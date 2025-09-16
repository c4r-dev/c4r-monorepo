"use client";
import React, { useState } from 'react';
import { Handle, Position, useConnection, useReactFlow } from '@xyflow/react';
import DeleteConfirmationModal from './DeleteConfirmationModal';
import { useDnD } from './DnDContext';
import { useSearchParams } from 'next/navigation';

/**
 * Custom node component for the ReactFlow diagram.
 * Represents a single bias in the mapping interface.
 * Features:
 * - Draggable node with custom styling
 * - Delete button with confirmation modal
 * - Connection handles for creating relationships
 * - Selection highlighting
 */
export default function BiasNode({ id, data }) {
  const [showDeleteButton, setShowDeleteButton] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const { selectedBias, setSelectedBias } = useDnD();
  const connection = useConnection();
  const { deleteElements } = useReactFlow();
  const searchParams = useSearchParams();
  const individualMode = searchParams.get('individualMode') === 'true';
  const prePopulate = searchParams.get('prePopulate') === 'true';

  const handleDeleteClick = (event) => {
    event.stopPropagation();
    setIsDeleteModalOpen(true);
  };

  const handleConfirmDelete = () => {
    deleteElements({ nodes: [{ id }] });
    setIsDeleteModalOpen(false);
  };

  const handleClick = (event) => {
    event.stopPropagation();
    setSelectedBias(data.label === selectedBias ? null : data.label);
  };

  return (
    <>
      <div 
        className={`customNode ${selectedBias === data.label ? 'selected' : ''}`}
        onMouseEnter={() => !individualMode && !prePopulate && setShowDeleteButton(true)}
        onMouseLeave={() => !individualMode && !prePopulate && setShowDeleteButton(false)}
        onClick={handleClick}
      >
        <div className="customNodeBody" data-draghandle>
          {showDeleteButton && !individualMode && !prePopulate && (
            <button
              className="node-delete-button"
              onClick={handleDeleteClick}
              aria-label="Delete node"
            >
              ×
            </button>
          )}
          
          <div className="connectionArea">
            <Handle 
              className="customHandle"
              position={Position.Right}
              type="target"
              id="target"
              style={{ opacity: 0, width: '70%', height: '70%', border: 'none' }}
            />
            
            <Handle
              className="customHandle"
              position={Position.Left}
              type="source"
              id="source"
              style={{ opacity: 0, width: '70%', height: '70%', border: 'none' }}
            />
          </div>
          
          <div className="nodeLabelContainer">
            <div className="nodeMainLabel">
              {data.label}
            </div>
            <div className="nodeDescription">
              {data.description}
            </div>
          </div>
        </div>
      </div>

      <DeleteConfirmationModal
        isOpen={isDeleteModalOpen}
        onClose={() => setIsDeleteModalOpen(false)}
        onConfirm={handleConfirmDelete}
        biasName={data.label}
      />
    </>
  );
}