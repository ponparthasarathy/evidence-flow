import React, { useState } from 'react';
import { Search, Play, AlertCircle, RefreshCw, Sliders } from 'lucide-react';

export default function QueryControl({ onRunQuery1, onRunQuery2, onRunCounterfactual, onReingest, loading }) {
  const [cfThreshold, setCfThreshold] = useState(300000);

  return (
    <div className="flat-panel" style={{ padding: '12px 16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px', flexWrap: 'wrap' }}>
      
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
  );
}

