import os
import pytest
from app.ingest import ingest_data_dir
from app.extract import extract_fact_with_llm, ExtractionResult
from app.config import settings

def test_ingest_and_extract():
    data_dir = settings.DATA_DIR
    pages = ingest_data_dir(data_dir)
    assert len(pages) >= 6, f"Expected at least 6 document pages in {data_dir}, found {len(pages)}"

    extracted_facts = []
    for p in pages:
        fact = extract_fact_with_llm(p["text"], p["file_name"], p["page"], p["file_path"])
        assert isinstance(fact, ExtractionResult)
        assert fact.doc_type in ["decision", "policy", "approval", "purchase_order", "invoice"]
        assert fact.source_path == p["file_path"]
        assert fact.page_ref == p["page"]
        extracted_facts.append(fact)

    doc_types = [f.doc_type for f in extracted_facts]
    assert "policy" in doc_types
    assert "approval" in doc_types
    assert "purchase_order" in doc_types
    assert "invoice" in doc_types
    assert "decision" in doc_types

    # Specific assertions
    policy_fact = next(f for f in extracted_facts if f.doc_type == "policy")
    assert policy_fact.threshold_value == 500000
    assert policy_fact.date == "2023-02-01"

    invoice_2_fact = next(f for f in extracted_facts if f.ref_number == "INV-2024-002")
    assert invoice_2_fact.amount == 650000
    item_names = [item["description"] for item in invoice_2_fact.line_items]
    assert "Premium support" in item_names
