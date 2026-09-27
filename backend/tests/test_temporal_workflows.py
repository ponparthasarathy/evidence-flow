import pytest
import asyncio
from fastapi.testclient import TestClient
from app.main import app
from app.temporal_workflows import (
    EvidenceFlowIngestionWorkflow,
    ingest_documents_activity,
    extract_llm_facts_activity,
    analyze_code_ast_activity,
    run_z3_verification_activity,
)
from app.temporal_client import execute_temporal_ingestion_workflow, get_workflow_status

client = TestClient(app)

def test_temporal_activities():
    # Test Activity 4: Z3 Formal Verification Activity
    z3_res = asyncio.run(run_z3_verification_activity())
    assert "Microsoft Z3 SMT" in z3_res["verifier"]
    assert "verification_status" in z3_res

def test_temporal_client_execution():
    res = asyncio.run(execute_temporal_ingestion_workflow(sovereign_mode=True))
    assert "workflow_id" in res
    assert res["status"] == "COMPLETED"
    
    wf_id = res["workflow_id"]
    status_res = get_workflow_status(wf_id)
    assert status_res["workflow_id"] == wf_id
    assert status_res["status"] == "COMPLETED"

def test_temporal_api_endpoints():
    # POST /api/workflows/ingest
    res = client.post("/api/workflows/ingest", json={"sovereign_mode": False})
    assert res.status_code == 200
    data = res.json()
    assert "workflow_id" in data
    assert data["status"] == "COMPLETED"
    
    wf_id = data["workflow_id"]
    
    # GET /api/workflows/status/{wf_id}
    status_res = client.get(f"/api/workflows/status/{wf_id}")
    assert status_res.status_code == 200
    st_data = status_res.json()
    assert st_data["workflow_id"] == wf_id
    assert st_data["status"] == "COMPLETED"
