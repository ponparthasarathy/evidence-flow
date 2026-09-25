import React, { useState, useEffect } from 'react';
import GraphView from './components/GraphView';
import EvidencePanel from './components/EvidencePanel';
import QueryControl from './components/QueryControl';
import IngestionScreen from './components/IngestionScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ReviewScreen from './components/ReviewScreen';
import AnalyticsScreen from './components/AnalyticsScreen';
import ComplianceScreen from './components/ComplianceScreen';
import Sidebar from './components/Sidebar';

const API_BASE = '/api';

export default function App() {
  const [viewState, setViewState] = useState('ingestion'); // 'ingestion' | 'processing' | 'review' | 'explorer' | 'analytics' | 'compliance' | 'settings'
  const [sovereignMode, setSovereignMode] = useState(false);

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
    if (viewState === 'explorer' && graphData.nodes.length === 0) {
      fetchGraph();
    }
  }, [viewState]);

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

      // Highlight mismatch path: Policy -> CodeFunction -> Commit -> Dev
      setHighlightedPath({
        nodes: ["Policy_2023-02-01", "CodeFunction_process_vendor_payment", "Commit_2022-03-10", "Dev_Jane_Developer"],
        edges: ["Policy_2023-02-01->GOVERNS->CodeFunction_process_vendor_payment", "CodeFunction_process_vendor_payment->LAST_CHANGED_BY->Commit_2022-03-10", "Dev_Jane_Developer->AUTHORED->Commit_2022-03-10"]
      });
    } catch (err) {
      console.error("Query 2 error:", err);
    } finally {
      setLoading(false);
    }
  };

  const runCounterfactual = async (threshold) => {
    try {
      setLoading(true);
      setActiveQuery('counterfactual');
      const res = await fetch(`${API_BASE}/queries/counterfactual?threshold=${threshold}`);
      const data = await res.json();
      setQueryResult(data);

      // Highlight affected invoices exceeding hypothetical threshold
      setHighlightedPath({
        nodes: ["Invoice_INV-2024-001", "Invoice_INV-2024-002"],
        edges: ["PO #4521->BILLED_BY->Invoice_INV-2024-001", "PO #4521->BILLED_BY->Invoice_INV-2024-002"]
      });
    } catch (err) {
      console.error("Counterfactual query error:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleReingest = () => {
    setViewState('ingestion');
  };

  const handleStartProcessing = () => {
    setViewState('processing');
  };

  const handleProcessingComplete = () => {
    setViewState('review');
  };

  const handleReviewAccept = () => {
    setViewState('explorer');
    fetchGraph();
  };

  return (
    <div style={{ display: 'flex', height: '100vh', background: 'var(--bg-primary)', overflow: 'hidden' }}>
      
      {/* Left Sidebar */}
      <Sidebar 
        viewState={viewState} 
        onNavigate={setViewState} 
        sovereignMode={sovereignMode}
        setSovereignMode={setSovereignMode}
      />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {viewState === 'ingestion' && (
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '32px' }}>
              <IngestionScreen onStartProcessing={handleStartProcessing} sovereignMode={sovereignMode} />
            </div>
          </main>
        )}

        {viewState === 'processing' && (
          <main style={{ flex: 1, overflow: 'hidden' }}>
            <ProcessingScreen onComplete={handleProcessingComplete} />
          </main>
        )}

        {viewState === 'review' && (
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '32px' }}>
              <ReviewScreen onAccept={handleReviewAccept} />
            </div>
          </main>
        )}

        {viewState === 'analytics' && (
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <AnalyticsScreen />
          </main>
        )}

        {viewState === 'compliance' && (
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <ComplianceScreen />
          </main>
        )}

        {viewState === 'settings' && (
          <main style={{ flex: 1, overflowY: 'auto', padding: '32px' }}>
            <div className="flat-panel" style={{ padding: '24px', maxWidth: '800px' }}>
              <h2 style={{ fontSize: '1.4rem', fontWeight: 600, marginBottom: '12px' }}>Settings & System Config</h2>
              <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div><strong>Theme:</strong> Notion Enterprise Minimalist (White / Red #BC0202)</div>
                <div><strong>Backend API:</strong> FastAPI v0.2.0 (Port 8000)</div>
                <div><strong>Graph DB:</strong> Neo4j 5.18 (Port 7474 / 7687)</div>
                <div><strong>Analytics Engine:</strong> DuckDB OLAP (data/analytics.duckdb)</div>
                <div><strong>Vector DB:</strong> Qdrant Vector Search (Port 6333)</div>
                <div><strong>Workflow Engine:</strong> Temporal IO Workflow Worker</div>
                <div><strong>Observability:</strong> OpenTelemetry / Jaeger Tracing</div>
                <div><strong>Sovereign Mode Status:</strong> {sovereignMode ? "ENABLED (Local Ollama & Presidio)" : "DISABLED (Cloud Anthropic API)"}</div>
              </div>
            </div>
          </main>
        )}

        {viewState === 'explorer' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '16px' }}>
            {/* Query Bar */}
            <QueryControl
              onRunQuery1={runQuery1}
              onRunQuery2={runQuery2}
              onRunCounterfactual={runCounterfactual}
              onReingest={handleReingest}
              loading={loading}
            />

            {/* Main Workspace */}
            <div style={{ display: 'flex', flex: 1, gap: '16px', overflow: 'hidden' }}>
              {/* Cytoscape Graph Canvas */}
              <main className="flat-panel" style={{ flex: 1, position: 'relative', overflow: 'hidden', background: '#FFFFFF' }}>
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
        )}
      </div>
    </div>
  );
}

