import uuid

from datetime import timedelta

from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm

from sqlalchemy.ext.asyncio import AsyncSession
from sqlmodel import select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.db.session import get_session
from src.models.user import User
from src.core.security import hash_password, verify_password, create_access_token, CurrentUser
from src.schemas.user import UserRead, UserUpdate, UserCreate, Token

router = APIRouter()



@router.post(
    "",
    response_model=UserRead,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    user: UserCreate,
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Creates a new user.
    """

    statement = select(User).where(func.lower(User.email) == user.email.lower())
    result = await db.execute(statement)
    existing_user = result.scalars().first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=user.email,
        full_name=user.full_name,
        username=user.email.split("@")[0] + "_" + str(uuid.uuid4().hex)[:4],
        hashed_password=hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Handles user login by email
    """

    statement = select(User).where(func.lower(User.email) == form_data.username.lower())
    result = await db.execute(statement)
    user = result.scalars().first()

    if not user or not verify_password(form_data.password, user.hashed_password):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #create access token
    access_token_expires = timedelta(minutes=settings.access_token_expire_minutes)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    return Token(
        access_token=access_token,
        token_type="bearer"
    )
    


@router.get("/me", response_model=UserRead)
async def get_current_user(
   current_user: CurrentUser
):
    """
    Logic: Returns the authenticated student's profile information.
    """
    return current_user

@router.patch("/{user_id}", response_model=UserRead)
async def update_my_profile(
    user_id: uuid.UUID,
    user_update: UserUpdate,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Allows a student to update their name or medical year.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to update this user")

    user = await db.get(User, user_id)

    if not user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    if user_update.email is not None and user_update.email.lower() != user.email.lower():
        result = await db.execute(
            select(User).where(func.lower(User.email) == user_update.email.lower()),
        )
        existing_email = result.scalars().first()
        if existing_email:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail="Email already exists",
            )
        user.email = user_update.email.lower()
        
    if user_update.full_name is not None:
        user.full_name = user_update.full_name

    await db.commit()
    await db.refresh(user)
    return user

@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    user_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Permanently deletes the student's account and all associated data.
    """
    if user_id != current_user.id:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="You are not authorized to delete this user")

    db_user = await db.get(User, user_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    await db.delete(db_user)
    await db.commit()

    return None