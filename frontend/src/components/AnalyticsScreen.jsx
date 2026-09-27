import React, { useState, useEffect } from 'react';
import { BarChart3, Search, Database, AlertCircle, ShoppingCart } from 'lucide-react';

export default function AnalyticsScreen() {
  const [spendData, setSpendData] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [loadingSearch, setLoadingSearch] = useState(false);

  useEffect(() => {
    fetch('/api/analytics/spend-by-vendor')
      .then(res => res.json())
      .then(data => setSpendData(data.spend_by_vendor || []))
      .catch(err => console.error("Error fetching analytics:", err));
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQuery.trim()) return;
    setLoadingSearch(true);
    try {
      const res = await fetch(`/api/search?q=${encodeURIComponent(searchQuery)}`);
      const data = await res.json();
      setSearchResults(data.results || []);
    } catch (err) {
      console.error("Vector search error:", err);
    } finally {
      setLoadingSearch(false);
    }
  };

  const totalSpend = spendData.reduce((acc, curr) => acc + (curr.total_spend || 0), 0);

  return (
    <div style={{ padding: '32px', display: 'flex', flexDirection: 'column', gap: '32px', maxWidth: '1100px', margin: '0 auto', width: '100%' }}>
      
      {/* Header */}
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '8px' }}>
          <Database size={24} color="var(--accent-primary)" />
          <h2 style={{ fontSize: '1.8rem', fontWeight: 600, color: 'var(--text-primary)' }}>Analytics & Vector Search</h2>
        </div>
        <p style={{ color: 'var(--text-secondary)', fontSize: '0.95rem' }}>
          DuckDB OLAP engine for spend analytics & Qdrant vector embeddings for semantic document search.
        </p>
      </div>

      {/* Top Metrics Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '16px' }}>
        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Total Tracked Spend
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-primary)', marginTop: '8px' }}>
            ₹{totalSpend.toLocaleString('en-IN')}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Calculated across ingested invoices via DuckDB
          </div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Active Vendors
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--text-primary)', marginTop: '8px' }}>
            {spendData.length}
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            Grouped vendor entities
          </div>
        </div>

        <div className="flat-panel" style={{ padding: '20px' }}>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontWeight: 500, textTransform: 'uppercase', letterSpacing: '0.5px' }}>
            Qdrant Collection Status
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 700, color: 'var(--accent-success)', marginTop: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--accent-success)' }}></span>
            Active
          </div>
          <div style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', marginTop: '4px' }}>
            64-dim cosine vector space
          </div>
        </div>
      </div>

      {/* Spend by Vendor Chart & Table */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '16px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <BarChart3 size={18} color="var(--accent-primary)" />
          DuckDB Spend Aggregation by Vendor
        </h3>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          {spendData.map((item, idx) => {
            const pct = totalSpend > 0 ? (item.total_spend / totalSpend) * 100 : 0;
            return (
              <div key={idx} style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 500, color: 'var(--text-primary)' }}>{item.vendor}</span>
                  <span style={{ fontWeight: 600, color: 'var(--accent-primary)' }}>
                    ₹{item.total_spend.toLocaleString('en-IN')} ({pct.toFixed(1)}%)
                  </span>
                </div>
                <div style={{ width: '100%', height: '10px', background: 'var(--bg-secondary)', borderRadius: '5px', overflow: 'hidden' }}>
                  <div style={{
                    width: `${pct}%`,
                    height: '100%',
                    background: 'var(--accent-primary)',
                    borderRadius: '5px'
                  }} />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Qdrant Vector Search Section */}
      <div className="flat-panel" style={{ padding: '24px' }}>
        <h3 style={{ fontSize: '1.1rem', fontWeight: 600, marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Search size={18} color="var(--accent-primary)" />
          Qdrant Semantic Search Engine
        </h3>
        <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: '16px' }}>
          Search policy limits, purchase approvals, or line items using natural language semantics.
        </p>

        <form onSubmit={handleSearch} style={{ display: 'flex', gap: '8px', marginBottom: '20px' }}>
          <input
            type="text"
            placeholder="e.g. 'CFO approval threshold' or 'Enterprise Server'"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            style={{
              flex: 1,
              padding: '10px 14px',
              borderRadius: '6px',
              border: '1px solid var(--border-color)',
              fontSize: '0.9rem',
              outline: 'none'
            }}
          />
          <button
            type="submit"
            disabled={loadingSearch}
            className="btn-primary"
            style={{ padding: '10px 20px', display: 'flex', alignItems: 'center', gap: '8px' }}
          >
            <Search size={16} />
            {loadingSearch ? 'Searching...' : 'Vector Search'}
          </button>
        </form>

        {searchResults.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
            <div style={{ fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              Top Matching Chunks ({searchResults.length}):
            </div>
            {searchResults.map((res, idx) => (
              <div key={idx} style={{
                padding: '12px 16px',
                borderRadius: '6px',
                border: '1px solid var(--border-color)',
                background: '#FAFAFA',
                display: 'flex',
                flexDirection: 'column',
                gap: '6px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem' }}>
                  <span style={{ fontWeight: 600, color: 'var(--text-primary)' }}>
                    {res.payload?.file_name || res.id} ({res.payload?.doc_type})
                  </span>
                  <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '4px', background: 'rgba(188,2,2,0.1)', color: 'var(--accent-primary)', fontWeight: 600 }}>
                    Score: {res.score}
                  </span>
                </div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'monospace' }}>
                  {res.payload?.summary || res.payload?.text}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
}
