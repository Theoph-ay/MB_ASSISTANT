import os
from dotenv import load_dotenv

load_dotenv()

vision_model = "meta-llama/llama-4-scout-17b-16e-instruct"
llm = "openai/gpt-oss-120b"

#db url in .env format : DATABASE_URL=postgresql+psycopg://dbuser:db-password@db_service:5432/mydb

DATABASE_URL = os.getenv("DATABASE_URL")
if DATABASE_URL and DATABASE_URL.startswith("postgres://"):
    DATABASE_URL = DATABASE_URL.replace("postgres://", "postgresql+psycopg://", 1)
elif DATABASE_URL and DATABASE_URL.startswith("postgresql://"):
    DATABASE_URL = DATABASE_URL.replace("postgresql://", "postgresql+psycopg://", 1)
else:
    DATABASE_URL = DATABASE_URL

