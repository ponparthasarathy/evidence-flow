import React, { useState } from 'react';
import { ShieldCheck, GitPullRequest, AlertTriangle, CheckCircle2, Play } from 'lucide-react';

export default function ComplianceScreen() {
  const [prAuthor, setPrAuthor] = useState('john.dev@company.com');
  const [constantName, setConstantName] = useState('CFO_APPROVAL_LIMIT');
  const [proposedValue, setProposedValue] = useState(1000000);
  const [commitMessage, setCommitMessage] = useState('Bypass CFO sign-off for fast server procurement');
  
  const [webhookResult, setWebhookResult] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleTestWebhook = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/webhook/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          file_path: 'backend/app/main.py',
          constant_name: constantName,
          new_value: parseInt(proposedValue),
          author: prAuthor,
          commit_message: commitMessage
        })
      });
      const data = await res.json();
      setWebhookResult(data);
    } catch (err) {
      console.error("Webhook test error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1000px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <ShieldCheck size={24} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>CI/CD Continuous Compliance</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          GitHub Webhook simulation intercepting pull requests and checking code AST constants against active Neo4j Policy nodes.
        </p>
      </div>

      {/* Interactive Webhook Simulator Panel */}
      <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitPullRequest size={18} color="var(--accent-primary)" />
          Simulate GitHub Pull Request Commit
        </h3>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px' }}>
          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              PR Author / Developer
            </label>
            <input
              type="text"
              value={prAuthor}
              onChange={(e) => setPrAuthor(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              AST Code Constant Name
            </label>
            <input
              type="text"
              value={constantName}
              onChange={(e) => setConstantName(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Proposed Hardcoded Constant Value (₹)
            </label>
            <input
              type="number"
              value={proposedValue}
              onChange={(e) => setProposedValue(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '6px' }}>
              Commit Message
            </label>
            <input
              type="text"
              value={commitMessage}
              onChange={(e) => setCommitMessage(e.target.value)}
              style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem' }}
            />
          </div>
        </div>

        <div style={{ display: 'flex', gap: '12px', marginTop: '8px' }}>
          <button
            onClick={handleTestWebhook}
            disabled={loading}
            className="btn-primary"
            style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Play size={16} />
            {loading ? 'Evaluating Policy Webhook...' : 'Trigger CI/CD Compliance Check'}
          </button>
          
          <button
            onClick={() => setProposedValue(500000)}
            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FFF', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Set Compliant Value (₹5,00,000)
          </button>
          <button
            onClick={() => setProposedValue(1000000)}
            style={{ padding: '10px 16px', borderRadius: '6px', border: '1px solid var(--border-color)', background: '#FFF', fontSize: '0.85rem', cursor: 'pointer' }}
          >
            Set Non-Compliant Value (₹10,00,000)
          </button>
        </div>
      </div>

      {/* Webhook Response Output */}
      {webhookResult && (
        <div className="flat-panel" style={{
          padding: '24px',
          borderLeft: webhookResult.status === 'BLOCKED' ? '6px solid var(--accent-primary)' : '6px solid var(--accent-success)',
          background: webhookResult.status === 'BLOCKED' ? 'rgba(188, 2, 2, 0.02)' : 'rgba(46, 117, 89, 0.02)',
          display: 'flex',
          flexDirection: 'column',
          gap: '16px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
              {webhookResult.status === 'BLOCKED' ? (
                <AlertTriangle size={24} color="var(--accent-primary)" />
              ) : (
                <CheckCircle2 size={24} color="var(--accent-success)" />
              )}
              <span style={{ fontSize: '1.2rem', fontWeight: 700, color: webhookResult.status === 'BLOCKED' ? 'var(--accent-primary)' : 'var(--accent-success)' }}>
                CI/CD Status: {webhookResult.status} ({webhookResult.action})
              </span>
            </div>

            {webhookResult.real_commit && (
              <span className="badge badge-green" style={{ fontSize: '0.8rem', padding: '6px 12px' }}>
                {webhookResult.real_commit.push_status}
              </span>
            )}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.9rem' }}>
            <div><strong>Reason:</strong> {webhookResult.reason}</div>
            {webhookResult.required_approval && (
              <div style={{ color: 'var(--accent-primary)', fontWeight: 600 }}>
                <strong>Required Gate:</strong> {webhookResult.required_approval}
              </div>
            )}
            
            {/* Real Git Commit Details Box */}
            {webhookResult.real_commit && (
              <div style={{
                marginTop: '12px',
                padding: '12px 16px',
                background: '#FFFFFF',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.85rem',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>Git Commit Lineage Record</span>
                  <a 
                    href={webhookResult.real_commit.commit_url} 
                    target="_blank" 
                    rel="noreferrer"
                    style={{ color: 'var(--accent-primary)', fontWeight: 600, fontFamily: 'monospace', textDecoration: 'underline' }}
                  >
                    Commit {webhookResult.real_commit.commit_hash} ↗
                  </a>
                </div>
                <div style={{ color: 'var(--text-secondary)' }}>
                  <strong>Author:</strong> {webhookResult.real_commit.author} &bull; <strong>Repo:</strong> <code style={{ fontSize: '0.8rem' }}>codite-team/evidence-flow-commit</code>
                </div>
                <div style={{ fontFamily: 'monospace', color: 'var(--text-muted)', fontSize: '0.8rem' }}>
                  Commit Message: "{webhookResult.real_commit.commit_message}"
                </div>
              </div>
            )}

            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'monospace', marginTop: '4px' }}>
              Target File: {webhookResult.file}
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
