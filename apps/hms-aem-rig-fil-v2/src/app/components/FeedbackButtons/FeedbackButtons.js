import React, { useState, forwardRef, useImperativeHandle } from 'react';
import { Player } from '@lottiefiles/react-lottie-player';

import C4R_UI_Button_Positive from '@/app/assets/C4R_UI_Button_Positive.json';
import C4R_UI_Button_Neutral from '@/app/assets/C4R_UI_Button_Neutral.json';
import C4R_UI_Button_Negative from '@/app/assets/C4R_UI_Button_Negative.json';
import C4R_UI_Button_NotSure from '@/app/assets/C4R_UI_Button_Not-sure.json';
import './FeedbackButtons.css';

const FeedbackButtons = forwardRef(({ onSelectionChange, disabled, onDisabledButtonClick }, ref) => {
  const [selected, setSelected] = useState(null);

  const buttons = [
    { id: 'positive', label: 'Positive', animation: C4R_UI_Button_Positive },
    { id: 'neutral', label: 'Neutral', animation: C4R_UI_Button_Neutral },
    { id: 'negative', label: 'Negative', animation: C4R_UI_Button_Negative },
    { id: 'uncertain', label: 'Uncertain', animation: C4R_UI_Button_NotSure },
  ];

  const handleButtonClick = (id, label) => {
    if (disabled) {
      if (onDisabledButtonClick) onDisabledButtonClick();
      return;
    }
    setSelected(id);
    if (onSelectionChange) {
      onSelectionChange(label);
    }
  };

  // Expose the reset function to the parent component
  useImperativeHandle(ref, () => ({
    reset: () => setSelected(null),
  }));

  return (
    <div className='feedback-buttons'>
      {buttons.map(button => (
        <div
          key={button.id}
          className={`button ${button.id} ${disabled ? 'disabled' : ''} ${selected === button.id ? 'selected' : selected ? 'not-selected' : 'none-selected'}`}
          onClick={() => handleButtonClick(button.id, button.label)}
          style={{ cursor: disabled ? 'not-allowed' : 'pointer' }}
        >
          <div className="label">{button.label}</div>
          <Player
            src={button.animation}
            className="player"
            loop
            autoplay
            speed={1.0}
          />
        </div>
      ))}
    </div>
  );
});

FeedbackButtons.displayName = 'FeedbackButtons';

export default FeedbackButtons;