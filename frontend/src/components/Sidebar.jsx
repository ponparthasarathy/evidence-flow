import React from 'react';
import { ShieldAlert, LayoutDashboard, PlusSquare, Network, Settings, GitBranch, Database, BarChart3, ShieldCheck, Users, LineChart } from 'lucide-react';

export default function Sidebar({ viewState, onNavigate, sovereignMode, setSovereignMode, currentUser }) {
  const isAdmin = currentUser?.role === 'Admin';
  const isAuditorOrAdmin = currentUser?.role === 'Admin' || currentUser?.role === 'Auditor';

  const navItems = [
    { id: 'dashboard', label: `${currentUser?.role || 'Role'} Portal`, icon: LayoutDashboard },
    { id: 'ingestion', label: 'New Ingestion', icon: PlusSquare },
    { id: 'explorer', label: 'Case Explorer', icon: Network },
    { id: 'analytics', label: 'Spend Analytics', icon: BarChart3 },
    ...(isAuditorOrAdmin ? [{ id: 'graph-analytics', label: 'Graph View (Charts)', icon: LineChart }] : []),
    { id: 'compliance', label: 'CI/CD Compliance', icon: ShieldCheck },
    ...(isAdmin ? [{ id: 'users', label: 'Users & RBAC', icon: Users }] : []),
    { id: 'settings', label: 'Settings', icon: Settings },
  ];





  return (
    <div style={{
      width: '240px',
      height: '100vh',
      background: 'var(--bg-secondary)',
      borderRight: '1px solid var(--border-color)',
      display: 'flex',
      flexDirection: 'column',
      padding: '16px 0',
      flexShrink: 0
    }}>
      {/* Logo & Title */}
      <div style={{ padding: '0 16px', display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '24px' }}>
        <span style={{ fontWeight: 600, fontSize: '1rem', color: 'var(--text-primary)' }}>EvidenceFlow</span>
      </div>

      {/* Navigation */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '2px', padding: '0 8px', flex: 1 }}>
        {navItems.map(item => {
          const isActive = viewState === item.id || (item.id === 'ingestion' && (viewState === 'processing' || viewState === 'review'));
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => onNavigate(item.id)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                padding: '8px 12px',
                borderRadius: '6px',
                border: 'none',
                background: isActive ? 'rgba(55, 53, 47, 0.08)' : 'transparent',
                color: isActive ? 'var(--text-primary)' : 'var(--text-secondary)',
                fontWeight: isActive ? 500 : 400,
                fontSize: '0.9rem',
                cursor: 'pointer',
                textAlign: 'left',
                transition: 'background 120ms ease-in'
              }}
              onMouseEnter={(e) => {
                if (!isActive) e.currentTarget.style.background = 'rgba(55, 53, 47, 0.04)';
              }}
              onMouseLeave={(e) => {
                if (!isActive) e.currentTarget.style.background = 'transparent';
              }}
            >
              <Icon size={18} color={isActive ? "var(--accent-primary)" : "var(--text-secondary)"} />
              {item.label}
            </button>
          )
        })}
      </div>

      {/* Settings / Sovereign Mode Toggle */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-primary)', fontWeight: 500 }}>Sovereign Mode</span>
          <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
            <div style={{
              width: '32px', height: '18px', borderRadius: '10px',
              background: sovereignMode ? 'var(--accent-primary)' : 'var(--border-color)',
              position: 'relative', transition: 'background 0.2s'
            }}>
              <div style={{
                width: '14px', height: '14px', borderRadius: '50%', background: '#fff',
                position: 'absolute', top: '2px', left: sovereignMode ? '16px' : '2px',
                transition: 'left 0.2s'
              }} />
            </div>
            <input type="checkbox" checked={sovereignMode} onChange={() => setSovereignMode(!sovereignMode)} style={{ display: 'none' }} />
          </label>
        </div>
        <div style={{ fontSize: '0.7rem', color: 'var(--text-secondary)', lineHeight: 1.3 }}>
          {sovereignMode ? "Using local Ollama & Presidio. Data never leaves your network." : "Using Cloud LLM (Claude/OpenAI)."}
        </div>
      </div>

      {/* Status Footer */}
      <div style={{ padding: '16px', borderTop: '1px solid var(--border-color)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <Database size={14} />
          <span>Neo4j Active</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', marginLeft: 'auto' }}></span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <GitBranch size={14} />
          <span>Git Tracked</span>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--accent-success)', marginLeft: 'auto' }}></span>
        </div>
      </div>
    </div>
  );
}
