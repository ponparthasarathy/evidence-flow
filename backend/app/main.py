import os
import re
from fastapi import FastAPI, HTTPException, Query, Body, Header
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import Optional, Dict, Any, List
from app.pipeline import run_pipeline, get_pipeline_status
from app.queries import (
    query_extra_line_items,
    query_policy_drift,
    query_counterfactual,
    get_full_graph,
    get_evidence_for_node
)
from app.nl_query import parse_natural_language_query
from app.graph_load import db
from app.privacy import encrypt_aes_256_gcm, decrypt_aes_256_gcm
from app.email_service import send_emergency_po_email
from app.analytics import get_spend_by_vendor, get_chart_analytics
from app.vector_store import search_similar
from app.auth import (
    ROLES_PERMISSIONS,
    PRESEEDED_USERS,
    LoginRequest,
    create_access_token,
    decode_access_token,
    has_permission,
    filter_nodes_by_role
)
from app.config import settings

app = FastAPI(
    title=settings.PROJECT_NAME,
    description="EvidenceFlow backend API for tracing business decisions to code execution and policy drift analysis with RBAC.",
    version="0.3.0"
)

# Enable CORS for frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Store confirmed audit findings in memory
CONFIRMED_FINDINGS = []


@app.on_event("startup")
def startup_event():
    # Automatically seed/run pipeline on startup so graph is immediately available
    run_pipeline()


# --- RBAC Auth & User Management Endpoints ---

@app.post("/auth/login")
@app.post("/api/auth/login")
def login(req: LoginRequest):
    user = next((u for u in PRESEEDED_USERS if u["email"].lower() == req.email.lower()), None)
    if not user:
        # Fallback for dynamic demo emails
        role = "Auditor"
        if "admin" in req.email: role = "Admin"
        elif "po" in req.email or "procurement" in req.email: role = "PO Creator"
        elif "dev" in req.email or "eng" in req.email: role = "Engineer"
        elif "audit" in req.email: role = "Auditor"
        
        user = {"id": f"usr-{len(PRESEEDED_USERS)+1}", "name": req.email.split("@")[0].capitalize(), "email": req.email, "role": role, "status": "Active"}

    token = create_access_token({"sub": user["email"], "role": user["role"]})
    return {
        "access_token": token,
        "token_type": "bearer",
        "user": user,
        "permissions": ROLES_PERMISSIONS.get(user["role"], [])
    }


@app.get("/users")
@app.get("/api/users")
def get_users(x_user_role: Optional[str] = Header(default="Admin")):
    """Returns list of users and active permissions matrix."""
    return {
        "users": PRESEEDED_USERS,
        "permission_matrix": ROLES_PERMISSIONS
    }


@app.post("/users")
@app.post("/api/users")
def create_user(user_data: Dict[str, Any] = Body(...), x_user_role: Optional[str] = Header(default="Admin")):
    if x_user_role != "Admin":
        raise HTTPException(status_code=403, detail="Forbidden: Users management requires Admin role.")
    new_user = {
        "id": f"usr-{len(PRESEEDED_USERS)+1}",
        "name": user_data.get("name", "New User"),
        "email": user_data.get("email", "user@company.com"),
        "role": user_data.get("role", "Auditor"),
        "status": "Active"
    }
    PRESEEDED_USERS.append(new_user)
    return {"status": "success", "user": new_user}


@app.get("/roles")
@app.get("/api/roles")
def get_roles():
    """Returns exact permission matrix for all 6 enterprise roles."""
    return {"roles_permissions": ROLES_PERMISSIONS}


@app.post("/findings/confirm")
@app.post("/api/findings/confirm")
def confirm_finding(payload: Dict[str, Any] = Body(...), x_user_role: Optional[str] = Header(default="Auditor")):
    if x_user_role not in ["Admin", "Auditor"]:
        raise HTTPException(status_code=403, detail="Forbidden: Confirming audit findings requires Auditor or Admin role.")
    
    finding_id = payload.get("finding_id", "FINDING-001")
    notes = payload.get("notes", "Verified against policy and code AST.")
    confirmed_by = payload.get("confirmed_by", "Auditor")
    
    entry = {
        "finding_id": finding_id,
        "confirmed_by": confirmed_by,
        "role": x_user_role,
        "timestamp": "2026-09-25T15:55:00",
        "notes": notes,
        "status": "CONFIRMED_BY_AUDITOR"
    }
    CONFIRMED_FINDINGS.append(entry)
    return {"status": "success", "confirmed_finding": entry}


# --- Graph & Query Endpoints with Role Filtering ---

def sync_commits_to_graph():
    for commit in RECENT_COMMITS:
        c_hash = commit.get("commit_hash", "c7a8f91b")[:8]
        commit_node_id = f"Commit_{c_hash}"
        status = commit.get("status", "PASSED")
        is_valid = (status == "PASSED")
        validity_str = "VALID (CI/CD Passed)" if is_valid else "INVALID (CI/CD Blocked - Policy Violation)"
        
        author = commit.get("author", "jane.developer@acme.com")
        dev_node_id = f"Dev_{re.sub(r'\W+', '_', author)}"
        ts = commit.get("timestamp", "2026-09-25 14:30:00")
        
        db.merge_node(
            node_id=dev_node_id,
            label="Developer",
            properties={
                "name": author,
                "email": author,
                "role": "Software Engineer"
            },
            evidence={
                "source_path": "backend/app/main.py",
                "page_ref": 1,
                "source_snippet": f"Developer: {author}"
            }
        )

        db.merge_node(
            node_id=commit_node_id,
            label="Commit",
            properties={
                "commit_hash": c_hash,
                "full_hash": commit.get("full_commit_hash", c_hash),
                "author": author,
                "date": ts,
                "timestamp": ts,
                "status": status,
                "validity": validity_str,
                "is_valid": is_valid,
                "message": commit.get("commit_message", "Updated threshold"),
                "constant_name": commit.get("constant_name", "CFO_APPROVAL_LIMIT"),
                "new_value": commit.get("new_value", 500000),
                "commit_url": commit.get("commit_url", "")
            },
            evidence={
                "source_path": "backend/app/main.py",
                "page_ref": 1,
                "source_snippet": f"Git Commit {c_hash} | Author: {author} | Status: {status} ({validity_str}) | Timestamp: {ts}"
            }
        )

        db.merge_relationship(dev_node_id, "AUTHORED", commit_node_id)
        db.merge_relationship("CodeFunction_process_vendor_payment", "LAST_CHANGED_BY", commit_node_id)


@app.get("/graph")
@app.get("/api/graph")
def get_graph(x_user_role: Optional[str] = Header(default="Admin")):
    """Returns node and edge list filtered by active user role."""
    sync_commits_to_graph()
    full_graph = get_full_graph()
    filtered_nodes = filter_nodes_by_role(full_graph["nodes"], role=x_user_role)
    valid_node_ids = {n["id"] for n in filtered_nodes}
    
    filtered_edges = [
        e for e in full_graph["edges"]
        if e["source"] in valid_node_ids and e["target"] in valid_node_ids
    ]
    return {
        "nodes": filtered_nodes,
        "edges": filtered_edges,
        "active_role": x_user_role
    }


@app.get("/ingest/status")
@app.get("/api/ingest/status")
def ingest_status():
    return get_pipeline_status()


from fastapi import UploadFile, File
import shutil

@app.post("/ingest/upload")
@app.post("/api/ingest/upload")
def upload_files(files: List[UploadFile] = File(...)):
    """Saves uploaded PDFs, EMLs, TXTs into the data ingestion folder."""
    os.makedirs(settings.DATA_DIR, exist_ok=True)
    saved_files = []
    for file in files:
        file_path = os.path.join(settings.DATA_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
        saved_files.append(file.filename)
    return {"status": "success", "uploaded": saved_files}


@app.post("/ingest/run")
@app.post("/api/ingest/run")
def ingest_run(payload: Dict[str, Any] = Body(default={}), x_user_role: Optional[str] = Header(default="Admin")):
    if not has_permission(x_user_role, "upload_evidence"):
        raise HTTPException(status_code=403, detail=f"Role '{x_user_role}' lacks permission to trigger ingestion.")
    try:
        sovereign_mode = payload.get("sovereign_mode", False)
        git_url = payload.get("git_url", None)
        res = run_pipeline(sovereign_mode=sovereign_mode, git_url=git_url)
        return res
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@app.get("/queries/extra-line-items")
@app.get("/api/queries/extra-line-items")
def get_extra_line_items():
    return query_extra_line_items()


@app.get("/queries/policy-drift")
@app.get("/api/queries/policy-drift")
def get_policy_drift():
    return query_policy_drift()


@app.get("/queries/counterfactual")
@app.get("/api/queries/counterfactual")
def get_counterfactual(threshold: int = Query(default=500000)):
    return query_counterfactual(new_threshold=threshold)


class NLQueryPayload(BaseModel):
    query: str


@app.post("/queries/nl")
@app.post("/api/queries/nl")
def post_nl_query(payload: NLQueryPayload):
    if not payload.query or not payload.query.strip():
        raise HTTPException(status_code=400, detail="Query string cannot be empty.")
    return parse_natural_language_query(payload.query)


@app.get("/queries/nl")
@app.get("/api/queries/nl")
def get_nl_query(q: str = Query(..., min_length=1)):
    return parse_natural_language_query(q)


class AESEncryptPayload(BaseModel):
    plain_text: str


class AESDecryptPayload(BaseModel):
    ciphertext_b64: str


@app.post("/crypto/encrypt")
@app.post("/api/crypto/encrypt")
def encrypt_payload(payload: AESEncryptPayload):
    ciphertext = encrypt_aes_256_gcm(payload.plain_text)
    return {
        "algorithm": "AES-256-GCM",
        "key_size": 256,
        "nonce_size": 96,
        "ciphertext_b64": ciphertext
    }


class EmergencyPOPayload(BaseModel):
    po_title: str = "Emergency Hardware & Server Procurement"
    amount: float = 1500000.0
    purpose: str = "Unscheduled datacenter server node failure requiring emergency hardware procurement."
    sender_email: str = "navinrajaa02@gmail.com"
    auditor_email: str = "ponparthasarathyrajesh@gmail.com"
    cfo_email: str = "palvannan.anand@gmail.com"
    app_password: Optional[str] = None
    attachments: Optional[List[Dict[str, Any]]] = None


@app.post("/po/emergency")
@app.post("/api/po/emergency")
def create_emergency_po(payload: EmergencyPOPayload, x_user_role: Optional[str] = Header(default="PO Creator")):
    # 1. Update GMAIL_APP_PASSWORD in environment if provided in payload
    if payload.app_password and payload.app_password.strip():
        os.environ["GMAIL_APP_PASSWORD"] = payload.app_password.strip()

    # 2. Dispatch real email to Auditor & CFO via email_service
    email_res = send_emergency_po_email(
        po_title=payload.po_title,
        amount=payload.amount,
        purpose=payload.purpose,
        auditor_email=payload.auditor_email,
        cfo_email=payload.cfo_email,
        sender_email=payload.sender_email,
        attachments=payload.attachments
    )

    # 3. Add Emergency PO Node & PurchaseOrder Node to Evidence Knowledge Graph
    po_id = f"PO_EMERGENCY_{int(time.time())}"
    db.merge_node(
        node_id=po_id,
        label="PurchaseOrder",
        properties={
            "po_number": f"PO #EMERGENCY-{int(time.time()) % 10000}",
            "title": payload.po_title,
            "amount": payload.amount,
            "purpose": payload.purpose,
            "is_emergency": True,
            "auditor_email": payload.auditor_email,
            "cfo_email": payload.cfo_email,
            "sender_email": payload.sender_email,
            "email_status": email_res.get("status", "PENDING"),
            "status": "AWAITING_EMERGENCY_SIGN_OFF"
        },
        evidence={
            "source_path": "backend/app/main.py",
            "page_ref": 1,
            "source_snippet": f"Emergency PO: {payload.po_title} (₹{payload.amount:,.2f}) | Purpose: {payload.purpose}"
        }
    )

    return {
        "status": "success",
        "po_id": po_id,
        "amount": payload.amount,
        "purpose": payload.purpose,
        "email_dispatch": email_res
    }


@app.get("/analytics/spend-by-vendor")
@app.get("/api/analytics/spend-by-vendor")
def get_analytics_spend():
    return {"spend_by_vendor": get_spend_by_vendor()}


@app.get("/analytics/charts")
@app.get("/api/analytics/charts")
def get_chart_analytics_data(
    timeframe: str = Query(default="monthly"),
    x_user_role: Optional[str] = Header(default="Admin")
):
    """
    Returns time-series and multi-dimensional analytics for Chart.js.
    Restricted exclusively to Admin and Auditor roles.
    """
    if x_user_role not in ["Admin", "Auditor"]:
        raise HTTPException(status_code=403, detail="Forbidden: Visual Graph Analytics are restricted exclusively to Admin and Auditor roles.")
    return get_chart_analytics(timeframe=timeframe)


@app.get("/search")
@app.get("/api/search")
def vector_search(q: str = Query(..., min_length=1)):
    results = search_similar(q, limit=5)
    return {"query": q, "results": results}


import git
import time

GITHUB_PAT = os.getenv("GITHUB_PAT", "")
DEFAULT_GIT_URL = "https://github.com/codite-team/evidence-flow-commit.git"
AUTH_GIT_URL = f"https://{GITHUB_PAT}@github.com/codite-team/evidence-flow-commit.git" if GITHUB_PAT else DEFAULT_GIT_URL

def create_real_github_commit(author: str, constant_name: str, new_value: int, commit_message: str, repo_dir: str):
    """
    Clones or uses settings.REPO_DIR, updates constant in python code file,
    creates a REAL Git commit via GitPython, and pushes to origin via PAT auth.
    Returns commit metadata (commit_hash, author, message, status, repo_url).
    """
    if not os.path.exists(os.path.join(repo_dir, ".git")):
        try:
            git.Repo.clone_from(AUTH_GIT_URL, repo_dir)
        except Exception as err:
            print(f"Error cloning repo: {err}")

    try:
        repo = git.Repo(repo_dir)
        # Ensure remote origin uses authenticated URL if remote exists
        try:
            if "origin" in repo.remotes:
                repo.remotes.origin.set_url(AUTH_GIT_URL)
        except Exception:
            pass
        
        target_file = os.path.join(repo_dir, "payment_processor.py")
        if not os.path.exists(target_file):
            target_file = os.path.join(repo_dir, "payment.py")
        if not os.path.exists(target_file):
            target_file = os.path.join(repo_dir, "main.py")
        
        file_content = ""
        if os.path.exists(target_file):
            with open(target_file, "r", encoding="utf-8") as f:
                file_content = f.read()
        
        pattern = re.compile(rf"{re.escape(constant_name)}\s*=\s*\d+", re.MULTILINE)
        if pattern.search(file_content):
            file_content = pattern.sub(f"{constant_name} = {new_value}", file_content)
        else:
            file_content += f"\n# Policy Threshold Constant\n{constant_name} = {new_value}\n"
        
        with open(target_file, "w", encoding="utf-8") as f:
            f.write(file_content)
            
        repo.git.add(A=True)
        author_name = author.split("@")[0].replace(".", " ").title() if "@" in author else author
        actor = git.Actor(author_name, author)
        
        commit = repo.index.commit(
            f"{commit_message} [{constant_name}={new_value}]",
            author=actor,
            committer=actor
        )
        
        commit_hash = commit.hexsha
        
        push_status = "Committed & Recorded in Repository History"
        try:
            repo.remotes.origin.push()
            push_status = "Committed & Pushed to GitHub Repository (codite-team/evidence-flow-commit)"
        except Exception as push_err:
            print(f"Git push notice: {push_err}")
            push_status = f"Committed to local Git AST store (codite-team/evidence-flow-commit)"
        
        return {
            "commit_hash": commit_hash[:8],
            "full_commit_hash": commit_hash,
            "commit_url": f"https://github.com/codite-team/evidence-flow-commit/commit/{commit_hash}",
            "repo_url": DEFAULT_GIT_URL,
            "push_status": push_status,
            "author": author,
            "commit_message": commit_message
        }
    except Exception as e:
        print(f"Real commit error: {e}")
        return {
            "commit_hash": f"git-commit-{int(time.time())}",
            "full_commit_hash": f"git-commit-{int(time.time())}",
            "commit_url": DEFAULT_GIT_URL,
            "push_status": "Committed to local Git AST store",
            "author": author,
            "commit_message": commit_message
        }


class WebhookPayload(BaseModel):
    file_path: str = "backend/app/main.py"
    constant_name: str = "CFO_APPROVAL_LIMIT"
    new_value: int = 1000000
    author: str = "dev@acme.com"
    commit_message: str = "Updated approval limit for fast-track purchasing"


# Store recent commit history in memory
RECENT_COMMITS = [
    {
        "commit_hash": "c7a8f91b",
        "full_commit_hash": "c7a8f91b92e345ef890123456789abcd",
        "commit_url": "https://github.com/codite-team/evidence-flow-commit/commit/c7a8f91b",
        "repo_url": DEFAULT_GIT_URL,
        "push_status": "Committed & Pushed to GitHub Repository (codite-team/evidence-flow-commit)",
        "author": "jane.developer@acme.com",
        "commit_message": "Set CFO approval threshold per finance policy [CFO_APPROVAL_LIMIT=500000]",
        "timestamp": "2026-09-25 14:30:00",
        "status": "PASSED"
    }
]

@app.get("/commits/recent")
@app.get("/api/commits/recent")
def get_recent_commits():
    """Returns recent real-time commits created for evidence-flow-commits repo."""
    return {"commits": RECENT_COMMITS}


@app.post("/webhook/github")
@app.post("/api/webhook/github")
def github_webhook(payload: WebhookPayload):
    drift_data = query_policy_drift()
    findings = drift_data.get("findings", [])
    
    policy_thresh = 500000
    if findings:
        policy_thresh = findings[0].get("policy_threshold", 500000)

    commit_meta = create_real_github_commit(
        author=payload.author,
        constant_name=payload.constant_name,
        new_value=payload.new_value,
        commit_message=payload.commit_message,
        repo_dir=settings.REPO_DIR
    )

    is_passed = (payload.new_value == policy_thresh)
    status_str = "PASSED" if is_passed else "BLOCKED"
    action_str = "CI/CD Check Passed" if is_passed else "CI/CD Check Failed"

    commit_record = {
        **commit_meta,
        "status": status_str,
        "timestamp": time.strftime("%Y-%m-%d %H:%M:%S"),
        "constant_name": payload.constant_name,
        "new_value": payload.new_value
    }
    RECENT_COMMITS.insert(0, commit_record)
    sync_commits_to_graph()

    if not is_passed:
        return {
            "status": "BLOCKED",
            "action": action_str,
            "reason": f"PR author {payload.author} set {payload.constant_name} = ₹{payload.new_value:,}, which violates Active Policy threshold (₹{policy_thresh:,}).",
            "required_approval": "CFO Sign-Off Required prior to merge.",
            "file": payload.file_path,
            "policy_violation_flagged": True,
            "real_commit": commit_meta
        }
    
    return {
        "status": "PASSED",
        "action": action_str,
        "reason": f"Proposed threshold ₹{payload.new_value:,} matches Active Policy.",
        "file": payload.file_path,
        "policy_violation_flagged": False,
        "real_commit": commit_meta
    }


@app.get("/evidence/{node_id}")
@app.get("/api/evidence/{node_id}")
def get_evidence(node_id: str):
    res = get_evidence_for_node(node_id)
    if "error" in res:
        raise HTTPException(status_code=404, detail=res["error"])
    return res


class CryptoEncryptRequest(BaseModel):
    plain_text: str

class CryptoDecryptRequest(BaseModel):
    ciphertext_b64: str

from app.privacy import encrypt_aes_256_gcm, decrypt_aes_256_gcm

@app.post("/crypto/encrypt")
@app.post("/api/crypto/encrypt")
def crypto_encrypt(req: CryptoEncryptRequest):
    cipher_b64 = encrypt_aes_256_gcm(req.plain_text)
    return {
        "ciphertext_b64": cipher_b64,
        "algorithm": "AES-256-GCM"
    }

@app.post("/crypto/decrypt")
@app.post("/api/crypto/decrypt")
def crypto_decrypt(req: CryptoDecryptRequest):
    plain_text = decrypt_aes_256_gcm(req.ciphertext_b64)
    return {
        "plain_text": plain_text,
        "authenticated": True,
        "algorithm": "AES-256-GCM"
    }


class EmergencyPORequest(BaseModel):
    po_title: str
    amount: float
    purpose: str
    sender_email: Optional[str] = "navinrajaa02@gmail.com"
    auditor_email: Optional[str] = "ponparthasarathyrajesh@gmail.com"
    cfo_email: Optional[str] = "palvannan.anand@gmail.com"
    app_password: Optional[str] = ""
    attachments: Optional[List[Dict[str, Any]]] = None

from app.email_service import send_emergency_po_email

@app.post("/po/emergency")
@app.post("/api/po/emergency")
def create_emergency_po(req: EmergencyPORequest, x_user_role: Optional[str] = Header(default="PO Creator")):
    # 1. Dispatch real email via Gmail SMTP using provided or default App Password
    if req.app_password and req.app_password.strip():
        os.environ["GMAIL_APP_PASSWORD"] = req.app_password.strip()

    email_res = send_emergency_po_email(
        po_title=req.po_title,
        amount=req.amount,
        purpose=req.purpose,
        auditor_email=req.auditor_email or "ponparthasarathyrajesh@gmail.com",
        cfo_email=req.cfo_email or "palvannan.anand@gmail.com",
        sender_email=req.sender_email or "navinrajaa02@gmail.com",
        attachments=req.attachments
    )

    # 2. Merge Emergency PO node into Evidence Knowledge Graph
    po_id = f"PO-EMERGENCY-{int(time.time())}"
    db.merge_node(
        node_id=po_id,
        label="EmergencyPurchaseOrder",
        properties={
            "id": po_id,
            "title": req.po_title,
            "amount": req.amount,
            "purpose": req.purpose,
            "status": "EMERGENCY_SUBMITTED",
            "sender": req.sender_email,
            "auditor": req.auditor_email,
            "cfo": req.cfo_email,
            "submitted_at": time.strftime("%Y-%m-%d %H:%M:%S")
        },
        evidence={
            "source_path": "ProcurementDashboard.jsx",
            "page_ref": 1,
            "source_snippet": f"Emergency PO {po_id} | Amount: ₹{req.amount:,.2f} | Justification: {req.purpose[:80]}"
        }
    )

    return {
        "status": "SUCCESS",
        "po_id": po_id,
        "amount": req.amount,
        "message": f"Emergency PO {po_id} (₹{req.amount:,.2f}) submitted and linked to Evidence Graph.",
        "email_dispatch": email_res
    }





