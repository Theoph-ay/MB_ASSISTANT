from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlmodel import SQLModel

from src.db.session import engine, init_db
from src.api.router import chats, user, auth  
@asynccontextmanager
async def lifespan(app: FastAPI):
    print("MB_ASSISTANT: Connecting Database...")
    # await init_db() # Disabled since Alembic is doing schema migrations
    yield
    await engine.dispose()
    print("MB_ASSISTANT: Shutting Down...")

app = FastAPI(
    title="MB_ASSISTANT API",
    description="AI Assistant for MBBS Students- Paediatrics, OnG Focus",
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
app.include_router(chats.router, prefix="/api/chat", tags=["Clinical Chat"])
app.include_router(user.router, prefix="/api/users", tags=["Student Profile"])
app.include_router(auth.router, prefix="/api/auth", tags=["Authentication"])

@app.get("/")
def home():
    return {"message": "MB_ASSISTANT Backend is Pulse-Positive and Breathing."}
