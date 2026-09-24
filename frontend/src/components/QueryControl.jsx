import React, { useState } from 'react';
import { Search, Play, AlertCircle, RefreshCw } from 'lucide-react';

export default function QueryControl({ onRunQuery1, onRunQuery2, onReingest, loading }) {
  const [searchTerm, setSearchTerm] = useState('');

  return (
    <div className="glass-panel" style={{ padding: '16px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '16px' }}>
      <div style={{ flex: 1, display: 'flex', alignItems: 'center', gap: '10px', background: 'rgba(15, 23, 42, 0.8)', padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)' }}>
        <Search size={16} color="var(--text-muted)" />
        <input
          type="text"
          placeholder="Filter or search graph entities, line items, or policies..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          style={{ width: '100%', background: 'transparent', border: 'none', color: 'var(--text-primary)', outline: 'none', fontSize: '0.875rem' }}
        />
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <button className="btn btn-primary" onClick={onRunQuery1} disabled={loading}>
          <Play size={14} /> Query 1: Extra Line Items
        </button>
        <button className="btn btn-danger" onClick={onRunQuery2} disabled={loading}>
          <AlertCircle size={14} /> Query 2: Policy Drift
        </button>
        <button className="btn" onClick={onReingest} disabled={loading} title="Re-run Pipeline">
          <RefreshCw size={14} className={loading ? 'spin' : ''} /> Re-ingest
        </button>
      </div>
    </div>
  );
}
