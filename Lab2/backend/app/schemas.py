from pydantic import BaseModel
from typing import Optional
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
    heart_rate: Optional[int] = 0
    systolic_bp: Optional[int] = 0
    diastolic_bp: Optional[int] = 0
    weight: Optional[float] = 0.0
    sleep_hours: Optional[float] = 0.0
    water_intake: Optional[int] = 0
    steps: Optional[int] = 0


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
