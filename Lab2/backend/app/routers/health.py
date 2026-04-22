from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from typing import List
from .. import models, schemas, auth
from ..database import get_db
from ..services import reminder_service

router = APIRouter(prefix="/api/health", tags=["health"])


@router.post("/records", response_model=schemas.HealthRecordOut)
def create_record(
    record: schemas.HealthRecordCreate,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    db_record = models.HealthRecord(user_id=current_user.id, **record.model_dump())
    db.add(db_record)
    db.commit()
    db.refresh(db_record)
    # Auto-trigger reminder checks after new health data
    reminder_service.run_all_checks(db, current_user.id)
    return db_record


@router.get("/records", response_model=List[schemas.HealthRecordOut])
def get_records(
    limit: int = 30,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    records = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == current_user.id)
        .order_by(models.HealthRecord.record_date.desc())
        .limit(limit)
        .all()
    )
    return records


@router.get("/records/latest", response_model=schemas.HealthRecordOut)
def get_latest_record(
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == current_user.id)
        .order_by(models.HealthRecord.record_date.desc())
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="暂无健康记录")
    return record


@router.delete("/records/{record_id}")
def delete_record(
    record_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    record = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.id == record_id, models.HealthRecord.user_id == current_user.id)
        .first()
    )
    if not record:
        raise HTTPException(status_code=404, detail="记录不存在")
    db.delete(record)
    db.commit()
    return {"detail": "删除成功"}
