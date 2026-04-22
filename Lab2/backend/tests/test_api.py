from unittest.mock import patch


def test_register_user(client):
    response = client.post(
        "/api/users/register",
        json={"username": "testuser", "password": "testpassword", "name": "Test User", "age": 25, "gender": "Male"}
    )
    assert response.status_code == 200
    assert response.json()["username"] == "testuser"


def test_login_user(client):
    client.post(
        "/api/users/register",
        json={"username": "loginuser", "password": "loginpassword", "name": "Login User", "age": 30}
    )
    response = client.post(
        "/api/users/login",
        json={"username": "loginuser", "password": "loginpassword"}
    )
    assert response.status_code == 200
    assert "access_token" in response.json()


def test_create_health_record(client):
    client.post(
        "/api/users/register",
        json={"username": "healthuser", "password": "password123", "name": "Health User"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "healthuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

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
    client.post(
        "/api/users/register",
        json={"username": "aiuser", "password": "password123", "name": "AI User"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "aiuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    mock_ai.return_value = "Hello, I am your health assistant."

    response = client.post(
        "/api/ai/chat",
        json={"message": "你好"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["reply"] == "Hello, I am your health assistant."


def test_create_health_record_invalid_data(client):
    client.post("/api/users/register", json={"username": "testval", "password": "password123"})
    login_res = client.post("/api/users/login", json={"username": "testval", "password": "password123"})
    token = login_res.json()["access_token"]

    response = client.post(
        "/api/health/records",
        json={"heart_rate": -1},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 422


def test_delete_record_not_found(client):
    client.post("/api/users/register", json={"username": "deluser", "password": "password123"})
    login_res = client.post("/api/users/login", json={"username": "deluser", "password": "password123"})
    token = login_res.json()["access_token"]

    response = client.delete(
        "/api/health/records/9999",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404


# --- Additional tests for coverage ---

def test_get_me_unauthorized(client):
    response = client.get("/api/users/me")
    assert response.status_code == 401


def test_update_me(client):
    client.post(
        "/api/users/register",
        json={"username": "updateuser", "password": "password123", "name": "Original"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "updateuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    response = client.put(
        "/api/users/me",
        json={"name": "Updated Name", "age": 30},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert response.json()["name"] == "Updated Name"
    assert response.json()["age"] == 30


def test_get_records_list(client):
    client.post(
        "/api/users/register",
        json={"username": "listuser", "password": "password123"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "listuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Create a record first
    client.post(
        "/api/health/records",
        json={"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000},
        headers={"Authorization": f"Bearer {token}"}
    )

    response = client.get(
        "/api/health/records",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 1


def test_get_latest_record_not_found(client):
    client.post(
        "/api/users/register",
        json={"username": "nolatest", "password": "password123"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "nolatest", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    response = client.get(
        "/api/health/records/latest",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 404


@patch("app.routers.ai.get_ai_response")
def test_ai_chat_history(mock_ai, client):
    client.post(
        "/api/users/register",
        json={"username": "histuser", "password": "password123"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "histuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    mock_ai.return_value = "Test reply"

    # Send a chat message
    client.post(
        "/api/ai/chat",
        json={"message": "test"},
        headers={"Authorization": f"Bearer {token}"}
    )

    # Get history
    response = client.get(
        "/api/ai/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert len(response.json()) >= 2  # user + assistant messages


def test_register_duplicate_username(client):
    client.post(
        "/api/users/register",
        json={"username": "dupuser", "password": "password123", "name": "First"}
    )
    response = client.post(
        "/api/users/register",
        json={"username": "dupuser", "password": "password456", "name": "Second"}
    )
    assert response.status_code == 400


def test_login_wrong_password(client):
    client.post(
        "/api/users/register",
        json={"username": "wrongpw", "password": "password123"}
    )
    response = client.post(
        "/api/users/login",
        json={"username": "wrongpw", "password": "wrongpassword"}
    )
    assert response.status_code == 401


# Test AI service fallback mode
def test_ai_chat_fallback(client):
    """Test AI chat works with fallback when API call fails."""
    client.post(
        "/api/users/register",
        json={"username": "fallbackuser", "password": "password123", "name": "Fallback User"}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "fallbackuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    # Create some records first so fallback has data
    client.post(
        "/api/health/records",
        json={"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000},
        headers={"Authorization": f"Bearer {token}"}
    )

    response = client.post(
        "/api/ai/chat",
        json={"message": "你好"},
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert "reply" in response.json()


# Test get user profile
def test_get_me(client):
    client.post(
        "/api/users/register",
        json={"username": "meuser", "password": "password123", "name": "Me User", "age": 25}
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": "meuser", "password": "password123"}
    )
    token = login_res.json()["access_token"]

    response = client.get("/api/users/me", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["username"] == "meuser"
