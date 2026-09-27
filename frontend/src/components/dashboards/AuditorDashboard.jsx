import React, { useState, useEffect } from 'react';
import { UserCheck, AlertCircle, CheckCircle, FileText, ArrowRight, Play, Eye, ShieldCheck, CheckSquare, LineChart, Calendar } from 'lucide-react';

export default function AuditorDashboard({ currentUser, onNavigate }) {
  const [driftData, setDriftData] = useState(null);
  const [extraItems, setExtraItems] = useState(null);
  const [confirmedIds, setConfirmedIds] = useState([]);
  const [confirmNotes, setConfirmNotes] = useState('');
  const [signedMsg, setSignedMsg] = useState(null);

  useEffect(() => {
    fetch('/api/queries/policy-drift')
      .then(res => res.json())
      .then(data => setDriftData(data));

    fetch('/api/queries/extra-line-items')
      .then(res => res.json())
      .then(data => setExtraItems(data));
  }, []);

  const handleConfirmFinding = async (findingId) => {
    try {
      const res = await fetch('/api/findings/confirm', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser?.role || 'Auditor'
        },
        body: JSON.stringify({
          finding_id: findingId,
          notes: confirmNotes || "Verified against AST constant analysis & Policy node",
          confirmed_by: currentUser?.name || 'Auditor'
        })
      });
      const data = await res.json();
      if (res.ok) {
        setConfirmedIds(prev => [...prev, findingId]);
        setSignedMsg(`Finding ${findingId} officially confirmed & recorded into Audit Log.`);
      }
    } catch (err) {
      console.error("Sign-off error:", err);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <UserCheck size={26} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Auditor Compliance Workspace</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Inspect policy-vs-code drift mismatches, review unapproved invoice line items, and issue official digital sign-offs.
        </p>
      </div>

      {/* Auditor Quick Actions */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => onNavigate('graph-analytics')} className="btn-primary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-primary)', color: '#FFFFFF' }}>
          <LineChart size={16} /> Open Graph View (Chart.js)
        </button>
        <button onClick={() => onNavigate('explorer')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Eye size={16} /> Launch Interactive Case Explorer
        </button>
        <button onClick={() => onNavigate('compliance')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> Review CI/CD Webhook Gates
        </button>
      </div>

      {/* Dedicated Section: Graph View (Daily, Weekly, Monthly, Yearly) */}
      <div className="flat-panel" style={{ padding: '24px', borderLeft: '6px solid var(--accent-primary)', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={20} color="var(--accent-primary)" />
            Auditor Visual Graph & Time-Series View (Chart.js)
          </h3>
          <span className="badge badge-green">Auditor Authorized</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Inspect visual analytics with <strong>Daily</strong>, <strong>Weekly</strong>, <strong>Monthly</strong>, and <strong>Yearly</strong> breakdown views using Chart.js. Track policy drift trends over time, vendor spend distribution, and multi-dimensional audit scores.
        </p>
        <button
          onClick={() => onNavigate('graph-analytics')}
          className="btn-primary"
          style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
        >
          <Calendar size={15} /> Launch Daily/Weekly/Monthly/Yearly Graph View
        </button>
      </div>

      {signedMsg && (
        <div style={{ padding: '12px 16px', background: 'rgba(46,117,89,0.08)', border: '1px solid var(--accent-success)', borderRadius: '6px', color: 'var(--accent-success)', fontWeight: 600, fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <CheckCircle size={16} /> {signedMsg}
        </div>
      )}

      {/* Active Drift Mismatches Card */}
      <div className="flat-panel" style={{ padding: '24px', borderLeft: '6px solid var(--accent-primary)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--accent-primary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <AlertCircle size={20} /> Flagged Policy Drift Findings
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {driftData?.summary || "Comparing codebase constants against active governance policy documents..."}
        </p>

        {driftData?.findings && driftData.findings.map((f, idx) => {
          const findingId = f.policy_id || `DRIFT-${idx+1}`;
          const isConfirmed = confirmedIds.includes(findingId);
          return (
            <div key={idx} style={{ padding: '16px', borderRadius: '6px', background: 'var(--bg-secondary)', marginBottom: '12px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '8px' }}>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)', fontSize: '0.95rem' }}>
                  Policy Stated Threshold: ₹{f.policy_threshold?.toLocaleString()} vs Hardcoded Constant: ₹{f.code_threshold_value?.toLocaleString()} ({f.code_threshold_name})
                </div>
                <span className={isConfirmed ? "badge badge-green" : "badge badge-red"}>
                  {isConfirmed ? "SIGN-OFF CONFIRMED" : f.drift_status}
                </span>
              </div>

              <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '12px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div><strong>Git Blame Author:</strong> {f.last_commit_author} &bull; Commit Hash: <code>{f.last_commit_hash}</code></div>
                <div><strong>Commit Message:</strong> "{f.last_commit_message}" (Date: {f.last_commit_date})</div>
              </div>

              {/* Evidence Snippet */}
              {driftData.evidence && driftData.evidence[idx] && (
                <div style={{ padding: '8px 12px', background: '#FFF', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '12px' }}>
                  <strong>Source Ref:</strong> <code>{driftData.evidence[idx].file}</code> (Page {driftData.evidence[idx].page})
                  <div style={{ fontStyle: 'italic', marginTop: '2px' }}>"{driftData.evidence[idx].snippet}"</div>
                </div>
              )}

              {/* Sign-off button */}
              {!isConfirmed ? (
                <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                  <input
                    type="text"
                    placeholder="Auditor verification notes..."
                    value={confirmNotes}
                    onChange={(e) => setConfirmNotes(e.target.value)}
                    style={{ flex: 1, padding: '6px 10px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem' }}
                  />
                  <button
                    onClick={() => handleConfirmFinding(findingId)}
                    className="btn-primary"
                    style={{ padding: '6px 14px', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '6px' }}
                  >
                    <CheckSquare size={14} /> Confirm Audit Sign-Off
                  </button>
                </div>
              ) : (
                <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                  ✓ Digital Sign-off Recorded by {currentUser?.name || 'Auditor'}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* Discrepancy Items Card */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px' }}>
          Unapproved Invoice Line Item Discrepancies
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          {extraItems?.summary || "Comparing billed invoice items against approved purchase orders..."}
        </p>

        {extraItems?.findings && extraItems.findings.map((f, idx) => (
          <div key={idx} style={{ padding: '14px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'var(--bg-secondary)', marginBottom: '10px', fontSize: '0.85rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '4px' }}>
              <span style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                Billed Item: "{f.extra_item}" (₹{f.extra_amount?.toLocaleString()})
              </span>
              <span className="badge badge-red">UNAPPROVED LINE ITEM</span>
            </div>
            <div style={{ color: 'var(--text-secondary)', marginTop: '2px' }}>
              Invoice {f.invoice_number} | PO Ref: {f.po_number} (Approved by: {f.approver})
            </div>
          </div>
        ))}
      </div>

    </div>
  );
}

