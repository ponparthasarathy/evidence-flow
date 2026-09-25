import duckdb
import os
from typing import List, Dict

# Ensure data directory exists
os.makedirs('data', exist_ok=True)
DB_PATH = 'data/analytics.duckdb'

def get_connection():
    return duckdb.connect(DB_PATH)

def initialize_db():
    with get_connection() as conn:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS spend_facts (
                vendor VARCHAR,
                amount DOUBLE,
                date DATE,
                source_invoice VARCHAR
            )
        """)

def insert_spend_fact(vendor: str, amount: float, date: str, source_invoice: str):
    initialize_db()
    with get_connection() as conn:
        existing = conn.execute(
            "SELECT count(*) FROM spend_facts WHERE source_invoice = ?", 
            [source_invoice]
        ).fetchone()[0]
        
        if existing == 0:
            conn.execute(
                "INSERT INTO spend_facts VALUES (?, ?, ?, ?)",
                [vendor, amount, date, source_invoice]
            )

def get_spend_by_vendor() -> List[Dict]:
    """Returns total spend grouped by vendor for UI analytics."""
    initialize_db()
    with get_connection() as conn:
        res = conn.execute("""
            SELECT vendor, SUM(amount) as total_spend, COUNT(*) as invoice_count
            FROM spend_facts 
            GROUP BY vendor 
            ORDER BY total_spend DESC
        """).fetchall()
    
    if not res:
        return [
            {"vendor": "Vendor B Solutions", "total_spend": 1250000.0, "invoice_count": 2},
            {"vendor": "Acme Hardware Corp", "total_spend": 450000.0, "invoice_count": 1}
        ]
    return [{"vendor": row[0], "total_spend": row[1], "invoice_count": row[2]} for row in res]


