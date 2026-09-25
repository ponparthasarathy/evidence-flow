import React, { useState, useRef } from 'react';
import { UploadCloud, Folder, FileText, Github, Mail, ArrowRight, Check, Trash2, ShieldCheck, Loader2 } from 'lucide-react';

export default function IngestionScreen({ onStartProcessing, sovereignMode }) {
  const [repoType, setRepoType] = useState('url'); // 'url' or 'zip'
  const [githubUrl, setGithubUrl] = useState('https://github.com/codite-team/evidence-flow-commit.git');
  const [uploadedFiles, setUploadedFiles] = useState([]);
  const [uploading, setUploading] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  const fileInputRef = useRef(null);
  const emailInputRef = useRef(null);

  const handleFileSelect = async (files) => {
    if (!files || files.length === 0) return;
    setUploading(true);
    
    const formData = new FormData();
    const newFileObjs = [];
    
    Array.from(files).forEach((file) => {
      formData.append('files', file);
      newFileObjs.push({ name: file.name, size: (file.size / 1024).toFixed(1) + ' KB', type: file.type || 'document' });
    });

    try {
      const res = await fetch('/api/ingest/upload', {
        method: 'POST',
        body: formData
      });
      if (res.ok) {
        setUploadedFiles(prev => [...prev, ...newFileObjs]);
      }
    } catch (err) {
      console.error('File upload failed:', err);
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFileSelect(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
  };

  const removeFile = (index) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const handleStartPipeline = async () => {
    setIsProcessing(true);
    try {
      await fetch('/api/ingest/run', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          git_url: githubUrl,
          sovereign_mode: sovereignMode
        })
      });
      onStartProcessing();
    } catch (err) {
      console.error('Failed to start pipeline:', err);
      onStartProcessing();
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '32px' }}>
      
      {/* Title Header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <div>
          <h2 style={{ fontSize: '2rem', fontWeight: 600, marginBottom: '8px' }}>New Case Ingestion</h2>
          <p style={{ color: 'var(--text-secondary)' }}>
            Upload documents, approval emails, and clone source repositories to trace decision lineage to git commit hash.
          </p>
        </div>
        {sovereignMode && (
          <div className="badge badge-success" style={{ padding: '8px 14px', fontSize: '0.85rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
            <ShieldCheck size={16} />
            Sovereign Mode Active (Ollama & Presidio)
          </div>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '24px' }}>
        
        {/* Documents Dropzone */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <FileText size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Documents & PDFs</h3>
            </div>
            {uploadedFiles.length > 0 && (
              <span style={{ fontSize: '0.8rem', color: 'var(--accent-success)', fontWeight: 600 }}>
                {uploadedFiles.length} file(s) attached
              </span>
            )}
          </div>

          <input 
            type="file" 
            ref={fileInputRef} 
            multiple 
            accept=".pdf,.eml,.txt,.doc,.docx" 
            style={{ display: 'none' }} 
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div 
            className="dropzone"
            onDrop={handleDrop}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onClick={() => fileInputRef.current?.click()}
            style={{
              borderColor: dragActive ? 'var(--accent-primary)' : 'var(--border-color)',
              background: dragActive ? 'rgba(188, 2, 2, 0.04)' : 'var(--bg-secondary)',
              cursor: 'pointer',
              minHeight: '140px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justify: 'center'
            }}
          >
            {uploading ? (
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: 'var(--accent-primary)' }}>
                <Loader2 className="spin" size={28} />
                <span>Uploading documents...</span>
              </div>
            ) : (
              <>
                <UploadCloud size={36} color="var(--accent-primary)" />
                <p style={{ marginTop: '12px', fontSize: '0.95rem', fontWeight: 500 }}>
                  Drag & drop PDFs here, or <span style={{ textDecoration: 'underline', color: 'var(--accent-primary)' }}>click to browse</span>
                </p>
                <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginTop: '4px' }}>
                  Tenders, POs, Invoices (.pdf, .txt, .eml)
                </p>
              </>
            )}
          </div>

          {/* Uploaded File List */}
          {uploadedFiles.length > 0 && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginTop: '8px' }}>
              {uploadedFiles.map((file, idx) => (
                <div key={idx} style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '8px 12px', background: '#F8F9FA', borderRadius: '6px', fontSize: '0.85rem', border: '1px solid var(--border-color)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Check size={16} color="var(--accent-success)" />
                    <span style={{ fontWeight: 500 }}>{file.name}</span>
                    <span style={{ color: 'var(--text-muted)', fontSize: '0.75rem' }}>({file.size})</span>
                  </div>
                  <button onClick={(e) => { e.stopPropagation(); removeFile(idx); }} style={{ border: 'none', background: 'none', cursor: 'pointer', color: 'var(--text-muted)' }}>
                    <Trash2 size={14} />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Source Code Git Repo Zone */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'space-between' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Github size={20} color="var(--accent-primary)" />
              <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Source Code Analysis</h3>
            </div>
            <div style={{ display: 'flex', gap: '8px', fontSize: '0.8rem' }}>
              <button className={`tab-btn ${repoType === 'url' ? 'active' : ''}`} onClick={() => setRepoType('url')}>Git URL</button>
              <button className={`tab-btn ${repoType === 'zip' ? 'active' : ''}`} onClick={() => setRepoType('zip')}>ZIP</button>
            </div>
          </div>
          
          {repoType === 'url' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', flex: 1, justifyContent: 'center' }}>
              <label style={{ fontSize: '0.85rem', fontWeight: 500, color: 'var(--text-secondary)' }}>
                GitHub Repository URL (Clones commits & extracts AST)
              </label>
              <input 
                type="text" 
                placeholder="https://github.com/org/repo" 
                className="text-input"
                value={githubUrl}
                onChange={e => setGithubUrl(e.target.value)}
                style={{ padding: '10px 14px', fontSize: '0.9rem', fontFamily: 'monospace' }}
              />
              <p style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                Demo Repo: <code style={{ background: '#EAEAEA', padding: '2px 6px', borderRadius: '4px' }}>https://github.com/codite-team/evidence-flow-commit.git</code>
              </p>
            </div>
          ) : (
            <div 
              className="dropzone"
              onClick={() => fileInputRef.current?.click()}
              style={{ cursor: 'pointer', minHeight: '140px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
            >
              <Folder size={36} color="var(--accent-primary)" />
              <p style={{ marginTop: '12px', fontSize: '0.9rem' }}>Drag & drop ZIP archive containing codebase</p>
            </div>
          )}
        </div>

        {/* Approval Emails (Optional) */}
        <div className="flat-panel" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px', gridColumn: '1 / -1' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Mail size={20} color="var(--accent-primary)" />
            <h3 style={{ fontSize: '1.1rem', fontWeight: 600 }}>Approval Emails & Communication Logs (Optional)</h3>
          </div>
          
          <input 
            type="file" 
            ref={emailInputRef} 
            multiple 
            accept=".eml,.msg,.txt" 
            style={{ display: 'none' }} 
            onChange={(e) => handleFileSelect(e.target.files)}
          />

          <div 
            className="dropzone"
            onClick={() => emailInputRef.current?.click()}
            style={{ minHeight: '100px', cursor: 'pointer', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}
          >
            <UploadCloud size={28} color="var(--text-muted)" />
            <p style={{ marginTop: '8px', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
              Drop EML / MSG email threads here or click to browse
            </p>
          </div>
        </div>

      </div>

      {/* Trigger Button */}
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}>
        <button 
          className="btn btn-primary" 
          onClick={handleStartPipeline} 
          disabled={isProcessing}
          style={{ padding: '12px 28px', fontSize: '1.05rem', gap: '10px' }}
        >
          {isProcessing ? (
            <>
              <Loader2 className="spin" size={18} />
              Initializing Ingestion...
            </>
          ) : (
            <>
              Start Real Ingestion Pipeline
              <ArrowRight size={18} />
            </>
          )}
        </button>
      </div>

    </div>
  );
}

