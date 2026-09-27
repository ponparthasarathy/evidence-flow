import pytest
from fastapi.testclient import TestClient
from app.main import app
from app.formal_verification import (
    verify_policy_code_equivalence,
    verify_invoice_po_matching,
    run_full_system_formal_verification
)

client = TestClient(app)

def test_z3_formal_equivalence_contradiction():
    # Policy = 500,000 vs Code = 1,200,000 -> Z3 should prove UNSATISFIED_CONTRADICTION
    res = verify_policy_code_equivalence(500000.0, 1200000.0, constant_name="CFO_APPROVAL_LIMIT")
    assert res["status"] == "UNSATISFIED_CONTRADICTION"
    assert res["is_proven_compliant"] is False
    assert "counterexample" in res
    assert res["counterexample"]["discrepancy_transaction_amount"] is not None

def test_z3_formal_equivalence_sat():
    # Policy = 500,000 vs Code = 500,000 -> Z3 should prove FORMALLY_VERIFIED_SAT
    res = verify_policy_code_equivalence(500000.0, 500000.0, constant_name="CFO_APPROVAL_LIMIT")
    assert res["status"] == "FORMALLY_VERIFIED_SAT"
    assert res["is_proven_compliant"] is True
    assert res["counterexample"] is None

def test_z3_line_item_matching_verification():
    # Line items with an unapproved item -> Z3 proves UNSATISFIED_INVARIANT_VIOLATION
    items = [
        {"description": "Server Node", "amount": 600000.0, "is_approved": True},
        {"description": "Unapproved Addon", "amount": 200000.0, "is_approved": False}
    ]
    res = verify_invoice_po_matching(1200000.0, items)
    assert res["status"] == "UNSATISFIED_INVARIANT_VIOLATION"
    assert res["is_proven_compliant"] is False
    assert len(res["unapproved_items"]) == 1

def test_z3_api_endpoints():
    # GET /api/verify/z3
    res = client.get("/api/verify/z3")
    assert res.status_code == 200
    data = res.json()
    assert "Microsoft Z3 SMT Formal Verification Engine" in data["verifier"]
    assert "policy_vs_code_proof" in data
    assert "line_item_bounds_proof" in data

    # POST /api/verify/z3/custom (mismatch test)
    custom_res = client.post("/api/verify/z3/custom", json={
        "policy_threshold": 500000.0,
        "code_threshold": 1200000.0,
        "threshold_name": "CFO_APPROVAL_LIMIT"
    })
    assert custom_res.status_code == 200
    c_data = custom_res.json()
    assert c_data["policy_vs_code_proof"]["status"] == "UNSATISFIED_CONTRADICTION"

    # POST /api/verify/z3/custom (matching test)
    custom_sat = client.post("/api/verify/z3/custom", json={
        "policy_threshold": 500000.0,
        "code_threshold": 500000.0,
        "threshold_name": "CFO_APPROVAL_LIMIT"
    })
    assert custom_sat.status_code == 200
    sat_data = custom_sat.json()
    assert sat_data["policy_vs_code_proof"]["status"] == "FORMALLY_VERIFIED_SAT"
