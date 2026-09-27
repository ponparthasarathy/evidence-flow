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
      const props = n.properties || {};
      const status = props.status || 'PASSED';
      const timestamp = props.date || props.timestamp || '';
      
      let customLabel = n.label || n.id;
      if (n.type === 'Commit') {
        const hash = props.commit_hash || n.id.replace('Commit_', '');
        const shortHash = hash.slice(0, 8);
        const timeStr = timestamp ? `\n${timestamp}` : '';
        if (status === 'PASSED') {
          customLabel = `Commit_${shortHash}\n[✓ VALID]${timeStr}`;
        } else {
          customLabel = `Commit_${shortHash}\n[✖ INVALID: BLOCKED]${timeStr}`;
        }
      }

      return {
        data: {
          id: n.id,
          label: customLabel,
          type: n.type,
          commitStatus: status,
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
        'font-size': '11px',
        'font-family': 'Inter, sans-serif',
        'font-weight': '600',
        'text-valign': 'center',
        'text-halign': 'center',
        'width': 'label',
        'height': 'label',
        'padding': '16px',
        'border-width': '1.5px',
        'border-color': '#E9E9E7',
        'shadow-blur': 12,
        'shadow-color': 'rgba(15, 15, 15, 0.1)',
        'shadow-opacity': 1,
        'shadow-offset-y': 4,
        'text-wrap': 'wrap',
        'text-max-width': '160px',
        'transition-property': 'background-color, border-color, shadow-color, shadow-opacity',
        'transition-duration': '0.3s'
      }
    },
    {
      selector: 'node[type = "Decision"]',
      style: { 'border-color': '#0284C7', 'border-width': '2.5px', 'shape': 'round-rectangle', 'border-style': 'solid' }
    },
    {
      selector: 'node[type = "Approval"]',
      style: { 'border-color': '#2563EB', 'border-width': '2.5px', 'shape': 'round-rectangle', 'border-style': 'solid' }
    },
    {
      selector: 'node[type = "PurchaseOrder"]',
      style: { 'border-color': '#0F7B6C', 'border-width': '2.5px', 'shape': 'round-rectangle', 'border-style': 'solid' }
    },
    {
      selector: 'node[type = "Invoice"]',
      style: { 'border-color': '#D9730D', 'border-width': '2.5px', 'shape': 'round-rectangle', 'border-style': 'solid' }
    },
    {
      selector: 'node[type = "Payment"]',
      style: { 'border-color': '#A855F7', 'border-width': '2.5px', 'shape': 'round-rectangle', 'border-style': 'solid' }
    },
    {
      selector: 'node[type = "CodeFunction"]',
      style: { 'border-color': '#0D9488', 'border-width': '2.5px', 'shape': 'cut-rectangle', 'background-color': '#F7F7F5' }
    },
    {
      selector: 'node[type = "Commit"]',
      style: { 'border-color': '#16A34A', 'border-width': '2.5px', 'shape': 'ellipse', 'border-style': 'dashed', 'background-color': '#F0FDF4', 'color': '#15803D' }
    },
    {
      selector: 'node[type = "Commit"][commitStatus = "BLOCKED"]',
      style: { 'border-color': '#DC2626', 'border-width': '3px', 'shape': 'ellipse', 'border-style': 'solid', 'background-color': '#FEF2F2', 'color': '#991B1B' }
    },
    {
      selector: 'node[type = "Document"]',
      style: { 'border-color': '#787774', 'border-width': '2.5px', 'shape': 'barrel' }
    },
    {
      selector: 'node[isHighlighted = "true"]',
      style: {
        'border-color': '#BC0202',
        'border-width': '3px',
        'background-color': '#FFF5F5',
        'color': '#BC0202',
        'shadow-color': 'rgba(188, 2, 2, 0.25)',
        'shadow-blur': 16,
        'shadow-offset-y': 6,
        'z-index': 10
      }
    },
    {
      selector: 'node:selected',
      style: {
        'border-color': '#37352F',
        'border-width': '3px',
        'shadow-color': 'rgba(55, 53, 47, 0.2)',
        'z-index': 10
      }
    },
    {
      selector: 'edge',
      style: {
        'width': 2.5,
        'line-color': '#E9E9E7',
        'target-arrow-color': '#E9E9E7',
        'target-arrow-shape': 'triangle',
        'curve-style': 'bezier',
        'label': 'data(label)',
        'font-size': '10px',
        'font-weight': '500',
        'color': '#9B9A97',
        'text-rotation': 'autorotate',
        'text-margin-y': -12,
        'text-background-color': '#FFFFFF',
        'text-background-opacity': 0.8,
        'text-background-padding': '4px',
        'text-background-shape': 'roundrectangle'
      }
    },
    {
      selector: 'edge[isHighlighted = "true"]',
      style: {
        'width': 3.5,
        'line-color': '#BC0202',
        'target-arrow-color': '#BC0202',
        'color': '#BC0202',
        'font-weight': '700',
        'z-index': 9
      }
    }
  ];

  const layout = {
    name: 'dagre',
    rankDir: 'LR',
    nodeSep: 80,
    rankSep: 160,
    padding: 60,
    animate: true,
    animationDuration: 500
  };

  useEffect(() => {
    if (cyRef.current) {
      const cy = cyRef.current;
      cy.layout(layout).run();
      cy.fit();
    }
  }, [elements]);

  return (
    <div style={{ 
      width: '100%', 
      height: '100%', 
      position: 'relative',
      backgroundSize: '24px 24px',
      backgroundImage: 'radial-gradient(circle, #E6E6E6 1px, transparent 1px)'
    }}>
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
