import os
import pytest
from app.code_analysis import analyze_repository
from app.config import settings

def test_code_analysis_sample_repo():
    repo_dir = settings.REPO_DIR
    analysis = analyze_repository(repo_dir)

    functions = analysis["functions"]
    constants = analysis["constants"]

    assert len(functions) >= 1
    func_names = [f["function_name"] for f in functions]
    assert "process_vendor_payment" in func_names

    assert len(constants) >= 1
    cfo_const = next(c for c in constants if c["constant_name"] == "CFO_APPROVAL_LIMIT")
    assert cfo_const["threshold_value"] == 1000000

    last_commit = cfo_const.get("last_commit")
    assert last_commit is not None
    assert last_commit["date"] == "2022-03-10"
    assert "Set CFO approval threshold per finance policy" in last_commit["message"]
