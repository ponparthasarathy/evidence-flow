import React, { useState, useEffect } from 'react';
import { DollarSign, BarChart3, Sliders, Play, TrendingUp, CheckCircle2 } from 'lucide-react';

export default function FinanceDashboard({ currentUser, onNavigate }) {
  const [spendData, setSpendData] = useState([]);
  const [cfThreshold, setCfThreshold] = useState(300000);
  const [cfResult, setCfResult] = useState(null);

  useEffect(() => {
    fetch('/api/analytics/spend-by-vendor')
      .then(res => res.json())
      .then(data => setSpendData(data.spend_by_vendor || []));
  }, []);

  const runSimulation = async () => {
    try {
      const res = await fetch(`/api/queries/counterfactual?threshold=${cfThreshold}`);
      const data = await res.json();
      setCfResult(data);
    } catch (err) {
      console.error("Simulation error:", err);
    }
  };

  const totalSpend = spendData.reduce((acc, curr) => acc + (curr.total_spend || 0), 0);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <DollarSign size={26} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Finance Spend & Invoice Hub</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          DuckDB analytical spend tracking, vendor invoice disbursement controls, and counterfactual threshold policy simulations.
        </p>
      </div>

      {/* Spend Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>TOTAL DISBURSED SPEND</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '6px' }}>
            ₹{totalSpend.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Calculated via DuckDB OLAP</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>ACTIVE VENDOR CONTRACTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>
            {spendData.length} Vendors
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Grouped Invoice Records</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>POLICY THRESHOLD GATE</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-success)', marginTop: '6px' }}>
            ₹5,00,000
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>Mandatory CFO Approval Limit</div>
        </div>
      </div>

      {/* Spend Aggregation by Vendor */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--accent-primary)" /> DuckDB Vendor Spend Distribution
        </h3>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {spendData.map((item, idx) => {
            const pct = totalSpend > 0 ? (item.total_spend / totalSpend) * 100 : 0;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 500 }}>{item.vendor}</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>₹{item.total_spend.toLocaleString('en-IN')} ({pct.toFixed(1)}%)</span>
                </div>
                <div style={{ width: '100%', height: '8px', background: 'var(--bg-secondary)', borderRadius: '4px', overflow: 'hidden' }}>
                  <div style={{ width: `${pct}%`, height: '100%', background: 'var(--accent-primary)', borderRadius: '4px' }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Disbursed Invoices Ledger */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
          Disbursed Invoices & Payment Ledger
        </h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px' }}>Invoice ID</th>
              <th style={{ padding: '10px' }}>Vendor</th>
              <th style={{ padding: '10px' }}>Billed Amount</th>
              <th style={{ padding: '10px' }}>PO Ref</th>
              <th style={{ padding: '10px' }}>Approval Gate</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px', fontWait: 600 }}>INV-2024-001</td>
              <td style={{ padding: '10px' }}>Vendor B (Server Supply Inc)</td>
              <td style={{ padding: '10px', fontWeight: 600 }}>₹6,00,000</td>
              <td style={{ padding: '10px' }}>PO #4521</td>
              <td style={{ padding: '10px' }}><span className="badge badge-green">CIO Approved</span></td>
              <td style={{ padding: '10px', color: 'var(--accent-success)' }}>PAID</td>
            </tr>
            <tr style={{ borderBottom: '1px solid var(--border-color)' }}>
              <td style={{ padding: '10px', fontWeight: 600 }}>INV-2024-002</td>
              <td style={{ padding: '10px' }}>Vendor B (Server Supply Inc)</td>
              <td style={{ padding: '10px', fontWeight: 600 }}>₹6,50,000</td>
              <td style={{ padding: '10px' }}>PO #4521</td>
              <td style={{ padding: '10px' }}><span className="badge badge-red">Unapproved Item (₹50k)</span></td>
              <td style={{ padding: '10px', color: 'var(--accent-primary)' }}>UNDER AUDIT</td>
            </tr>
          </tbody>
        </table>
      </div>

      {/* Counterfactual Policy Simulation Tool */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Sliders size={18} color="var(--accent-primary)" /> What-If Counterfactual Policy Simulation
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Simulate historical invoice impact if executive CFO sign-off threshold were changed.
        </p>

        <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '16px' }}>
          <select
            value={cfThreshold}
            onChange={(e) => setCfThreshold(Number(e.target.value))}
            style={{ padding: '8px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', fontSize: '0.9rem', background: '#FFF' }}
          >
            <option value={300000}>₹3,00,000 (Strict Policy)</option>
            <option value={500000}>₹5,00,000 (Current Policy)</option>
            <option value={1000000}>₹10,00,000 (Relaxed Policy)</option>
          </select>
          
          <button onClick={runSimulation} className="btn-primary" style={{ padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play size={15} /> Run Simulation
          </button>
        </div>

        {cfResult && (
          <div style={{ padding: '14px', borderRadius: '6px', background: 'var(--bg-secondary)', fontSize: '0.875rem' }}>
            <div style={{ fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>{cfResult.summary}</div>
            {cfResult.findings?.map((f, i) => (
              <div key={i} style={{ padding: '8px 10px', background: '#FFF', borderRadius: '4px', border: '1px solid var(--border-color)', marginBottom: '6px' }}>
                Invoice {f.invoice_number} ({f.vendor_name}) - ₹{f.amount?.toLocaleString()} → Flagged: <strong>{f.risk_status}</strong>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
