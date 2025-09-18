const logger = require('../../../../../../../packages/logging/logger.js');
'use client';

import React, { useState, useCallback, useRef, useEffect, Suspense } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  useNodesState,
  useEdgesState,
  addEdge,
  Controls,
  Background,
  useReactFlow,
  applyNodeChanges,
} from '@xyflow/react';
import { useSearchParams, useRouter } from 'next/navigation';

import '@xyflow/react/dist/style.css';
import './grid.css';

import TextNode from './TextNode';
import BackgroundNode from './BackgroundNode';
import Sidebar from './Sidebar';
import Header from '../../components/Header/Header';
import InstructionsModal from '../../components/InstructionsModal/InstructionsModal';

// --- Initial Setup ---

// Define the hardcoded randomization nodes
const HARDCODED_NODES = [
  { id: 'fixed-1', label: 'Housing location randomization', fixed: true },
  { id: 'fixed-2', label: 'Treatment administration order', fixed: true },
  { id: 'fixed-3', label: 'Behavioral testing order', fixed: true },
  { id: 'fixed-4', label: 'Euthanasia/tissue collection order', fixed: true },
  { id: 'fixed-5', label: 'Sample processing randomization', fixed: true },
];

// Background SVG dimensions (doubled from original)
const svgWidth = 659 * 2;
const svgHeight = 471 * 2;

// Define boundaries based on the background node size and centered position
const bounds = {
  minX: -svgWidth / 2,
  maxX: svgWidth / 2,
  minY: -svgHeight / 2,
  maxY: svgHeight / 2,
};

// Estimated TextNode dimensions for initial drop clamping (derived from CSS)
const estimatedNodeWidth = 120;
const estimatedNodeHeight = 50;

// Initial nodes on the canvas (starts with the background node)
const initialNodes = [
  {
    id: 'background-0',
    type: 'backgroundNode',
    position: { x: bounds.minX, y: bounds.minY }, // Position background by top-left
    data: {},
    draggable: false,
    selectable: false,
    zIndex: -1, // Render below other nodes
  },
];

const initialEdges = [];

// Register custom node components
const nodeTypes = {
  textNode: TextNode,
  backgroundNode: BackgroundNode,
};

// Utility for generating unique node IDs
let id = 0;
const getId = () => `node_${id++}`;

// The 5 hardcoded randomization ideas (same as flowchart page)
const HARDCODED_IDEAS = [
  'Housing location randomization',
  'Treatment administration order',
  'Behavioral testing order',
  'Euthanasia/tissue collection order',
  'Sample processing randomization',
];

// Deterministically pick 2 ideas from 5 using sessionID as a seed
function pickTwoFromFive(sessionID, ideas) {
  let hash = 0;
  for (let i = 0; i < sessionID.length; i++) {
    hash = ((hash << 5) - hash) + sessionID.charCodeAt(i);
    hash |= 0;
  }
  const idx1 = Math.abs(hash) % ideas.length;
  const idx2 = (Math.abs(hash * 31) % (ideas.length - 1));
  const secondIdx = idx2 >= idx1 ? idx2 + 1 : idx2;
  return [ideas[idx1], ideas[secondIdx]];
}

// --- Helper Function ---

// Clamps a node's position within the defined bounds
const clampPosition = (position, nodeWidth, nodeHeight) => {
  const clampedX = Math.max(
    bounds.minX,
    // Adjust max position by node width to keep the node within bounds
    Math.min(position.x, bounds.maxX - (nodeWidth ?? estimatedNodeWidth))
  );
  const clampedY = Math.max(
    bounds.minY,
    // Adjust max position by node height
    Math.min(position.y, bounds.maxY - (nodeHeight ?? estimatedNodeHeight))
  );
  return { x: clampedX, y: clampedY };
};

// --- Main Component ---

function FlowCanvas() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
  const [availableSidebarNodes, setAvailableSidebarNodes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitStatus, setSubmitStatus] = useState(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  const searchParams = useSearchParams();
  const router = useRouter();
  const sessionID = searchParams.get('sessionID');
  const { screenToFlowPosition } = useReactFlow();

  // Function to fetch summarized ideas
  const fetchSummarizedIdeas = useCallback(async () => {
    try {
      const response = await fetch(`/api/getSummarizedIdeas?sessionID=${sessionID}`);
      if (!response.ok) {
        throw new Error(`Error ${response.status}: ${response.statusText}`);
      }
      const data = await response.json();
      if (data.status === 'in_progress') {
        setIsSummarizing(true);
        setTimeout(fetchSummarizedIdeas, 2000);
        return;
      }
      if (data.status === 'complete' && data.ideas) {
        // AI summary nodes
        let userGeneratedNodes = data.ideas.map((idea, index) => ({
          id: `user-${index + 1}`,
          label: idea,
          fixed: false,
          type: 'ai',
        }));
        // Inspiration ideas (deterministic)
        const inspirationIdeas = sessionID ? pickTwoFromFive(sessionID, HARDCODED_IDEAS) : [];
        // Add inspiration ideas if not already present
        inspirationIdeas.forEach((idea) => {
          if (!userGeneratedNodes.some(node => node.label === idea)) {
            userGeneratedNodes.push({
              id: `insp-${idea.replace(/\s+/g, '-')}`,
              label: idea,
              fixed: false,
              type: 'inspiration',
            });
          }
        });
        // If total < 7, add more from hardcoded list (excluding any already present)
        if (userGeneratedNodes.length < 7) {
          const alreadyUsed = new Set(userGeneratedNodes.map(n => n.label));
          for (const idea of HARDCODED_IDEAS) {
            if (!alreadyUsed.has(idea)) {
              userGeneratedNodes.push({
                id: `extra-${idea.replace(/\s+/g, '-')}`,
                label: idea,
                fixed: false,
                type: 'extra',
              });
              if (userGeneratedNodes.length >= 7) break;
            }
          }
        }
        setAvailableSidebarNodes(userGeneratedNodes);
        setIsSummarizing(false);
        setLoading(false);
      }
    } catch (err) {
      setError(`Failed to load ideas: ${err.message}`);
      setLoading(false);
    }
  }, [sessionID]);

  // Fetch summarized ideas when component mounts
  useEffect(() => {
    if (sessionID) {
      fetchSummarizedIdeas();
    } else {
      setError('No session ID found in URL');
      setLoading(false);
    }
  }, [sessionID, fetchSummarizedIdeas]);

  // Custom handler for node changes to implement clamping and logging
  const onNodesChange = useCallback(
    (changes) => {
      // Calculate the state React Flow *would* have after applying changes
      const nextNodes = applyNodeChanges(changes, nodes);
      let logged = false; // Flag to prevent multiple logs per drag operation

      // Process changes before applying them to state
      const updatedChanges = changes.map((change) => {
        // Intercept position changes (drag, select)
        if (change.type === 'position') {
          const node = nodes.find((n) => n.id === change.id);
          // Apply clamping only to draggable text nodes
          if (node?.type === 'textNode') {
            // Use measured dimensions if available, otherwise estimate
            const nodeWidth = node.width;
            const nodeHeight = node.height;

            // Calculate the clamped position
            const clampedPos = clampPosition(change.position, nodeWidth, nodeHeight);
            // Modify the change object with the clamped position
            change.position = clampedPos;

            // Log the final position only when dragging stops for this node
            if (change.dragging === false && !logged) {
              const finalNode = nextNodes.find(n => n.id === change.id);
              if (finalNode) {
                 logger.app.info(`Node ${finalNode.id} finished moving to:`, finalNode.position);
                 logged = true;
              }
            }
          }
        }
        return change;
      });

      // Apply the potentially modified changes to the actual state
      setNodes((nds) => applyNodeChanges(updatedChanges, nds));
    },
    [nodes, setNodes] // Dependencies: current nodes state and setter
  );

  // Standard handler for edge connections (no custom logic needed here yet)
  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [setEdges],
  );

  // Handler for dragging over the canvas (allows dropping)
  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  // Handler for dropping a node from the sidebar onto the canvas
  const onDrop = useCallback(
    (event) => {
      event.preventDefault();

      const reactFlowBounds = reactFlowWrapper.current.getBoundingClientRect();
      // Extract node type and label from dragged data
      const dataString = event.dataTransfer.getData('application/reactflow');

      if (!dataString) {
        return; // Exit if dropped item is not a valid node
      }

      const { type, label, offsetX, offsetY } = JSON.parse(dataString);

      // Convert screen coordinates to flow coordinates
      const position = screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      // Adjust position based on where the node was grabbed
      const adjustedPosition = {
        x: position.x - offsetX,
        y: position.y - offsetY,
      };

      // Clamp the initial drop position within bounds
      const clampedInitialPosition = clampPosition(adjustedPosition, estimatedNodeWidth, estimatedNodeHeight);

      // Create the new node object
      const newNode = {
        id: getId(),
        type,
        position: clampedInitialPosition,
        data: { label: `${label}` },
      };

      // Add the new node to the canvas state and log its position
      setNodes((nds) => nds.concat(newNode));
      logger.app.info(`Node ${newNode.id} dropped at:`, newNode.position);
      setIsDraggingOver(false); // Reset drag over state on successful drop

      // Remove the dropped node from the available sidebar nodes state
      setAvailableSidebarNodes((prevNodes) =>
        prevNodes.filter((node) => node.label !== label)
      );
    },
    [screenToFlowPosition, setNodes, setAvailableSidebarNodes, setIsDraggingOver] // Added setIsDraggingOver dependency
  );

  // Handler for when a draggable item enters the canvas area
  const handleDragEnter = useCallback((event) => {
    event.preventDefault();
    // Check if the dragged item is one of our nodes
    if (event.dataTransfer.types.includes('application/reactflow')) {
      setIsDraggingOver(true);
    }
  }, [setIsDraggingOver]);

  // Handler for when a draggable item leaves the canvas area
  const handleDragLeave = useCallback((event) => {
    event.preventDefault();
    // Check if the related target (where the mouse moved to) is outside the wrapper
    // This prevents flickering when moving over child elements inside the wrapper
    if (!event.currentTarget.contains(event.relatedTarget)) {
       setIsDraggingOver(false);
    }
  }, [setIsDraggingOver]);

  // Handler for submitting the flowchart data
  const handleSubmit = useCallback(async () => {
    setIsSubmitting(true);
    setSubmitStatus(null); // Clear previous status

    // Get session ID from URL
    const sessionID = searchParams.get('sessionID');
    
    if (!sessionID) {
      setSubmitStatus({ type: 'error', message: 'No session ID found. Cannot submit.' });
      setIsSubmitting(false);
      return;
    }

    // Get the list of hardcoded node labels we want to submit
    const hardcodedLabels = HARDCODED_NODES.map(node => node.label);

    // Filter for only nodes with labels that match our hardcoded list
    const nodesToSave = nodes
      .filter(node => node.type === 'textNode' && hardcodedLabels.includes(node.data.label))
      .map(node => ({
        label: node.data.label,
        position: node.position,
      }));

    // Check if all required nodes are on the canvas
    const placedLabels = nodesToSave.map(node => node.label);
    const missingLabels = hardcodedLabels.filter(label => !placedLabels.includes(label));

    if (missingLabels.length > 0) {
      setSubmitStatus({ 
        type: 'error', 
        message: `Please place all required nodes on the canvas. Missing: ${missingLabels.join(', ')}` 
      });
      setIsSubmitting(false);
      return;
    }

    // Prepare payload
    const payload = {
      nodes: nodesToSave,
      submissionID: 'placeholder-submission-id', // Hardcoded placeholder
      sessionID: sessionID,
    };

    try {
      const response = await fetch('/api/saveFlow', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.message || 'Failed to save flowchart');
      }

      logger.app.info("Submission successful:", result);
      setSubmitStatus({ type: 'success', message: 'Flowchart saved successfully!' });
      
      // After successful submission, redirect to the results page with the same sessionID
      setTimeout(() => {
        router.push(`/pages/results?sessionID=${sessionID}`);
      }, 1000); // Short delay to show success message before redirecting

    } catch (error) {
      logger.app.error("Submission failed:", error);
      setSubmitStatus({ type: 'error', message: error.message || 'An error occurred during submission.' });
    } finally {
      setIsSubmitting(false);
    }
  }, [nodes, searchParams, router]); // Add router to dependencies

  // Handler for opening instructions modal
  const handleHelpClick = useCallback(() => {
    setIsInstructionsModalOpen(true);
  }, []);

  // Handler for closing instructions modal
  const handleCloseInstructionsModal = useCallback(() => {
    setIsInstructionsModalOpen(false);
  }, []);

  return (
    <div className="page-container">
      <Header onHelpClick={handleHelpClick} />
      <div className="instructions">
        <h2>Instructions</h2>
        <p>Drag words from the bank to decide how you would prioritize the ideas. Something that&apos;s hard to randomize is something that could require time, skills, equipment, or funding beyond the original scope of the project. Something that&apos;s high impact would be a very large source of bias if left unaddressed.</p>
      </div>
      <div
        className={`reactflow-wrapper ${isDraggingOver ? 'dragging-over' : ''}`}
        ref={reactFlowWrapper}
        onDragEnter={handleDragEnter} // Add drag enter handler
        onDragLeave={handleDragLeave} // Add drag leave handler
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange} // Use custom handler
          onEdgesChange={onEdgesChange} // Use standard handler
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          nodeTypes={nodeTypes} // Register custom nodes
          fitView // Initial view fits all nodes
          fitViewOptions={{ padding: 0.2 }} // Padding for fitView
          className="touchdevice-flow"
          // Optional: Restrict viewport panning/zooming
          translateExtent={[[bounds.minX, bounds.minY], [bounds.maxX + 200, bounds.maxY + 200]]}
          // minZoom={1}
          // maxZoom={2}
          proOptions={{ hideAttribution: true }}
        >
          <Controls />
          <Background variant="dots" gap={12} size={1} />
        </ReactFlow>
      </div>
      {/* Sidebar displaying draggable nodes */}
      <Sidebar 
        availableNodes={availableSidebarNodes} 
        loading={loading || isSummarizing} 
        error={error}
        isSummarizing={isSummarizing}
      />
      {/* Footer for submission */}
      <footer className="submit-footer">
         {submitStatus && (
            <p className={`submit-status ${submitStatus.type}`}>
              {submitStatus.message}
            </p>
          )}
        <button 
          onClick={handleSubmit} 
          disabled={isSubmitting} 
          className="submit-button"
        >
          {isSubmitting ? 'Submitting...' : 'Submit'}
        </button>
      </footer>
      
      <InstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onClose={handleCloseInstructionsModal}
      >
        <h3>Step 2: Prioritization</h3>
        <p>
          Drag words from the bank to decide how you would prioritize the randomization ideas. 
          Something that&apos;s hard to randomize is something that could require time, skills, equipment, 
          or funding beyond the original scope of the project. Something that&apos;s high impact would be 
          a very large source of bias if left unaddressed.
        </p>
      </InstructionsModal>
    </div>
  );
}

// --- Provider Wrapper ---

// Wrap the main canvas component with ReactFlowProvider for context access
function GridPage() {
  return (
    <ReactFlowProvider>
      <FlowCanvas />
    </ReactFlowProvider>
  );
}

export default function PageContent() {
  return (
      <Suspense fallback={<div className="loading-indicator"><div className="spinner"></div><p>Loading...</p></div>}>
        <GridPage />
      </Suspense>
  );
}
