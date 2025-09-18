const logger = require('../../../../../../packages/logging/logger.js');
'use client'

import { useState } from 'react'
import './HintGenerator.css'

export default function HintGenerator() {
  const [isLoading, setIsLoading] = useState(false)
  const [hints, setHints] = useState([])
  const [currentHintIndex, setCurrentHintIndex] = useState(0)
  const [model, setModel] = useState("gpt-3.5-turbo");
  const [userMessage, setUserMessage] = useState("");

  const generateHint = async () => {
    setIsLoading(true)

    try {
      const res = await fetch("/api/openAI", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ model, userMessage }),
      });

      const data = await res.json();
      logger.app.info("data", data);

      const parsedData = JSON.parse(data.content);
      setHints(prevHints => [...prevHints, parsedData.question1]);
      setCurrentHintIndex(hints.length);

    } catch (error) {
      logger.app.error("Error:", error);
      setHints(prevHints => [...prevHints, "An error occurred while fetching the hint."]);
      setCurrentHintIndex(hints.length);
    } finally {
      setIsLoading(false);
    }
  }

  const navigateHints = (direction) => {
    setCurrentHintIndex(prevIndex => {
      if (direction === 'next') {
        return (prevIndex + 1) % hints.length;
      } else {
        return (prevIndex - 1 + hints.length) % hints.length;
      }
    });
  }

  return (
    <div className="container">
      <div className="text-container">
        {isLoading ? (
          <div className="loading-text">LOADING...</div>
        ) : hints.length > 0 ? (
          <div className="hint-text">{hints[currentHintIndex]}</div>
        ) : null}
      </div>
      
      <button 
        className="button" 
        onClick={generateHint}
        disabled={isLoading}
      >
        {hints.length > 0 ? 'Generate new hint' : 'HINT'}
      </button>

      {hints.length > 1 && (
        <div className="navigation-buttons">
          <button className="navigation-button" onClick={() => navigateHints('prev')}>◀</button>
          <button className="navigation-button" onClick={() => navigateHints('next')}>▶</button>
        </div>
      )}

      {hints.length > 1 && (
        <div className="index-indicator">
          {currentHintIndex + 1}/{hints.length}
        </div>
      )}
    </div>
  )
}

