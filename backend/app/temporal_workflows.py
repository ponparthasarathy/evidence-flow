import asyncio
import os
import json
from datetime import timedelta
from typing import Dict, Any, List
from temporalio import activity, workflow
from temporalio.common import RetryPolicy

from app.ingest import ingest_data_dir
from app.extract import extract_fact_with_llm
from app.code_analysis import analyze_repository
from app.graph_load import load_extracted_facts_into_graph, db
from app.formal_verification import run_full_system_formal_verification
from app.config import settings

# --- Temporal Activities ---

@activity.defn
async def ingest_documents_activity(data_dir: str) -> List[Dict[str, Any]]:
    """Activity 1: Ingests PDFs, EMLs, and TXT files with PII redaction."""
    return ingest_data_dir(data_dir)


@activity.defn
async def extract_llm_facts_activity(params: Dict[str, Any]) -> List[Dict[str, Any]]:
    """Activity 2: Extracts facts using LLM (Gemini/Ollama) with automatic retries."""
    pages = params.get("pages", [])
    sovereign_mode = params.get("sovereign_mode", False)
    extracted = []
    for p in pages:
        fact = extract_fact_with_llm(
            p["text"], p["file_name"], p["page"], p["file_path"], sovereign_mode=sovereign_mode
        )
        extracted.append(fact)
    return extracted


@activity.defn
async def analyze_code_ast_activity(repo_dir: str) -> Dict[str, Any]:
    """Activity 3: Parses Python repository AST constants and Git history."""
    return analyze_repository(repo_dir)


@activity.defn
async def run_z3_verification_activity() -> Dict[str, Any]:
    """Activity 4: Microsoft Z3 SMT Formal Verification of Policy-vs-Code Invariants."""
    return run_full_system_formal_verification()


@activity.defn
async def load_graph_and_duckdb_activity(params: Dict[str, Any]) -> Dict[str, Any]:
    """Activity 5: Loads facts into Neo4j Knowledge Graph & DuckDB OLAP Facts."""
    extracted_facts = params.get("extracted_facts", [])
    code_analysis = params.get("code_analysis", {})
    
    payment_mapping = {}
    if os.path.exists(settings.PAYMENT_MAPPING_FILE):
        try:
            with open(settings.PAYMENT_MAPPING_FILE, "r", encoding="utf-8") as f:
                payment_mapping = json.load(f)
        except Exception:
            payment_mapping = {"vendor_payment": "process_vendor_payment"}
    else:
        payment_mapping = {"vendor_payment": "process_vendor_payment"}

    load_extracted_facts_into_graph(extracted_facts, code_analysis, payment_mapping)
    nodes = db.get_all_nodes()
    edges = db.get_edges()
    return {"total_nodes": len(nodes), "total_edges": len(edges)}


# --- Temporal Workflows ---

@workflow.defn
class EvidenceFlowIngestionWorkflow:
    """
    Temporal Workflow orchestrating end-to-end evidence ingestion,
    LLM extraction, AST analysis, Z3 formal verification, and graph loading.
    """
    @workflow.run
    async def run(self, params: Dict[str, Any]) -> Dict[str, Any]:
        sovereign_mode = params.get("sovereign_mode", False)
        data_dir = params.get("data_dir", settings.DATA_DIR)
        repo_dir = params.get("repo_dir", settings.REPO_DIR)
        
        retry_policy = RetryPolicy(
            initial_interval=timedelta(seconds=1),
            maximum_interval=timedelta(seconds=10),
            maximum_attempts=3,
        )
        
        # Step 1: Ingestion
        pages = await workflow.execute_activity(
            ingest_documents_activity,
            data_dir,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=retry_policy,
        )
        
        # Step 2: LLM Fact Extraction
        extracted_facts = await workflow.execute_activity(
            extract_llm_facts_activity,
            {"pages": pages, "sovereign_mode": sovereign_mode},
            start_to_close_timeout=timedelta(minutes=5),
            retry_policy=retry_policy,
        )
        
        # Step 3: AST Forensics
        code_analysis = await workflow.execute_activity(
            analyze_code_ast_activity,
            repo_dir,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=retry_policy,
        )
        
        # Step 4: Z3 Formal Verification
        z3_certificate = await workflow.execute_activity(
            run_z3_verification_activity,
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=retry_policy,
        )
        
        # Step 5: Graph Loading
        graph_stats = await workflow.execute_activity(
            load_graph_and_duckdb_activity,
            {"extracted_facts": extracted_facts, "code_analysis": code_analysis},
            start_to_close_timeout=timedelta(minutes=2),
            retry_policy=retry_policy,
        )
        
        return {
            "workflow_status": "COMPLETED",
            "ingested_pages": len(pages),
            "extracted_facts": len(extracted_facts),
            "z3_verification": z3_certificate,
            "graph_summary": graph_stats,
        }
