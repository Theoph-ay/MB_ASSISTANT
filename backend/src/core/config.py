import os
from typing import List
from pydantic_settings import BaseSettings, SettingsConfigDict


class Settings(BaseSettings):

    vision_model: str = "meta-llama/llama-4-scout-17b-16e-instruct"
    llm: str = "openai/gpt-oss-120b"
    #db url in .env format : DATABASE_URL=postgresql+psycopg://dbuser:db-password@db_service:5432/mydb
    DATABASE_URL: str #Pydantic should get this from .env automatically
    PINECONE_API_KEY: str
    PINECONE_INDEX_NAME: str
    GROQ_API_KEY: str
    HUGGINGFACE_TOKEN: str
    GOOGLE_CLIENT_ID: str
    GOOGLE_CLIENT_SECRET: str
    GOOGLE_REDIRECT_URI: str
    FRONTEND_URL: str = "http://localhost:5173"

    secret_key: str
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    max_file_size: int = 5 * 1024 * 1024 #5MB
    allowed_image_extensions: List[str] = [".jpg", ".jpeg", ".png", ".webp"]

    model_config = SettingsConfigDict(
        env_file=".env",
        env_file_encoding="utf-8",
        extra="ignore"
    )


settings = Settings()


#crash logic for databases that do not use the psycopg3
if settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgres://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif settings.DATABASE_URL and settings.DATABASE_URL.startswith("postgresql://"):
    settings.DATABASE_URL = settings.DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)