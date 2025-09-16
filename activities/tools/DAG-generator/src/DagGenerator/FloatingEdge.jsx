import { getStraightPath, useInternalNode, EdgeLabelRenderer } from '@xyflow/react';

import { getEdgeParams } from './utils.js';

function FloatingEdge({ id, source, target, markerEnd, style, label }) {
  const sourceNode = useInternalNode(source);
  const targetNode = useInternalNode(target);

  if (!sourceNode || !targetNode) {
    return null;
  }

  const { sx, sy, tx, ty } = getEdgeParams(sourceNode, targetNode);

  const [edgePath, labelX, labelY] = getStraightPath({
    sourceX: sx,
    sourceY: sy,
    targetX: tx,
    targetY: ty,
  });

  let edgeModifierX = 0;
  let edgeModifierY = 0;

  if (id === "A-B") {
    edgeModifierX = 0;
    edgeModifierY = -15;
  }
  else if (id === "B-C") {
    edgeModifierX = -20;
    edgeModifierY = -10;
  }
  else if (id === "C-A") {
    edgeModifierX = 25;
    edgeModifierY = -10;
  }



return (
    <>
            <path
            id={id}
            className="react-flow__edge-path"
            d={edgePath}
            markerEnd={markerEnd}
            style={style}
            />  
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX + edgeModifierX}px,${labelY + edgeModifierY}px)`,
            fontSize: 18,
            // everything inside EdgeLabelRenderer has no pointer events by default
            // if you have an interactive element, set pointer-events: all
            pointerEvents: 'all',
          }}
          className="nodrag nopan"
        >
            <p>{label?.text}</p>
        </div>
      </EdgeLabelRenderer>
    </>
  );
}

export default FloatingEdge;
