import json
import os
from typing import Dict, Any
from app.config import settings
from app.ingest import ingest_data_dir
from app.extract import extract_fact_with_llm
from app.code_analysis import analyze_repository
from app.graph_load import load_extracted_facts_into_graph, db

def run_pipeline() -> Dict[str, Any]:
    """
    Executes the full pipeline:
    1. Ingest files from settings.DATA_DIR
    2. Extract facts using LLM / disk cache
    3. Analyze code using tree-sitter & GitPython
    4. Load everything into Neo4j graph store idempotently
    """
    # Clear previous run if needed or merge idempotently
    pages = ingest_data_dir(settings.DATA_DIR)

    extracted_facts = []
    for p in pages:
        fact = extract_fact_with_llm(p["text"], p["file_name"], p["page"], p["file_path"])
        extracted_facts.append(fact)

    code_analysis = analyze_repository(settings.REPO_DIR)

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

    return {
        "status": "success",
        "ingested_pages": len(pages),
        "extracted_facts": len(extracted_facts),
        "graph_summary": {
            "total_nodes": len(nodes),
            "total_edges": len(edges)
        }
    }
