import React, { useState } from 'react';
import './SolutionCards.css';

export default function SolutionCards({ 
  solutionCards, 
  onSolutionSelect, 
  onConfirmSolution,
  disabledCards = [], 
  selectedCard = null,
  pendingCard = null,
  confirming = false,
  justConfirmedWrong = false
}) {
  const [draggedCard, setDraggedCard] = useState(null);

  const handleCardClick = (cardId) => {
    if (disabledCards.includes(cardId) || selectedCard) return;
    onSolutionSelect(cardId);
  };

  const handleDragStart = (e, cardId) => {
    if (disabledCards.includes(cardId) || selectedCard) {
      e.preventDefault();
      return;
    }
    setDraggedCard(cardId);
    e.dataTransfer.setData('text/plain', cardId);
  };

  const handleDragEnd = () => {
    setDraggedCard(null);
  };

  const getCardStyle = (card) => {
    const isDisabled = disabledCards.includes(card.id);
    const isSelected = selectedCard === card.id;
    const isPending = pendingCard === card.id;
    const isDragging = draggedCard === card.id;
    
    let backgroundColor = '#ffffff';
    let borderColor = '#d1d5db';
    let opacity = 1;
    
    if (isDisabled) {
      backgroundColor = '#fef2f2';
      borderColor = '#ef4444';
      opacity = 0.6;
    } else if (isSelected) {
      backgroundColor = '#ecfdf5';
      borderColor = '#10b981';
    } else if (isPending) {
      backgroundColor = '#dbeafe';
      borderColor = '#3b82f6';
    } else if (isDragging) {
      backgroundColor = '#f3f4f6';
      borderColor = '#6b7280';
      opacity = 0.8;
    }

    return {
      border: `2px solid ${borderColor}`,
      backgroundColor,
      cursor: (isDisabled || (selectedCard && !isSelected)) ? 'not-allowed' : 'pointer',
      opacity,
      transition: 'all 0.3s ease',
      boxShadow: isDragging ? '0 8px 24px rgba(0, 0, 0, 0.15)' : '0 2px 8px rgba(0, 0, 0, 0.1)',
      transform: isDragging ? 'scale(1.02)' : 'scale(1)',
      // Remove size/layout inline styles to let CSS take control
    };
  };

  if (!solutionCards || solutionCards.length === 0) {
    return null;
  }

  return (
    <div className="solution-cards-container">
      <h3 className="solution-cards-title">
        Solution Options
      </h3>
      <p className="solution-cards-description">
        Great! Now select the best solution to address the identified methodological concern.
      </p>
      
      <div className="solution-cards-grid">
        {solutionCards.map((card) => (
          <div
            key={card.id}
            className="solution-card"
            style={getCardStyle(card)}
            onClick={() => handleCardClick(card.id)}
            draggable={!disabledCards.includes(card.id) && !selectedCard}
            onDragStart={(e) => handleDragStart(e, card.id)}
            onDragEnd={handleDragEnd}
          >
            <div 
              className="solution-card-text"
              style={{ 
                color: disabledCards.includes(card.id) ? '#6b7280' : '#374151',
                fontWeight: selectedCard === card.id || pendingCard === card.id ? '600' : '400'
              }}
            >
              {card.text}
            </div>
            
            {disabledCards.includes(card.id) && (
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
            
            {selectedCard === card.id && (
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
          </div>
        ))}
      </div>
      
      {pendingCard && !selectedCard && (
        <div className="confirm-button-container">
          <button
            className="confirm-solution-button"
            onClick={onConfirmSolution}
            disabled={confirming || justConfirmedWrong}
            style={{
              backgroundColor: (confirming || justConfirmedWrong) ? '#9ca3af' : '#3b82f6',
              cursor: (confirming || justConfirmedWrong) ? 'not-allowed' : 'pointer',
              opacity: confirming ? 0.7 : 1
            }}
          >
            {confirming ? 'Confirming...' : 'Confirm Solution'}
          </button>
        </div>
      )}
    </div>
  );
} 