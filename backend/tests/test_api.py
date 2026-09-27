import pytest
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)

def test_api_endpoints():
    # 1. Ingest run
    response = client.post("/ingest/run")
    assert response.status_code == 200
    data = response.json()
    assert data["status"] == "success"

    # 2. Get Graph
    response = client.get("/graph")
    assert response.status_code == 200
    graph = response.json()
    assert "nodes" in graph
    assert "edges" in graph
    assert len(graph["nodes"]) > 0

    # 3. Query extra line items
    response = client.get("/queries/extra-line-items")
    assert response.status_code == 200
    res = response.json()
    assert len(res["findings"]) == 1
    assert res["findings"][0]["extra_item"] == "Premium support"

    # 4. Query policy drift
    response = client.get("/queries/policy-drift")
    assert response.status_code == 200
    res = response.json()
    assert len(res["findings"]) == 1
    assert res["findings"][0]["drift_status"] == "stale code: policy changed after last commit"

    # 5. Get Evidence for a node
    first_node_id = graph["nodes"][0]["id"]
    response = client.get(f"/evidence/{first_node_id}")
    assert response.status_code == 200
    ev = response.json()
    assert ev["node_id"] == first_node_id
    assert "file_path" in ev

    # 6. NL Query Engine (Text-to-Cypher / Text-to-SQL)
    nl_q = "Show me all invoices over ₹5 Lakhs approved by David Chen where the code function was modified after Feb 2023."
    response = client.post("/api/queries/nl", json={"query": nl_q})
    assert response.status_code == 200
    nl_res = response.json()
    assert "cypher" in nl_res
    assert "sql" in nl_res
    assert "MATCH" in nl_res["cypher"]
    assert "SELECT" in nl_res["sql"]
    assert "500000" in nl_res["cypher"]

    # 7. AES-256-GCM Encrypted Data Payload Verification
    plain = "Confidential ISO 19011 Audit Evidence snippet for ₹1,200,000 disbursement"
    enc_res = client.post("/api/crypto/encrypt", json={"plain_text": plain})
    assert enc_res.status_code == 200
    ciphertext_b64 = enc_res.json()["ciphertext_b64"]
    assert ciphertext_b64 != plain
    assert enc_res.json()["algorithm"] == "AES-256-GCM"

    dec_res = client.post("/api/crypto/decrypt", json={"ciphertext_b64": ciphertext_b64})
    assert dec_res.status_code == 200
    assert dec_res.json()["plain_text"] == plain
    assert dec_res.json()["authenticated"] is True

    # 8. Chart.js Time-Series Analytics (Daily, Weekly, Monthly, Yearly) & RBAC Check
    for tf in ["daily", "weekly", "monthly", "yearly"]:
        chart_res = client.get(f"/api/analytics/charts?timeframe={tf}", headers={"X-User-Role": "Admin"})
        assert chart_res.status_code == 200
        chart_data = chart_res.json()
        assert chart_data["timeframe"] == tf
        assert "labels" in chart_data
        assert "spend_trend" in chart_data
        assert "drift_anomalies" in chart_data

    # Auditor access allowed
    auditor_res = client.get("/api/analytics/charts?timeframe=monthly", headers={"X-User-Role": "Auditor"})
    assert auditor_res.status_code == 200

    # Non-Admin/Auditor access forbidden (403)
    forbidden_res = client.get("/api/analytics/charts?timeframe=monthly", headers={"X-User-Role": "PO Creator"})
    assert forbidden_res.status_code == 403


