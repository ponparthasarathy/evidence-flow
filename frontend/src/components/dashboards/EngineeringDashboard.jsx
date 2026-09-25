import React, { useState, useEffect } from 'react';
import { Code, GitCommit, GitBranch, ShieldCheck, Play, Terminal, CheckCircle2, AlertTriangle, ExternalLink } from 'lucide-react';

export default function EngineeringDashboard({ currentUser, onNavigate }) {
  const [driftData, setDriftData] = useState(null);
  const [constantVal, setConstantVal] = useState(500000);
  const [prAuthor, setPrAuthor] = useState(currentUser?.email || 'dev@acme.com');
  const [commitMsg, setCommitMsg] = useState('Sync AST threshold constant with active CFO policy');
  const [webhookResult, setWebhookResult] = useState(null);
  const [recentCommits, setRecentCommits] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchCommits = () => {
    fetch('/api/commits/recent')
      .then(res => res.json())
      .then(data => setRecentCommits(data.commits || []));
  };

  useEffect(() => {
    fetch('/api/queries/policy-drift')
      .then(res => res.json())
      .then(data => setDriftData(data));

    fetchCommits();
  }, []);

  const handleTriggerCommit = async (proposedVal) => {
    setLoading(true);
    const targetVal = proposedVal !== undefined ? proposedVal : constantVal;
    try {
      const res = await fetch('/api/webhook/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: 'sample_repo/payment.py',
          constant_name: 'CFO_APPROVAL_LIMIT',
          new_value: parseInt(targetVal),
          author: prAuthor,
          commit_message: commitMsg
        })
      });
      const data = await res.json();
      setWebhookResult(data);
      fetchCommits();
    } catch (err) {
      console.error("Commit trigger error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Code size={26} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Engineering AST & Git Forensics Workspace</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Tree-sitter Python AST constant parsing, Git commit blame forensics, and real-time GitHub commit webhook execution.
        </p>
      </div>

      {/* Engineering Actions */}
      <div style={{ display: 'flex', gap: '12px' }}>
        <button onClick={() => onNavigate('compliance')} className="btn-primary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <ShieldCheck size={16} /> Open Full CI/CD Compliance Suite
        </button>
        <button onClick={() => onNavigate('explorer')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={16} /> Inspect Neo4j Code Graph
        </button>
      </div>

      {/* Interactive Webhook & Real-Time Commit Trigger */}
      <div className="flat-panel" style={{ padding: '24px', borderLeft: '6px solid var(--accent-primary)' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitCommit size={18} color="var(--accent-primary)" /> Trigger Real-Time GitHub Commit & CI/CD Compliance Gate
        </h3>
        <p style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Executes code AST update and creates real-time commit for repository: <code>https://github.com/codite-team/evidence-flow-commit.git</code>
        </p>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', marginBottom: '16px' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              PR Author Email
            </label>
            <input
              type="text"
              value={prAuthor}
              onChange={(e) => setPrAuthor(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
              Commit Message
            </label>
            <input
              type="text"
              value={commitMsg}
              onChange={(e) => setCommitMsg(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => handleTriggerCommit(500000)}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={14} /> Trigger PASSED Commit (₹5,00,000)
          </button>
          
          <button
            onClick={() => handleTriggerCommit(1000000)}
            disabled={loading}
            style={{ padding: '8px 18px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FFF', fontSize: '0.85rem', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <AlertTriangle size={14} color="var(--accent-danger)" /> Test Non-Compliant Commit (₹10,00,000)
          </button>
        </div>

        {/* Live Status Result Display */}
        {webhookResult && (
          <div style={{
            marginTop: '20px',
            padding: '16px',
            borderRadius: '6px',
            background: webhookResult.status === 'PASSED' ? 'rgba(46, 117, 89, 0.05)' : 'rgba(224, 62, 62, 0.05)',
            border: webhookResult.status === 'PASSED' ? '1px solid var(--accent-success)' : '1px solid var(--accent-danger)'
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
              <span style={{ fontWeight: 700, fontSize: '1.05rem', color: webhookResult.status === 'PASSED' ? 'var(--accent-success)' : 'var(--accent-danger)' }}>
                CI/CD Status: {webhookResult.status} ({webhookResult.action})
              </span>
              <span className="badge badge-green">
                {webhookResult.real_commit?.push_status || 'Committed'}
              </span>
            </div>

            <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '10px' }}>
              {webhookResult.reason}
            </p>

            {webhookResult.real_commit && (
              <div style={{ background: '#FFF', padding: '10px 14px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <strong>Repository SHA:</strong> <code>{webhookResult.real_commit.commit_hash}</code> &bull; Author: <code>{webhookResult.real_commit.author}</code>
                </div>
                <a
                  href={webhookResult.real_commit.commit_url}
                  target="_blank"
                  rel="noreferrer"
                  style={{ color: 'var(--accent-primary)', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  View on GitHub <ExternalLink size={12} />
                </a>
              </div>
            )}
          </div>
        )}
      </div>

      {/* AST Code Constants Card */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Terminal size={18} color="var(--accent-primary)" /> Extracted AST Constants & Git Commit Blame
        </h3>

        {driftData?.findings?.map((f, idx) => (
          <div key={idx} style={{ padding: '16px', borderRadius: '6px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
              <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                Function: <code>{f.code_function}()</code> in <code>sample_repo/app.py</code>
              </span>
              <span className="badge badge-red">{f.drift_status}</span>
            </div>

            <pre style={{ padding: '10px', background: '#FFFFFF', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.8rem', fontFamily: 'monospace', marginBottom: '12px' }}>
              {`def process_vendor_payment(invoice_amount, po_number):\n    ${f.code_threshold_name} = ${f.code_threshold_value}  # Hardcoded Constant\n    if invoice_amount > ${f.code_threshold_name}:\n        require_cfo_approval()`}
            </pre>

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <div><strong>Git Commit Author:</strong> {f.last_commit_author}</div>
              <div><strong>Commit Hash:</strong> <code>{f.last_commit_hash}</code> (Date: {f.last_commit_date})</div>
              <div><strong>Commit Message:</strong> "{f.last_commit_message}"</div>
            </div>
          </div>
        ))}
      </div>

      {/* Recent Commit History Stream */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={18} color="var(--accent-primary)" /> Recent Real-Time Commits Stream (evidence-flow-commits)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {recentCommits.map((c, i) => (
            <div key={i} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  <code>{c.commit_hash}</code> - {c.commit_message}
                </div>
                <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  Author: {c.author} &bull; Date: {c.timestamp || 'Just now'}
                </div>
              </div>
              <span className={c.status === 'PASSED' ? "badge badge-green" : "badge badge-red"}>
                {c.status || 'COMMITTED'}
              </span>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

