import React, { useEffect, useRef } from 'react';
import CytoscapeComponent from 'react-cytoscapejs';
import cytoscape from 'cytoscape';
import dagre from 'cytoscape-dagre';

// Register dagre layout
cytoscape.use(dagre);

export default function GraphView({ graphData, selectedNodeId, highlightedPath, onNodeClick }) {
  const cyRef = useRef(null);

  // Format elements for cytoscape
  const elements = React.useMemo(() => {
    if (!graphData || !graphData.nodes) return [];

    const nodes = graphData.nodes.map(n => {
      const isHighlighted = highlightedPath && highlightedPath.nodes.includes(n.id);
      return {
        data: {
          id: n.id,
          label: n.label || n.id,
          type: n.type,
          isHighlighted: isHighlighted ? 'true' : 'false'
        }
      };
    });

    const edges = graphData.edges.map(e => {
      const isHighlighted = highlightedPath && highlightedPath.edges.includes(e.key);
      return {
        data: {
          id: e.key,
          source: e.source,
          target: e.target,
          label: e.label,
          isHighlighted: isHighlighted ? 'true' : 'false'
        }
      };
    });

    return [...nodes, ...edges];
  }, [graphData, highlightedPath]);

  const stylesheet = [
    {
      selector: 'node',
      style: {
        'label': 'data(label)',
        'color': '#F3F4F6',
        'font-size': '12px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '600',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'label',
        'height': '36px',
        'padding': '12px',
        'border-width': '2px',
        'border-color': 'rgba(255,255,255,0.2)',
        'transition-property': 'background-color, border-color, width, height',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'node[type = "Decision"]',
      style: { 'background-color': '#0284C7', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Approval"]',
      style: { 'background-color': '#2563EB', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "PurchaseOrder"]',
      style: { 'background-color': '#059669', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Invoice"]',
      style: { 'background-color': '#D97706', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Payment"]',
      style: { 'background-color': '#9333EA', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "CodeFunction"]',
      style: { 'background-color': '#0D9488', 'shape': 'rectangle' }
    },
    {
      selector: 'node[type = "Commit"]',
      style: { 'background-color': '#475569', 'shape': 'ellipse' }
    },
    {
      selector: 'node[type = "Document"]',
      style: { 'background-color': '#475569', 'shape': 'barrel' }
    },
    {
      selector: 'node[isHighlighted = "true"]',
      style: {
        'border-color': '#EF4444',
        'border-width': '4px',
        'background-color': '#DC2626',
        'color': '#FFFFFF'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#3B82F6',
        'border-width': '4px'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#4B5563',
        'target-arrow-color': '#4B5563',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'color': '#9CA3AF',
        'text-rotation': 'autorotate',
        'text-margin-y': -8
      }
    },
    {
      selector: 'edge[isHighlighted = "true"]',
      style: {
        'width': 4,
        'line-color': '#EF4444',
        'target-arrow-color': '#EF4444'
      }
    }
  ];

  const layout = {
    name: 'dagre',
    rankDir: 'LR',
    nodeSep: 60,
    rankSep: 120,
    padding: 30
  };

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.layout(layout).run();
      cy.fit();
    }
  }, [elements]);

  return (
    <div style={{ width: '100%', height: '100%', position: 'relative' }}>
      <CytoscapeComponent
        elements={elements}
        style={{ width: '100%', height: '100%' }}
        stylesheet={stylesheet}
        layout={layout}
        cy={(cy) => {
          cyRef.current = cy;
          cy.off('tap', 'node');
          cy.on('tap', 'node', (evt) => {
            const node = evt.target;
            if (onNodeClick) {
              onNodeClick(node.id());
            }
          });
        }}
      />
    </div>
  );
}
