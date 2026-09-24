from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from app.pipeline import run_pipeline
from app.queries import (
    query_extra_line_items,
    query_policy_drift,
    get_full_graph,
    get_evidence_for_node
)
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EvidenceFlow backend API for tracing business decisions to code execution and policy drift analysis.",
    version="0.1.0"
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


@app.post("/ingest/run")
def ingest_run():
    """
    Triggers full data ingestion, fact extraction, code analysis, and graph loading.
    """
    try:
        res = run_pipeline()
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/graph")
def get_graph():
    """
    Returns full node and edge list formatted for UI visualization.
    """
    return get_full_graph()


@app.get("/queries/extra-line-items")
def get_extra_line_items():
    """
    Returns unapproved invoice line items missing from the approved Purchase Order.
    """
    return query_extra_line_items()


@app.get("/queries/policy-drift")
def get_policy_drift():
    """
    Compares policy document thresholds with hardcoded code constant thresholds.
    """
    return query_policy_drift()


@app.get("/evidence/{node_id}")
def get_evidence(node_id: str):
    """
    Returns evidence metadata (source file, page/line, snippet) for a given node ID.
    """
    res = get_evidence_for_node(node_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res
