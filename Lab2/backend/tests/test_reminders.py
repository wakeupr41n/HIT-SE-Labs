"""Tests for reminder endpoints and auto-trigger logic."""


def _register_and_login(client, username="remuser", name="Rem User"):
    client.post(
        "/api/users/register",
        json={"username": username, "password": "password123", "name": name, "age": 28},
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": username, "password": "password123"},
    )
    return {"Authorization": f"Bearer {login_res.json()['access_token']}"}


def test_get_reminders_empty(client):
    headers = _register_and_login(client, "emptyrem")
    response = client.get("/api/reminders", headers=headers)
    assert response.status_code == 200
    assert response.json() == []


def test_auto_reminder_on_abnormal_data(client):
    headers = _register_and_login(client, "abnormaluser")
    # Create record with abnormal heart rate
    response = client.post(
        "/api/health/records",
        json={"heart_rate": 150, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000},
        headers=headers,
    )
    assert response.status_code == 200

    # Check that abnormal reminder was auto-created
    rem_response = client.get("/api/reminders", headers=headers)
    reminders = rem_response.json()
    assert any(r["type"] == "abnormal" for r in reminders)


def test_auto_reminder_on_low_water(client):
    headers = _register_and_login(client, "wateruser")
    response = client.post(
        "/api/health/records",
        json={"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 500, "steps": 8000},
        headers=headers,
    )
    assert response.status_code == 200

    rem_response = client.get("/api/reminders", headers=headers)
    reminders = rem_response.json()
    assert any(r["type"] == "water" for r in reminders)


def test_auto_reminder_on_low_steps(client):
    headers = _register_and_login(client, "seduser")
    response = client.post(
        "/api/health/records",
        json={"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 500},
        headers=headers,
    )
    assert response.status_code == 200

    rem_response = client.get("/api/reminders", headers=headers)
    reminders = rem_response.json()
    assert any(r["type"] == "sedentary" for r in reminders)


def test_get_unread_count(client):
    headers = _register_and_login(client, "countuser")
    # Create abnormal data to trigger a reminder
    client.post(
        "/api/health/records",
        json={"heart_rate": 150, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 500, "steps": 500},
        headers=headers,
    )

    response = client.get("/api/reminders/unread-count", headers=headers)
    assert response.status_code == 200
    assert response.json()["count"] > 0


def test_mark_reminder_read(client):
    headers = _register_and_login(client, "readuser")
    # Create abnormal data
    client.post(
        "/api/health/records",
        json={"heart_rate": 150, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000},
        headers=headers,
    )

    reminders = client.get("/api/reminders", headers=headers).json()
    reminder_id = reminders[0]["id"]

    # Mark as read
    response = client.put(f"/api/reminders/{reminder_id}/read", headers=headers)
    assert response.status_code == 200
    assert response.json()["is_read"] is True

    # Verify count decreased
    count = client.get("/api/reminders/unread-count", headers=headers).json()["count"]
    assert count < len(reminders)


def test_mark_all_read(client):
    headers = _register_and_login(client, "allreaduser")
    # Create abnormal data to trigger reminders
    client.post(
        "/api/health/records",
        json={"heart_rate": 150, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 500, "steps": 500},
        headers=headers,
    )

    response = client.put("/api/reminders/read-all", headers=headers)
    assert response.status_code == 200

    count = client.get("/api/reminders/unread-count", headers=headers).json()["count"]
    assert count == 0


def test_manual_check_endpoint(client):
    headers = _register_and_login(client, "checkuser")
    # No records yet, check should return empty
    response = client.post("/api/reminders/check", headers=headers)
    assert response.status_code == 200

    # Add record and check again
    client.post(
        "/api/health/records",
        json={"heart_rate": 72, "systolic_bp": 120, "diastolic_bp": 80,
              "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000},
        headers=headers,
    )
    # All values normal, should not create new reminders
    response = client.post("/api/reminders/check", headers=headers)
    assert response.status_code == 200


def test_reminder_deduplication(client):
    """Creating same abnormal data twice within 1 hour should not duplicate reminders."""
    headers = _register_and_login(client, "dedupuser")
    abnormal_data = {
        "heart_rate": 150, "systolic_bp": 120, "diastolic_bp": 80,
        "weight": 70, "sleep_hours": 7, "water_intake": 2000, "steps": 8000,
    }

    # First record triggers abnormal reminder
    client.post("/api/health/records", json=abnormal_data, headers=headers)
    count1 = client.get("/api/reminders/unread-count", headers=headers).json()["count"]

    # Second record should NOT create a duplicate (same type within 1 hour)
    client.post("/api/health/records", json=abnormal_data, headers=headers)
    count2 = client.get("/api/reminders/unread-count", headers=headers).json()["count"]

    assert count2 == count1  # No new abnormal reminder created
