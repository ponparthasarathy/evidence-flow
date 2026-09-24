import pytest
from app.pipeline import run_pipeline
from app.graph_load import db
from app.queries import query_extra_line_items, query_policy_drift, get_full_graph

def test_acceptance_criteria_1_to_5():
    # Run 1
    res1 = run_pipeline()
    assert res1["status"] == "success"

    # 1. Check Node Counts
    policies = db.get_all_nodes("Policy")
    approvals = db.get_all_nodes("Approval")
    pos = db.get_all_nodes("PurchaseOrder")
    invoices = db.get_all_nodes("Invoice")
    code_funcs = db.get_all_nodes("CodeFunction")
    commits = db.get_all_nodes("Commit")

    assert len(policies) == 1, f"Expected 1 Policy node, got {len(policies)}"
    assert len(approvals) == 1, f"Expected 1 Approval node, got {len(approvals)}"
    assert len(pos) == 1, f"Expected 1 PO node, got {len(pos)}"
    assert len(invoices) == 2, f"Expected 2 Invoice nodes, got {len(invoices)}"
    assert len(code_funcs) >= 1, f"Expected at least 1 CodeFunction node, got {len(code_funcs)}"
    assert len(commits) >= 1, f"Expected at least 1 Commit node, got {len(commits)}"

    # 2. Test extra-line-items query
    extra_res = query_extra_line_items()
    assert len(extra_res["findings"]) == 1, f"Expected 1 extra item finding, got {len(extra_res['findings'])}"
    finding = extra_res["findings"][0]
    assert finding["extra_item"] == "Premium support"
    assert finding["extra_amount"] == 50000
    assert finding["invoice_number"] == "INV-2024-002"
    assert len(extra_res["evidence"]) >= 1

    # 3. Test policy-drift query
    drift_res = query_policy_drift()
    assert len(drift_res["findings"]) == 1, f"Expected 1 policy drift finding, got {len(drift_res['findings'])}"
    drift = drift_res["findings"][0]
    assert drift["policy_threshold"] == 500000
    assert drift["code_threshold_value"] == 1000000
    assert drift["last_commit_date"] == "2022-03-10"
    assert drift["policy_date"] == "2023-02-01"
    assert drift["drift_status"] == "stale code: policy changed after last commit"
    assert len(drift_res["evidence"]) >= 1

    # 4. Test idempotency (run pipeline twice)
    nodes_count_run1 = len(db.get_all_nodes())
    edges_count_run1 = len(db.get_edges())

    run_pipeline() # Run 2

    nodes_count_run2 = len(db.get_all_nodes())
    edges_count_run2 = len(db.get_edges())

    assert nodes_count_run2 == nodes_count_run1, f"Nodes duplicated: {nodes_count_run1} -> {nodes_count_run2}"
    assert edges_count_run2 == edges_count_run1, f"Edges duplicated: {edges_count_run1} -> {edges_count_run2}"

    # 5. Every finding has at least one evidence entry
    for f_item in extra_res["findings"]:
        assert len(extra_res["evidence"]) > 0
        for ev in extra_res["evidence"]:
            assert ev["file"] != ""
            assert ev["snippet"] != ""

    for d_item in drift_res["findings"]:
        assert len(drift_res["evidence"]) > 0
        for ev in drift_res["evidence"]:
            assert ev["file"] != ""
            assert ev["snippet"] != ""
