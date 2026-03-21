import json
import uuid
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.responses import StreamingResponse
from sqlmodel import select
from typing import List

from sqlalchemy.ext.asyncio import AsyncSession

from src.db.session import get_session
from src.models.chat import Chat
from src.schemas.chat import (
    ChatRequest, 
    ChatResponse, 
    ChatSidebarResponse, 
    ChatUpdate,
    RenameRequest,
    DeleteRequest,
    ShareRequest
)
from src.core.security import CurrentUser
from src.api.agent import agent_executor, llm

router = APIRouter()

@router.post("", response_model=ChatResponse)
async def chat_with_assistant(
    request: ChatRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session),
):
    """
    Logic: Receives a message, runs the AI Agent, and persists the history to Postgres.
    """
    
    chat_record = (await db.execute(
        select(Chat).where(Chat.thread_id == request.thread_id)
    )).scalars().first()

    if not chat_record:
        chat_record = Chat(
            thread_id = request.thread_id,
            user_id=current_user.id,
            title="New Consultation"
        )
        db.add(chat_record)
        await db.commit()
        await db.refresh(chat_record)
    
    async def event_generator():
        full_response = ""
        config = {"configurable": {"thread_id": str(request.thread_id)}}

        async for chunk, metadata in agent_executor.astream(
            {"messages": [("user", request.message)]},
            config=config,
            stream_mode="messages",
        ):
            #only stream agent node content
            langgraph_node = metadata.get("langgraph_node", "")
            if langgraph_node == "agent" and chunk.content:
                full_response += chunk.content
                yield chunk.content

        # After loop finishes, save the final state
        try:
            new_messages = list(chat_record.messages or [])
            new_messages.append({"role": "user", "content":request.message})
            new_messages.append({"role": "assistant", "content":full_response})
            chat_record.messages = new_messages
       
            if chat_record.title == "New Consultation":
                try:
                    title_resp = await llm.ainvoke([
                        ("system", "Generate a concise 3-6 word title summarizing this medical question. Output ONLY the title, nothing else."),
                        ("user", request.message),
                    ])
                    chat_record.title = title_resp.content.strip().strip('"').strip("'")[:60]
                except Exception as e:
                    chat_record.title = " ".join(request.message.split()[:5] + "...")

            db.add(chat_record)
            await db.commit()
        except Exception as e:
                print(f"Error saving chat history: {e}")

    return StreamingResponse(event_generator(), media_type="text/plain")

@router.get("/history/{thread_id}", response_model=Chat)
async def get_chat_session(
    thread_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Fetches the entire conversation history for a specific thread.
    """
    chat_record = (await db.execute(
        select(Chat).where(Chat.thread_id == thread_id, Chat.user_id == current_user.id)
    )).scalars().first()
    if not chat_record:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Chat session not found"
        )
    return chat_record

@router.get("/sessions", response_model=List[ChatSidebarResponse])
async def get_user_chat_sessions(
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    """
    Logic: Fetches all chat sessions for the current user.
    """
    statement = (
        select(Chat)
        .where(Chat.user_id == current_user.id)
        .order_by(Chat.updated_at.desc())
    )
    result = await db.execute(statement)
    results = result.scalars().all()
    return [
        ChatSidebarResponse(
            thread_id=row.thread_id,
            title=row.title,
            updated_at=row.updated_at
        )
        for row in results
    ]

@router.patch("/edit")
async def edit_message(
    update: ChatUpdate, 
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    chat = (await db.execute(select(Chat).where(Chat.thread_id == update.thread_id, Chat.user_id == current_user.id))).scalars().first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")

    new_messages = chat.messages[:update.message_index]
    new_messages.append({"role": "user", "content": update.new_content})
    
    chat.messages = new_messages
    db.add(chat)
    await db.commit()
    
    return {"status": "success", "message": "History rewound to edit point."}

# Patch/rename chatsession from sidebar
@router.patch("/rename")
async def rename_session(
    body: RenameRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    chat = (await db.execute(select(Chat).where(Chat.thread_id == body.thread_id, Chat.user_id == current_user.id))).scalars().first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    chat.title = body.new_title.strip() or "Untitled"
    db.add(chat)
    await db.commit()
    return {"status": "success", "title": chat.title}

# Delete chatsession from sidebar
@router.delete("/{thread_id}")
async def delete_session(
    thread_id: uuid.UUID,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    chat = (await db.execute(select(Chat).where(Chat.thread_id == thread_id, Chat.user_id == current_user.id))).scalars().first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    await db.delete(chat)
    await db.commit()
    return {"status": "success", "message": "Chat deleted successfully."}


#share chat
@router.post("/share")
async def share_chat(
    body: ShareRequest,
    current_user: CurrentUser,
    db: AsyncSession = Depends(get_session)
):
    chat = (await db.execute(select(Chat).where(Chat.thread_id == body.thread_id, Chat.user_id == current_user.id))).scalars().first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    # Generate a share_id if one doesn't exist
    if not chat.share_id:
        chat.share_id = str(uuid.uuid4())[:8]
    chat.is_shared = True
    db.add(chat)
    await db.commit()
    await db.refresh(chat)

    return {
        "share_id": chat.share_id,
        "thread_id": str(chat.thread_id),
        "message": "Referral link generated successfully."
    }

# View shared chat
@router.get("/share/{share_id}")
async def view_shared_chat(
    share_id: str,
    db: AsyncSession = Depends(get_session)
):
    chat = (await db.execute(select(Chat).where(Chat.share_id == share_id))).scalars().first()
    if not chat:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Chat not found")
    return {
        "thread_id": str(chat.thread_id),
        "title": chat.title,
        "messages": chat.messages,
    }