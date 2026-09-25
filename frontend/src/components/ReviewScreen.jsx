import React from 'react';
import { AlertTriangle, Check, X } from 'lucide-react';

const MOCK_REVIEW_ITEMS = [
  { id: 1, type: 'Fact', source: 'Invoice #4521', content: 'Extracted Amount: ₹6,50,000', confidence: 0.65, issue: 'Ambiguous currency symbol in OCR' },
  { id: 2, type: 'Policy', source: 'Approval Email', content: 'Threshold: ₹5,00,000', confidence: 0.72, issue: 'Implicit threshold based on thread context' }
];

export default function ReviewScreen({ onAccept }) {
  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Human-in-the-Loop Review</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Review low-confidence extractions before committing to the evidence graph.</p>
      </div>

      <div className="flat-panel" style={{ overflow: 'hidden' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Source</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Extracted Content</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Confidence</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500 }}>Issue / Reason</th>
              <th style={{ padding: '16px', fontSize: '0.85rem', color: 'var(--text-secondary)', fontWeight: 500, textAlign: 'right' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {MOCK_REVIEW_ITEMS.map((item) => (
              <tr key={item.id} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '16px' }}>
                  <div style={{ fontSize: '0.9rem', fontWeight: 500 }}>{item.source}</div>
                  <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>{item.type}</div>
                </td>
                <td style={{ padding: '16px', fontSize: '0.9rem' }}>{item.content}</td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{ width: '60px', height: '6px', background: 'var(--border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                      <div style={{ height: '100%', width: `${item.confidence * 100}%`, background: 'var(--accent-warning)' }}></div>
                    </div>
                    <span style={{ fontSize: '0.8rem', color: 'var(--accent-warning)', fontWeight: 500 }}>{Math.round(item.confidence * 100)}%</span>
                  </div>
                </td>
                <td style={{ padding: '16px' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: 'var(--text-secondary)', fontSize: '0.85rem' }}>
                    <AlertTriangle size={14} color="var(--accent-warning)" />
                    {item.issue}
                  </div>
                </td>
                <td style={{ padding: '16px', textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                    <button className="btn" style={{ padding: '6px', color: 'var(--accent-danger)' }}>
                      <X size={16} />
                    </button>
                    <button className="btn" style={{ padding: '6px', color: 'var(--accent-success)' }}>
                      <Check size={16} />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={onAccept} style={{ padding: '12px 24px', fontSize: '1rem' }}>
          Confirm & Load Graph
        </button>
      </div>
    </div>
  );
}
