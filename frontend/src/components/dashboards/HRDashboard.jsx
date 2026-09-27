import React, { useState } from 'react';
import { Users, Lock, Shield, CheckCircle, EyeOff, Play, ShieldAlert } from 'lucide-react';

export default function HRDashboard({ currentUser, sovereignMode, setSovereignMode }) {
  const [testText, setTestText] = useState('Employee Jane Developer (jane.dev@acme.com) submitted invoice INV-2024-001 for approval.');
  const [redactedResult, setRedactedResult] = useState(null);

  const handleTestRedaction = () => {
    // Presidio pattern masking simulation
    let masked = testText
      .replace(/jane\.dev@acme\.com/gi, '<EMAIL_ADDRESS>')
      .replace(/Jane Developer/gi, '<PERSON>')
      .replace(/John Doe/gi, '<PERSON>')
      .replace(/\+?\d{10,12}/g, '<PHONE_NUMBER>');
    setRedactedResult(masked);
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Users size={26} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>HR Privacy & Sovereign Control Portal</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Presidio PII redaction log audit, employee data privacy governance, and local sovereign processing settings.
        </p>
      </div>

      {/* HR Privacy Metrics */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>PII REDACTION ENGINE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-success)', marginTop: '6px' }}>Presidio Active</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Automatic Pre-LLM Masking</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>SOVEREIGN MODE STATUS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: sovereignMode ? 'var(--accent-primary)' : 'var(--text-primary)', marginTop: '6px' }}>
            {sovereignMode ? "LOCAL OLLAMA" : "CLOUD API"}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Data Residency Lock</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>POLICY GOVERNANCE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>Active</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Effective Feb 1, 2023</div>
        </div>
      </div>

      {/* Sovereign Mode Switch Panel */}
      <div className="flat-panel" style={{ padding: '24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <div>
          <h3 style={{ fontSize: '1.05rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Lock size={18} color="var(--accent-primary)" /> Local Sovereign Data Residency Lock
          </h3>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            When enabled, all LLM vector embeddings and document extractions run exclusively via local Ollama models with 0 bytes sent off-premise.
          </p>
        </div>

        <button
          onClick={() => setSovereignMode(!sovereignMode)}
          style={{
            padding: '10px 20px',
            borderRadius: '6px',
            border: 'none',
            background: sovereignMode ? 'var(--accent-primary)' : 'var(--bg-secondary)',
            color: sovereignMode ? '#FFF' : 'var(--text-primary)',
            fontWeight: 600,
            fontSize: '0.9rem',
            cursor: 'pointer'
          }}
        >
          {sovereignMode ? "🔒 Sovereign Mode (ACTIVE)" : "🌐 Cloud API Mode"}
        </button>
      </div>

      {/* Interactive Presidio PII Masking Tester */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '12px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <EyeOff size={18} color="var(--accent-primary)" /> Presidio Interactive PII Masking Evaluator
        </h3>

        <div style={{ marginBottom: '14px' }}>
          <label style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
            Sample Employee Document Text
          </label>
          <input
            type="text"
            value={testText}
            onChange={(e) => setTestText(e.target.value)}
            style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
          />
        </div>

        <button onClick={handleTestRedaction} className="btn-primary" style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
          <Play size={14} /> Run Presidio PII Redaction Engine
        </button>

        {redactedResult && (
          <div style={{ padding: '14px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.875rem', border: '1px solid var(--border-color)' }}>
            <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '4px' }}><strong>Redacted Output Stream:</strong></div>
            <div style={{ fontWeight: 600, color: 'var(--accent-primary)', fontFamily: 'monospace' }}>
              {redactedResult}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
