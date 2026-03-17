import os
from dotenv import load_dotenv

load_dotenv()

vision_model = "meta-llama/llama-4-scout-17b-16e-instruct"
llm = "openai/gpt-oss-120b"

DATABASE_URL = os.getenv("DATABASE_URL")