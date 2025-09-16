"use client";

import React, { useState } from 'react';
import biasData from './biasData.json';
import { useDnD } from './DnDContext';
import { useSearchParams } from 'next/navigation';
import { Typography } from '@mui/material';

/**
 * Sidebar component displaying available bias nodes.
 * Provides:
 * - Draggable bias nodes
 * - Bias descriptions on selection
 * - Shuffle functionality for random bias selection
 * - Dynamic filtering of available biases
 */
export default function BiasNodeSidebar() {
  const { availableBiases, shuffleBiases } = useDnD();
  const [selectedBias, setSelectedBias] = useState(null);
  const searchParams = useSearchParams();
  const individualMode = searchParams.get('individualMode') === 'true';
  const prePopulate = searchParams.get('prePopulate') === 'true';

  // If in individual or pre-populate mode, show empty state
  if (individualMode || prePopulate) {
    return (
      <div className="bias-sidebar">
        <div className="bias-sidebar-content">
          <Typography variant="h6" gutterBottom>
            {/* Biases are pre-populated on the canvas */}
          </Typography>
        </div>
      </div>
    );
  }

  const onDragStart = (event, bias) => {
    // Get the position where the user clicked within the node
    const nodeRect = event.target.getBoundingClientRect();
    const offsetX = event.clientX - nodeRect.left;
    const offsetY = event.clientY - nodeRect.top;

    // Store both the bias type and the offset in the dataTransfer
    event.dataTransfer.setData('application/bias', bias.BiasName);
    event.dataTransfer.setData('application/offsetX', offsetX.toString());
    event.dataTransfer.setData('application/offsetY', offsetY.toString());
    event.dataTransfer.effectAllowed = 'move';
    
    setSelectedBias(bias.BiasName);
  };

  const handleBiasClick = (biasName) => {
    setSelectedBias(biasName === selectedBias ? null : biasName);
  };

  const handleShuffleClick = () => {
    shuffleBiases(availableBiases.length);
  };

  // Filter the full biasData based on what's still available
  const availableBiasData = biasData.filter(bias => 
    availableBiases.includes(bias.BiasName)
  );

  return (
    <aside className="bias-sidebar">
      <div className="description">
        <div>Drag these biases to map their relationships</div>
        {!individualMode && !prePopulate && (
          <button 
            className="shuffle-button"
            onClick={handleShuffleClick}
            title="Get new random biases"
          >
            🔄 Shuffle Biases
          </button>
        )}
      </div>
      <div className="draggable-nodes-grid">
        {availableBiasData.map((bias) => (
          <div
            key={bias.BiasName}
            className={`dndnode bias ${selectedBias === bias.BiasName ? 'selected' : ''}`}
            draggable
            onDragStart={(e) => onDragStart(e, bias)}
            onClick={() => handleBiasClick(bias.BiasName)}
          >
            <div className="bias-name">{bias.BiasName}</div>
            <div className="bias-description">{bias.BiasDescription}</div>
          </div>
        ))}
      </div>
    </aside>
  );
}