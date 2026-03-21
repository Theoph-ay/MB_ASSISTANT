from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse

from sqlmodel import select
from sqlalchemy.ext.asyncio import AsyncSession

from src.core.config import settings
from src.models.user import User
from src.core.security import get_google_user_info, create_access_token
from src.db.session import get_session

router = APIRouter()

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

    # Issue Token
    token = create_access_token({"sub": str(user_id)})
    return RedirectResponse(url=f"{settings.FRONTEND_URL}/?token={token}")