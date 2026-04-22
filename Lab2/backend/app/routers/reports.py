"""Health report API endpoints."""
import io
from fastapi import APIRouter, Depends, HTTPException
from fastapi.responses import StreamingResponse
from sqlalchemy.orm import Session
from typing import List, Optional
from .. import models, schemas, auth
from ..database import get_db
from ..services import report_service, pdf_service

router = APIRouter(prefix="/api/reports", tags=["reports"])


@router.get("", response_model=List[schemas.HealthReportOut])
def get_reports(
    report_type: Optional[str] = None,
    limit: int = 20,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    query = db.query(models.HealthReport).filter(models.HealthReport.user_id == current_user.id)
    if report_type:
        query = query.filter(models.HealthReport.report_type == report_type)
    reports = query.order_by(models.HealthReport.created_at.desc()).limit(limit).all()
    return reports


@router.get("/{report_id}", response_model=schemas.HealthReportOut)
def get_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(models.HealthReport)
        .filter(models.HealthReport.id == report_id, models.HealthReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    return report


@router.post("/generate", response_model=schemas.HealthReportOut)
def generate_report(
    req: schemas.ReportGenerateRequest,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    try:
        report = report_service.generate_report(db, current_user, req.report_type)
        return report
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))


@router.delete("/{report_id}")
def delete_report(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(models.HealthReport)
        .filter(models.HealthReport.id == report_id, models.HealthReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")
    db.delete(report)
    db.commit()
    return {"detail": "删除成功"}


@router.get("/{report_id}/pdf")
def download_report_pdf(
    report_id: int,
    current_user: models.User = Depends(auth.get_current_user),
    db: Session = Depends(get_db),
):
    report = (
        db.query(models.HealthReport)
        .filter(models.HealthReport.id == report_id, models.HealthReport.user_id == current_user.id)
        .first()
    )
    if not report:
        raise HTTPException(status_code=404, detail="报告不存在")

    # Fetch related records for data table
    records = (
        db.query(models.HealthRecord)
        .filter(
            models.HealthRecord.user_id == current_user.id,
            models.HealthRecord.record_date >= report.start_date,
            models.HealthRecord.record_date <= report.end_date,
        )
        .order_by(models.HealthRecord.record_date.asc())
        .all()
    )

    pdf_bytes = pdf_service.generate_report_pdf(report, current_user, records)
    filename = f"aura_health_report_{report.report_type}_{report.start_date.strftime('%Y%m%d')}.pdf"

    return StreamingResponse(
        io.BytesIO(pdf_bytes),
        media_type="application/pdf",
        headers={"Content-Disposition": f"attachment; filename={filename}"},
    )
