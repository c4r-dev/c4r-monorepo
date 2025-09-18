const logger = require('../../../../../../../../packages/logging/logger.js');
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { CircularProgress, Container } from '@mui/material';
import FixThatBiasFlow from '../../components/FixThatBiasFlow';
import SolutionCards from '../../components/SolutionCards';
import SessionConfigPopup from '../../components/SessionPopup/SessionConfigPopup';
import './FTB-1.css';

// Loading component
function LoadingFallback() {
  return (
    <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={40} />
    </Container>
  );
}

// Main content component that uses useSearchParams
function FixThatBiasContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [sessionId, setSessionId] = useState(null);
  const [showConfigPopup, setShowConfigPopup] = useState(true);
  const [currentCaseStudy, setCurrentCaseStudy] = useState(null);
  const [currentCaseStudyIndex, setCurrentCaseStudyIndex] = useState(0);
  const [totalCaseStudies, setTotalCaseStudies] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [phase, setPhase] = useState('problem'); // 'problem' or 'solution'
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
  const [disabledSolutions, setDisabledSolutions] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [incorrectSelectionId, setIncorrectSelectionId] = useState(null);

  // Check for sessionID in URL params
  useEffect(() => {
    const urlSessionID = searchParams.get('sessionID');
    if (urlSessionID) {
      setSessionId(urlSessionID);
      setShowConfigPopup(false);
      initializeSession(urlSessionID);
    } else {
      setShowConfigPopup(true);
      setLoading(false);
    }
  }, [searchParams]);

  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionId) {
      setShowConfigPopup(false);
    }
  };

  // Initialize session and load first case study
  const initializeSession = async (useSessionId = sessionId) => {
    if (!useSessionId) return;
    
    try {
      const response = await fetch('/api/fixThatBias');
      const data = await response.json();
      
      setTotalCaseStudies(data.totalCaseStudies);
      
      // Load first case study
      await loadCaseStudy(1);
      setLoading(false);
    } catch (error) {
      logger.app.error('Failed to initialize session:', error);
      setLoading(false);
    }
  };

  const loadCaseStudy = async (caseStudyId) => {
    try {
      const response = await fetch(`/api/fixThatBias?caseStudyId=${caseStudyId}`);
      const data = await response.json();
      setCurrentCaseStudy(data.caseStudy);
      
      // Reset state for new case study
      setSelectedNodeId(null);
      setPhase('problem');
      setFeedback('');
      setFeedbackType('');
      setDisabledSolutions([]);
      setSelectedSolution(null);
      setIncorrectSelectionId(null);
    } catch (error) {
      logger.app.error('Failed to load case study:', error);
    }
  };

  const handleNodeClick = (nodeId) => {
    if (phase !== 'problem') return;
    setSelectedNodeId(nodeId);
    setFeedback('');
    setIncorrectSelectionId(null); // Clear any previous incorrect selection highlighting
  };

  const handlePaneClick = () => {
    if (phase !== 'problem') return;
    setSelectedNodeId(null);
    setIncorrectSelectionId(null);
  };

  const handleConfirmSelection = async () => {
    if (!selectedNodeId || !sessionId) return;
    
    setConfirming(true);
    try {
      const response = await fetch('/api/fixThatBias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          caseStudyId: currentCaseStudy.id,
          action: 'selectProblem',
          data: { selectedStepId: selectedNodeId }
        })
      });

      const result = await response.json();
      
      setFeedback(result.feedback);
      setFeedbackType(result.isCorrect ? 'success' : 'error');
      
      if (result.canProceedToSolutions) {
        setPhase('solution');
        // Keep the selected node visible in solution phase
      } else {
        // Mark this selection as incorrect and clear the selection
        setIncorrectSelectionId(selectedNodeId);
        setSelectedNodeId(null);
      }
    } catch (error) {
      logger.app.error('Failed to submit selection:', error);
      setFeedback('An error occurred. Please try again.');
      setFeedbackType('error');
      setSelectedNodeId(null);
    }
    setConfirming(false);
  };

  const handleNoConcerns = async () => {
    if (!sessionId) return;

    setConfirming(true);
    try {
      const response = await fetch('/api/fixThatBias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          caseStudyId: currentCaseStudy.id,
          action: 'noConcerns',
          data: {}
        })
      });

      const result = await response.json();
      
      setFeedback(result.feedback);
      setFeedbackType(result.isCorrect ? 'success' : 'error');
      
      // Clear selection after "No Concerns" confirmation
      setSelectedNodeId(null);
    } catch (error) {
      logger.app.error('Failed to submit no concerns:', error);
      setFeedback('An error occurred. Please try again.');
      setFeedbackType('error');
    }
    setConfirming(false);
  };

  const handleSolutionSelect = async (solutionId) => {
    if (disabledSolutions.includes(solutionId) || !sessionId) return;
    
    setSelectedSolution(solutionId);
    setConfirming(true);
    
    try {
      const response = await fetch('/api/fixThatBias', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId,
          caseStudyId: currentCaseStudy.id,
          action: 'selectSolution',
          data: { selectedSolutionId: solutionId }
        })
      });

      const result = await response.json();
      
      setFeedback(result.feedback);
      setFeedbackType(result.isCorrect ? 'success' : 'error');
      
      if (!result.isCorrect) {
        setDisabledSolutions(prev => [...prev, solutionId]);
        setSelectedSolution(null);
      }
    } catch (error) {
      logger.app.error('Failed to submit solution:', error);
      setFeedback('An error occurred. Please try again.');
      setFeedbackType('error');
    }
    setConfirming(false);
  };

  const handleNextCaseStudy = () => {
    const nextIndex = currentCaseStudyIndex + 1;
    if (nextIndex < totalCaseStudies) {
      setCurrentCaseStudyIndex(nextIndex);
      loadCaseStudy(nextIndex + 1);
    } else {
      // Go to results page
      router.push(`/pages/FTB-results?sessionId=${sessionId}`);
    }
  };

  // Show loading while waiting for session configuration
  if (loading && sessionId) {
    return (
      <div className="ftb-container">
        <div className="loading-state">
          <div className="loading-spinner"></div>
          <p>Loading Fix That Bias activity...</p>
        </div>
      </div>
    );
  }

  // Show session configuration popup
  if (showConfigPopup || !sessionId) {
    return (
      <>
        <SessionConfigPopup 
          open={showConfigPopup}
          onClose={handleConfigClose}
          sessionID={sessionId}
        />
        <div className="ftb-container">
          <div className="loading-state">
            <p>Configuring your session...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentCaseStudy) {
    return (
      <div className="ftb-container">
        <div className="error-state">
          <p>Failed to load case study. Please refresh the page.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="ftb-container">
      <header className="ftb-header">
        <h1>Fix That Bias</h1>
        <div className="progress-indicator">
          Case Study {currentCaseStudyIndex + 1} of {totalCaseStudies}
        </div>
      </header>

      <div className="case-study-info">
        <h2>{currentCaseStudy.title}</h2>
        <div className="research-details">
          <p><strong>Research Question:</strong> {currentCaseStudy.researchQuestion}</p>
          <p><strong>Independent Variable:</strong> {currentCaseStudy.independentVariable}</p>
          <p><strong>Dependent Variable:</strong> {currentCaseStudy.dependentVariable}</p>
          <p><strong>Subject Population:</strong> {currentCaseStudy.subjectPopulation}</p>
        </div>
      </div>

      {phase === 'problem' && (
        <div className="problem-phase">
          <div className="instructions">
            <p>Review the research methods below and select the step where you think there might be a methodological concern or bias issue.</p>
          </div>
          
          <div className="flowchart-container">
            <FixThatBiasFlow
              caseStudy={currentCaseStudy}
              selectedNodeId={selectedNodeId}
              onNodeClick={handleNodeClick}
              incorrectSelectionId={incorrectSelectionId}
              onPaneClick={handlePaneClick}
            />
          </div>

          <div className="action-buttons">
            <button
              className={`confirm-btn ${selectedNodeId ? 'active' : ''}`}
              onClick={handleConfirmSelection}
              disabled={!selectedNodeId || confirming}
            >
              {confirming ? 'Confirming...' : 'Confirm Selection'}
            </button>
            
            <button
              className="no-concerns-btn"
              onClick={handleNoConcerns}
              disabled={confirming}
            >
              No Concerns
            </button>
          </div>
        </div>
      )}

      {phase === 'solution' && (
        <div className="solution-phase">
          <div className="instructions">
            <p>Great! Now select the best solution to address the identified methodological concern.</p>
          </div>
          
          <div className="flowchart-container">
            <FixThatBiasFlow
              caseStudy={currentCaseStudy}
              selectedNodeId={selectedNodeId}
              onNodeClick={() => {}} // No interaction in solution phase
              showFeedback={true}
              incorrectSelectionId={incorrectSelectionId}
            />
          </div>

          <SolutionCards
            solutionCards={currentCaseStudy.solutionCards}
            onSolutionSelect={handleSolutionSelect}
            disabledCards={disabledSolutions}
            selectedCard={selectedSolution}
          />
        </div>
      )}

      {feedback && (
        <div className={`feedback-container ${feedbackType}`}>
          <p>{feedback}</p>
          
          {feedbackType === 'success' && phase === 'solution' && selectedSolution && (
            <button
              className="next-btn"
              onClick={handleNextCaseStudy}
            >
              {currentCaseStudyIndex + 1 < totalCaseStudies ? 'Next Case Study' : 'View Results'}
            </button>
          )}
        </div>
      )}
    </div>
  );
}

// Main component export - wrapped in Suspense
export default function FixThatBiasPage() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <FixThatBiasContent />
    </Suspense>
  );
}
