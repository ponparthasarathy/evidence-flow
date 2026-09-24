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
