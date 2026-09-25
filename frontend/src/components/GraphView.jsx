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
        'color': '#37352F',
        'background-color': '#FFFFFF',
        'font-size': '12px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '500',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'label',
        'height': '32px',
        'padding': '12px',
        'border-width': '1px',
        'border-color': '#E9E9E7',
        'transition-property': 'background-color, border-color',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'node[type = "Decision"]',
      style: { 'border-color': '#0284C7', 'border-width': '2px', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Approval"]',
      style: { 'border-color': '#2563EB', 'border-width': '2px', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "PurchaseOrder"]',
      style: { 'border-color': '#0F7B6C', 'border-width': '2px', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Invoice"]',
      style: { 'border-color': '#D9730D', 'border-width': '2px', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "Payment"]',
      style: { 'border-color': '#A855F7', 'border-width': '2px', 'shape': 'round-rectangle' }
    },
    {
      selector: 'node[type = "CodeFunction"]',
      style: { 'border-color': '#0D9488', 'border-width': '2px', 'shape': 'rectangle', 'background-color': '#F7F7F5' }
    },
    {
      selector: 'node[type = "Commit"]',
      style: { 'border-color': '#787774', 'border-width': '2px', 'shape': 'ellipse' }
    },
    {
      selector: 'node[type = "Document"]',
      style: { 'border-color': '#787774', 'border-width': '2px', 'shape': 'barrel' }
    },
    {
      selector: 'node[isHighlighted = "true"]',
      style: {
        'border-color': '#BC0202',
        'border-width': '3px',
        'background-color': '#FDF2F2',
        'color': '#BC0202',
        'font-weight': '600'
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#37352F',
        'border-width': '3px'
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2,
        'line-color': '#E9E9E7',
        'target-arrow-color': '#E9E9E7',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'color': '#787774',
        'text-rotation': 'autorotate',
        'text-margin-y': -8
      }
    },
    {
      selector: 'edge[isHighlighted = "true"]',
      style: {
        'width': 3,
        'line-color': '#BC0202',
        'target-arrow-color': '#BC0202',
        'color': '#BC0202',
        'font-weight': '600'
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
