import React, { memo } from 'react';

const BackgroundNode = memo(({ data }) => {
  // SVG dimensions from the file are 659x471
  const svgWidth = 659;
  const svgHeight = 471;

  return (
    <div 
      className="background-node"
      style={{
        width: svgWidth,
        height: svgHeight,
      }}
    >
      {/* Load SVG as an image to ensure proper rendering */}
      <img 
        src="/canvas-background.svg" 
        alt="Canvas Background" 
        width={svgWidth} 
        height={svgHeight}
        draggable={false}
      />
    </div>
  );
});

// Add display name for React DevTools
BackgroundNode.displayName = 'BackgroundNode';

export default BackgroundNode; 