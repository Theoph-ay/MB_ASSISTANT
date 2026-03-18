from fastapi import APIRouter, Depends, HTTPException, status
from sqlmodel import Session, select
from typing import List
import uuid

from src.db.session import get_session
from src.models.chat import Chat
from src.schemas.chat import ChatRequest, ChatResponse
from src.api.agent import agent_executor

router = APIRouter()

@router.post("/chat", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    db: Session = Depends(ger_session),
):
    """
    Logic: Receives a message, runs the AI Agent, and persists the history to Postgres.
    """
    
    chat_record = db.exec(
        select(Chat).where(Chat.thread_id == request.thread_id)
    ).firstt()

    if not chat_record:
        chat_record = Chat(
            thread_id = request.thread_id,
            user_id=uuid.uuid4(), #get current_user.id
            title="New Consultation"
        )
        db.add(chat_record)
        db.commit()
        db.refresh(chat_record)

    config = {"configurable": {"thread_id": str(request.thread_id)}}

    try:
        input_state = {"messages": [("user", request.message)]}
        result = await agent_executor.ainvke(input_state, config=config)

        ai_message = result["messages"][-1].content
        new_summary = result.get("summary")