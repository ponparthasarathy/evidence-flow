import os
import sys
import git
from datetime import datetime, timezone
from reportlab.lib.pagesizes import letter
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib import colors

ROOT_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), ".."))
DATA_DIR = os.path.join(ROOT_DIR, "data")
REPO_DIR = os.path.join(ROOT_DIR, "sample_repo")

os.makedirs(DATA_DIR, exist_ok=True)
os.makedirs(REPO_DIR, exist_ok=True)


def create_tender_pdf():
    filepath = os.path.join(DATA_DIR, "tender_server.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    title_style = ParagraphStyle(
        'DocTitle',
        parent=styles['Heading1'],
        fontSize=18,
        leading=22,
        textColor=colors.HexColor("#1A365D")
    )
    
    story.append(Paragraph("TENDER DOCUMENT: IT INFRASTRUCTURE PROCUREMENT", title_style))
    story.append(Spacer(1, 12))
    story.append(Paragraph("Tender Reference: TND-2024-SERVER-01", styles['Heading3']))
    story.append(Paragraph("Issue Date: 2024-01-05", styles['Normal']))
    story.append(Spacer(1, 12))
    
    body_text = """
    <b>Project Title:</b> Enterprise High-Performance Server Acquisition<br/>
    <b>Department:</b> IT Infrastructure & Operations<br/>
    <b>Approved Budget:</b> ₹12,00,000 (Twelve Lakh Indian Rupees)<br/>
    <b>Quantity Required:</b> 1 Server Unit<br/><br/>
    <b>Scope of Work:</b> Supply, installation, and deployment of 1 High-Performance Enterprise Server with 3-year standard hardware warranty.
    """
    story.append(Paragraph(body_text, styles['Normal']))
    doc.build(story)
    print(f"Generated {filepath}")


def create_policy_email():
    filepath = os.path.join(DATA_DIR, "policy_cfo_approval.eml")
    content = """From: Finance Policy Desk <policy@enterprise.com>
To: All Department Heads <mgmt@enterprise.com>
Subject: Updated Financial Approval Matrix & Policy
Date: Wed, 1 Feb 2023 09:00:00 +0530

Dear Management Team,

Please note the updated financial approval limits effective immediately.

Effective Feb 1, 2023, invoices above ₹5,00,000 require CFO sign-off prior to payment disbursement.

All purchase approvals and invoice processing workflows must strictly enforce this updated threshold.

Regards,
Finance Governance Office
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {filepath}")


def create_approval_email():
    filepath = os.path.join(DATA_DIR, "approval_vendor_b.eml")
    content = """From: Chief Information Officer <cio@enterprise.com>
To: Procurement Office <procurement@enterprise.com>
Subject: Approval: IT Server Tender - Vendor B Selection
Date: Mon, 15 Jan 2024 14:30:00 +0530

Procurement Team,

Based on the evaluation of Tender #TND-2024-SERVER-01, CIO approves Vendor B for the ₹12,00,000 purchase.

Please issue Purchase Order #4521 to Vendor B Solutions for ₹12,00,000 under the approved payment terms: 50% advance and 50% after installation.

Thanks,
CIO
"""
    with open(filepath, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"Generated {filepath}")


def create_po_pdf():
    filepath = os.path.join(DATA_DIR, "po_4521.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("PURCHASE ORDER", styles['Heading1']))
    story.append(Spacer(1, 10))
    
    header_data = [
        ["PO Number:", "PO #4521", "PO Date:", "2024-01-18"],
        ["Vendor:", "Vendor B Solutions", "Total Amount:", "₹12,00,000"],
        ["Terms:", "50% now / 50% after installation", "Approver:", "CIO"]
    ]
    t_header = Table(header_data, colWidths=[100, 180, 100, 140])
    t_header.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Line Items:", styles['Heading3']))
    story.append(Spacer(1, 6))

    table_data = [
        ["Item #", "Description", "Qty", "Unit Price (₹)", "Total (₹)"],
        ["1", "High Performance Enterprise Server", "1", "12,00,000", "12,00,000"]
    ]
    t_items = Table(table_data, colWidths=[50, 250, 40, 90, 90])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_items)
    doc.build(story)
    print(f"Generated {filepath}")


def create_invoice_1_pdf():
    filepath = os.path.join(DATA_DIR, "invoice_1.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("INVOICE: INV-2024-001", styles['Heading1']))
    story.append(Spacer(1, 10))
    
    header_data = [
        ["Invoice Number:", "INV-2024-001", "Date:", "2024-01-20"],
        ["Vendor:", "Vendor B Solutions", "PO Reference:", "PO #4521"],
        ["Billed To:", "Enterprise Inc.", "Total Due:", "₹6,00,000"]
    ]
    t_header = Table(header_data, colWidths=[110, 170, 100, 140])
    t_header.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Billed Line Items:", styles['Heading3']))
    story.append(Spacer(1, 6))

    table_data = [
        ["Item #", "Description", "Qty", "Amount (₹)"],
        ["1", "High Performance Enterprise Server - Advance (50%)", "1", "6,00,000"]
    ]
    t_items = Table(table_data, colWidths=[50, 300, 40, 130])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_items)
    doc.build(story)
    print(f"Generated {filepath}")


def create_invoice_2_pdf():
    filepath = os.path.join(DATA_DIR, "invoice_2.pdf")
    doc = SimpleDocTemplate(filepath, pagesize=letter)
    styles = getSampleStyleSheet()
    story = []

    story.append(Paragraph("INVOICE: INV-2024-002", styles['Heading1']))
    story.append(Spacer(1, 10))
    
    header_data = [
        ["Invoice Number:", "INV-2024-002", "Date:", "2024-02-10"],
        ["Vendor:", "Vendor B Solutions", "PO Reference:", "PO #4521"],
        ["Billed To:", "Enterprise Inc.", "Total Due:", "₹6,50,000"]
    ]
    t_header = Table(header_data, colWidths=[110, 170, 100, 140])
    t_header.setStyle(TableStyle([
        ('FONTNAME', (0,0), (-1,-1), 'Helvetica'),
        ('FONTSIZE', (0,0), (-1,-1), 10),
        ('BOTTOMPADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_header)
    story.append(Spacer(1, 15))

    story.append(Paragraph("Billed Line Items:", styles['Heading3']))
    story.append(Spacer(1, 6))

    table_data = [
        ["Item #", "Description", "Qty", "Amount (₹)"],
        ["1", "High Performance Enterprise Server - Balance (50%)", "1", "6,00,000"],
        ["2", "Premium support", "1", "50,000"]
    ]
    t_items = Table(table_data, colWidths=[50, 300, 40, 130])
    t_items.setStyle(TableStyle([
        ('BACKGROUND', (0,0), (-1,0), colors.HexColor("#E2E8F0")),
        ('GRID', (0,0), (-1,-1), 1, colors.HexColor("#CBD5E1")),
        ('FONTNAME', (0,0), (-1,0), 'Helvetica-Bold'),
        ('PADDING', (0,0), (-1,-1), 6),
    ]))
    story.append(t_items)
    doc.build(story)
    print(f"Generated {filepath}")


def setup_sample_repo():
    payment_processor_path = os.path.join(REPO_DIR, "payment_processor.py")

    # If repo exists, re-initialize cleanly by removing old git history
    if os.path.exists(REPO_DIR):
        import shutil
        shutil.rmtree(REPO_DIR, ignore_errors=True)
    os.makedirs(REPO_DIR, exist_ok=True)

    repo = git.Repo.init(REPO_DIR)
    
    # Configure git committer details locally for test stability
    with repo.config_writer() as config:
        config.set_value("user", "name", "Finance Dev")
        config.set_value("user", "email", "dev@enterprise.com")

    # Commit 1: Add CFO threshold
    v1_content = """\"\"\"
Vendor Payment Processor Module
Handles vendor invoice payments and policy checks.
\"\"\"

# Financial approval limits
CFO_APPROVAL_LIMIT = 1000000  # ₹10,00,000 threshold for CFO approval


def process_vendor_payment(invoice: dict) -> dict:
    \"\"\"
    Executes vendor payment processing for approved invoices.
    \"\"\"
    amount = invoice.get("amount", 0)
    cfo_approved = invoice.get("cfo_approved", False)

    if amount > CFO_APPROVAL_LIMIT and not cfo_approved:
        raise ValueError(f"Invoice amount ₹{amount} exceeds CFO approval threshold of ₹{CFO_APPROVAL_LIMIT}")

    payment_record = {
        "payment_id": f"PAY-{invoice.get('invoice_number', 'UNKNOWN')}",
        "amount": amount,
        "status": "COMPLETED",
        "processed_by": "process_vendor_payment"
    }
    return payment_record
"""
    with open(payment_processor_path, "w", encoding="utf-8") as f:
        f.write(v1_content)
    
    repo.index.add(["payment_processor.py"])
    commit1_date = datetime(2022, 3, 10, 10, 0, 0, tzinfo=timezone.utc).strftime("%Y-%m-%d %H:%M:%S %z")
    repo.index.commit("Set CFO approval threshold per finance policy", author_date=commit1_date, commit_date=commit1_date)

    # Commit 2: Add logging (does NOT touch threshold)
    v2_content = """\"\"\"
Vendor Payment Processor Module
Handles vendor invoice payments and policy checks with audit logging.
\"\"\"
import logging

logger = logging.getLogger("payment_processor")

# Financial approval limits
CFO_APPROVAL_LIMIT = 1000000  # ₹10,00,000 threshold for CFO approval


def process_vendor_payment(invoice: dict) -> dict:
    \"\"\"
    Executes vendor payment processing for approved invoices.
    \"\"\"
    logger.info("Processing vendor payment for invoice %s", invoice.get("invoice_number"))
    amount = invoice.get("amount", 0)
    cfo_approved = invoice.get("cfo_approved", False)

    if amount > CFO_APPROVAL_LIMIT and not cfo_approved:
        logger.error("CFO approval required for amount %s", amount)
        raise ValueError(f"Invoice amount ₹{amount} exceeds CFO approval threshold of ₹{CFO_APPROVAL_LIMIT}")

    payment_record = {
        "payment_id": f"PAY-{invoice.get('invoice_number', 'UNKNOWN')}",
        "amount": amount,
        "status": "COMPLETED",
        "processed_by": "process_vendor_payment"
    }
    return payment_record
"""
    with open(payment_processor_path, "w", encoding="utf-8") as f:
        f.write(v2_content)
    
    repo.index.add(["payment_processor.py"])
    commit2_date = datetime(2023, 5, 15, 11, 0, 0, tzinfo=timezone.utc).strftime("%Y-%m-%d %H:%M:%S %z")
    repo.index.commit("Add detailed transaction logging", author_date=commit2_date, commit_date=commit2_date)

    # Commit 3: Refactor error handling (does NOT touch threshold)
    v3_content = """\"\"\"
Vendor Payment Processor Module
Handles vendor invoice payments and policy checks with audit logging.
\"\"\"
import logging

logger = logging.getLogger("payment_processor")

# Financial approval limits
CFO_APPROVAL_LIMIT = 1000000  # ₹10,00,000 threshold for CFO approval


def process_vendor_payment(invoice: dict) -> dict:
    \"\"\"
    Executes vendor payment processing for approved invoices.
    \"\"\"
    invoice_num = invoice.get("invoice_number", "UNKNOWN")
    logger.info("Processing vendor payment for invoice %s", invoice_num)
    amount = invoice.get("amount", 0)
    cfo_approved = invoice.get("cfo_approved", False)

    if amount > CFO_APPROVAL_LIMIT and not cfo_approved:
        msg = f"Invoice amount ₹{amount} exceeds CFO approval threshold of ₹{CFO_APPROVAL_LIMIT}"
        logger.error(msg)
        raise ValueError(msg)

    payment_record = {
        "payment_id": f"PAY-{invoice_num}",
        "amount": amount,
        "status": "COMPLETED",
        "processed_by": "process_vendor_payment"
    }
    return payment_record
"""
    with open(payment_processor_path, "w", encoding="utf-8") as f:
        f.write(v3_content)
    
    repo.index.add(["payment_processor.py"])
    commit3_date = datetime(2024, 2, 1, 12, 0, 0, tzinfo=timezone.utc).strftime("%Y-%m-%d %H:%M:%S %z")
    repo.index.commit("Refactor payment error handling", author_date=commit3_date, commit_date=commit3_date)

    print(f"Initialized git repo at {REPO_DIR} with 3 commits.")


if __name__ == "__main__":
    create_tender_pdf()
    create_policy_email()
    create_approval_email()
    create_po_pdf()
    create_invoice_1_pdf()
    create_invoice_2_pdf()
    setup_sample_repo()
