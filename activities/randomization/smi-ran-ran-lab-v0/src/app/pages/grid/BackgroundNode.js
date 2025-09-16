'use client';

import React, { memo } from 'react';

const BackgroundNode = memo(() => {
  // Original SVG dimensions: 659x471
  // Doubled size:
  const svgWidth = 659 * 2;
  const svgHeight = 471 * 2;

  return (
    <div
      className="background-node"
      style={{
        width: svgWidth,
        height: svgHeight,
        // Ensure it doesn't interfere with interactions
        pointerEvents: 'none',
      }}
    >
      {/* Load SVG as an image */}
      <img
        src="/canvas-background.svg" // Assuming the svg is in the public folder
        alt="Canvas Background"
        width={svgWidth}
        height={svgHeight}
        draggable={false}
        style={{ display: 'block' }} // Prevents extra space below img
      />
    </div>
  );
});

BackgroundNode.displayName = 'BackgroundNode';

export default BackgroundNode; 