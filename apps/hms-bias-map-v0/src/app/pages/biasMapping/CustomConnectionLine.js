import React from 'react';
import { getBezierPath } from '@xyflow/react';

/**
 * Custom connection line component for ReactFlow.
 * Renders a bezier curve while users are dragging
 * to create new connections between nodes.
 * Features enhanced styling and smooth curves.
 */

function CustomConnectionLine({ fromX, fromY, toX, toY, connectionLineStyle }) {
  const [edgePath] = getBezierPath({
    sourceX: fromX,
    sourceY: fromY,
    targetX: toX,
    targetY: toY,
    curvature: 0.5, // Ensures smoothness
  });

  return (
    <g>
      <path
        style={{ ...connectionLineStyle, strokeWidth: 2 }} /* Increase stroke width */
        fill="none"
        d={edgePath}
      />
    </g>
  );
}

export default CustomConnectionLine;