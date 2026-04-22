from pydantic import BaseModel, Field
from typing import Optional, List
from datetime import datetime


# ===== User Schemas =====
class UserCreate(BaseModel):
    username: str
    password: str
    name: Optional[str] = ""
    age: Optional[int] = 0
    gender: Optional[str] = ""
    height: Optional[float] = 0.0
    weight: Optional[float] = 0.0
    occupation: Optional[str] = ""


class UserLogin(BaseModel):
    username: str
    password: str


class UserOut(BaseModel):
    id: int
    username: str
    name: str
    age: int
    gender: str
    height: float
    weight: float
    occupation: str
    created_at: datetime

    class Config:
        from_attributes = True


class UserUpdate(BaseModel):
    name: Optional[str] = None
    age: Optional[int] = None
    gender: Optional[str] = None
    height: Optional[float] = None
    weight: Optional[float] = None
    occupation: Optional[str] = None


class Token(BaseModel):
    access_token: str
    token_type: str


# ===== Health Record Schemas =====
class HealthRecordCreate(BaseModel):
    heart_rate: Optional[int] = Field(0, ge=30, le=220)
    systolic_bp: Optional[int] = Field(0, ge=60, le=250)
    diastolic_bp: Optional[int] = Field(0, ge=40, le=150)
    weight: Optional[float] = Field(0.0, ge=30.0, le=300.0)
    sleep_hours: Optional[float] = Field(0.0, ge=0.0, le=24.0)
    water_intake: Optional[int] = Field(0, ge=0, le=10000)
    steps: Optional[int] = Field(0, ge=0, le=100000)


class HealthRecordOut(BaseModel):
    id: int
    user_id: int
    record_date: datetime
    heart_rate: int
    systolic_bp: int
    diastolic_bp: int
    weight: float
    sleep_hours: float
    water_intake: int
    steps: int

    class Config:
        from_attributes = True


# ===== AI Conversation Schemas =====
class ChatMessage(BaseModel):
    message: str


class ChatResponse(BaseModel):
    reply: str


class ConversationOut(BaseModel):
    id: int
    role: str
    content: str
    created_at: datetime

    class Config:
        from_attributes = True


# ===== Reminder Schemas =====
class ReminderOut(BaseModel):
    id: int
    user_id: int
    type: str
    message: str
    triggered_at: datetime
    is_read: bool

    class Config:
        from_attributes = True


class ReminderUpdate(BaseModel):
    is_read: Optional[bool] = None


# ===== Health Report Schemas =====
class ReportGenerateRequest(BaseModel):
    report_type: str = Field(..., pattern="^(weekly|monthly)$")


class HealthReportOut(BaseModel):
    id: int
    user_id: int
    report_type: str
    title: str
    content: str
    start_date: datetime
    end_date: datetime
    created_at: datetime

    class Config:
        from_attributes = True
