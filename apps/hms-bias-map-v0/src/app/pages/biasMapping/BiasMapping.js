const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import React, { useRef, useCallback, useState, useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  useReactFlow,
  Background,
  getNodesBounds,
  getViewportForBounds,
  MarkerType,
  fitView,
} from '@xyflow/react';
import { toPng } from 'html-to-image';
import '@xyflow/react/dist/style.css';
import { useRouter, useSearchParams } from 'next/navigation';
import { jsPDF } from 'jspdf';

import CustomButton from '@/app/components/CustomButton/CustomButton';

import BiasNodeSidebar from './BiasNodeSidebar';
import { DnDProvider, useDnD } from './DnDContext';
import BiasNode from './BiasNode';
import FloatingEdge from './FloatingEdge';
import CustomConnectionLine from './CustomConnectionLine';
import { getEdgeParams } from './utils'; // Ensure utils are imported
import biasData from './biasData.json';
import { PRE_POPULATED_BIASES } from './constants';

/**
 * Main component for the Bias Mapping interface.
 * Manages the interactive flow diagram where users can:
 * - Drag and drop bias nodes
 * - Create connections between nodes
 * - Edit connection labels
 * - Export the diagram as PNG/PDF
 * - Submit mappings to the database
 * 
 * Uses ReactFlow for the interactive diagram functionality
 * and integrates with the DnD context for bias management.
 */

// Initial nodes can remain empty
const initialNodes = [
  // Example node structure
  // {
  //   id: 'bias-1',
  //   type: 'biasNode',
  //   data: { label: 'Confirmation Bias' },
  //   position: { x: 250, y: 5 },
  // },
];

let nodeId = 1;
const getId = () => `bias-${++nodeId}`;

// Add nodeTypes configuration
const nodeTypes = {
  biasNode: BiasNode,
};

// Add edgeTypes configuration
const edgeTypes = {
  floating: FloatingEdge,
  custom: CustomConnectionLine,
};

// Add default edge options
const defaultEdgeOptions = {
  type: 'floating',
  markerEnd: {
    type: MarkerType.Arrow,
    width: 0,
    height: 0,
  },
};

const connectionLineStyle = {
  stroke: '#b1b1b7',
};

function BiasFlow() {
  const reactFlowWrapper = useRef(null);
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const { screenToFlowPosition, getNodes, getViewport, fitView, getNodesBounds } = useReactFlow();
  const { availableBiases, setAvailableBiases } = useDnD();
  const [isDragging, setIsDragging] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Add state for session parameters
  const [sessionID, setSessionID] = useState(null);
  const [biasNumber, setBiasNumber] = useState(0);
  const [individualMode, setIndividualMode] = useState(false);
  const [showConfigPopup, setShowConfigPopup] = useState(false);

  // Move URL parameter logic into useEffect
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search);
    const session = searchParams.get('sessionID');
    const biasNum = parseInt(searchParams.get('biasNumber') || '0');
    const individual = searchParams.get('individualMode') === 'true';

    // Only update state if the values have changed
    if (session !== sessionID) setSessionID(session);
    if (biasNum !== biasNumber) setBiasNumber(biasNum);
    if (individual !== individualMode) setIndividualMode(individual);

    // If we're in individual mode, set the fixed values
    if (individual) {
      setSessionID('group1');
      setBiasNumber(5);
    }
  }, [sessionID, biasNumber, individualMode]);

  // Update the initial node placement useEffect
  useEffect(() => {
    const individualMode = searchParams.get('individualMode') === 'true';
    const prePopulate = searchParams.get('prePopulate') === 'true';
    
    if (individualMode || prePopulate) {
      // Get the pre-populated biases from biasData
      const initialNodes = biasData
        .filter(bias => PRE_POPULATED_BIASES.includes(bias.BiasName))
        .map((bias, index) => {
          // Calculate positions for circular formation
          const radius = 200; // Radius of the circle
          const centerX = 400; // X coordinate of circle center
          const centerY = 300; // Y coordinate of circle center
          const angle = (2 * Math.PI * index) / PRE_POPULATED_BIASES.length; // Equal angle spacing
          
          return {
            id: `bias-${index + 1}`,
            type: 'biasNode',
            position: { 
              x: centerX + radius * Math.cos(angle),
              y: centerY + radius * Math.sin(angle)
            },
            data: {
              label: bias.BiasName,
              description: bias.BiasDescription
            }
          };
        });

      setNodes(initialNodes);
      setAvailableBiases([]);

      // Use setTimeout to ensure nodes are rendered before fitting view
      setTimeout(() => {
        fitView({ padding: 0.2, duration: 0 });
      }, 50);
    } else if (!searchParams.get('sessionID')) {
      // Clear nodes and edges if no sessionID is present
      setNodes([]);
      setEdges([]);
      setAvailableBiases([]);
    }
  }, [searchParams, setNodes, setAvailableBiases, fitView]);

  const handleSubmit = async () => {
    // Check if there are any nodes
    if (nodes.length === 0) {
      alert('Please add at least one bias before submitting.');
      return;
    }

    // Check if sessionID is null and try to get it from URL
    let currentSessionID = sessionID;
    if (!currentSessionID) {
      const searchParams = new URLSearchParams(window.location.search);
      currentSessionID = searchParams.get('sessionID');
    }

    if (!currentSessionID) {
      alert('Session ID is missing. Please refresh the page and try again.');
      return;
    }

    // Generate a random submission instance number
    const submissionInstance = Math.floor(Math.random() * 1000000);
    
    // Get the current flow state
    const flowState = {
      nodes,
      edges,
    };

    try {
      const response = await fetch('/api/biasMappingApi', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          flow: JSON.stringify(flowState),
          sessionID: currentSessionID,
          biasNumber,
          submissionInstance,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to submit bias mapping');
      }

      // Redirect to review page after successful submission
      router.push(`/pages/review?sessionID=${currentSessionID}`);
      
    } catch (error) {
      logger.app.error('Error submitting bias mapping:', error);
      alert('Failed to submit bias mapping. Please try again.');
    }
  };

  // Define callbacks before using them
  const onEdgeUpdate = useCallback((edgeId, newData) => {
    setEdges((eds) =>
      eds.map((edge) => {
        if (edge.id === edgeId) {
          return { ...edge, ...newData };
        }
        return edge;
      })
    );
  }, []);

  const onEdgeDelete = useCallback((edgeId) => {
    setEdges((eds) => eds.filter((edge) => edge.id !== edgeId));
  }, []);

  // Now we can use onEdgeUpdate and onEdgeDelete in onConnect
  const onConnect = useCallback(
    (params) => {
      const hasReverseConnection = edges.some(
        (edge) =>
          edge.source === params.target && edge.target === params.source
      );

      if (!hasReverseConnection) {
        setEdges((eds) =>
          addEdge(
            {
              ...params,
              type: 'floating',
              label: 'Click to edit',
              data: { onEdgeUpdate, onEdgeDelete },
              markerEnd: {
                type: MarkerType.Arrow,
                width: 0,
                height: 0,
              },
            },
            eds
          )
        );
      }
    },
    [edges, onEdgeUpdate, onEdgeDelete]
  );

  const onDragOver = useCallback((event) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
    setIsDragging(true);
  }, []);

  const onDrop = useCallback(
    (event) => {
      event.preventDefault();
      setIsDragging(false);

      const type = event.dataTransfer.getData('application/bias');
      const offsetX = parseFloat(event.dataTransfer.getData('application/offsetX'));
      const offsetY = parseFloat(event.dataTransfer.getData('application/offsetY'));
      
      // Use a different variable name to avoid shadowing
      const foundBias = biasData.find(b => b.BiasName === type);
      
      const position = screenToFlowPosition({
        x: event.clientX - offsetX,
        y: event.clientY - offsetY,
      });

      const newNode = {
        id: getId(),
        type: 'biasNode',
        position,
        data: {
          label: type,
          description: foundBias?.BiasDescription || ''
        },
      };

      setAvailableBiases(prev => prev.filter(bias => bias !== type));
      setNodes((nds) => nds.concat(newNode));
    },
    [screenToFlowPosition, setAvailableBiases, setNodes]
  );

  const onDragLeave = useCallback((event) => {
    event.preventDefault();
    setIsDragging(false);
  }, []);

  // Handle node deletion
  const handleNodesChange = useCallback((changes) => {
    // Check for node removal
    changes.forEach((change) => {
      if (change.type === 'remove') {
        const removedNode = nodes.find(node => node.id === change.id);
        if (removedNode) {
          // Add the bias back to available biases
          setAvailableBiases(prev => [...prev, removedNode.data.label]);
        }
      }
    });
    
    onNodesChange(changes);
  }, [nodes, setAvailableBiases, onNodesChange]);

  const captureViewport = () => {
    return new Promise((resolve) => {
      // First fit the view to ensure all nodes are visible and centered
      fitView({
        padding: 0.2,
        duration: 0
      });

      setTimeout(() => {
        // Get the flow element
        const flowElement = document.querySelector('.react-flow__viewport');
        if (!flowElement) {
          resolve(null);
          return;
        }

        // Get the actual dimensions of the ReactFlow container
        const reactFlowBounds = document.querySelector('.reactflow-wrapper').getBoundingClientRect();

        toPng(flowElement, {
          backgroundColor: '#ffffff',
          width: reactFlowBounds.width,
          height: reactFlowBounds.height,
          style: {
            width: `${reactFlowBounds.width}px`,
            height: `${reactFlowBounds.height}px`,
            transform: flowElement.style.transform
          },
          quality: 1,
          pixelRatio: 2
        }).then(dataUrl => resolve({ dataUrl, dimensions: reactFlowBounds }));
      }, 50);
    });
  };

  const handleExportPDF = async () => {
    const result = await captureViewport();
    if (!result) return;

    const { dataUrl, dimensions } = result;
    
    // Create PDF
    const pdf = new jsPDF({
      orientation: 'landscape',
      unit: 'px',
      format: [dimensions.width, dimensions.height]
    });

    // Add the image to the PDF
    pdf.addImage(
      dataUrl,
      'PNG',
      0,
      0,
      dimensions.width,
      dimensions.height
    );

    // Save the PDF
    pdf.save('bias-mapping.pdf');
  };

  const handleExportPNG = async () => {
    const result = await captureViewport();
    if (!result) return;

    const { dataUrl } = result;
    
    const a = document.createElement('a');
    a.setAttribute('download', 'bias-mapping.png');
    a.setAttribute('href', dataUrl);
    a.click();
  };

  return (
    <div className="dndflow">
      <div 
        className={`reactflow-wrapper ${isDragging ? 'dragging' : ''}`} 
        ref={reactFlowWrapper}
      >
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={handleNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          onDrop={onDrop}
          onDragOver={onDragOver}
          onDragLeave={onDragLeave}
          nodeTypes={nodeTypes}
          edgeTypes={edgeTypes}
          defaultEdgeOptions={{
            ...defaultEdgeOptions,
          }}
          connectionLineComponent={CustomConnectionLine}
          connectionLineStyle={connectionLineStyle}
          // fitView
          proOptions={{ hideAttribution: true }}
        >
          <Controls
            position="top-left"
            showInteractive={false}

          />
          <Background />
        </ReactFlow>
      </div>
      <div className="bias-bottom-panel">
        <BiasNodeSidebar />
      </div>
      <div className="bias-footer-row">
        <CustomButton onClick={handleExportPNG}>
          Export as PNG
        </CustomButton>
        <CustomButton onClick={handleExportPDF}>
          Export as PDF
        </CustomButton>
        <CustomButton onClick={handleSubmit}>Submit</CustomButton>
      </div>
    </div>
  );
}

export default function BiasMapping() {
  return (
    <ReactFlowProvider>
      <DnDProvider>
        <BiasFlow />
      </DnDProvider>
    </ReactFlowProvider>
  );
}