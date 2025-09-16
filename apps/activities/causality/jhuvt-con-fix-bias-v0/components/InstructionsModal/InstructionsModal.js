'use client';

import React from 'react';
import './InstructionsModal.css';

const InstructionsModal = ({ isOpen, onClose, title, content }) => {
  if (!isOpen) return null;

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close modal">
          ×
        </button>
        <h2 className="modal-title">{title}</h2>
        <div className="modal-text">
          {content}
        </div>
      </div>
    </div>
  );
};

export default InstructionsModal;