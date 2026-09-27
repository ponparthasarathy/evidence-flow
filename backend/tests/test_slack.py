import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.slack_service import build_slack_weekly_report_payload, send_slack_weekly_report

client = TestClient(app)

def test_build_slack_weekly_report_payload():
    payload = build_slack_weekly_report_payload(timeframe="weekly", channel="#compliance-audit-alerts")
    assert "channel" in payload
    assert payload["channel"] == "#compliance-audit-alerts"
    assert "blocks" in payload
    assert len(payload["blocks"]) > 3
    assert payload["blocks"][0]["type"] == "header"
    assert "Weekly Governance" in payload["blocks"][0]["text"]["text"]

def test_send_slack_weekly_report_simulation():
    res = send_slack_weekly_report(webhook_url="", timeframe="weekly", channel="#test-channel")
    assert res["status"] == "success"
    assert res["dispatch_type"] == "SLACK_BOT_SIMULATION"
    assert res["channel"] == "#test-channel"

def test_slack_api_endpoints():
    # 1. Preview endpoint
    prev_res = client.get("/api/slack/preview?timeframe=monthly")
    assert prev_res.status_code == 200
    prev_data = prev_res.json()
    assert "blocks" in prev_data

    # 2. Trigger send endpoint
    send_res = client.post("/api/slack/send-weekly-report", json={
        "timeframe": "weekly",
        "channel": "#compliance-audit-alerts"
    })
    assert send_res.status_code == 200
    send_data = send_res.json()
    assert send_data["status"] == "success"
    assert "payload_sent" in send_data
