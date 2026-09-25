import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, Activity } from 'lucide-react';

const STEPS = [
  { id: 'ocr', label: 'OCR Document Ingestion', desc: 'Reading text from PDFs and invoices' },
  { id: 'presidio', label: 'PII Redaction & Sovereign Check', desc: 'Masking sensitive fields locally via Presidio' },
  { id: 'llm', label: 'LLM Fact Extraction & Vector Indexing', desc: 'Extracting facts & upserting chunks to Qdrant' },
  { id: 'treesitter', label: 'AST Code & Git Forensics Parsing', desc: 'Analyzing tree-sitter AST & Git commit blame history' },
  { id: 'graph', label: 'Knowledge Graph & DuckDB Sync', desc: 'Linking facts into Neo4j graph & DuckDB spend database' }
];

export default function ProcessingScreen({ onComplete }) {
  const [statusData, setStatusData] = useState({
    status: 'running',
    progress: 15,
    current_step: 'Initializing pipeline workflow...',
    trace_id: 'ef-trace-9a8b7c6d'
  });

  useEffect(() => {
    let timer;
    const pollStatus = async () => {
      try {
        const res = await fetch('/api/ingest/status');
        if (res.ok) {
          const data = await res.json();
          setStatusData(data);
          if (data.status === 'completed' && data.progress >= 100) {
            setTimeout(onComplete, 1200);
            return;
          }
        }
      } catch (err) {
        console.error("Status polling error:", err);
      }
      timer = setTimeout(pollStatus, 800);
    };

    pollStatus();
    return () => clearTimeout(timer);
  }, [onComplete]);

  const stepIndex = Math.min(
    Math.floor((statusData.progress / 100) * STEPS.length),
    STEPS.length - 1
  );

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '32px' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px', color: 'var(--text-primary)' }}>Processing Pipeline Workflow</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Resilient Temporal workflow execution with OpenTelemetry tracing.</p>
      </div>

      <div className="flat-panel" style={{ width: '640px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
        
        {/* Progress Bar */}
        <div style={{ marginBottom: '12px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: '6px', color: 'var(--text-secondary)' }}>
            <span>{statusData.current_step}</span>
            <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>{statusData.progress}%</span>
          </div>
          <div style={{ width: '100%', height: '8px', background: 'var(--border-color)', borderRadius: '4px', overflow: 'hidden' }}>
            <div style={{
              width: `${statusData.progress}%`,
              height: '100%',
              background: 'var(--accent-primary)',
              transition: 'width 0.3s ease-out'
            }} />
          </div>
        </div>

        {STEPS.map((step, index) => {
          const isCompleted = stepIndex > index || statusData.progress >= 100;
          const isActive = stepIndex === index && statusData.progress < 100;
          const isPending = stepIndex < index && statusData.progress < 100;

          let Icon = Circle;
          let color = 'var(--text-muted)';
          
          if (isCompleted) {
            Icon = CheckCircle;
            color = 'var(--accent-success)';
          } else if (isActive) {
            Icon = Loader2;
            color = 'var(--accent-primary)';
          }

          return (
            <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: isPending ? 0.4 : 1 }}>
              <div style={{ marginTop: '2px' }}>
                <Icon size={22} color={color} className={isActive ? 'spin' : ''} />
              </div>
              <div>
                <h4 style={{ fontSize: '1rem', fontWeight: 500, color: isActive ? 'var(--text-primary)' : 'inherit' }}>
                  {step.label}
                </h4>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Real Telemetry Trace */}
      <div className="flat-panel" style={{ width: '640px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px', background: '#FAFAFA' }}>
        <Activity size={18} color="var(--accent-primary)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          [OpenTelemetry Span] trace_id={statusData.trace_id || 'ef-trace-9a8b7c'}
        </span>
      </div>

    </div>
  );
}

