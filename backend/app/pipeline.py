import json
import os
import uuid
import time
from typing import Dict, Any
from app.config import settings
from app.ingest import ingest_data_dir
from app.extract import extract_fact_with_llm
from app.code_analysis import analyze_repository
from app.graph_load import load_extracted_facts_into_graph, db

# OpenTelemetry Tracing setup
try:
    from opentelemetry import trace
    from opentelemetry.sdk.trace import TracerProvider
    from opentelemetry.sdk.trace.export import SimpleSpanProcessor, ConsoleSpanExporter
    
    provider = TracerProvider()
    processor = SimpleSpanProcessor(ConsoleSpanExporter())
    provider.add_span_processor(processor)
    trace.set_tracer_provider(provider)
    tracer = trace.get_tracer("evidence_flow.pipeline")
except Exception:
    tracer = None

PIPELINE_STATUS: Dict[str, Any] = {
    "status": "completed",
    "progress": 100,
    "current_step": "Pipeline execution idle/ready",
    "trace_id": f"ef-trace-{uuid.uuid4().hex[:12]}",
    "sovereign_mode": False,
    "ingested_pages": 0,
    "extracted_facts": 0,
    "total_nodes": 0,
    "total_edges": 0
}

def get_pipeline_status() -> Dict[str, Any]:
    nodes = db.get_all_nodes()
    edges = db.get_edges()
    PIPELINE_STATUS["total_nodes"] = len(nodes)
    PIPELINE_STATUS["total_edges"] = len(edges)
    return PIPELINE_STATUS

def run_pipeline(sovereign_mode: bool = False) -> Dict[str, Any]:
    """
    Executes the full pipeline:
    1. Ingest files from settings.DATA_DIR
    2. Extract facts using LLM / disk cache (with sovereign_mode check)
    3. Analyze code using tree-sitter & GitPython forensics
    4. Load everything into Neo4j graph store, DuckDB analytics, and Qdrant vector store
    """
    global PIPELINE_STATUS
    trace_id = f"ef-trace-{uuid.uuid4().hex[:12]}"
    
    PIPELINE_STATUS.update({
        "status": "running",
        "progress": 10,
        "current_step": "Ingesting document files (.pdf, .eml, .txt)...",
        "trace_id": trace_id,
        "sovereign_mode": sovereign_mode
    })

    try:
        # Step 1: Document Ingestion
        pages = ingest_data_dir(settings.DATA_DIR)
        PIPELINE_STATUS.update({
            "progress": 30,
            "current_step": f"Extracted {len(pages)} pages. Running PII Redaction & LLM Fact Extraction...",
            "ingested_pages": len(pages)
        })

        # Step 2: Extraction & Vector Indexing
        extracted_facts = []
        for p in pages:
            fact = extract_fact_with_llm(
                p["text"], 
                p["file_name"], 
                p["page"], 
                p["file_path"],
                sovereign_mode=sovereign_mode
            )
            extracted_facts.append(fact)

        PIPELINE_STATUS.update({
            "progress": 65,
            "current_step": "Parsing codebase AST & Git forensics history...",
            "extracted_facts": len(extracted_facts)
        })

        # Step 3: Repository AST & Git Forensics
        code_analysis = analyze_repository(settings.REPO_DIR)

        PIPELINE_STATUS.update({
            "progress": 85,
            "current_step": "Loading facts into Neo4j, DuckDB & Qdrant..."
        })

        # Step 4: Loading into Neo4j, DuckDB, Vector Store
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

        PIPELINE_STATUS.update({
            "status": "completed",
            "progress": 100,
            "current_step": "Pipeline execution complete! Knowledge Graph active.",
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        })

        return {
            "status": "success",
            "trace_id": trace_id,
            "ingested_pages": len(pages),
            "extracted_facts": len(extracted_facts),
            "sovereign_mode": sovereign_mode,
            "graph_summary": {
                "total_nodes": len(nodes),
                "total_edges": len(edges)
            }
        }
    except Exception as e:
        PIPELINE_STATUS.update({
            "status": "error",
            "current_step": f"Pipeline error: {str(e)}"
        })
        raise e

