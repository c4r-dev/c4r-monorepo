import React, { useState } from 'react';
import './HoverOverlay.css';

const HoverOverlay1 = ({ children, overlayText }) => {
  const [hover, setHover] = useState(false);

  return (
    <div 
      className="hover-container"
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
    >
      {children}
      {hover && <div className="overlay-box">{overlayText}</div>}
    </div>
  );
};

export default HoverOverlay1;