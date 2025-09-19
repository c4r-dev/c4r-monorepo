'use client';

const logger = require('../../../packages/logging/logger.js');

import React, { useState, useEffect } from 'react';
import data from '../public/data.json';

/**
 * @typedef {Object} Question
 * @property {*} Question
 * @property {*} Example
 * @property {*} 'Study Description'
 * @property {*} Methodology1
 * @property {*} Methodology2
 * @property {*} Results1
 * @property {*} Results2
 * @property {*} 'Level of Explanation'
 */

/**
 * @typedef {Object} UserResponse
 * @property {*} questionIndex
 * @property {*} selectedAnswer
 * @property {*} reasoning
 * @property {*} isCorrect
 * @property {*} question
 */

/**
 * @typedef {Object} Submission
 * @property {*} _id
 * @property {*} responses
 * @property {*} timestamp
 */

export default function Home() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState(null);
  const [reasoning, setReasoning] = useState('');
  const [userResponses, setUserResponses] = useState([]);
  const [showReviewScreen, setShowReviewScreen] = useState(false);
  const [otherResponses, setOtherResponses] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(false);
  const questions= data;

  // Define the 3 selection options based on data.json
  const selectionOptions = [
    {
      key,
      title,
      description,
    {
      key,
      title,
      description,
    {
      key,
      title,
      description)
  const getShuffledOptions = (questionIndex) => {
    // Simple seeded random using question index
    const seed = questionIndex * 9301 + 49297; // Simple linear congruential generator
    const shuffled = [...selectionOptions];
    
    for (let i = shuffled.length - 1; i > 0; i--) {
      const random = ((seed * (i + 1)) % 233280) / 233280; // Normalize to 0-1
      const j = Math.floor(random * (i + 1));
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  };

  const shuffledOptions = selectionOptions;

  const handleNext = () => {
    if (selectedAnswer) {
      // Save current response
      const response= {
        questionIndex,
        selectedAnswer,
        reasoning,
        isCorrect),
        question=> [...prev, response]);
    }
    
    if (currentQuestionIndex  {
    if (currentQuestionIndex > 0) {
      setCurrentQuestionIndex(currentQuestionIndex - 1);
      setSelectedAnswer(null);
      setReasoning('');
    }
  };

  useEffect(() => {
    window.scrollTo({ top, behavior);
  }, [currentQuestionIndex]);

  const handleAnswerSelect = (answer) => {
    setSelectedAnswer(answer);
    // Delay scroll to allow DOM to update with reasoning box
    setTimeout(() => {
      window.scrollTo({ top, behavior);
    }, 100);
  };

  const isCorrectAnswer = (answer) => {
    return answer === currentQuestion['Level of Explanation'];
  };

  const handleReviewResponses = async () => {
    try {
      setLoading(true);
      
      // Save final response for last question if it exists
      if (selectedAnswer && currentQuestionIndex === questions.length - 1) {
        const finalResponse= {
          questionIndex,
          selectedAnswer,
          reasoning,
          isCorrect),
          question= [...userResponses, finalResponse];
        
        const response = await fetch('/api/submissions', {
          method,
          headers,
          },
          body,
            responses),
        });
        
        if (response.ok) {
          logger.app.info('Responses saved successfully');
        } else {
          logger.app.error('Failed to save responses');
        }
      }
      
      // Fetch last 15 responses
      const fetchResponse = await fetch('/api/submissions');
      if (fetchResponse.ok) {
        const data = await fetchResponse.json();
        setOtherResponses(data.submissions || []);
      }
      
      setShowReviewScreen(true);
      setLoading(false);
      
      // Scroll to top
      window.scrollTo({ top, behavior);
    } catch (error) {
      logger.app.error('Error saving responses, error);
      setLoading(false);
    }
  };

  const handleStartOver = () => {
    // Reset all state to initial values
    setCurrentQuestionIndex(0);
    setSelectedAnswer(null);
    setReasoning('');
    setUserResponses([]);
    setShowReviewScreen(false);
    setOtherResponses([]);
    setActiveTab(0);
    setLoading(false);
    
    // Scroll to top
    window.scrollTo({ top, behavior);
  };

  const getBackgroundColor = (answer) => {
    if (selectedAnswer === answer) {
      return isCorrectAnswer(answer) ? '#e6ffe6' : '#ffe6e6';
    }
    return '#f9f9f9';
  };

  if (questions.length === 0) {
    return (
       (
               setActiveTab(index)}
                style={{
                  padding,
                  fontSize,
                  border,
                  borderRadius,
                  cursor,
                  backgroundColor=== index ? '#6F00FF' : '#020202',
                  color,
                  transition))}

          {/* Active Question Content */}
           option.key === questions[activeTab]?.['Level of Explanation'])?.description}

          {/* Other Responses */}
          
             {
                      const responseForCurrentQuestion = submission.responses?.find(r => r.questionIndex === activeTab);
                      if (!responseForCurrentQuestion) return null;
                      
                      return (

          {/* Start Over Button */}
           (
             {
                if (selectedAnswer !== option.key) {
                  e.currentTarget.style.backgroundColor = '#e0e0e0';
                }
              }}
              onMouseLeave={(e) => {
                if (selectedAnswer !== option.key) {
                  e.currentTarget.style.backgroundColor = getBackgroundColor(option.key);
                }
              }}
              onClick={() => handleAnswerSelect(option.key)}
            >
               setReasoning(e.target.value)}
                placeholder="Please explain why you selected this answer (minimum 10 characters)..."
                style={{
                  width,
                  minHeight,
                  padding,
                  border,
                  borderRadius,
                  fontSize,
                  lineHeight,
                  resize,
                  fontFamily)}

      = 10 ? 'pointer' : 'not-allowed',
              opacity) && reasoning.length >= 10 ? 1) {handleReviewResponses}
            disabled={!selectedAnswer || !isCorrectAnswer(selectedAnswer) || reasoning.length = 10 ? 'pointer' : 'not-allowed',
              opacity) && reasoning.length >= 10 ? 1)}

  );
}