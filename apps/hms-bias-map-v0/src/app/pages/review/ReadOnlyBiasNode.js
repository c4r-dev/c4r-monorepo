"use client";

import React from 'react';
import { Handle, Position } from '@xyflow/react';

export default function ReadOnlyBiasNode({ id, data }) {
  return (
    <div className="review-node">
      <div className="review-node-body">
        <div className="review-node-connection-area">
          <Handle 
            className="review-node-handle"
            position={Position.Right}
            type="target"
            id="target"
            style={{ opacity: 0 }}
          />
          <Handle
            className="review-node-handle"
            position={Position.Left}
            type="source"
            id="source"
            style={{ opacity: 0 }}
          />
        </div>
        <div className="review-node-label">
          {data.label}
        </div>
      </div>
    </div>
  );
} 