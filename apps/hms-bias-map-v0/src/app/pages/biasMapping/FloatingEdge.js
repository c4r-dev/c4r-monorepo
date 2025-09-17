import React from 'react';
import { getBezierPath, useInternalNode } from '@xyflow/react';
import { getEdgeParams } from './utils';
import EdgeLabel from './EdgeLabel';

/**
 * Custom edge component for ReactFlow.
 * Implements floating edges with custom styling,
 * labels, and interactive features for the
 * bias mapping diagram.
 */
function FloatingEdge({ id, source, target, markerEnd, style, label, labelStyle, data }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
  const { onEdgeUpdate, onEdgeDelete } = data || {};

  const handleLabelChange = (newLabel) => {
    if (onEdgeUpdate) {
      onEdgeUpdate(id, { label: newLabel });
    }
  };

  const handleEdgeDelete = () => {
    if (onEdgeDelete) {
      onEdgeDelete(id);
    }
  };

  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
    sourcePosition: sourcePos,
    targetPosition: targetPos,
    curvature: 0.5,
  });

  return (
    <>
      <path
        id={id}
        className="react-flow__edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{ ...style, strokeWidth: 2 }}
      />
      <EdgeLabel
        label={label}
        x={labelX}
        y={labelY}
        labelStyle={labelStyle}
        onLabelChange={handleLabelChange}
        onEdgeDelete={handleEdgeDelete}
      />
    </>
  );
}

export default FloatingEdge;