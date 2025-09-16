import React from 'react';
import './ResearchMethodsSteps.css';

export default function ResearchMethodsSteps({ 
  caseStudy, 
  selectedNodeId, 
  onNodeClick, 
  showFeedback = false,
  incorrectSelectionId = null,
  onPaneClick 
}) {
  
  const getButtonStyle = (step) => {
    const isSelected = selectedNodeId === step.id;
    const isIncorrectSelection = incorrectSelectionId === step.id;
    const isCorrectWithFeedback = step.isCorrect && showFeedback;
    
    let backgroundColor = '#ffffff';
    let borderColor = '#6b7280';
    let boxShadow = '0 2px 4px rgba(0, 0, 0, 0.1)';
    let textColor = '#374151';
    
    // Apply correct step styling first (green background)
    if (isCorrectWithFeedback) {
      backgroundColor = '#ecfdf5';
      borderColor = '#10b981';
      boxShadow = '0 2px 8px rgba(16, 185, 129, 0.2)';
      textColor = '#374151';
    }
    
    // Apply selected step styling (blue border, keeping background if correct)
    if (isSelected) {
      borderColor = '#3b82f6';
      boxShadow = '0 4px 12px rgba(59, 130, 246, 0.3)';
      // Only change background to blue if it's not a correct step
      if (!isCorrectWithFeedback) {
        backgroundColor = '#dbeafe';
      }
    }
    
    // Apply incorrect selection styling (overrides others)
    if (isIncorrectSelection) {
      backgroundColor = '#fef2f2';
      borderColor = '#ef4444';
      boxShadow = '0 2px 8px rgba(239, 68, 68, 0.2)';
      textColor = '#991b1b';
    }
    
    return {
      padding: '16px',
      border: `2px solid ${borderColor}`,
      borderRadius: '8px',
      backgroundColor,
      boxShadow,
      maxWidth: '400px',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
      fontSize: '14px',
      lineHeight: '1.4',
      color: textColor,
      fontWeight: isSelected ? '600' : '400',
      marginBottom: '12px',
      width: '100%',
      textAlign: 'left',
      display: 'block'
    };
  };

  const handleButtonClick = (stepId) => {
    if (onNodeClick) {
      onNodeClick(stepId);
    }
  };

  const handleContainerClick = (e) => {
    // Only trigger onPaneClick if clicking on the container itself, not on buttons
    if (e.target === e.currentTarget && onPaneClick) {
      onPaneClick();
    }
  };

  if (!caseStudy) {
    return (
      <div style={{ 
        width: '100%', 
        minHeight: '400px', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        backgroundColor: '#f9fafb',
        border: '2px dashed #d1d5db',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#6b7280', fontSize: '16px' }}>Loading case study...</p>
      </div>
    );
  }

  return (
    <div 
      className="research-methods-container"
      onClick={handleContainerClick}
    >
      <div className="research-methods-content">
        <h3 className="research-methods-title">
          Research Methods Steps
        </h3>
        
        {caseStudy.methodsSteps.map((step, index) => (
          <button
            key={step.id}
            className="method-step-button"
            onClick={() => handleButtonClick(step.id)}
            style={{...getButtonStyle(step), position: 'relative'}}
          >
            <div className="step-label" style={{ marginBottom: '4px', fontWeight: '600', fontSize: '12px', color: '#6b7280' }}>
              Step {index + 1}
            </div>
            {step.text}
            
            {incorrectSelectionId === step.id && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                backgroundColor: '#ef4444',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ✕
              </div>
            )}
            
            {step.isCorrect && showFeedback && (
              <div style={{
                position: 'absolute',
                top: '8px',
                right: '8px',
                width: '20px',
                height: '20px',
                backgroundColor: '#10b981',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#ffffff',
                fontSize: '12px',
                fontWeight: 'bold'
              }}>
                ✓
              </div>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}