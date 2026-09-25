import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Code, DollarSign, Layers } from 'lucide-react';

export default function EvidencePanel({ selectedNode, evidenceData, queryResult, activeQuery }) {
  return (
    <div className="flat-panel" style={{ height: '100%', padding: '20px', overflowY: 'auto' }}>
      <h2 style={{ fontSize: '1.1rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
        <FileText size={18} color="var(--accent-primary)" /> Evidence & Audit Inspection
      </h2>

      {/* Query Result Section */}
      {queryResult && (
        <div style={{ marginBottom: '24px', padding: '16px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)' }}>
              {activeQuery === 'extra' ? 'Query 1: Extra Line Items' : 'Query 2: Policy Drift Analysis'}
            </span>
            <span className={queryResult.needs_review ? 'badge badge-red' : 'badge badge-green'}>
              {queryResult.needs_review ? 'Flagged for Review' : 'Verified'}
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.4 }}>
            {queryResult.summary}
          </p>

          {/* Findings */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Structured Findings
            </h4>
            {queryResult.findings && queryResult.findings.map((finding, idx) => (
              <div key={idx} style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-card)', fontSize: '0.825rem', marginBottom: '8px', borderLeft: '3px solid var(--accent-danger)' }}>
                {activeQuery === 'extra' ? (
                  <div>
                    <div><strong>Unapproved Line Item:</strong> <span style={{ color: 'var(--accent-danger)' }}>{finding.extra_item}</span> (₹{finding.extra_amount?.toLocaleString()})</div>
                    <div><strong>Billed Invoice:</strong> {finding.invoice_number}</div>
                    <div><strong>Approved PO Ref:</strong> {finding.po_number} (Approver: {finding.approver})</div>
                    <div><strong>Executed By Code Function:</strong> <code>{finding.executed_by_function}</code></div>
                  </div>
                ) : (
                  <div>
                    <div><strong>Policy Threshold:</strong> ₹{finding.policy_threshold?.toLocaleString()} (Date: {finding.policy_date})</div>
                    <div><strong>Code Threshold:</strong> ₹{finding.code_threshold_value?.toLocaleString()} (<code>{finding.code_threshold_name}</code>)</div>
                    <div><strong>Last Code Commit:</strong> {finding.last_commit_date} ("{finding.last_commit_message}")</div>
                    <div style={{ marginTop: '4px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                      Status: {finding.drift_status}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Query Evidence Array */}
          {queryResult.evidence && queryResult.evidence.length > 0 && (
            <div style={{ marginTop: '12px' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
                Supporting Evidence Artifacts
              </h4>
              {queryResult.evidence.map((ev, idx) => (
                <div key={idx} style={{ padding: '10px', borderRadius: '4px', background: 'var(--bg-card)', fontSize: '0.8rem', marginBottom: '6px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 500 }}>
                    📄 Source File: {ev.file} (Page/Line {ev.page})
                  </div>
                  <pre style={{ marginTop: '4px', padding: '6px', background: 'var(--bg-secondary)', borderRadius: '4px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                    "{ev.snippet}"
                  </pre>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Clicked Node Detail Section */}
      {selectedNode ? (
        <div style={{ padding: '14px', borderRadius: '4px', background: 'var(--bg-secondary)', border: '1px solid var(--border-color)' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '8px' }}>
            Node Inspector: {selectedNode.label || selectedNode.id}
          </h3>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginBottom: '10px' }}>
            Type: <span className="badge badge-green">{selectedNode.type}</span>
          </div>

          {evidenceData && (
            <div>
              <div style={{ fontSize: '0.8rem', fontWeight: 600, color: 'var(--text-primary)', marginBottom: '4px' }}>
                Primary Evidence Trace:
              </div>
              <div style={{ fontSize: '0.775rem', color: 'var(--text-secondary)', marginBottom: '6px' }}>
                Path: {evidenceData.file_path} (Ref: Page/Line {evidenceData.page_ref})
              </div>
              {evidenceData.source_snippet && (
                <pre style={{ padding: '8px', background: 'var(--bg-card)', borderRadius: '4px', color: 'var(--text-primary)', whiteSpace: 'pre-wrap', fontSize: '0.75rem', border: '1px solid var(--border-color)' }}>
                  {evidenceData.source_snippet}
                </pre>
              )}
            </div>
          )}
        </div>
      ) : (
        !queryResult && (
          <div style={{ padding: '24px', textAlign: 'center', color: 'var(--text-muted)', fontSize: '0.875rem' }}>
            Click any node on the graph or run a query above to view evidence details.
          </div>
        )
      )}
    </div>
  );
}
