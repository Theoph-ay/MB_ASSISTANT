import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import EmailStr

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(unique=True, index=True, nullable=False)

class UserCreate(SQLModel):
    email: EmailStr

class UserRead(UserBase):
    id: uuid.UUID
    created_at: datetime

class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None

class Token(SQLModel):
    access_token: str
    token_type: str