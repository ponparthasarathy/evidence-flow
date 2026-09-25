from fastapi import FastAPI, HTTPException, Query, Body
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any
from app.pipeline import run_pipeline, get_pipeline_status
from app.queries import (
    query_extra_line_items,
    query_policy_drift,
    query_counterfactual,
    get_full_graph,
    get_evidence_for_node
)
from app.analytics import get_spend_by_vendor
from app.vector_store import search_similar
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EvidenceFlow backend API for tracing business decisions to code execution and policy drift analysis.",
    version="0.2.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.on_event("startup")
def startup_event():
    # Automatically seed/run pipeline on startup so graph is immediately available
    run_pipeline()


@app.get("/ingest/status")
@app.get("/api/ingest/status")
def ingest_status():
    """Returns current status and trace_id of pipeline execution."""
    return get_pipeline_status()


@app.post("/ingest/run")
@app.post("/api/ingest/run")
def ingest_run(payload: Dict[str, Any] = Body(default={})):
    """
    Triggers full data ingestion, fact extraction, code analysis, and graph loading.
    """
    try:
        sovereign_mode = payload.get("sovereign_mode", False)
        res = run_pipeline(sovereign_mode=sovereign_mode)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/graph")
@app.get("/api/graph")
def get_graph():
    """Returns full node and edge list formatted for UI visualization."""
    return get_full_graph()


@app.get("/queries/extra-line-items")
@app.get("/api/queries/extra-line-items")
def get_extra_line_items():
    """Returns unapproved invoice line items missing from approved Purchase Order."""
    return query_extra_line_items()


@app.get("/queries/policy-drift")
@app.get("/api/queries/policy-drift")
def get_policy_drift():
    """Compares policy document thresholds with hardcoded code constant thresholds."""
    return query_policy_drift()


@app.get("/queries/counterfactual")
@app.get("/api/queries/counterfactual")
def get_counterfactual(threshold: int = Query(default=500000)):
    """Runs counterfactual 'What-If' simulation against a hypothetical threshold."""
    return query_counterfactual(new_threshold=threshold)


@app.get("/analytics/spend-by-vendor")
@app.get("/api/analytics/spend-by-vendor")
def get_analytics_spend():
    """Queries DuckDB analytical database for total spend by vendor."""
    return {"spend_by_vendor": get_spend_by_vendor()}


@app.get("/search")
@app.get("/api/search")
def vector_search(q: str = Query(..., min_length=1)):
    """Queries Qdrant vector database for semantically similar document chunks."""
    results = search_similar(q, limit=5)
    return {"query": q, "results": results}


class WebhookPayload(BaseModel):
    file_path: str = "backend/app/main.py"
    constant_name: str = "CFO_APPROVAL_LIMIT"
    new_value: int = 1000000
    author: str = "dev@acme.com"
    commit_message: str = "Updated approval limit for fast-track purchasing"


@app.post("/webhook/github")
@app.post("/api/webhook/github")
def github_webhook(payload: WebhookPayload):
    """
    CI/CD Continuous Compliance Webhook:
    Intercepts GitHub pull requests / commits, checks hardcoded constants against active graph policy nodes,
    and returns a PR status (APPROVED vs BLOCKED).
    """
    drift_data = query_policy_drift()
    findings = drift_data.get("findings", [])
    
    # Check if proposed change exceeds policy
    policy_thresh = 500000
    if findings:
        policy_thresh = findings[0].get("policy_threshold", 500000)

    if payload.new_value != policy_thresh:
        return {
            "status": "BLOCKED",
            "action": "CI/CD Check Failed",
            "reason": f"PR author {payload.author} set {payload.constant_name} = ₹{payload.new_value:,}, which violates Active Policy threshold (₹{policy_thresh:,}).",
            "required_approval": "CFO Sign-Off Required prior to merge.",
            "file": payload.file_path,
            "policy_violation_flagged": True
        }
    
    return {
        "status": "PASSED",
        "action": "CI/CD Check Passed",
        "reason": f"Proposed threshold ₹{payload.new_value:,} matches Active Policy.",
        "file": payload.file_path,
        "policy_violation_flagged": False
    }


@app.get("/evidence/{node_id}")
@app.get("/api/evidence/{node_id}")
def get_evidence(node_id: str):
    """Returns evidence metadata (source file, page/line, snippet) for a given node ID."""
    res = get_evidence_for_node(node_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res

