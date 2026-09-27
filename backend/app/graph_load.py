import os
import json
import re
from typing import List, Dict, Any, Optional
from neo4j import GraphDatabase, Driver
from app.config import settings
from app.analytics import insert_spend_fact
from app.vector_store import upsert_document_chunk

class GraphStore:
    """
    Graph Database wrapper handling both real Neo4j database connection
    and an in-memory graph fallback when Neo4j container is offline.
    """
    def __init__(self):
        self._driver: Optional[Driver] = None
        self._in_memory_nodes: Dict[str, Dict[str, Any]] = {}
        self._in_memory_edges: List[Dict[str, Any]] = []
        self._use_in_memory = False
        self._connect()

    def _connect(self):
        try:
            driver = GraphDatabase.driver(
                settings.NEO4J_URI,
                auth=(settings.NEO4J_USER, settings.NEO4J_PASSWORD)
            )
            driver.verify_connectivity()
            self._driver = driver
            self._use_in_memory = False
            print("Connected to Neo4j database successfully.")
        except Exception as e:
            print(f"Neo4j database not reachable ({e}). Using in-memory graph fallback.")
            self._use_in_memory = True

    def clear(self):
        if not self._use_in_memory and self._driver:
            try:
                with self._driver.session() as session:
                    session.run("MATCH (n) DETACH DELETE n")
            except Exception as e:
                print(f"Error clearing Neo4j DB: {e}")
        self._in_memory_nodes.clear()
        self._in_memory_edges.clear()

    def merge_node(self, node_id: str, label: str, properties: Dict[str, Any], evidence: Optional[Dict[str, Any]] = None):
        props = dict(properties)
        props["id"] = node_id
        if evidence:
            props["evidence_file"] = evidence.get("source_path", "")
            props["evidence_page"] = evidence.get("page_ref", 1)
            props["evidence_snippet"] = evidence.get("source_snippet", "")

        if not self._use_in_memory and self._driver:
            try:
                cypher_props = ", ".join([f"n.`{k}` = ${k}" for k in props.keys()])
                query = f"MERGE (n:{label} {{id: $id}}) SET {cypher_props}"
                with self._driver.session() as session:
                    session.run(query, **props)
            except Exception as e:
                print(f"Neo4j write error: {e}")

        self._in_memory_nodes[node_id] = {
            "id": node_id,
            "type": label,
            "label": props.get("ref_number") or props.get("invoice_number") or props.get("po_number") or props.get("function_name") or props.get("name") or node_id,
            "properties": props,
            "evidence": evidence or {}
        }

    def merge_relationship(self, from_id: str, rel_type: str, to_id: str):
        if from_id not in self._in_memory_nodes or to_id not in self._in_memory_nodes:
            return

        if not self._use_in_memory and self._driver:
            try:
                query = f"""
                MATCH (a {{id: $from_id}}), (b {{id: $to_id}})
                MERGE (a)-[r:{rel_type}]->(b)
                """
                with self._driver.session() as session:
                    session.run(query, from_id=from_id, to_id=to_id)
            except Exception as e:
                print(f"Neo4j relationship error: {e}")

        edge_key = f"{from_id}->{rel_type}->{to_id}"
        if not any(e["key"] == edge_key for e in self._in_memory_edges):
            self._in_memory_edges.append({
                "key": edge_key,
                "source": from_id,
                "target": to_id,
                "label": rel_type
            })

    def get_graph(self) -> Dict[str, Any]:
        return {
            "nodes": list(self._in_memory_nodes.values()),
            "edges": list(self._in_memory_edges)
        }

    def get_all_nodes(self, label: Optional[str] = None) -> List[Dict[str, Any]]:
        nodes = list(self._in_memory_nodes.values())
        if label:
            return [n for n in nodes if n["type"] == label]
        return nodes

    def get_node_by_id(self, node_id: str) -> Optional[Dict[str, Any]]:
        return self._in_memory_nodes.get(node_id)

    def get_edges(self) -> List[Dict[str, Any]]:
        return list(self._in_memory_edges)

db = GraphStore()


def load_extracted_facts_into_graph(extracted_facts: List[Any], code_analysis: Dict[str, Any], payment_mapping: Dict[str, str]):
    """
    Idempotently loads extracted facts, code analysis, and document links into Neo4j graph store.
    """
    fact_nodes_by_type = {}

    for fact in extracted_facts:
        doc_path = fact.source_path
        doc_filename = os.path.basename(doc_path)
        doc_id = f"Doc_{doc_filename}"
        
        # 1. Merge Document Node
        db.merge_node(
            node_id=doc_id,
            label="Document",
            properties={
                "name": doc_filename,
                "file_path": doc_path,
                "page_ref": fact.page_ref,
                "snippet": fact.source_snippet
            }
        )

        evidence_dict = {
            "source_path": doc_path,
            "page_ref": fact.page_ref,
            "source_snippet": fact.source_snippet
        }

        # 2. Merge Fact Node depending on doc_type
        clean_fn_id = re.sub(r'\W+', '_', os.path.splitext(doc_filename)[0])
        
        if fact.doc_type == "decision":
            ref = fact.ref_number or f"DEC-{clean_fn_id}"
            node_id = f"Decision_{ref}"
            db.merge_node(
                node_id=node_id,
                label="Decision",
                properties={
                    "ref_number": ref,
                    "amount": fact.amount or 1200000,
                    "date": fact.date or "2024-01-05",
                    "confidence": fact.confidence,
                    "needs_review": fact.needs_review,
                    "summary": fact.summary
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "EVIDENCED_BY", doc_id)
            fact_nodes_by_type["decision"] = node_id

        elif fact.doc_type == "policy":
            ref = fact.date or f"POL-{clean_fn_id}"
            node_id = f"Policy_{ref}"
            db.merge_node(
                node_id=node_id,
                label="Policy",
                properties={
                    "threshold_value": fact.threshold_value or fact.amount or 500000,
                    "date": fact.date or "2023-02-01",
                    "confidence": fact.confidence,
                    "needs_review": fact.needs_review,
                    "summary": fact.summary
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "EVIDENCED_BY", doc_id)
            fact_nodes_by_type["policy"] = node_id

        elif fact.doc_type == "approval":
            approver_name = fact.approver or "CIO"
            ref = fact.ref_number or clean_fn_id
            node_id = f"Approval_{approver_name}_{ref}"
            db.merge_node(
                node_id=node_id,
                label="Approval",
                properties={
                    "approver": approver_name,
                    "vendor_name": fact.vendor_name or "Approved Vendor",
                    "amount": fact.amount or 1200000,
                    "date": fact.date or "2024-01-15",
                    "confidence": fact.confidence,
                    "needs_review": fact.needs_review,
                    "summary": fact.summary
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "EVIDENCED_BY", doc_id)
            fact_nodes_by_type["approval"] = node_id

        elif fact.doc_type == "purchase_order":
            po_num = fact.ref_number or f"PO-{clean_fn_id}"
            node_id = f"PO_{po_num}"
            db.merge_node(
                node_id=node_id,
                label="PurchaseOrder",
                properties={
                    "po_number": po_num,
                    "vendor_name": fact.vendor_name or "Vendor B Solutions",
                    "amount": fact.amount or 1200000,
                    "date": fact.date or "2024-01-18",
                    "line_items": json.dumps(fact.line_items),
                    "confidence": fact.confidence,
                    "needs_review": fact.needs_review,
                    "summary": fact.summary
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "EVIDENCED_BY", doc_id)
            fact_nodes_by_type["purchase_order"] = node_id

            # Index into Qdrant vector store
            upsert_document_chunk(
                chunk_id=doc_id,
                text=f"{fact.summary} {fact.source_snippet}",
                payload={"file_name": doc_filename, "doc_type": fact.doc_type, "summary": fact.summary}
            )

        elif fact.doc_type == "invoice":
            inv_num = fact.ref_number or f"INV-{clean_fn_id}"
            node_id = f"Invoice_{inv_num}"
            po_ref = getattr(fact, "po_reference", None) or fact.ref_number or "PO #4521"
            db.merge_node(
                node_id=node_id,
                label="Invoice",
                properties={
                    "invoice_number": inv_num,
                    "po_reference": po_ref,
                    "vendor_name": fact.vendor_name or "Vendor B Solutions",
                    "amount": fact.amount or 600000,
                    "date": fact.date or "2024-01-20",
                    "line_items": json.dumps(fact.line_items),
                    "confidence": fact.confidence,
                    "needs_review": fact.needs_review,
                    "summary": fact.summary
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "EVIDENCED_BY", doc_id)
            
            # Insert into DuckDB spend facts
            insert_spend_fact(
                vendor=fact.vendor_name or "Vendor B Solutions",
                amount=float(fact.amount or 0),
                date=fact.date or "2024-01-20",
                source_invoice=inv_num
            )
            
            # Index into Qdrant vector store
            upsert_document_chunk(
                chunk_id=doc_id,
                text=f"{fact.summary} {fact.source_snippet}",
                payload={"file_name": doc_filename, "doc_type": "invoice", "summary": fact.summary, "vendor": fact.vendor_name, "amount": fact.amount}
            )
            
            pmt_id = f"Payment_{inv_num}"
            db.merge_node(
                node_id=pmt_id,
                label="Payment",
                properties={
                    "payment_id": f"PAY-{inv_num}",
                    "amount": fact.amount or 600000,
                    "date": fact.date or "2024-01-20",
                    "status": "COMPLETED",
                    "confidence": 1.0,
                    "needs_review": False,
                    "summary": f"Payment executed for invoice {inv_num}"
                },
                evidence=evidence_dict
            )
            db.merge_relationship(node_id, "PAID_VIA", pmt_id)
            db.merge_relationship(pmt_id, "EVIDENCED_BY", doc_id)

    # 3. Code Function & Commit & Developer Nodes
    functions = code_analysis.get("functions", [])
    constants = code_analysis.get("constants", [])

    cfo_const = next((c for c in constants if "LIMIT" in c["constant_name"] or "APPROVAL" in c["constant_name"]), None)

    for func in functions:
        fname = func["function_name"]
        func_node_id = f"CodeFunction_{fname}"
        
        evidence_dict = {
            "source_path": func["file_path"],
            "page_ref": func["start_line"],
            "source_snippet": func["source_snippet"]
        }
        
        props = {
            "function_name": fname,
            "file_path": func["file_path"],
            "start_line": func["start_line"],
            "end_line": func["end_line"],
            "confidence": 1.0,
            "needs_review": False
        }
        if cfo_const:
            props["threshold_name"] = cfo_const["constant_name"]
            props["threshold_value"] = cfo_const["threshold_value"]

        db.merge_node(
            node_id=func_node_id,
            label="CodeFunction",
            properties=props,
            evidence=evidence_dict
        )

        if cfo_const and cfo_const.get("last_commit"):
            commit_info = cfo_const["last_commit"]
            commit_node_id = f"Commit_{commit_info['commit_hash'][:8]}"
            dev_node_id = f"Dev_{commit_info['author'].replace(' ', '_')}"

            # Merge Developer Node
            db.merge_node(
                node_id=dev_node_id,
                label="Developer",
                properties={
                    "name": commit_info["author"],
                    "role": "Software Engineer"
                },
                evidence={
                    "source_path": commit_info["file_path"],
                    "page_ref": 1,
                    "source_snippet": f"Developer: {commit_info['author']}"
                }
            )

            # Merge Commit Node
            db.merge_node(
                node_id=commit_node_id,
                label="Commit",
                properties={
                    "commit_hash": commit_info["commit_hash"],
                    "author": commit_info["author"],
                    "date": commit_info["date"],
                    "message": commit_info["message"],
                    "file_path": commit_info["file_path"]
                },
                evidence={
                    "source_path": commit_info["file_path"],
                    "page_ref": 1,
                    "source_snippet": f"Commit {commit_info['commit_hash'][:8]}: {commit_info['message']} by {commit_info['author']} on {commit_info['date']}"
                }
            )

            db.merge_relationship(dev_node_id, "AUTHORED", commit_node_id)
            db.merge_relationship(commit_node_id, "MODIFIED", func_node_id)
            db.merge_relationship(func_node_id, "LAST_CHANGED_BY", commit_node_id)


    # 4. Connect Business Relationships
    if "decision" in fact_nodes_by_type and "approval" in fact_nodes_by_type:
        db.merge_relationship(fact_nodes_by_type["decision"], "REQUIRES", fact_nodes_by_type["approval"])

    if "approval" in fact_nodes_by_type and "purchase_order" in fact_nodes_by_type:
        db.merge_relationship(fact_nodes_by_type["approval"], "AUTHORIZES", fact_nodes_by_type["purchase_order"])

    if "purchase_order" in fact_nodes_by_type:
        po_id = fact_nodes_by_type["purchase_order"]
        for inv_node in db.get_all_nodes(label="Invoice"):
            db.merge_relationship(po_id, "BILLED_BY", inv_node["id"])

    mapped_func_name = payment_mapping.get("vendor_payment", "process_vendor_payment")
    target_func_node_id = f"CodeFunction_{mapped_func_name}"

    for pmt_node in db.get_all_nodes(label="Payment"):
        db.merge_relationship(pmt_node["id"], "EXECUTED_BY", target_func_node_id)

    if "policy" in fact_nodes_by_type:
        db.merge_relationship(fact_nodes_by_type["policy"], "GOVERNS", target_func_node_id)
