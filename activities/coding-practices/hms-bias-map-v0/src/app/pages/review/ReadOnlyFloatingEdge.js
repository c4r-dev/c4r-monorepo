import React from 'react';
import { getBezierPath, useInternalNode } from '@xyflow/react';
import { getEdgeParams } from '../biasMapping/utils';

export default function ReadOnlyFloatingEdge({ id, source, target, markerEnd, style, label }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty, sourcePos, targetPos } = getEdgeParams(sourceNode, targetNode);
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
        className="review-edge-path"
        d={edgePath}
        markerEnd={markerEnd}
        style={{ 
          ...style, 
          stroke: '#b1b1b7',
          strokeWidth: 2,
          strokeLinecap: 'round',
          shapeRendering: 'crispEdges',
          fill: 'none',
          vectorEffect: 'non-scaling-stroke'
        }}
      />
      {label && (
        <g transform={`translate(${labelX}, ${labelY})`}>
          <foreignObject
            x="-75"
            y="-25"
            width="150"
            height="50"
            className="review-edge-label"
          >
            <div className="review-edge-label-text">
              {label}
            </div>
          </foreignObject>
        </g>
      )}
    </>
  );
} 