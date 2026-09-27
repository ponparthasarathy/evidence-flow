import React, { useState } from 'react';
import { ShieldAlert, LogIn, ArrowRight, UserCheck, Shield, DollarSign, ShoppingCart, Code, Users } from 'lucide-react';

const DEMO_ACCOUNTS = [
  { role: 'Admin', email: 'admin@evidenceflow.io', name: 'Sarah Connor', desc: 'Full System Control & User Management', icon: Shield },
  { role: 'Engineer', email: 'dev@evidenceflow.io', name: 'Alex Mercer', desc: 'AST Code Constants & Git Forensics', icon: Code },
  { role: 'Auditor', email: 'auditor@evidenceflow.io', name: 'Marcus Vance', desc: 'Policy Drift & Audit Findings Sign-Off', icon: UserCheck },
  { role: 'PO Creator', email: 'procurement@evidenceflow.io', name: 'David Chen', desc: 'PO Creation, Authorizations & Verification', icon: ShoppingCart }
];

export default function LoginScreen({ onLoginSuccess }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleLoginSubmit = async (e, demoEmail = null) => {
    if (e) e.preventDefault();
    const targetEmail = demoEmail || email;
    if (!targetEmail.trim()) {
      setError('Please enter an email address.');
      return;
    }
    setError('');
    setLoading(true);

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: targetEmail, password: password || 'password123' })
      });
      const data = await res.json();
      if (res.ok) {
        onLoginSuccess(data.user, data.access_token);
      } else {
        setError(data.detail || 'Authentication failed.');
      }
    } catch (err) {
      setError('Server connection error.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      width: '100vw',
      minHeight: '100vh',
      background: 'var(--bg-secondary)',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justify: 'center',
      padding: '40px 20px',
      overflowY: 'auto'
    }}>
      <div style={{
        maxWidth: '960px',
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '28px'
      }}>
        {/* Header Branding */}
        <div style={{ textAlign: 'center' }}>
          <div style={{ display: 'inline-flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>

            <h1 style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.5px' }}>
              EvidenceFlow
            </h1>
          </div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
            Enterprise Decision-to-Code Compliance Tracing Platform
          </p>
        </div>

        {/* Form Box */}
        <div className="flat-panel" style={{
          padding: '28px 32px',
          width: '100%',
          maxWidth: '460px',
          background: '#FFFFFF',
          boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
        }}>
          <h2 style={{ fontSize: '1.15rem', fontWeight: 600, marginBottom: '4px', color: 'var(--text-primary)' }}>
            Sign in to your account
          </h2>
          <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '18px' }}>
            Enter your credentials to access your role workspace.
          </p>

          {error && (
            <div style={{
              padding: '10px 12px',
              borderRadius: '4px',
              background: 'rgba(224, 62, 62, 0.08)',
              color: 'var(--accent-danger)',
              fontSize: '0.85rem',
              marginBottom: '16px',
              border: '1px solid var(--accent-danger)'
            }}>
              {error}
            </div>
          )}

          <form onSubmit={(e) => handleLoginSubmit(e)} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Corporate Email Address
              </label>
              <input
                type="email"
                placeholder="name@company.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <div>
              <label style={{ fontSize: '0.8rem', fontWeight: 500, color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>
                Password
              </label>
              <input
                type="password"
                placeholder="••••••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                style={{
                  width: '100%',
                  padding: '9px 12px',
                  borderRadius: '4px',
                  border: '1px solid var(--border-color)',
                  fontSize: '0.9rem',
                  outline: 'none'
                }}
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="btn-primary"
              style={{
                padding: '10px',
                borderRadius: '4px',
                fontSize: '0.9rem',
                fontWeight: 600,
                display: 'flex',
                alignItems: 'center',
                justify: 'center',
                gap: '8px',
                marginTop: '6px'
              }}
            >
              <LogIn size={16} />
              {loading ? 'Authenticating...' : 'Sign In to Workspace'}
            </button>
          </form>
        </div>

        {/* Demo Roles Grid */}
        <div style={{ width: '100%' }}>
          <div style={{
            textAlign: 'center',
            fontSize: '0.75rem',
            fontWeight: 600,
            color: 'var(--text-secondary)',
            textTransform: 'uppercase',
            letterSpacing: '0.08em',
            marginBottom: '14px'
          }}>
            Or Quick Sign-In as an Enterprise Role
          </div>

          <div style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '12px',
            width: '100%'
          }}>
            {DEMO_ACCOUNTS.map((acc, idx) => {
              const IconComponent = acc.icon;
              return (
                <button
                  key={idx}
                  onClick={() => handleLoginSubmit(null, acc.email)}
                  className="flat-panel"
                  style={{
                    padding: '14px 16px',
                    textAlign: 'left',
                    cursor: 'pointer',
                    transition: 'all 0.12s ease-in-out',
                    background: '#FFFFFF',
                    border: '1px solid var(--border-color)',
                    borderRadius: '6px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '8px',
                    minHeight: '105px'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = 'var(--accent-primary)';
                    e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.04)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = 'var(--border-color)';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                      <IconComponent size={16} color="var(--accent-primary)" />
                      <span style={{ fontWeight: 600, fontSize: '0.9rem', color: 'var(--text-primary)' }}>{acc.role}</span>
                    </div>
                    <ArrowRight size={14} color="var(--text-secondary)" />
                  </div>

                  <div>
                    <div style={{ fontSize: '0.825rem', fontWeight: 500, color: 'var(--text-primary)' }}>{acc.name}</div>
                    <div style={{ fontSize: '0.725rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>{acc.email}</div>
                  </div>

                  <div style={{ fontSize: '0.725rem', color: 'var(--text-muted)', borderTop: '1px solid var(--border-color)', paddingTop: '6px', marginTop: 'auto' }}>
                    {acc.desc}
                  </div>
                </button>
              );
            })}
          </div>
        </div>

      </div>
    </div>
  );
}
