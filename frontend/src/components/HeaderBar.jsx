import React from 'react';
import { Shield, User, LogOut } from 'lucide-react';

export default function HeaderBar({ currentUser, onSignOut }) {
  const getBadgeStyle = (role) => {
    switch (role) {
      case 'Admin': return { bg: 'rgba(188, 2, 2, 0.1)', color: '#BC0202' };
      case 'Auditor': return { bg: 'rgba(15, 123, 108, 0.1)', color: '#0F7B6C' };
      case 'Engineer':
      case 'Engineering': return { bg: 'rgba(43, 89, 195, 0.1)', color: '#2B59C3' };
      case 'PO Creator':
      case 'Procurement': return { bg: 'rgba(217, 115, 13, 0.1)', color: '#D9730D' };
      default: return { bg: 'rgba(55, 53, 47, 0.08)', color: '#37352F' };
    }
  };

  const badgeStyle = getBadgeStyle(currentUser.role);

  return (
    <div style={{
      height: '56px',
      background: 'var(--bg-secondary)',
      borderBottom: '1px solid var(--border-color)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 24px',
      flexShrink: 0
    }}>
      {/* Title / Breadcrumb */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.9rem' }}>
        <Shield size={18} color="var(--accent-primary)" />
        <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>EvidenceFlow</span>
        <span style={{ color: 'var(--text-secondary)' }}>/</span>
        <span style={{ fontSize: '0.8rem', padding: '3px 8px', borderRadius: '4px', background: badgeStyle.bg, color: badgeStyle.color, fontWeight: 600 }}>
          {currentUser.role} Workspace
        </span>
      </div>

      {/* User Profile Info & Sign Out */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '28px',
            height: '28px',
            borderRadius: '50%',
            background: 'var(--border-color)',
            display: 'flex',
            alignItems: 'center',
            justify: 'center',
            fontSize: '0.8rem',
            fontWeight: 600,
            color: 'var(--text-primary)'
          }}>
            {currentUser.name.charAt(0)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.2 }}>
              {currentUser.name}
            </span>
            <span style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
              {currentUser.email}
            </span>
          </div>
        </div>

        <button
          onClick={onSignOut}
          style={{
            padding: '5px 10px',
            borderRadius: '4px',
            border: '1px solid var(--border-color)',
            background: '#FFFFFF',
            color: 'var(--text-secondary)',
            fontSize: '0.8rem',
            cursor: 'pointer',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}
          title="Sign Out"
        >
          <LogOut size={14} /> Sign Out
        </button>
      </div>
    </div>
  );
}

