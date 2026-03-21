import uuid
from datetime import datetime, timezone
from typing import Optional
from sqlmodel import Field, SQLModel
from pydantic import EmailStr, model_validator

class UserBase(SQLModel):
    email: str = Field(unique=True, index=True, nullable=False)
    full_name: str = Field(index=True, nullable=False)

class UserCreate(UserBase):
    password: str = Field(min_length=8)
    confirm_password: str = Field(min_length=8)

    @model_validator(mode='after')
    def check_passwords_match(self):
        if self.password != self.confirm_password:
            raise ValueError("Passwords do not match")
        return self

class UserRead(UserBase):
    id: uuid.UUID

class UserUpdate(SQLModel):
    email: Optional[str] = None
    full_name: Optional[str] = None

class Token(SQLModel):
    access_token: str
    token_type: str