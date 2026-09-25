import React, { useState, useEffect } from 'react';
import GraphView from './components/GraphView';
import EvidencePanel from './components/EvidencePanel';
import QueryControl from './components/QueryControl';
import IngestionScreen from './components/IngestionScreen';
import ProcessingScreen from './components/ProcessingScreen';
import ReviewScreen from './components/ReviewScreen';
import Sidebar from './components/Sidebar';

const API_BASE = '/api';

export default function App() {
  const [viewState, setViewState] = useState('ingestion'); // 'ingestion' | 'processing' | 'review' | 'explorer'

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
      <Sidebar viewState={viewState} onNavigate={setViewState} />

      {/* Main Content Area */}
      <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden' }}>
        
        {viewState === 'ingestion' && (
          <main style={{ flex: 1, overflowY: 'auto' }}>
            <div style={{ padding: '32px' }}>
              <IngestionScreen onStartProcessing={handleStartProcessing} />
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

        {viewState === 'explorer' && (
          <div style={{ display: 'flex', flexDirection: 'column', height: '100%', padding: '16px', gap: '16px' }}>
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
