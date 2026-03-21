from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse
from pydantic import BaseModel

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.models.user import User
from src.core.security import get_google_user_info, create_access_token
from src.db.session import get_session

import uuid
import time

router = APIRouter()

# ── In-memory store for short-lived, single-use auth codes ──
# Format: { code_string: { "user_id": str, "expires_at": float } }
_pending_codes: dict[str, dict] = {}
_CODE_TTL_SECONDS = 60  # codes expire after 60 seconds

def _cleanup_expired_codes():
    """Remove expired codes to prevent memory leaks."""
    now = time.time()
    expired = [k for k, v in _pending_codes.items() if v["expires_at"] < now]
    for k in expired:
        del _pending_codes[k]


@router.get("/login/google")
async def google_login():
    auth_url = (
        f"https://accounts.google.com/o/oauth2/v2/auth?client_id={settings.GOOGLE_CLIENT_ID}"
        f"&redirect_uri={settings.GOOGLE_REDIRECT_URI}&response_type=code&scope=openid%20email%20profile"
    )
    return RedirectResponse(url=auth_url)

@router.get("/google/callback")
async def google_callback(code: str, db: AsyncSession = Depends(get_session)):

    google_data = await get_google_user_info(code)

    statement = select(User).where(User.email == google_data["email"])
    result = await db.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        user_id = existing_user.id
    else:
        new_user = User(
            email=google_data["email"],
            full_name=google_data["name"],
            username=google_data["sub"],
            google_id=google_data["sub"],
            auth_provider="google"
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        user_id = new_user.id

    # Generate a short-lived, single-use auth code (NOT a token)
    _cleanup_expired_codes()
    auth_code = uuid.uuid4().hex
    _pending_codes[auth_code] = {
        "user_id": str(user_id),
        "expires_at": time.time() + _CODE_TTL_SECONDS,
    }

    # Redirect with the opaque code — the JWT never touches the URL
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/?code={auth_code}")


class CodeExchangeRequest(BaseModel):
    code: str

@router.post("/exchange")
async def exchange_code(payload: CodeExchangeRequest):
    """Exchange a single-use auth code for a JWT access token."""
    _cleanup_expired_codes()

    entry = _pending_codes.pop(payload.code, None)
    if not entry:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authorization code",
        )

    if time.time() > entry["expires_at"]:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Authorization code has expired",
        )

    token = create_access_token({"sub": entry["user_id"]})
    return {"access_token": token, "token_type": "bearer"}