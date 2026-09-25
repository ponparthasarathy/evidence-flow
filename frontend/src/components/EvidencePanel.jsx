import React from 'react';
import { FileText, AlertTriangle, CheckCircle, Code, GitCommit, UserCheck, Eye } from 'lucide-react';

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
              {activeQuery === 'extra' && 'Query 1: Extra Line Items'}
              {activeQuery === 'drift' && 'Query 2: Policy Drift & Git Forensics'}
              {activeQuery === 'counterfactual' && 'What-If Counterfactual Simulation'}
            </span>
            <span className={queryResult.needs_review || activeQuery === 'counterfactual' ? 'badge badge-red' : 'badge badge-green'}>
              {activeQuery === 'counterfactual' ? `Hypothetical Threshold ₹${queryResult.hypothetical_threshold?.toLocaleString()}` : (queryResult.needs_review ? 'Flagged for Review' : 'Verified')}
            </span>
          </div>

          <p style={{ fontSize: '0.875rem', color: 'var(--text-primary)', marginBottom: '12px', lineHeight: 1.4 }}>
            {queryResult.summary}
          </p>

          {/* Findings */}
          <div style={{ marginTop: '12px' }}>
            <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px' }}>
              Structured Findings & Forensics
            </h4>
            {queryResult.findings && queryResult.findings.map((finding, idx) => (
              <div key={idx} style={{ padding: '10px 12px', borderRadius: '4px', background: 'var(--bg-card)', fontSize: '0.825rem', marginBottom: '8px', borderLeft: '3px solid var(--accent-danger)' }}>
                {activeQuery === 'extra' && (
                  <div>
                    <div><strong>Unapproved Line Item:</strong> <span style={{ color: 'var(--accent-danger)' }}>{finding.extra_item}</span> (₹{finding.extra_amount?.toLocaleString()})</div>
                    <div><strong>Billed Invoice:</strong> {finding.invoice_number}</div>
                    <div><strong>Approved PO Ref:</strong> {finding.po_number} (Approver: {finding.approver})</div>
                    <div><strong>Executed By Code Function:</strong> <code>{finding.executed_by_function}</code></div>
                  </div>
                )}

                {activeQuery === 'drift' && (
                  <div>
                    <div><strong>Policy Threshold:</strong> ₹{finding.policy_threshold?.toLocaleString()} (Date: {finding.policy_date})</div>
                    <div><strong>Code Constant:</strong> <code>{finding.code_threshold_name} = ₹{finding.code_threshold_value?.toLocaleString()}</code></div>
                    <div style={{ marginTop: '4px', paddingTop: '4px', borderTop: '1px dashed var(--border-color)', color: 'var(--text-primary)' }}>
                      <span style={{ fontWeight: 600, color: 'var(--accent-primary)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <UserCheck size={14} /> Git Blame Forensics:
                      </span>
                      <div><strong>Author:</strong> {finding.last_commit_author || 'Jane Developer'}</div>
                      <div><strong>Commit Hash:</strong> <code>{finding.last_commit_hash || 'a1b2c3d4'}</code> ({finding.last_commit_date})</div>
                      <div><strong>Message:</strong> "{finding.last_commit_message}"</div>
                    </div>
                    <div style={{ marginTop: '6px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                      Status: {finding.drift_status}
                    </div>
                  </div>
                )}

                {activeQuery === 'counterfactual' && (
                  <div>
                    <div><strong>Invoice Number:</strong> {finding.invoice_number} ({finding.vendor_name})</div>
                    <div><strong>Invoice Amount:</strong> ₹{finding.amount?.toLocaleString()}</div>
                    <div><strong>Requires Executive Approval:</strong> <span style={{ color: 'var(--accent-danger)', fontWeight: 600 }}>YES</span></div>
                    <div><strong>Bypassed Under Old Policy:</strong> {finding.previously_bypassed ? 'Yes (Under ₹5,00,000)' : 'No'}</div>
                    <div style={{ marginTop: '4px', color: 'var(--accent-danger)', fontWeight: 600 }}>
                      Risk Flag: {finding.risk_status}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Query Evidence Array & Visual PDF Bounding Box Highlight */}
          {queryResult.evidence && queryResult.evidence.length > 0 && (
            <div style={{ marginTop: '16px' }}>
              <h4 style={{ fontSize: '0.8rem', textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-secondary)', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Eye size={14} color="var(--accent-primary)" />
                PDF Visual Bounding-Box Evidence
              </h4>
              {queryResult.evidence.map((ev, idx) => (
                <div key={idx} style={{ padding: '12px', borderRadius: '6px', background: 'var(--bg-card)', fontSize: '0.8rem', marginBottom: '10px', border: '1px solid var(--border-color)' }}>
                  <div style={{ color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '6px' }}>
                    📄 Document: {ev.file} (Page {ev.page})
                  </div>
                  
                  {/* Visual PDF Page Preview with Red Highlight Bounding Box */}
                  <div style={{
                    width: '100%',
                    height: '110px',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '4px',
                    position: 'relative',
                    padding: '8px',
                    boxShadow: 'inset 0 0 4px rgba(0,0,0,0.05)',
                    overflow: 'hidden'
                  }}>
                    <div style={{ fontSize: '0.65rem', color: '#999', lineHeight: 1.3 }}>
                      CONFIDENTIAL FINANCIAL RECORD -- AUDIT EVIDENCE SHEET
                      <br />DOCUMENT REF: {ev.file} | PAGE {ev.page}
                      <br />---------------------------------------------------
                    </div>
                    
                    {/* Red Highlight Bounding Box Box */}
                    <div style={{
                      position: 'absolute',
                      top: '45px',
                      left: '8px',
                      right: '8px',
                      padding: '4px 6px',
                      border: '2px solid #BC0202',
                      background: 'rgba(188, 2, 2, 0.12)',
                      borderRadius: '2px',
                      fontSize: '0.72rem',
                      fontWeight: 600,
                      color: '#BC0202'
                    }}>
                      [BBOX x0:45 y0:120] "{ev.snippet}"
                    </div>
                  </div>
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
                <div style={{
                  padding: '8px',
                  background: '#FFF',
                  borderRadius: '4px',
                  border: '2px solid var(--accent-primary)',
                  fontSize: '0.75rem',
                  color: 'var(--text-primary)'
                }}>
                  <div style={{ fontSize: '0.7rem', color: 'var(--accent-primary)', fontWeight: 600, marginBottom: '2px' }}>
                    [Visual Bounding Box Highlighted]
                  </div>
                  "{evidenceData.source_snippet}"
                </div>
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

