import time
import jwt
from typing import Dict, Any, List, Optional
from pydantic import BaseModel
from fastapi import HTTPException, Header, Depends

SECRET_KEY = "evidence_flow_jwt_secret_key_super_secure"
ALGORITHM = "HS256"

# Define Roles & Exact Permission Matrix
ROLES_PERMISSIONS: Dict[str, List[str]] = {
    "Admin": [
        "users_management", "upload_evidence", "view_po", "view_invoices",
        "view_payments", "view_source_code", "analyze_code", "view_audit_findings",
        "confirm_finding", "manage_roles"
    ],
    "PO Creator": [
        "upload_evidence", "view_po", "view_invoices_limited", "view_audit_findings_own"
    ],
    "Procurement": [
        "upload_evidence", "view_po", "view_invoices_limited", "view_audit_findings_own"
    ],
    "Auditor": [
        "upload_evidence", "view_po", "view_invoices", "view_payments",
        "view_source_code_limited", "analyze_code", "view_audit_findings", "confirm_finding"
    ],
    "Engineer": [
        "upload_evidence", "view_po_limited", "view_invoices_limited",
        "view_source_code", "analyze_code", "view_audit_findings_technical"
    ],
    "Engineering": [
        "upload_evidence", "view_po_limited", "view_invoices_limited",
        "view_source_code", "analyze_code", "view_audit_findings_technical"
    ]
}

# Pre-seeded users matching demo roles (Admin, Engineer, Auditor, PO Creator)
PRESEEDED_USERS = [
    {"id": "usr-1", "name": "Sarah Connor", "email": "admin@evidenceflow.io", "role": "Admin", "status": "Active"},
    {"id": "usr-2", "name": "Marcus Vance", "email": "auditor@evidenceflow.io", "role": "Auditor", "status": "Active"},
    {"id": "usr-3", "name": "David Chen", "email": "procurement@evidenceflow.io", "role": "PO Creator", "status": "Active"},
    {"id": "usr-4", "name": "Alex Mercer", "email": "dev@evidenceflow.io", "role": "Engineer", "status": "Active"}
]

class LoginRequest(BaseModel):
    email: str
    password: str = "password123"

def create_access_token(data: dict) -> str:
    to_encode = data.copy()
    to_encode.update({"exp": time.time() + 86400}) # 24 hour token
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_access_token(token: str) -> Optional[dict]:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        return payload
    except Exception:
        return None

def has_permission(user_role: str, permission: str) -> bool:
    role_perms = ROLES_PERMISSIONS.get(user_role, [])
    if permission in role_perms:
        return True
    # Check for broader permission if specific limited permission is assigned
    if permission + "_limited" in role_perms or permission + "_own" in role_perms:
        return True
    return False

def filter_nodes_by_role(nodes: List[Dict[str, Any]], role: str) -> List[Dict[str, Any]]:
    """
    Filters graph nodes according to role-based visibility restrictions.
    """
    if role in ["Admin", "Auditor"]:
        return nodes # Full unrestricted view
    
    filtered = []
    for node in nodes:
        ntype = node.get("type")
        if role in ["PO Creator", "Procurement"]:
            if ntype in ["PurchaseOrder", "Invoice", "Decision", "Approval", "Policy"]:
                filtered.append(node)
        elif role in ["Engineer", "Engineering"]:
            if ntype in ["CodeFunction", "Commit", "Developer", "Policy", "PurchaseOrder", "Invoice"]:
                filtered.append(node)
        else:
            filtered.append(node)
    return filtered
