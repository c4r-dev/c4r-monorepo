import React, { useState } from 'react';
import EdgeLabelModal from './EdgeLabelModal';

/**
 * Component for rendering and managing edge labels.
 * Provides interactive labels for connections between
 * bias nodes, with editing capabilities through
 * the EdgeLabelModal.
 */

function EdgeLabel({ label, x, y, labelStyle, onLabelChange, onEdgeDelete }) {
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleLabelClick = (event) => {
    event.stopPropagation();
    setIsModalOpen(true);
  };

  return (
    <>
      <g 
        transform={`translate(${x}, ${y})`} 
        className="edge-label-container"
        onClick={handleLabelClick}
      >
        <foreignObject
          x="-75" // Half of our max-width to center
          y="-25" // Adjust based on expected text height
          width="150" // Max width for the text
          height="50" // Adjust based on expected text height
          className="edge-label-foreign-object"
        >
          <div className="edge-label-text">
            {label || 'Click to edit'}
          </div>
        </foreignObject>
      </g>
      
      <EdgeLabelModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSave={onLabelChange}
        onDelete={onEdgeDelete}
        initialLabel={label}
      />
    </>
  );
}

export default EdgeLabel;
