import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from sqlalchemy import func
from sqlalchemy.orm import selectinload

from src.core.config import settings
from src.db.session import get_session
from src.models.user import User
from src.schemas.user import UserRead, UserUpdate, UserCreate, Token

router = APIRouter()



@router.post(
    "",
    response_model=UserCreate,
    status_code=status.HTTP_201_CREATED
)
async def create_user(
    user: UserCreate,
    db: Session = Depends(get_session)
):
    """
    Logic: Creates a new user.
    """

    existing_user = db.exec(
        select(User).where(func.lower(User.email) == user.email.lower())
    ).first()

    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    new_user = User(
        email=user.email,
        full_name=user.full_name
        password_hash = hash_password(user.password)
    )
    db.add(new_user)
    await db.commit()
    await db.refresh(new_user)

    return new_user


@router.post("/token", response_model=Token)
async def login_for_access_token(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_session)
):
    """
    Logic: Handles user login by email
    """

    user = await db.exe(
        select(User)
        .where(func.lower(User.email) == form_data.username.lower())
    ).first()

    if not user or not verify_password(form_data.password, user.password_hash):
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    #create access token
    access_token_expires = timedelta(minutes=settings.ACCESS_TOKEN_EXPIRE_MINUTES)
    access_token = create_access_token(
        data={"sub": str(user.id)}, 
        expires_delta=access_token_expires
    )
    return Token(
        access_token=access_token,
        token_type="bearer"
    )
    


@router.get("/me", response_model=UserRead)
async def get_my_profile(
    db: Session = Depends(get_session)
):
    """
    Logic: Returns the authenticated student's profile information.
    """
    # Placeholder: In the next step, this comes from your Auth token
    mock_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    
    user = db.get(User, mock_id)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, 
            detail="User not found"
        )
    return user

@router.patch("/me", response_model=UserRead)
async def update_my_profile(
    user_data: UserUpdate,
    db: Session = Depends(get_session)
):
    """
    Logic: Allows a student to update their name or medical year.
    """
    mock_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    db_user = db.get(User, mock_id)
    
    if not db_user:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="User not found")

    data = user_data.model_dump(exclude_unset=True)
    for key, value in data.items():
        setattr(db_user, key, value)

    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

@router.delete("/me", status_code=status.HTTP_204_NO_CONTENT)
async def delete_my_account(
    db: Session = Depends(get_session)
):
    """
    Logic: Permanently deletes the student's account and all associated data.
    """
    # Placeholder for current_user.id
    mock_id = uuid.UUID("123e4567-e89b-12d3-a456-426614174000")
    
    db_user = db.get(User, mock_id)
    if not db_user:
        raise HTTPException(status_code=404, detail="User not found")

    db.delete(db_user)
    db.commit()

    return None