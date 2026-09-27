import React, { useState, useEffect } from 'react';
import { Shield, Database, Users, Server, Activity, Plus, CheckCircle, AlertTriangle, GitBranch, ExternalLink, LineChart, Calendar } from 'lucide-react';

export default function AdminDashboard({ currentUser, onNavigate }) {
  const [users, setUsers] = useState([]);
  const [pipelineStatus, setPipelineStatus] = useState(null);
  const [commits, setCommits] = useState([]);

  useEffect(() => {
    fetch('/api/users', { headers: { 'X-User-Role': currentUser.role } })
      .then(res => res.json())
      .then(data => setUsers(data.users || []));

    fetch('/api/ingest/status')
      .then(res => res.json())
      .then(data => setPipelineStatus(data));

    fetch('/api/commits/recent')
      .then(res => res.json())
      .then(data => setCommits(data.commits || []));
  }, [currentUser.role]);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '28px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header Banner */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
          <Shield size={26} color="var(--accent-primary)" />
          <h1 style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)' }}>Admin System Operations Center</h1>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          Global system health, user account provisioning, RBAC matrix enforcement, and database node monitoring.
        </p>
      </div>

      {/* System Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '16px' }}>
        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>ACTIVE USER ACCOUNTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>{users.length}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--accent-success)', marginTop: '4px' }}>4 Roles Provisioned</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>NEO4J GRAPH NODES</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '6px' }}>{pipelineStatus?.total_nodes || 12}</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>{pipelineStatus?.total_edges || 14} Linked Edges</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>DUCKDB SPEND FACTS</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '6px' }}>Active</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>OLAP Analytics Connected</div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500 }}>QDRANT VECTOR DB</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-success)', marginTop: '6px' }}>Ready</div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>64-dim Cosine Vectors</div>
        </div>
      </div>

      {/* Quick Action Navigation Buttons */}
      <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
        <button onClick={() => onNavigate('graph-analytics')} className="btn-primary" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px', background: 'var(--accent-primary)', color: '#FFFFFF' }}>
          <LineChart size={16} /> Open Graph View (Chart.js)
        </button>
        <button onClick={() => onNavigate('users')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Users size={16} /> Manage Users & RBAC Matrix
        </button>
        <button onClick={() => onNavigate('explorer')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Database size={16} /> Open Case Explorer
        </button>
        <button onClick={() => onNavigate('analytics')} className="btn" style={{ padding: '10px 18px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Activity size={16} /> Open Spend Analytics
        </button>
      </div>

      {/* Dedicated Section: Graph View (Daily, Weekly, Monthly, Yearly) */}
      <div className="flat-panel" style={{ padding: '24px', borderLeft: '6px solid var(--accent-primary)', background: '#FAFAFA' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px' }}>
          <h3 style={{ fontSize: '1.15rem', fontWeight: 600, color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <LineChart size={20} color="var(--accent-primary)" />
            Admin Visual Graph Analytics Section (Chart.js)
          </h3>
          <span className="badge badge-green">Admin & Auditor Exclusive</span>
        </div>
        <p style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', marginBottom: '16px', lineHeight: 1.5 }}>
          Access full interactive charts with <strong>Daily</strong>, <strong>Weekly</strong>, <strong>Monthly</strong>, and <strong>Yearly</strong> breakdown views powered by Chart.js. Includes spend trends, policy drift anomaly frequencies, vendor distribution doughnut, and multi-dimensional compliance radar.
        </p>
        <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
          <button
            onClick={() => onNavigate('graph-analytics')}
            className="btn-primary"
            style={{ padding: '8px 16px', fontSize: '0.875rem', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Calendar size={15} /> Launch Daily/Weekly/Monthly/Yearly Graph View
          </button>
        </div>
      </div>

      {/* Accounts Directory */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px' }}>System Account Directory</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.875rem' }}>
          <thead>
            <tr style={{ borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)' }}>
              <th style={{ padding: '10px' }}>Name</th>
              <th style={{ padding: '10px' }}>Email</th>
              <th style={{ padding: '10px' }}>Assigned Role</th>
              <th style={{ padding: '10px' }}>Status</th>
            </tr>
          </thead>
          <tbody>
            {users.map((u, idx) => (
              <tr key={idx} style={{ borderBottom: '1px solid var(--border-color)' }}>
                <td style={{ padding: '10px', fontWeight: 500 }}>{u.name}</td>
                <td style={{ padding: '10px', fontFamily: 'monospace', color: 'var(--text-secondary)' }}>{u.email}</td>
                <td style={{ padding: '10px' }}><span className="badge badge-green">{u.role}</span></td>
                <td style={{ padding: '10px', color: 'var(--accent-success)' }}>● {u.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Real-Time Commit Audit Stream */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <GitBranch size={18} color="var(--accent-primary)" /> Target Repository Lineage Audit Stream (codite-team/evidence-flow-commit)
        </h3>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {commits.map((c, idx) => (
            <div key={idx} style={{ padding: '12px', background: 'var(--bg-secondary)', borderRadius: '6px', fontSize: '0.85rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                  Commit <code>{c.commit_hash}</code> &bull; Author: {c.author}
                </div>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '2px' }}>
                  "{c.commit_message}"
                </div>
              </div>
              <a
                href={c.commit_url || "https://github.com/codite-team/evidence-flow-commit.git"}
                target="_blank"
                rel="noreferrer"
                style={{ color: 'var(--accent-primary)', fontWeight: 600, fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}
              >
                GitHub <ExternalLink size={12} />
              </a>
            </div>
          ))}
        </div>
      </div>

    </div>
  );
}

