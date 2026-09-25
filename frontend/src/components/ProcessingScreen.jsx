import React, { useEffect, useState } from 'react';
import { CheckCircle, Circle, Loader2, Activity } from 'lucide-react';

const STEPS = [
  { id: 'ocr', label: 'OCR Extraction', desc: 'Reading text from PDFs and images' },
  { id: 'presidio', label: 'PII Redaction (Presidio)', desc: 'Masking sensitive fields locally' },
  { id: 'llm', label: 'LLM Fact Extraction', desc: 'Structuring facts from redacted text' },
  { id: 'treesitter', label: 'AST Code Parsing', desc: 'Analyzing source code for policies' },
  { id: 'graph', label: 'Knowledge Graph Build', desc: 'Linking facts in Neo4j' }
];

export default function ProcessingScreen({ onComplete }) {
  const [currentStep, setCurrentStep] = useState(0);

  // Mock progress simulation
  useEffect(() => {
    let step = 0;
    const interval = setInterval(() => {
      step++;
      setCurrentStep(step);
      if (step >= STEPS.length) {
        clearInterval(interval);
        setTimeout(onComplete, 1000);
      }
    }, 1500);
    return () => clearInterval(interval);
  }, [onComplete]);

  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', flexDirection: 'column', gap: '40px' }}>
      
      <div style={{ textAlign: 'center' }}>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>Processing Pipeline</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Extracting and linking evidence securely.</p>
      </div>

      <div className="flat-panel" style={{ width: '600px', padding: '32px', display: 'flex', flexDirection: 'column', gap: '24px' }}>
        {STEPS.map((step, index) => {
          const isCompleted = currentStep > index;
          const isActive = currentStep === index;
          const isPending = currentStep < index;

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
            <div key={step.id} style={{ display: 'flex', alignItems: 'flex-start', gap: '16px', opacity: isPending ? 0.5 : 1 }}>
              <div style={{ marginTop: '2px' }}>
                <Icon size={24} color={color} className={isActive ? 'spin' : ''} />
              </div>
              <div>
                <h4 style={{ fontSize: '1.1rem', fontWeight: 500, color: isActive ? 'var(--text-primary)' : 'inherit' }}>
                  {step.label}
                </h4>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
                  {step.desc}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Simulated Telemetry Trace */}
      <div className="flat-panel" style={{ width: '600px', padding: '16px', display: 'flex', alignItems: 'center', gap: '12px' }}>
        <Activity size={18} color="var(--accent-warning)" />
        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
          [Jaeger Trace] span_id=9a8b7c {STEPS[Math.min(currentStep, STEPS.length-1)]?.id}_pipeline_active...
        </span>
      </div>

    </div>
  );
}
