'use client';

import React, { useState, useEffect, useCallback, Suspense, useRef } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  Controls,
  useNodesState,
} from '@xyflow/react';
import { useSearchParams } from 'next/navigation';
import '@xyflow/react/dist/style.css';
import './results.css';
import Header from '../../components/Header/Header';
import InstructionsModal from '../../components/InstructionsModal/InstructionsModal';

// Import the node components
import BackgroundNode from '../grid/BackgroundNode';
import SubmissionNode from './SubmissionNode';

// Define the read-only display node
const ResultNode = ({ data }) => (
  <div className="result-node">
    <div className="result-node-label">{data.label}</div>
    {data.count && <div className="result-node-count">n={data.count}</div>}
  </div>
);

// Background SVG dimensions (same as grid page)
const svgWidth = 659 * 2;
const svgHeight = 471 * 2;

// Define boundaries based on the background node size and centered position
const bounds = {
  minX: -svgWidth / 2,
  maxX: svgWidth / 2,
  minY: -svgHeight / 2,
  maxY: svgHeight / 2,
};

// Register custom node components
const nodeTypes = {
  resultNode: ResultNode,
  backgroundNode: BackgroundNode,
  submissionNode: SubmissionNode,
};

// Format agreement score as a decimal with 2 decimal places
const formatAgreementScore = (score) => {
  return score.toFixed(2);
};

function ResultsFlow() {
  // State for nodes display
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [nodeData, setNodeData] = useState([]);
  
  // State for individual submission nodes (when hovering)
  const [hoveredLabel, setHoveredLabel] = useState(null);
  const [allNodeSubmissions, setAllNodeSubmissions] = useState({});
  const [isLoadingSubmissions, setIsLoadingSubmissions] = useState(false);
  const [submissionsLoaded, setSubmissionsLoaded] = useState(false);
  
  // General state
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [totalSubmissions, setTotalSubmissions] = useState(0);
  const [backgroundNode, setBackgroundNode] = useState(null);
  
  const searchParams = useSearchParams();
  const [refreshing, setRefreshing] = useState(false);
  const originalNodesOrderRef = useRef([]);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  // Create the background node
  useEffect(() => {
    setBackgroundNode({
      id: 'background-0',
      type: 'backgroundNode',
      position: { x: bounds.minX, y: bounds.minY },
      data: {},
      draggable: false,
      selectable: false,
      zIndex: -1,
    });
  }, []);

  // Refactor fetchAveragedNodes and fetchAllNodeSubmissions so they can be called from refresh
  const fetchAveragedNodes = useCallback(async () => {
    try {
      setLoading(true);
      const sessionID = searchParams.get('sessionID');
      if (!sessionID) {
        setError('No session ID found in URL');
        setLoading(false);
        return;
      }
      const response = await fetch(`/api/getAveragedNodes?sessionID=${sessionID}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      const resultNodes = data.nodeData
        .filter(node => node.position !== null)
        .map(node => ({
          id: node.id,
          type: 'resultNode',
          position: node.position,
          data: { label: node.label, count: node.count },
          draggable: false,
        }));
      setNodes(backgroundNode ? [backgroundNode, ...resultNodes] : resultNodes);
      setNodeData(data.nodeData);
      setTotalSubmissions(data.totalSubmissions);
      setLoading(false);
    } catch (err) {
      setError(`Failed to load data: ${err.message}`);
      setLoading(false);
    }
  }, [searchParams, setNodes, backgroundNode]);

  const fetchAllNodeSubmissions = useCallback(async () => {
    try {
      setIsLoadingSubmissions(true);
      const sessionID = searchParams.get('sessionID');
      if (!sessionID) return;
      const response = await fetch(`/api/getAllNodeSubmissions?sessionID=${sessionID}`);
      if (!response.ok) throw new Error(`Error ${response.status}: ${response.statusText}`);
      const data = await response.json();
      setAllNodeSubmissions(data.nodeSubmissionsMap);
      setSubmissionsLoaded(true);
    } catch (err) {
      // Optionally handle error
    } finally {
      setIsLoadingSubmissions(false);
    }
  }, [searchParams]);

  // Add refresh handler
  const handleRefresh = async () => {
    setRefreshing(true);
    setSubmissionsLoaded(false);
    await fetchAveragedNodes();
    await fetchAllNodeSubmissions();
    setRefreshing(false);
  };

  // Fetch the averaged node positions when component mounts
  useEffect(() => {
    if (backgroundNode) {
      fetchAveragedNodes();
    }
  }, [backgroundNode, fetchAveragedNodes]);

  // Fetch all node submissions data once when component mounts
  useEffect(() => {
    if (!loading && !error && backgroundNode && nodeData.length > 0 && !submissionsLoaded) {
      fetchAllNodeSubmissions();
    }
  }, [loading, error, backgroundNode, nodeData, submissionsLoaded, fetchAllNodeSubmissions]);

  // Update displayed nodes when hovering changes
  useEffect(() => {
    if (hoveredLabel && submissionsLoaded && allNodeSubmissions[hoveredLabel]?.length > 0) {
      // When hovering and we have data, show the submission nodes for this label
      setNodes([backgroundNode, ...allNodeSubmissions[hoveredLabel]]);
    } else if (nodeData.length > 0 && backgroundNode) {
      // When not hovering, show the averaged nodes
      const resultNodes = nodeData
        .filter(node => node.position !== null)
        .map(node => ({
          id: node.id,
          type: 'resultNode',
          position: node.position,
          data: { 
            label: node.label,
            count: node.count
          },
          draggable: false,
        }));
      
      setNodes([backgroundNode, ...resultNodes]);
    }
  }, [hoveredLabel, submissionsLoaded, allNodeSubmissions, nodeData, backgroundNode, setNodes]);

  // Handle row mouse enter - no need to fetch data anymore
  const handleRowMouseEnter = useCallback((nodeLabel) => {
    setHoveredLabel(nodeLabel);
  }, []);

  // Handle row mouse leave
  const handleRowMouseLeave = useCallback(() => {
    setHoveredLabel(null);
  }, []);

  // Move hovered node to front
  const handleNodeMouseEnter = useCallback((event, node) => {
    originalNodesOrderRef.current = nodes;
    // Move hovered node to end (front)
    setNodes((nds) => {
      const filtered = nds.filter(n => n.id !== node.id);
      return [...filtered, node];
    });
  }, [nodes, setNodes]);

  // Restore original order
  const handleNodeMouseLeave = useCallback(() => {
    if (originalNodesOrderRef.current.length > 0) {
      setNodes(originalNodesOrderRef.current);
    }
  }, [setNodes]);

  // Handler for opening instructions modal
  const handleHelpClick = useCallback(() => {
    setIsInstructionsModalOpen(true);
  }, []);

  // Handler for closing instructions modal
  const handleCloseInstructionsModal = useCallback(() => {
    setIsInstructionsModalOpen(false);
  }, []);

  if (loading) {
    return <div className="loading">Loading averaged positions...</div>;
  }

  if (error) {
    return <div className="error">Error: {error}</div>;
  }

  return (
    <div className="results-container">
        <Header onHelpClick={handleHelpClick} />
      <div className="instructions">
        <h2>Group Results</h2>
        <p>This visualization shows the average positions of each randomization element based on all submissions with this session ID. <strong>Hover over a row in the table below</strong> to see individual submissions for that element. Each colored node represents a single participant&apos;s placement of that element.</p>
      </div>
      
      <div className="reactflow-container">
        {isLoadingSubmissions && !submissionsLoaded && (
          <div className="loading-overlay">Loading submission data...</div>
        )}
        <ReactFlow
          nodes={nodes}
          onNodesChange={onNodesChange}
          nodeTypes={nodeTypes}
          fitView
          fitViewOptions={{ padding: 0.2 }}
          nodesDraggable={false}
          nodesConnectable={false}
          elementsSelectable={false}
          proOptions={{ hideAttribution: true }}
          onNodeMouseEnter={handleNodeMouseEnter}
          onNodeMouseLeave={handleNodeMouseLeave}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      <div style={{ display: 'flex', justifyContent: 'center', margin: '24px 0 16px 0' }}>
        <button
          onClick={handleRefresh}
          disabled={refreshing}
          style={{
            padding: '10px 24px',
            borderRadius: 6,
            border: '1px solid #4c9aff',
            background: refreshing ? '#e0e0e0' : '#f1f8ff',
            color: '#333',
            fontWeight: 600,
            fontSize: '1rem',
            cursor: refreshing ? 'not-allowed' : 'pointer',
            boxShadow: '0 2px 4px rgba(76,154,255,0.08)',
            transition: 'background 0.2s'
          }}
        >
          {refreshing ? 'Refreshing...' : 'Refresh Data'}
        </button>
      </div>
      <div className="results-table-wrapper">
        <table className="results-table">
          <thead>
            <tr>
              <th className="header-idea">RANDOMIZATION IDEA (SORTED BY MEAN PRIORITIZATION)</th>
              <th className="header-agreement">GROUP AGREEMENT</th>
            </tr>
          </thead>
          <tbody>
            {nodeData.map((node, index) => (
              <tr 
                key={node.id} 
                className={`result-row ${hoveredLabel === node.label ? 'active' : ''}`}
                onMouseEnter={() => handleRowMouseEnter(node.label)}
                onMouseLeave={handleRowMouseLeave}
              >
                <td className="idea-cell">{node.label}</td>
                <td className="agreement-cell">{formatAgreementScore(node.groupAgreement)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      
      <InstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onClose={handleCloseInstructionsModal}
      >
        <h3>Step 3: Review</h3>
        <p>
          Review how others have prioritized each randomization idea. Items on the table are sorted 
          highest priority and easiest to implement. The numerical score reflects the extent to which 
          all submitters agreed on each idea.
        </p>
      </InstructionsModal>
    </div>
  );
}

// Wrap with provider and Suspense
function ResultsPage() {
  return (
    <ReactFlowProvider>
      <ResultsFlow />
    </ReactFlowProvider>
  );
}

export default function PageContent() {
  return (
      <Suspense fallback={<div className="loading-indicator"><div className="spinner"></div><p>Loading...</p></div>}>
        <ResultsPage />
      </Suspense>
  );
}
