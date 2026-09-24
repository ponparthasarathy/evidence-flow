import React, { useState, useEffect } from 'react';
import GraphView from './components/GraphView';
import EvidencePanel from './components/EvidencePanel';
import QueryControl from './components/QueryControl';
import { GitBranch, ShieldAlert } from 'lucide-react';

const API_BASE = '/api';

export default function App() {
  const [graphData, setGraphData] = useState({ nodes: [], edges: [] });
  const [selectedNode, setSelectedNode] = useState(null);
  const [evidenceData, setEvidenceData] = useState(null);
  const [queryResult, setQueryResult] = useState(null);
  const [activeQuery, setActiveQuery] = useState(null);
  const [highlightedPath, setHighlightedPath] = useState(null);
  const [loading, setLoading] = useState(false);

  const fetchGraph = async () => {
    try {
      setLoading(true);
      const res = await fetch(`${API_BASE}/graph`);
      const data = await res.json();
      setGraphData(data);
    } catch (err) {
      console.error("Failed to fetch graph:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGraph();
  }, []);

  const handleNodeClick = async (nodeId) => {
    const node = graphData.nodes.find(n => n.id === nodeId);
    setSelectedNode(node || { id: nodeId });
    try {
      const res = await fetch(`${API_BASE}/evidence/${nodeId}`);
      if (res.ok) {
        const ev = await res.json();
        setEvidenceData(ev);
      } else {
        setEvidenceData(null);
      }
    } catch (err) {
      console.error("Error fetching evidence:", err);
    }
  };

  const runQuery1 = async () => {
    try {
      setLoading(true);
      setActiveQuery('extra');
      const res = await fetch(`${API_BASE}/queries/extra-line-items`);
      const data = await res.json();
      setQueryResult(data);

      // Highlight path: Invoice 2 -> Payment -> CodeFunction
      setHighlightedPath({
        nodes: ["Invoice_INV-2024-002", "Payment_INV-2024-002", "CodeFunction_process_vendor_payment"],
        edges: ["Invoice_INV-2024-002->PAID_VIA->Payment_INV-2024-002", "Payment_INV-2024-002->EXECUTED_BY->CodeFunction_process_vendor_payment"]
      });
    } catch (err) {
      console.error("Query 1 error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runQuery2 = async () => {
    try {
      setLoading(true);
      setActiveQuery('drift');
      const res = await fetch(`${API_BASE}/queries/policy-drift`);
      const data = await res.json();
      setQueryResult(data);

      // Highlight mismatch path: Policy -> CodeFunction -> Commit
      setHighlightedPath({
        nodes: ["Policy_2023-02-01", "CodeFunction_process_vendor_payment", "Commit_2022-03-10"],
        edges: ["Policy_2023-02-01->GOVERNS->CodeFunction_process_vendor_payment", "CodeFunction_process_vendor_payment->LAST_CHANGED_BY->Commit_2022-03-10"]
      });
    } catch (err) {
      console.error("Query 2 error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReingest = async () => {
    try {
      setLoading(true);
      await fetch(`${API_BASE}/ingest/run`, { method: 'POST' });
      await fetchGraph();
    } catch (err) {
      console.error("Reingest error:", err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', padding: '16px', gap: '16px', background: 'var(--bg-primary)' }}>
      {/* Top Header */}
      <header className="glass-panel" style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <ShieldAlert size={28} color="#06B6D4" />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 700, letterSpacing: '-0.02em', background: 'linear-gradient(135deg, #F3F4F6, #9CA3AF)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              EvidenceFlow <span style={{ fontSize: '0.75rem', padding: '2px 8px', borderRadius: '12px', background: 'rgba(6, 182, 212, 0.15)', color: '#38BDF8', border: '1px solid rgba(6, 182, 212, 0.3)', verticalAlign: 'middle' }}>v0 Baseline</span>
            </h1>
            <p style={{ fontSize: '0.775rem', color: 'var(--text-secondary)' }}>
              Deterministic Business Decision Lineage & Stale Code Policy Drift Engine
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '16px', fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#10B981' }}></span>
            <span>Neo4j Active</span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <GitBranch size={14} color="#38BDF8" />
            <span>Git Tracked</span>
          </div>
        </div>
      </header>

      {/* Query Bar */}
      <QueryControl
        onRunQuery1={runQuery1}
        onRunQuery2={runQuery2}
        onReingest={handleReingest}
        loading={loading}
      />

      {/* Main Workspace */}
      <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
        {/* Cytoscape Graph Canvas */}
        <main className="glass-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden' }}>
          <GraphView
            graphData={graphData}
            selectedNodeId={selectedNode?.id}
            highlightedPath={highlightedPath}
            onNodeClick={handleNodeClick}
          />
        </main>

        {/* Evidence Side Panel */}
        <aside style={{ width: '400px', height: '100%' }}>
          <EvidencePanel
            selectedNode={selectedNode}
            evidenceData={evidenceData}
            queryResult={queryResult}
            activeQuery={activeQuery}
          />
        </aside>
      </div>
    </div>
  );
}
