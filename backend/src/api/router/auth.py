from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import RedirectResponse

from sqlmodel import select, Session

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
async def google_callback(code: str, db: Session = Depends(get_session)):

    google_data = await get_google_user_info(code)
    user_info = await get_google_user_info(code)

    statement = select(User).where(User.email == google_data["email"])
    existing_user = db.exec(statement).first()

    if existing_user:
        return existing_user
    else:
        new_user = User(
            email=google_data["email"],
            full_name=google_data["name"],
            google_id=google_data["sub"],
            auth_provider="google"
        )
        db.add(new_user)
        await db.commit()
        await db.refresh(new_user)
        return new_user

    # Issue Token
    token = create_access_token({"sub": str(new_user.id)})
    return {"access_token": token, "token_type": "bearer"}   