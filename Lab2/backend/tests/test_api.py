from unittest.mock import patch

def test_register_user(client):
    response = client.post(
        "/api/users/register",
        json={"username": "testuser", "password": "testpassword", "name": "Test User", "age": 25, "gender": "Male"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"

def test_login_user(client):
    # First register
    client.post(
        "/api/users/register",
        json={"username": "loginuser", "password": "loginpassword", "name": "Login User", "age": 30}
    )
    # Then login
    response = client.post(
        "/api/users/login",
        json={"username": "loginuser", "password": "loginpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()

def test_create_health_record(client):
    # Register and login to get token
    client.post(
        "/api/users/register",
        json={"username": "healthuser", "password": "password123", "name": "Health User"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "healthuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Create record
    response = client.post(
        "/api/health/records",
        json={
            "heart_rate": 72,
            "systolic_bp": 120,
            "diastolic_bp": 80,
            "weight": 70.5,
            "sleep_hours": 8,
            "water_intake": 2000,
            "steps": 10000
        },
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["heart_rate"] == 72

@patch("app.routers.ai.get_ai_response")
def test_ai_chat(mock_ai, client):
    # Register and login
    client.post(
        "/api/users/register",
        json={"username": "aiuser", "password": "password123", "name": "AI User"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "aiuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]
    
    # Mock AI response
    mock_ai.return_value = "Hello, I am your health assistant."
    
    response = client.post(
        "/api/ai/chat",
        json={"message": "你好"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["reply"] == "Hello, I am your health assistant."

def test_create_health_record_invalid_data(client):
    # Register and login
    client.post("/api/users/register", json={"username": "testval", "password": "password123"})
    login_res = client.post("/api/users/login", json={"username": "testval", "password": "password123"})
    token = login_res.json()["access_token"]
    
    # Test invalid heart rate (ge=30)
    response = client.post(
        "/api/health/records",
        json={"heart_rate": -1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422 # Pydantic validation error

def test_delete_record_not_found(client):
    # Register and login
    client.post("/api/users/register", json={"username": "deluser", "password": "password123"})
    login_res = client.post("/api/users/login", json={"username": "deluser", "password": "password123"})
    token = login_res.json()["access_token"]
    
    # Delete non-existent record
    response = client.delete(
        "/api/health/records/9999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404
