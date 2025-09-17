"use client";

import React, { useEffect } from 'react';
import {
  ReactFlow,
  ReactFlowProvider,
  Background,
  MarkerType,
  useReactFlow
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';
import './review.css';

import ReadOnlyBiasNode from './ReadOnlyBiasNode';
import ReadOnlyFloatingEdge from './ReadOnlyFloatingEdge';

const nodeTypes = {
  biasNode: ReadOnlyBiasNode,
};

const edgeTypes = {
  floating: ReadOnlyFloatingEdge,
};

const defaultEdgeOptions = {
  type: 'floating',
  markerEnd: {
    type: MarkerType.Arrow,
    width: 0,
    height: 0,
  },
};

function ReadOnlyBiasFlow({ nodes, edges }) {
  const { fitView } = useReactFlow();

  useEffect(() => {
    // Fit view after initial render
    fitView({ padding: 0.2, duration: 0 });
  }, [fitView, nodes, edges]);

  return (
    <div className="review-flow-wrapper">
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        defaultEdgeOptions={defaultEdgeOptions}
        proOptions={{ hideAttribution: true }}
        nodesDraggable={false}
        nodesConnectable={false}
        elementsSelectable={false}
        panOnScroll={false}
        zoomOnScroll={false}
        zoomOnPinch={false}
        zoomOnDoubleClick={false}
        panOnDrag={false}
        fitView
      >
        <Background />
      </ReactFlow>
    </div>
  );
}

export default function ReadOnlyBiasMapping({ flowState }) {
  const { nodes, edges } = flowState || { nodes: [], edges: [] };

  return (
    <ReactFlowProvider>
      <ReadOnlyBiasFlow nodes={nodes} edges={edges} />
    </ReactFlowProvider>
  );
}
