import React from 'react';
import { ShieldAlert, PlusSquare, Network, Settings, GitBranch, Database } from 'lucide-react';

export default function Sidebar({ viewState, onNavigate }) {
  const navItems = [
    { id: 'ingestion', label: 'New Ingestion', icon: PlusSquare },
    { id: 'explorer', label: 'Case Explorer', icon: Network },
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
        <ShieldAlert size={24} color="var(--accent-primary)" />
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
