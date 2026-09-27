import React, { useState, useEffect } from 'react';
import { ShoppingCart, FileCheck, AlertTriangle, CheckCircle, Package, Send, Mail, Lock, Paperclip, X, ShieldAlert } from 'lucide-react';

export default function ProcurementDashboard({ currentUser, onNavigate }) {
  const [extraItems, setExtraItems] = useState(null);
  const [showEmergencyModal, setShowEmergencyModal] = useState(false);

  // Emergency PO Form State
  const [poTitle, setPoTitle] = useState('Emergency Datacenter Server Infrastructure');
  const [amount, setAmount] = useState(1500000);
  const [purpose, setPurpose] = useState('Unscheduled primary server node failure causing critical downtime. Requires urgent hardware procurement & immediate deployment.');
  const [senderEmail, setSenderEmail] = useState('navinrajaa02@gmail.com');
  const [auditorEmail, setAuditorEmail] = useState('ponparthasarathyrajesh@gmail.com');
  const [cfoEmail, setCfoEmail] = useState('palvannan.anand@gmail.com');
  const [appPassword, setAppPassword] = useState('khpiceqzmoomqfto');
  const [attachedFiles, setAttachedFiles] = useState([]);
  const [dispatchStatus, setDispatchStatus] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetch('/api/queries/extra-line-items')
      .then(res => res.json())
      .then(data => setExtraItems(data));
  }, []);

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files);
    const newAtt = files.map(f => ({ filename: f.name, size: f.size }));
    setAttachedFiles([...attachedFiles, ...newAtt]);
  };

  const handleSendEmergencyPO = async (e) => {
    e.preventDefault();
    if (!purpose.trim()) {
      alert("Please enter the operational purpose and emergency justification.");
      return;
    }

    try {
      setLoading(true);
      setDispatchStatus(null);
      const res = await fetch('/api/po/emergency', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || 'PO Creator'
        },
        body: JSON.stringify({
          po_title: poTitle,
          amount: Number(amount),
          purpose: purpose,
          sender_email: senderEmail,
          auditor_email: auditorEmail,
          cfo_email: cfoEmail,
          app_password: appPassword,
          attachments: attachedFiles
        })
      });

      const data = await res.json();
      setDispatchStatus(data);
    } catch (err) {
      console.error("Emergency PO error:", err);
      setDispatchStatus({ status: "ERROR", message: "Failed to connect to backend server." });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>

      {/* Header Banner */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
            <ShoppingCart size={26} color="var(--accent-primary)" />
            <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Procurement PO Authorization Center</h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Purchase Order authorization tracking, emergency PO dispatch, and tender budget management.
          </p>
        </div>

        {/* Action Button: Create Emergency PO */}
        <button
          onClick={() => setShowEmergencyModal(true)}
          className="btn-primary"
          style={{
            padding: '10px 18px',
            fontSize: '0.9rem',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            background: '#BC0202',
            borderColor: '#BC0202',
            boxShadow: '0 2px 8px rgba(188, 2, 2, 0.25)'
          }}
        >
          Create Emergency PO
        </button>
      </div>

      {/* Procurement Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>APPROVED PURCHASE ORDERS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>PO #4521</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '4px' }}>CIO Approved (₹12,00,000)</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>TENDER REFERENCE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '6px' }}>TND-2024-01</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>High Performance Server</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>LINE ITEM DISCREPANCIES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-danger)', marginTop: '6px' }}>
            {extraItems?.findings?.length || 1} Unapproved
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-danger)', marginTop: '4px' }}>Flagged in Invoice INV-2024-002</div>
        </div>
      </div>

      {/* Line Item Verification Table */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={18} color="var(--accent-primary)" /> Billed vs Approved PO Line Item Matching
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(15,123,108,0.06)', border: '1px solid var(--accent-success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--accent-success)' }}>✓ High Performance Enterprise Server - Advance (50%) - ₹6,00,000</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Invoice INV-2024-001 | Matches PO #4521 Approved Scope (Source: <code>invoice_1.pdf</code> & <code>po_4521.pdf</code>)</div>
            </div>
            <span className="badge badge-green">VERIFIED</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(15,123,108,0.06)', border: '1px solid var(--accent-success)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--accent-success)' }}>✓ High Performance Enterprise Server - Balance (50%) - ₹6,00,000</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Invoice INV-2024-002 | Matches PO #4521 Approved Scope (Source: <code>invoice_2.pdf</code> & <code>po_4521.pdf</code>)</div>
            </div>
            <span className="badge badge-green">VERIFIED</span>
          </div>

          <div style={{ padding: '14px', borderRadius: '6px', background: 'rgba(224,62,62,0.06)', border: '1px solid var(--accent-danger)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontWeight: 600, color: 'var(--accent-danger)' }}> Premium Support (1 Year) - ₹50,000</div>
              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Invoice INV-2024-002 | Missing from Approved PO #4521 Scope (Source: <code>invoice_2.pdf</code>)</div>
            </div>
            <span className="badge badge-red">UNAPPROVED EXTRA ITEM</span>
          </div>
        </div>
      </div>

      {/* Tender Document Scope Matrix */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <FileCheck size={18} color="var(--accent-primary)" /> Approved Tender & Purchase Order Scope Matrix
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px' }}>Ref / Document</th>
              <th style={{ padding: '10px' }}>Title / Scope</th>
              <th style={{ padding: '10px' }}>Approved Amount</th>
              <th style={{ padding: '10px' }}>Authority Signer</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>TND-2024-01</td>
              <td style={{ padding: '10px' }}>Tender Document - High Performance Enterprise Server</td>
              <td style={{ padding: '10px' }}>₹12,00,000</td>
              <td style={{ padding: '10px' }}>Tender Board</td>
              <td style={{ padding: '10px' }}><span className="badge badge-green">TENDER AWARDED</span></td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>PO #4521</td>
              <td style={{ padding: '10px' }}>Purchase Order to Vendor B (Server Supply Inc)</td>
              <td style={{ padding: '10px' }}>₹12,00,000</td>
              <td style={{ padding: '10px' }}>CIO (Ref: <code>approval_vendor_b.eml</code>)</td>
              <td style={{ padding: '10px' }}><span className="badge badge-green">PO AUTHORIZED</span></td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Emergency PO Request Modal */}
      {showEmergencyModal && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          background: 'rgba(0,0,0,0.5)',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          zIndex: 1000,
          padding: '20px'
        }}>
          <div className="flat-panel" style={{
            background: '#FFFFFF',
            width: '100%',
            maxWidth: '650px',
            maxHeight: '90vh',
            overflowY: 'auto',
            padding: '28px',
            borderRadius: '8px',
            boxShadow: '0 10px 30px rgba(0,0,0,0.2)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', borderBottom: '2px solid #BC0202', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: '#BC0202', fontWeight: 700, fontSize: '1.2rem' }}>
                <ShieldAlert size={22} /> Emergency PO Request (₹10+ Lakhs)
              </div>
              <button
                type="button"
                onClick={() => setShowEmergencyModal(false)}
                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-secondary)' }}
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSendEmergencyPO} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Emergency PO Title:
                </label>
                <input
                  type="text"
                  value={poTitle}
                  onChange={(e) => setPoTitle(e.target.value)}
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
                  required
                />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px' }}>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Estimated Amount (INR):
                  </label>
                  <input
                    type="number"
                    value={amount}
                    onChange={(e) => setAmount(Number(e.target.value))}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.9rem', fontWeight: 600, color: '#BC0202' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                    Sender Email (From):
                  </label>
                  <input
                    type="email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem', background: '#F9FAFB' }}
                    required
                  />
                </div>
              </div>

              {/* Purpose & Justification */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Operational Emergency Purpose & Justification:
                </label>
                <textarea
                  rows={3}
                  value={purpose}
                  onChange={(e) => setPurpose(e.target.value)}
                  placeholder="Explain why this PO requires emergency fast-track sign-off..."
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.85rem', fontFamily: 'inherit' }}
                  required
                />
              </div>

              {/* Recipient Emails */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', background: '#F8FAFC', padding: '12px', borderRadius: '6px', border: '1px solid #E2E8F0' }}>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    Auditor Recipient Email:
                  </label>
                  <input
                    type="email"
                    value={auditorEmail}
                    onChange={(e) => setAuditorEmail(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                    required
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.78rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px', display: 'block' }}>
                    CFO Recipient Email:
                  </label>
                  <input
                    type="email"
                    value={cfoEmail}
                    onChange={(e) => setCfoEmail(e.target.value)}
                    style={{ width: '100%', padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.82rem' }}
                    required
                  />
                </div>
              </div>

              {/* Gmail App Password Field */}
              <div style={{ background: '#FFF5F5', padding: '12px', borderRadius: '6px', border: '1px solid #FECDD3' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 600, color: '#991B1B', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                  <Lock size={14} /> Gmail App Password (for {senderEmail}):
                </label>
                <input
                  type="password"
                  value={appPassword}
                  onChange={(e) => setAppPassword(e.target.value)}
                  placeholder="Enter 16-character Gmail App Password (e.g. abcd efgh ijkl mnop)"
                  style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid #FDA4AF', fontSize: '0.85rem' }}
                />
                <div style={{ fontSize: '0.72rem', color: '#991B1B', marginTop: '4px', lineHeight: 1.3 }}>
                  Generate 16-character App Password at: <code>Google Account &gt; Security &gt; 2-Step Verification &gt; App Passwords</code>.
                </div>
              </div>

              {/* Supporting Document Uploads */}
              <div>
                <label style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'block' }}>
                  Attach Invoices & Supporting Evidence Files:
                </label>
                <input
                  type="file"
                  multiple
                  onChange={handleFileUpload}
                  style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}
                />
                {attachedFiles.length > 0 && (
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginTop: '8px' }}>
                    {attachedFiles.map((att, idx) => (
                      <span key={idx} style={{ padding: '3px 8px', background: '#F1F5F9', border: '1px solid #CBD5E1', borderRadius: '4px', fontSize: '0.78rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Paperclip size={12} /> {att.filename}
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Status Dispatch Results */}
              {dispatchStatus && (
                <div style={{
                  padding: '12px',
                  borderRadius: '6px',
                  fontSize: '0.85rem',
                  background: dispatchStatus.email_dispatch?.status === 'SENT_SUCCESS' ? '#F0FDF4' : '#FEF2F2',
                  border: dispatchStatus.email_dispatch?.status === 'SENT_SUCCESS' ? '1px solid #BBF7D0' : '1px solid #FECDD3',
                  color: dispatchStatus.email_dispatch?.status === 'SENT_SUCCESS' ? '#166534' : '#991B1B'
                }}>
                  <strong>Dispatch Status:</strong> {dispatchStatus.email_dispatch?.message || dispatchStatus.message}
                  {dispatchStatus.email_dispatch?.status === 'CONFIG_REQUIRED' && (
                    <div style={{ marginTop: '4px', fontSize: '0.8rem', color: '#B91C1C' }}>
                      {dispatchStatus.email_dispatch.instruction}
                    </div>
                  )}
                </div>
              )}

              {/* Modal Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button
                  type="button"
                  onClick={() => setShowEmergencyModal(false)}
                  className="btn"
                  style={{ fontSize: '0.85rem' }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={loading}
                  className="btn-primary"
                  style={{
                    fontSize: '0.85rem',
                    background: '#BC0202',
                    borderColor: '#BC0202',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px'
                  }}
                >
                  <Send size={14} /> Send Emergency PO & Real Email
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
