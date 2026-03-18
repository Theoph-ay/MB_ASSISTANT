from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from src.db.session import engine
from src.api.router import chat, user  

@asynccontextmanager
async def lifespan(app: FastAPI):
    print("MB_ASSISTANT: Initializing Database...")
    SQLModel.metadata.create_all(engine)
    yield
    print("MB_ASSISTANT: Shutting Down...")

app = FastAPI(
    title="MB_ASSISTANT API",
    description="AI Assistant for MBBS 2027 Students - Stroke & ENT Focus",
    version="0.1.0",
    lifespan=lifespan
)

# Logic: Open the gates for the Frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development, allow everything
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Logic: Registering your "Wards" (Endpoints)
app.include_router(chat.router, prefix="/api/v1/chat", tags=["Clinical Chat"])
app.include_router(user.router, prefix="/api/v1/user", tags=["Student Profile"])

@app.get("/")
def home():
    return {"message": "MB_ASSISTANT Backend is Pulse-Positive and Breathing."}