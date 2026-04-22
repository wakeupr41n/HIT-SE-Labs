from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey, Boolean, Text
from sqlalchemy.orm import relationship
from datetime import datetime
from .database import Base


class User(Base):
    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    username = Column(String(50), unique=True, index=True, nullable=False)
    password_hash = Column(String(255), nullable=False)
    name = Column(String(100), default="")
    age = Column(Integer, default=0)
    gender = Column(String(10), default="")
    height = Column(Float, default=0.0)  # cm
    weight = Column(Float, default=0.0)  # kg
    occupation = Column(String(100), default="")
    created_at = Column(DateTime, default=datetime.utcnow)

    health_records = relationship("HealthRecord", back_populates="user")
    conversations = relationship("AIConversation", back_populates="user")
    reminders = relationship("Reminder", back_populates="user")
    reports = relationship("HealthReport", back_populates="user")


class HealthRecord(Base):
    __tablename__ = "health_records"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    record_date = Column(DateTime, default=datetime.utcnow)
    heart_rate = Column(Integer, default=0)          # bpm
    systolic_bp = Column(Integer, default=0)         # 收缩压
    diastolic_bp = Column(Integer, default=0)        # 舒张压
    weight = Column(Float, default=0.0)              # kg
    sleep_hours = Column(Float, default=0.0)         # 小时
    water_intake = Column(Integer, default=0)        # ml
    steps = Column(Integer, default=0)               # 步数
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="health_records")


class AIConversation(Base):
    __tablename__ = "ai_conversations"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    role = Column(String(20), nullable=False)  # "user" or "assistant"
    content = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="conversations")


class Reminder(Base):
    __tablename__ = "reminders"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    type = Column(String(20), nullable=False)  # sedentary, water, abnormal
    message = Column(Text, nullable=False)
    triggered_at = Column(DateTime, default=datetime.utcnow)
    is_read = Column(Boolean, default=False)

    user = relationship("User", back_populates="reminders")


class HealthReport(Base):
    __tablename__ = "health_reports"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    report_type = Column(String(10), nullable=False)  # "weekly" or "monthly"
    title = Column(String(200), nullable=False)
    content = Column(Text, nullable=False)
    start_date = Column(DateTime, nullable=False)
    end_date = Column(DateTime, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship("User", back_populates="reports")
