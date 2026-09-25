import React, { useState } from 'react';
import { UploadCloud, Folder, FileText, Github, Mail, ArrowRight } from 'lucide-react';

export default function IngestionScreen({ onStartProcessing }) {
  const [repoType, setRepoType] = useState('url'); // 'url' or 'zip'
  const [githubUrl, setGithubUrl] = useState('');

  return (
    <div style={{ padding: '40px', maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      <div>
        <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>New Case Ingestion</h2>
        <p style={{ color: 'var(--text-secondary)' }}>Upload documents and code to trace the decision lineage.</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Documents Dropzone */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <FileText size={20} color="var(--text-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Documents & PDFs</h3>
          </div>
          <div className="dropzone">
            <UploadCloud size={32} color="var(--text-muted)" />
            <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Drag & drop PDFs here, or click to browse</p>
            <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Tenders, POs, Invoices</p>
          </div>
        </div>

        {/* Code Repo Zone */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={20} color="var(--text-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Source Code</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
              <button className={`tab-btn ${repoType === 'url' ? 'active' : ''}`} onClick={() => setRepoType('url')}>Git URL</button>
              <button className={`tab-btn ${repoType === 'zip' ? 'active' : ''}`} onClick={() => setRepoType('zip')}>ZIP</button>
            </div>
          </div>
          
          {repoType === 'url' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', flex: 1, justifyContent: 'center' }}>
              <label style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>GitHub Repository URL</label>
              <input 
                type="text" 
                placeholder="https://github.com/org/repo" 
                className="text-input"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
              />
            </div>
          ) : (
            <div className="dropzone">
              <Folder size={32} color="var(--text-muted)" />
              <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Drag & drop ZIP archive</p>
            </div>
          )}
        </div>

        {/* Optional Emails */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="var(--text-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 500 }}>Approval Emails (Optional)</h3>
          </div>
          <div className="dropzone" style={{ minHeight: '120px' }}>
            <UploadCloud size={32} color="var(--text-muted)" />
            <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Drop EML/MSG files here</p>
          </div>
        </div>

      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button className="btn btn-primary" onClick={onStartProcessing} style={{ padding: '12px 24px', fontSize: '1rem' }}>
          Start Ingestion Pipeline
          <ArrowRight size={18} />
        </button>
      </div>

    </div>
  );
}
