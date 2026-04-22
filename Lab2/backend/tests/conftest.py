import pytest
from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os

# Set environment variables for testing before imports
os.environ["DATABASE_URL"] = "sqlite:///./test.db"
os.environ["OPENAI_API_KEY"] = "test-key"

from app.main import app
from app.database import Base, get_db

# Use an in-memory SQLite database for testing
SQLALCHEMY_DATABASE_URL = "sqlite:///./test.db"
engine = create_engine(SQLALCHEMY_DATABASE_URL, connect_args={"check_same_thread": False})
TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)

@pytest.fixture(scope="function")
def db():
    Base.metadata.create_all(bind=engine)
    db = TestingSessionLocal()
    try:
        yield db
    finally:
        db.close()
        Base.metadata.drop_all(bind=engine)

@pytest.fixture(scope="function")
def client(db):
    def override_get_db():
        try:
            yield db
        finally:
            pass
    app.dependency_overrides[get_db] = override_get_db
    with TestClient(app) as c:
        yield c

@pytest.fixture(scope="function")
def auth_headers(client):
    """Register a user and return auth headers."""
    client.post(
        "/api/users/register",
        json={"username": "testauth", "password": "password123", "name": "Auth User", "age": 28},
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "testauth", "password": "password123"},
    )
    token = login_res.json()["access_token"]
    return {"Authorization": f"Bearer {token}"}

@pytest.fixture(scope="function")
def sample_health_data():
    """Return a valid health record data dict."""
    return {
        "heart_rate": 75,
        "systolic_bp": 120,
        "diastolic_bp": 80,
        "weight": 68.0,
        "sleep_hours": 7.5,
        "water_intake": 2000,
        "steps": 8000,
    }
