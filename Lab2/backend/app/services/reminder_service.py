"""Smart reminder business logic for health monitoring."""
from datetime import datetime, timedelta
from typing import List, Optional
from sqlalchemy.orm import Session
from .. import models


def _has_recent_reminder(db: Session, user_id: int, reminder_type: str, hours: int = 1) -> bool:
    """Check if an unread reminder of the same type exists within the last N hours."""
    cutoff = datetime.utcnow() - timedelta(hours=hours)
    existing = (
        db.query(models.Reminder)
        .filter(
            models.Reminder.user_id == user_id,
            models.Reminder.type == reminder_type,
            models.Reminder.is_read == False,
            models.Reminder.triggered_at >= cutoff,
        )
        .first()
    )
    return existing is not None


def check_sedentary_reminder(db: Session, user_id: int) -> Optional[models.Reminder]:
    """Check if user has low activity / sedentary pattern."""
    if _has_recent_reminder(db, user_id, "sedentary"):
        return None

    latest = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == user_id)
        .order_by(models.HealthRecord.record_date.desc())
        .first()
    )

    if not latest:
        return None

    # Trigger if steps < 2000
    if latest.steps < 2000:
        reminder = models.Reminder(
            user_id=user_id,
            type="sedentary",
            message=f"您今日步数仅 {latest.steps} 步，活动量偏低。建议起身走动，每隔1小时活动5-10分钟。",
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return reminder

    return None


def check_hydration_reminder(db: Session, user_id: int) -> Optional[models.Reminder]:
    """Check if user's water intake is below recommended level."""
    if _has_recent_reminder(db, user_id, "water"):
        return None

    latest = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == user_id)
        .order_by(models.HealthRecord.record_date.desc())
        .first()
    )

    if not latest:
        return None

    # Trigger if water intake < 1500ml
    if latest.water_intake < 1500:
        reminder = models.Reminder(
            user_id=user_id,
            type="water",
            message=f"您今日饮水量仅 {latest.water_intake}ml，低于推荐的1500ml。建议及时补充水分，保持每小时饮水200ml左右。",
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return reminder

    return None


def check_abnormal_warning(db: Session, user_id: int) -> Optional[models.Reminder]:
    """Check for abnormal vital signs that need attention."""
    if _has_recent_reminder(db, user_id, "abnormal"):
        return None

    latest = (
        db.query(models.HealthRecord)
        .filter(models.HealthRecord.user_id == user_id)
        .order_by(models.HealthRecord.record_date.desc())
        .first()
    )

    if not latest:
        return None

    warnings = []

    if latest.heart_rate > 120:
        warnings.append(f"心率偏高 ({latest.heart_rate}bpm)")
    elif latest.heart_rate < 50 and latest.heart_rate > 0:
        warnings.append(f"心率偏低 ({latest.heart_rate}bpm)")

    if latest.systolic_bp > 160:
        warnings.append(f"收缩压偏高 ({latest.systolic_bp}mmHg)")
    elif latest.systolic_bp < 90 and latest.systolic_bp > 0:
        warnings.append(f"收缩压偏低 ({latest.systolic_bp}mmHg)")

    if latest.diastolic_bp > 100:
        warnings.append(f"舒张压偏高 ({latest.diastolic_bp}mmHg)")
    elif latest.diastolic_bp < 60 and latest.diastolic_bp > 0:
        warnings.append(f"舒张压偏低 ({latest.diastolic_bp}mmHg)")

    if warnings:
        detail = "；".join(warnings)
        reminder = models.Reminder(
            user_id=user_id,
            type="abnormal",
            message=f"检测到异常健康指标：{detail}。请密切关注身体状况，如持续异常请及时就医。",
        )
        db.add(reminder)
        db.commit()
        db.refresh(reminder)
        return reminder

    return None


def run_all_checks(db: Session, user_id: int) -> List[models.Reminder]:
    """Run all reminder checks and return list of newly created reminders."""
    reminders = []
    result = check_sedentary_reminder(db, user_id)
    if result:
        reminders.append(result)
    result = check_hydration_reminder(db, user_id)
    if result:
        reminders.append(result)
    result = check_abnormal_warning(db, user_id)
    if result:
        reminders.append(result)
    return reminders
