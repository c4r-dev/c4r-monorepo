'use client';

import React from 'react';

const Sidebar = ({ availableNodes, loading, error, isSummarizing }) => {
  const onDragStart = (event, nodeType, label) => {
    const target = event.target;
    const rect = target.getBoundingClientRect();
    const offsetX = event.clientX - rect.left;
    const offsetY = event.clientY - rect.top;

    const nodeData = JSON.stringify({ type: nodeType, label, offsetX, offsetY });
    event.dataTransfer.setData('application/reactflow', nodeData);
    event.dataTransfer.effectAllowed = 'move';
  };

  // Display loading state
  if (loading) {
    return (
      <aside className="node-holder">
        <h3>{isSummarizing ? 'Summarizing Ideas...' : 'Loading Ideas...'}</h3>
        <div className="loading-indicator"></div>
        {isSummarizing && (
          <p className="summarizing-message">
            Please wait while we analyze and combine similar ideas...
          </p>
        )}
      </aside>
    );
  }

  // Display error state
  if (error) {
    return (
      <aside className="node-holder">
        <h3>Error Loading Ideas</h3>
        <p className="error-message">{error}</p>
        <p>Please refresh the page or try again later.</p>
      </aside>
    );
  }

  return (
    <aside className="node-holder">
      <h3>Randomization Ideas</h3>
      <div className="nodes-container">
        {availableNodes.map((node) => (
          <div
            key={node.id}
            className={`draggable-node ${node.fixed ? 'fixed-node' : 'user-node'} sidebar-node-${node.type || 'ai'}`}
            onDragStart={(event) => onDragStart(event, 'textNode', node.label)}
            draggable
          >
            {node.label}
          </div>
        ))}
      </div>
      {availableNodes.length === 0 && <p>All nodes have been placed on the canvas.</p>}
    </aside>
  );
};

export default Sidebar; 