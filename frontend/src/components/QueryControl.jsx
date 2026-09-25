import React, { useState } from 'react';
import { Search, Play, AlertCircle, RefreshCw, Sliders, Sparkles, Send } from 'lucide-react';

export default function QueryControl({ onRunNLQuery, onRunQuery1, onRunQuery2, onRunCounterfactual, onReingest, loading }) {
  const [cfThreshold, setCfThreshold] = useState(300000);
  const [nlQueryInput, setNlQueryInput] = useState('');

  const samplePrompts = [
    "Show me all invoices over ₹5 Lakhs approved by David Chen where the code function was modified after Feb 2023.",
    "Unapproved PO line items exceeding threshold",
    "Policy drift for CFO approval threshold",
    "Invoices approved by CIO with payment execution details"
  ];

  const handleNLSubmit = (e) => {
    e.preventDefault();
    if (nlQueryInput.trim() && onRunNLQuery) {
      onRunNLQuery(nlQueryInput.trim());
    }
  };

  const handleChipClick = (promptText) => {
    setNlQueryInput(promptText);
    if (onRunNLQuery) {
      onRunNLQuery(promptText);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      
      {/* 1. Conversational AI Search Bar (Text-to-Cypher / Text-to-SQL) */}
      <div className="flat-panel" style={{ padding: '12px 16px', background: '#FFF' }}>
        <form onSubmit={handleNLSubmit} style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.88rem' }}>
            <Sparkles size={18} />
            <span>Ask Graph AI:</span>
          </div>
          <div style={{ flex: 1, position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={15} style={{ position: 'absolute', left: '12px', color: 'var(--text-tertiary)' }} />
            <input
              type="text"
              placeholder='Try: "Show me all invoices over ₹5 Lakhs approved by David Chen where code function was modified after Feb 2023."'
              value={nlQueryInput}
              onChange={(e) => setNlQueryInput(e.target.value)}
              style={{
                width: '100%',
                padding: '8px 12px 8px 36px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                fontSize: '0.88rem',
                outline: 'none',
                background: 'var(--bg-secondary)',
                color: 'var(--text-primary)',
                fontFamily: 'inherit'
              }}
            />
          </div>
          <button
            type="submit"
            className="btn btn-primary"
            disabled={loading || !nlQueryInput.trim()}
            style={{ fontSize: '0.85rem', whiteSpace: 'nowrap', display: 'flex', alignItems: 'center', gap: '6px' }}
          >
            <Send size={14} /> Translate & Query
          </button>
        </form>

        {/* Quick Suggestion Chips */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '10px', flexWrap: 'wrap' }}>
          <span style={{ fontSize: '0.75rem', color: 'var(--text-tertiary)', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Quick Prompts:
          </span>
          {samplePrompts.map((prompt, idx) => (
            <button
              key={idx}
              type="button"
              onClick={() => handleChipClick(prompt)}
              style={{
                padding: '4px 10px',
                borderRadius: '12px',
                border: '1px solid var(--border-color)',
                background: '#F9FAFB',
                color: 'var(--text-secondary)',
                fontSize: '0.78rem',
                cursor: 'pointer',
                transition: 'all 0.15s ease',
                whiteSpace: 'nowrap'
              }}
              onMouseEnter={(e) => {
                e.target.style.background = '#F3F4F6';
                e.target.style.borderColor = 'var(--accent-primary)';
                e.target.style.color = 'var(--accent-primary)';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = '#F9FAFB';
                e.target.style.borderColor = 'var(--border-color)';
                e.target.style.color = 'var(--text-secondary)';
              }}
            >
              {prompt.length > 55 ? prompt.substring(0, 52) + '...' : prompt}
            </button>
          ))}
        </div>
      </div>

      {/* 2. Simulation & Verification Control Bar */}
      <div className="flat-panel" style={{ padding: '10px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
        
        {/* Counterfactual Input Controls */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>
            <Sliders size={15} color="var(--accent-primary)" />
            <span>What-If Threshold:</span>
          </div>
          <select
            value={cfThreshold}
            onChange={(e) => setCfThreshold(Number(e.target.value))}
            style={{
              padding: '6px 10px',
              borderRadius: '4px',
              border: '1px solid var(--border-color)',
              fontSize: '0.85rem',
              background: '#FFF',
              outline: 'none',
              fontWeight: 500
            }}
          >
            <option value={300000}>₹3,00,000 (Strict)</option>
            <option value={500000}>₹5,00,000 (Active Policy)</option>
            <option value={1000000}>₹10,00,000 (Loose)</option>
          </select>
          <button
            className="btn"
            onClick={() => onRunCounterfactual(cfThreshold)}
            disabled={loading}
            style={{ background: '#FFF', border: '1px solid var(--border-color)', color: 'var(--text-primary)', fontSize: '0.85rem' }}
          >
            <Play size={13} /> Run What-If Simulation
          </button>
        </div>

        {/* Preset Verification Queries */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <button className="btn btn-primary" onClick={onRunQuery1} disabled={loading} style={{ fontSize: '0.85rem' }}>
            <Play size={14} /> Query 1: Extra Line Items
          </button>
          <button className="btn btn-danger" onClick={onRunQuery2} disabled={loading} style={{ fontSize: '0.85rem' }}>
            <AlertCircle size={14} /> Query 2: Policy Drift & Git Blame
          </button>
          <button className="btn" onClick={onReingest} disabled={loading} title="Re-run Pipeline" style={{ fontSize: '0.85rem' }}>
            <RefreshCw size={14} className={loading ? 'spin' : ''} /> Re-ingest
          </button>
        </div>
      </div>
    </div>
  );
}
