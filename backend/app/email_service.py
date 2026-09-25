import os
import smtplib
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText
from email.mime.application import MIMEApplication
from typing import List, Dict, Any, Optional

GMAIL_SENDER = os.getenv("SENDER_EMAIL", "navinrajaa02@gmail.com")
GMAIL_APP_PASSWORD = os.getenv("GMAIL_APP_PASSWORD", os.getenv("EVIDENCE_GMAIL_PASS", "khpiceqzmoomqfto"))

def send_emergency_po_email(
    po_title: str,
    amount: float,
    purpose: str,
    auditor_email: str = "ponparthasarathyrajesh@gmail.com",
    cfo_email: str = "palvannan.anand@gmail.com",
    sender_email: str = "navinrajaa02@gmail.com",
    attachments: Optional[List[Dict[str, Any]]] = None
) -> Dict[str, Any]:
    """
    Constructs and sends real emergency PO authorization emails via Gmail SMTP to Auditor & CFO.
    Requires GMAIL_APP_PASSWORD environment variable or user App Password configuration.
    """
    recipients = [auditor_email.strip(), cfo_email.strip()]
    recipients = [r for r in recipients if r]

    msg = MIMEMultipart("mixed")
    msg["Subject"] = f"🚨 URGENT: Emergency PO Approval Required (₹{amount:,.2f}) - {po_title}"
    msg["From"] = f"PO Creator <{sender_email}>"
    msg["To"] = ", ".join(recipients)

    html_content = f"""
    <!DOCTYPE html>
    <html>
    <body style="font-family: Arial, sans-serif; background-color: #f4f6f8; padding: 20px; color: #333;">
      <div style="max-width: 650px; background: #ffffff; margin: 0 auto; border-radius: 8px; border: 1px solid #e1e4e8; padding: 24px;">
        <div style="border-bottom: 3px solid #BC0202; padding-bottom: 12px; margin-bottom: 16px;">
          <h2 style="color: #BC0202; margin: 0; font-size: 20px;">🚨 Emergency Purchase Order Authorization Request</h2>
          <div style="font-size: 13px; color: #666; margin-top: 4px;">EvidenceFlow Compliance & Governance System</div>
        </div>

        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold; width: 35%;">Emergency PO Title:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">{po_title}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Estimated Amount:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0; color: #BC0202; font-weight: bold; font-size: 16px;">₹{amount:,.2f} ({amount/100000:.1f} Lakhs)</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Submitted By (PO Creator):</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">{sender_email}</td>
          </tr>
          <tr>
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">Auditor Sign-off Recipient:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">{auditor_email}</td>
          </tr>
          <tr style="background: #f8fafc;">
            <td style="padding: 10px; border: 1px solid #e2e8f0; font-weight: bold;">CFO Sign-off Recipient:</td>
            <td style="padding: 10px; border: 1px solid #e2e8f0;">{cfo_email}</td>
          </tr>
        </table>

        <div style="background: #fff5f5; border-left: 4px solid #BC0202; padding: 14px; margin-bottom: 20px; border-radius: 4px;">
          <h4 style="margin: 0 0 6px 0; color: #991b1b; font-size: 14px;">Operational Emergency Justification & Purpose:</h4>
          <p style="margin: 0; font-size: 13px; color: #7f1d1d; white-space: pre-wrap;">{purpose}</p>
        </div>

        <div style="font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; padding-top: 12px; text-align: center;">
          Sent automatically via EvidenceFlow Governance Gateway from <strong>{sender_email}</strong>.
          <br/>Please review attached supporting invoice & documentation prior to signing off.
        </div>
      </div>
    </body>
    </html>
    """

    msg.attach(MIMEText(html_content, "html"))

    # Attach files if provided
    if attachments:
        for att in attachments:
            try:
                filename = att.get("filename", "attachment.pdf")
                content = att.get("content", b"")
                if isinstance(content, str):
                    content = content.encode("utf-8")
                part = MIMEApplication(content, Name=filename)
                part['Content-Disposition'] = f'attachment; filename="{filename}"'
                msg.attach(part)
            except Exception as att_err:
                print(f"Error attaching file {att}: {att_err}")

    # Send email via Gmail SMTP
    app_pass = GMAIL_APP_PASSWORD.strip()
    if not app_pass:
        return {
            "status": "CONFIG_REQUIRED",
            "message": "Gmail App Password required to dispatch real email over SMTP.",
            "sender": sender_email,
            "recipients": recipients,
            "subject": msg["Subject"],
            "instruction": "Please set GMAIL_APP_PASSWORD environment variable or provide your 16-character Gmail App Password."
        }

    try:
        server = smtplib.SMTP("smtp.gmail.com", 587)
        server.starttls()
        server.login(sender_email, app_pass)
        server.sendmail(sender_email, recipients, msg.as_string())
        server.quit()
        return {
            "status": "SENT_SUCCESS",
            "message": f"Real Emergency PO Authorization email successfully sent to Auditor ({auditor_email}) & CFO ({cfo_email})!",
            "sender": sender_email,
            "recipients": recipients,
            "subject": msg["Subject"]
        }
    except Exception as smtp_err:
        print(f"SMTP Dispatch Error: {smtp_err}")
        return {
            "status": "SMTP_ERROR",
            "error": str(smtp_err),
            "sender": sender_email,
            "recipients": recipients
        }
