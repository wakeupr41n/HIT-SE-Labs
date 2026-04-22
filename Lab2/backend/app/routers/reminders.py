"""Reminder API endpoints."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..services import reminder_service

router = APIRouter(prefix="/api/reminders", tags=["reminders"])


@router.get("", response_model=List[schemas.ReminderOut])
def get_reminders(
    unread_only: bool = False,
    limit: int = 50,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.Reminder).filter(models.Reminder.user_id == current_user.id)
    if unread_only:
        query = query.filter(models.Reminder.is_read == False)
    reminders = query.order_by(models.Reminder.triggered_at.desc()).limit(limit).all()
    return reminders


@router.get("/unread-count")
def get_unread_count(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    count = (
        db.query(models.Reminder)
        .filter(models.Reminder.user_id == current_user.id, models.Reminder.is_read == False)
        .count()
    )
    return {"count": count}


@router.put("/{reminder_id}/read", response_model=schemas.ReminderOut)
def mark_read(
    reminder_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    reminder = (
        db.query(models.Reminder)
        .filter(models.Reminder.id == reminder_id, models.Reminder.user_id == current_user.id)
        .first()
    )
    if not reminder:
        raise HTTPException(status_code=404, detail="提醒不存在")
    reminder.is_read = True
    db.commit()
    db.refresh(reminder)
    return reminder


@router.put("/read-all")
def mark_all_read(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db.query(models.Reminder).filter(
        models.Reminder.user_id == current_user.id, models.Reminder.is_read == False
    ).update({"is_read": True})
    db.commit()
    return {"detail": "全部已读"}


@router.post("/check", response_model=List[schemas.ReminderOut])
def manual_check(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    reminders = reminder_service.run_all_checks(db, current_user.id)
    return reminders
