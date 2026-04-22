"""Tests for health report endpoints and PDF export."""
from unittest.mock import patch


def _register_and_login(client, username="repuser", name="Rep User"):
    client.post(
        "/api/users/register",
        json={"username": username, "password": "password123", "name": name, "age": 28},
    )
    login_res = client.post(
        "/api/users/login",
        json={"username": username, "password": "password123"},
    )
    return {"Authorization": f"Bearer {login_res.json()['access_token']}"}


def _create_records(client, headers, count=7):
    """Create multiple health records for report generation."""
    for i in range(count):
        client.post(
            "/api/health/records",
            json={
                "heart_rate": 70 + i,
                "systolic_bp": 115 + i,
                "diastolic_bp": 75 + i,
                "weight": 68.0,
                "sleep_hours": 7.5,
                "water_intake": 1800 + i * 100,
                "steps": 7000 + i * 500,
            },
            headers=headers,
        )


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n您的健康状况良好。")
def test_generate_weekly_report(mock_llm, client):
    headers = _register_and_login(client, "weekuser")
    _create_records(client, headers, 7)

    response = client.post(
        "/api/reports/generate",
        json={"report_type": "weekly"},
        headers=headers,
    )
    assert response.status_code == 200
    data = response.json()
    assert data["report_type"] == "weekly"
    assert data["title"] != ""
    assert data["content"] != ""
    assert data["id"] is not None


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n您的月度健康状况良好。")
def test_generate_monthly_report(mock_llm, client):
    headers = _register_and_login(client, "monthuser")
    _create_records(client, headers, 10)

    response = client.post(
        "/api/reports/generate",
        json={"report_type": "monthly"},
        headers=headers,
    )
    assert response.status_code == 200
    assert response.json()["report_type"] == "monthly"


def test_generate_report_no_data(client):
    headers = _register_and_login(client, "nodatauser")
    response = client.post(
        "/api/reports/generate",
        json={"report_type": "weekly"},
        headers=headers,
    )
    assert response.status_code == 400
    assert "无健康数据" in response.json()["detail"]


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n测试报告内容。")
def test_list_reports(mock_llm, client):
    headers = _register_and_login(client, "listuser")
    _create_records(client, headers, 7)

    # Generate two reports
    client.post("/api/reports/generate", json={"report_type": "weekly"}, headers=headers)
    client.post("/api/reports/generate", json={"report_type": "monthly"}, headers=headers)

    response = client.get("/api/reports", headers=headers)
    assert response.status_code == 200
    assert len(response.json()) >= 2


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n详情报告。")
def test_get_report_detail(mock_llm, client):
    headers = _register_and_login(client, "detailuser")
    _create_records(client, headers, 7)

    gen_res = client.post("/api/reports/generate", json={"report_type": "weekly"}, headers=headers)
    report_id = gen_res.json()["id"]

    response = client.get(f"/api/reports/{report_id}", headers=headers)
    assert response.status_code == 200
    assert response.json()["id"] == report_id


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n待删除报告。")
def test_delete_report(mock_llm, client):
    headers = _register_and_login(client, "delrepuser")
    _create_records(client, headers, 7)

    gen_res = client.post("/api/reports/generate", json={"report_type": "weekly"}, headers=headers)
    report_id = gen_res.json()["id"]

    # Delete
    response = client.delete(f"/api/reports/{report_id}", headers=headers)
    assert response.status_code == 200

    # Verify 404 on re-fetch
    response = client.get(f"/api/reports/{report_id}", headers=headers)
    assert response.status_code == 404


@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\nPDF测试报告。")
def test_download_pdf(mock_llm, client):
    headers = _register_and_login(client, "pdfuser")
    _create_records(client, headers, 7)

    gen_res = client.post("/api/reports/generate", json={"report_type": "weekly"}, headers=headers)
    report_id = gen_res.json()["id"]

    response = client.get(f"/api/reports/{report_id}/pdf", headers=headers)
    assert response.status_code == 200
    assert response.headers["content-type"] == "application/pdf"


# Test fallback report generation (AI returns None)
@patch("app.services.report_service._call_llm_api", return_value=None)
def test_generate_report_fallback(mock_llm, client):
    headers = _register_and_login(client, "fallbackuser")
    _create_records(client, headers, 7)

    response = client.post(
        "/api/reports/generate",
        json={"report_type": "weekly"},
        headers=headers,
    )
    assert response.status_code == 200
    content = response.json()["content"]
    assert "改善建议" in content  # Fallback report includes this section


# Test report filtering by type
@patch("app.services.report_service._call_llm_api", return_value="## 综合评估\n筛选测试。")
def test_list_reports_by_type(mock_llm, client):
    headers = _register_and_login(client, "filteruser")
    _create_records(client, headers, 7)

    client.post("/api/reports/generate", json={"report_type": "weekly"}, headers=headers)
    client.post("/api/reports/generate", json={"report_type": "monthly"}, headers=headers)

    # Filter weekly only
    response = client.get("/api/reports?report_type=weekly", headers=headers)
    assert response.status_code == 200
    for r in response.json():
        assert r["report_type"] == "weekly"


# Test get non-existent report
def test_get_report_not_found(client):
    headers = _register_and_login(client, "norepuser")
    response = client.get("/api/reports/9999", headers=headers)
    assert response.status_code == 404


# Test delete non-existent report
def test_delete_report_not_found(client):
    headers = _register_and_login(client, "nodelrepuser")
    response = client.delete("/api/reports/9999", headers=headers)
    assert response.status_code == 404


# Test PDF for non-existent report
def test_download_pdf_not_found(client):
    headers = _register_and_login(client, "nopdfuser")
    response = client.get("/api/reports/9999/pdf", headers=headers)
    assert response.status_code == 404
