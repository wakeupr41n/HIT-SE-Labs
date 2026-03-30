from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..services.ai_service import get_ai_response

router = APIRouter(prefix="/api/ai", tags=["ai"])


@router.post("/chat", response_model=schemas.ChatResponse)
def chat(
    msg: schemas.ChatMessage,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    # Save user message
    user_msg = models.AIConversation(
        user_id=current_user.id, role="user", content=msg.message
    )
    db.add(user_msg)
    db.commit()

    # Get recent health records for context
    records = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == current_user.id)
        .order_by(models.HealthRecord.record_date.desc())
        .limit(7)
        .all()
    )

    # Get recent conversation history
    history = (
        db.query(models.AIConversation)
        .filter(models.AIConversation.user_id == current_user.id)
        .order_by(models.AIConversation.created_at.desc())
        .limit(10)
        .all()
    )
    history.reverse()

    # Build context and call AI
    reply = get_ai_response(current_user, records, history, msg.message)

    # Save assistant reply
    assistant_msg = models.AIConversation(
        user_id=current_user.id, role="assistant", content=reply
    )
    db.add(assistant_msg)
    db.commit()

    return {"reply": reply}


@router.get("/history", response_model=List[schemas.ConversationOut])
def get_history(
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    conversations = (
        db.query(models.AIConversation)
        .filter(models.AIConversation.user_id == current_user.id)
        .order_by(models.AIConversation.created_at.desc())
        .limit(limit)
        .all()
    )
    conversations.reverse()
    return conversations
