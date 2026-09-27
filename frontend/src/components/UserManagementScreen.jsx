import React, { useState, useEffect } from 'react';
import { Users, Shield, Check, Lock, Plus, UserPlus, KeyRound, AlertCircle } from 'lucide-react';

const PERMISSION_ROWS = [
  { key: 'users_management', label: 'Users management', admin: true, po: false, audit: false, eng: false },
  { key: 'upload_evidence', label: 'Upload evidence', admin: true, po: true, audit: true, eng: true },
  { key: 'view_po', label: 'View PO', admin: true, po: true, audit: true, eng: 'Limited' },
  { key: 'view_invoices', label: 'View invoices', admin: true, po: 'Limited', audit: true, eng: 'Limited' },
  { key: 'view_payments', label: 'View payments', admin: true, po: false, audit: true, eng: false },
  { key: 'view_source_code', label: 'View source code', admin: true, po: false, audit: 'Limited', eng: true },
  { key: 'analyze_code', label: 'Analyze code', admin: true, po: false, audit: true, eng: true },
  { key: 'view_audit_findings', label: 'View audit findings', admin: true, po: 'Own', audit: true, eng: 'Technical' },
  { key: 'confirm_finding', label: 'Confirm finding', admin: true, po: false, audit: true, eng: false },
  { key: 'manage_roles', label: 'Manage roles', admin: true, po: false, audit: false, eng: false }
];

export default function UserManagementScreen({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [newUserName, setNewUserName] = useState('');
  const [newUserEmail, setNewUserEmail] = useState('');
  const [newUserRole, setNewUserRole] = useState('Auditor');
  const [notice, setNotice] = useState(null);

  useEffect(() => {
    fetch('/api/users', { headers: { 'X-User-Role': currentUser.role } })
      .then(res => res.json())
      .then(data => setUsers(data.users || []))
      .catch(err => console.error("Error fetching users:", err));
  }, [currentUser.role]);

  const handleAddUser = async (e) => {
    e.preventDefault();
    if (!newUserName.trim() || !newUserEmail.trim()) return;

    if (currentUser.role !== 'Admin') {
      setNotice({ type: 'error', message: 'Forbidden: Creating new users requires Admin privileges.' });
      return;
    }

    try {
      const res = await fetch('/api/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-User-Role': currentUser.role
        },
        body: JSON.stringify({ name: newUserName, email: newUserEmail, role: newUserRole })
      });
      const data = await res.json();
      if (res.ok) {
        setUsers([...users, data.user]);
        setNewUserName('');
        setNewUserEmail('');
        setNotice({ type: 'success', message: `User '${data.user.name}' created with role ${data.user.role}.` });
      } else {
        setNotice({ type: 'error', message: data.detail || 'Failed to create user.' });
      }
    } catch (err) {
      setNotice({ type: 'error', message: 'Error connecting to server.' });
    }
  };

  const getRoleBadgeClass = (role) => {
    switch (role) {
      case 'Admin': return 'badge-red';
      case 'Auditor': return 'badge-green';
      case 'Engineer':
      case 'Engineering': return 'badge-blue';
      case 'PO Creator':
      case 'Procurement': return 'badge badge-gold';
      default: return 'badge';
    }
  };

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Users size={24} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>User Management & RBAC Matrix</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Manage organization accounts, role-based scope access, and audit permission matrices.
        </p>
      </div>

      {notice && (
        <div style={{
          padding: '12px 16px',
          borderRadius: '6px',
          fontSize: '0.875rem',
          background: notice.type === 'error' ? 'rgba(224, 62, 62, 0.08)' : 'rgba(15, 123, 108, 0.08)',
          color: notice.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)',
          border: `1px solid ${notice.type === 'error' ? 'var(--accent-danger)' : 'var(--accent-success)'}`
        }}>
          {notice.message}
        </div>
      )}

      {/* User Creation Panel (Admin Only) */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <UserPlus size={18} color="var(--accent-primary)" />
          Add User Account
        </h3>

        <form onSubmit={handleAddUser} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 160px 140px', gap: '12px', alignItems: 'end' }}>
          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Full Name</label>
            <input
              type="text"
              placeholder="e.g. Jane Doe"
              value={newUserName}
              onChange={(e) => setNewUserName(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Email Address</label>
            <input
              type="email"
              placeholder="jane@company.com"
              value={newUserEmail}
              onChange={(e) => setNewUserEmail(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem' }}
            />
          </div>

          <div>
            <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>Assigned Role</label>
            <select
              value={newUserRole}
              onChange={(e) => setNewUserRole(e.target.value)}
              style={{ width: '100%', padding: '8px 12px', borderRadius: '4px', border: '1px solid var(--border-color)', fontSize: '0.875rem', background: '#FFF' }}
            >
              <option value="Admin">Admin</option>
              <option value="Engineer">Engineer</option>
              <option value="Auditor">Auditor</option>
              <option value="PO Creator">PO Creator</option>
            </select>
          </div>

          <button
            type="submit"
            className="btn-primary"
            style={{ padding: '9px 16px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '6px' }}
          >
            <Plus size={16} /> Add User
          </button>
        </form>
      </div>

      {/* Users List Table */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>
          Registered Organization Accounts ({users.length})
        </h3>

        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px' }}>User Name</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Role</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '12px 10px', fontWeight: 500, color: 'var(--text-primary)' }}>{u.name}</td>
                <td style={{ padding: '12px 10px', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{u.email}</td>
                <td style={{ padding: '12px 10px' }}>
                  <span className={`badge ${getRoleBadgeClass(u.role)}`} style={{ fontWeight: 600 }}>
                    {u.role}
                  </span>
                </td>
                <td style={{ padding: '12px 10px' }}>
                  <span style={{ color: 'var(--accent-success)', fontWeight: 500, fontSize: '0.8rem' }}>
                    ● {u.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Permission Matrix Table */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
          <h3 style={{ fontSize: '1.1rem', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Shield size={18} color="var(--accent-primary)" />
            Enterprise Role Permission Matrix
          </h3>
          <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
            System Enforced via JWT Scopes & FastAPI Middleware
          </span>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.85rem' }}>
            <thead>
              <tr style={{ borderBottom: '2px solid var(--border-color)', background: 'var(--bg-secondary)' }}>
                <th style={{ padding: '12px', textAlign: 'left', width: '220px' }}>Permission</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Admin</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Engineer</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>Auditor</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>PO Creator</th>
              </tr>
            </thead>
            <tbody>
              {PERMISSION_ROWS.map((row, idx) => (
                <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '10px 12px', fontWeight: 500, color: 'var(--text-primary)' }}>{row.label}</td>
                  
                  {['admin', 'eng', 'audit', 'po'].map((colKey, cIdx) => {
                    const val = row[colKey];
                    return (
                      <td key={cIdx} style={{ padding: '10px 12px', textAlign: 'center' }}>
                        {val === true && <Check size={16} color="var(--accent-success)" style={{ display: 'inline-block' }} />}
                        {val === false && <span style={{ color: 'var(--border-color)' }}>-</span>}
                        {typeof val === 'string' && (
                          <span style={{
                            fontSize: '0.75rem',
                            padding: '2px 6px',
                            borderRadius: '3px',
                            background: 'rgba(55, 53, 47, 0.08)',
                            color: 'var(--text-primary)',
                            fontWeight: 500
                          }}>
                            {val}
                          </span>
                        )}
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}
