const logger = require('../../../../../packages/logging/logger.js');
'use client';

import React, { useState, useEffect, useRef } from 'react';
import ResearchMethodsSteps from '../components/ResearchMethodsSteps';
import SolutionCards from '../components/SolutionCards';
import Header from '../components/Header/Header';
import InstructionsModal from '../components/InstructionsModal/InstructionsModal';
import './styles/FTB-1.css';

export default function FixThatBiasPage() {
  const [currentCaseStudy, setCurrentCaseStudy] = useState(null);
  const [currentCaseStudyIndex, setCurrentCaseStudyIndex] = useState(0);
  const [totalCaseStudies, setTotalCaseStudies] = useState(0);
  const [selectedNodeId, setSelectedNodeId] = useState(null);
  const [phase, setPhase] = useState('problem'); // 'problem' or 'solution'
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState(''); // 'success' or 'error'
  const [feedbackSource, setFeedbackSource] = useState(''); // 'research' or 'solution'
  const [researchFeedback, setResearchFeedback] = useState(''); // Persistent research feedback
  const [researchFeedbackType, setResearchFeedbackType] = useState('');
  const [disabledSolutions, setDisabledSolutions] = useState([]);
  const [selectedSolution, setSelectedSolution] = useState(null);
  const [pendingSolution, setPendingSolution] = useState(null);
  const [justConfirmedWrong, setJustConfirmedWrong] = useState(false);
  const [loading, setLoading] = useState(true);
  const [confirming, setConfirming] = useState(false);
  const [incorrectSelectionId, setIncorrectSelectionId] = useState(null);
  const [ftbData, setFtbData] = useState(null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);
  // Scroll to top button is always visible
  const containerRef = useRef(null);
  const headerRef = useRef(null);
  const caseStudyInfoRef = useRef(null);

  // Initialize session and load first case study
  useEffect(() => {
    // Prevent scroll restoration
    if ('scrollRestoration' in history) {
      history.scrollRestoration = 'manual';
    }
    
    // Immediately scroll to top
    document.documentElement.scrollTop = 0;
    document.body.scrollTop = 0;
    window.scrollTo(0, 0);
    
    initializeSession();
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Simple scroll to top on case study change
  useEffect(() => {
    if (currentCaseStudy) {
      window.scrollTo(0, 0);
      logger.app.info(`Case study ${currentCaseStudyIndex + 1} loaded, scroll to top`);
    }
  }, [currentCaseStudy]);

  // Button is always visible - no scroll listener needed

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: 'smooth'
    });
  };

  const initializeSession = async () => {
    try {
      // Fetch the FTB data directly from public folder
      const response = await fetch('/FTB-Data.json');
      const data = await response.json();
      setFtbData(data);
      
      setTotalCaseStudies(data.metadata.totalCaseStudies);
      
      // Load first case study
      setCurrentCaseStudyIndex(0);
      loadCaseStudy(1, data);
      setLoading(false);
      
      // Remove initial scroll to test
      // setTimeout(() => {
      //   logger.app.info('Initial load scroll position:', window.scrollY);
      // }, 200);
    } catch (error) {
      logger.app.error('Failed to initialize session:', error);
      setLoading(false);
    }
  };

  const loadCaseStudy = (caseStudyId, data = ftbData) => {
    if (!data) return;
    
    try {
      const caseStudy = data.caseStudies.find(cs => cs.id === caseStudyId);
      if (caseStudy) {
        setCurrentCaseStudy(caseStudy);
      }
      
      // Reset state for new case study
      setSelectedNodeId(null);
      setPhase('problem');
      setFeedback('');
      setFeedbackType('');
      setFeedbackSource('');
      setResearchFeedback('');
      setResearchFeedbackType('');
      setDisabledSolutions([]);
      setSelectedSolution(null);
      setPendingSolution(null);
      setJustConfirmedWrong(false);
      setIncorrectSelectionId(null);
    } catch (error) {
      logger.app.error('Failed to load case study:', error);
    }
  };

  const handleNodeClick = (nodeId) => {
    if (phase !== 'problem') return;
    setSelectedNodeId(nodeId);
    setFeedback('');
    setFeedbackSource('');
    setIncorrectSelectionId(null); // Clear any previous incorrect selection highlighting
  };

  const handlePaneClick = () => {
    if (phase !== 'problem') return;
    setSelectedNodeId(null);
    setIncorrectSelectionId(null);
  };

  const handleConfirmSelection = () => {
    if (!selectedNodeId || !currentCaseStudy) return;
    
    setConfirming(true);
    
    try {
      const selectedStep = currentCaseStudy.methodsSteps.find(step => step.id === selectedNodeId);
      
      if (!selectedStep) {
        setFeedback('Invalid step selected.');
        setFeedbackType('error');
        setSelectedNodeId(null);
        setConfirming(false);
        return;
      }

      const isCorrect = selectedStep.isCorrect;
      
      setFeedback(isCorrect ? currentCaseStudy.correctText : currentCaseStudy.incorrectText);
      setFeedbackType(isCorrect ? 'success' : 'error');
      setFeedbackSource('research');
      
      // Store research feedback persistently for solution phase
      if (isCorrect) {
        setResearchFeedback(currentCaseStudy.correctText);
        setResearchFeedbackType('success');
      }
      
      if (isCorrect) {
        setPhase('solution');
        // Keep the selected node visible in solution phase
      } else {
        // Mark this selection as incorrect and clear the selection
        setIncorrectSelectionId(selectedNodeId);
        setSelectedNodeId(null);
      }
    } catch (error) {
      logger.app.error('Failed to process selection:', error);
      setFeedback('An error occurred. Please try again.');
      setFeedbackType('error');
      setSelectedNodeId(null);
    }
    setConfirming(false);
  };

  const handleNoConcerns = () => {
    setConfirming(true);
    
    setFeedback('This study does have methodological concerns. Please try selecting a specific step.');
    setFeedbackType('error');
    
    // Clear selection after "No Concerns" confirmation
    setSelectedNodeId(null);
    setConfirming(false);
  };

  const handleSolutionSelect = (solutionId) => {
    if (disabledSolutions.includes(solutionId) || !currentCaseStudy) return;
    setPendingSolution(solutionId);
    setJustConfirmedWrong(false);
    
    // Only clear solution feedback, keep research feedback
    if (feedbackSource === 'solution') {
      setFeedback('');
      setFeedbackSource('');
      setFeedbackType('');
    }
  };

  const handleConfirmSolution = () => {
    if (!pendingSolution || !currentCaseStudy) return;
    
    setConfirming(true);
    
    try {
      const selectedSolution = currentCaseStudy.solutionCards.find(sol => sol.id === pendingSolution);
      
      if (!selectedSolution) {
        setFeedback('Invalid solution selected.');
        setFeedbackType('error');
        setConfirming(false);
        return;
      }

      const isCorrect = selectedSolution.isCorrect;
      
      setFeedback(selectedSolution.feedback);
      setFeedbackType(isCorrect ? 'success' : 'error');
      setFeedbackSource('solution');
      
      if (isCorrect) {
        setSelectedSolution(pendingSolution);
        setPendingSolution(null);
        setJustConfirmedWrong(false);
      } else {
        setDisabledSolutions(prev => [...prev, pendingSolution]);
        setJustConfirmedWrong(true);
        // Keep pendingSolution so button remains visible for wrong answers
      }
    } catch (error) {
      logger.app.error('Failed to process solution:', error);
      setFeedback('An error occurred. Please try again.');
      setFeedbackType('error');
    }
    setConfirming(false);
  };

  const handleNextCaseStudy = () => {
    const nextIndex = currentCaseStudyIndex + 1;
    if (nextIndex < totalCaseStudies) {
      // Disable scroll restoration before navigation
      if ('scrollRestoration' in history) {
        history.scrollRestoration = 'manual';
      }
      
      // Immediate scroll to top before loading next case study
      window.scrollTo(0, 0);
      document.documentElement.scrollTop = 0;
      document.body.scrollTop = 0;
      
      // Load next case study without URL navigation
      setCurrentCaseStudyIndex(nextIndex);
      loadCaseStudy(nextIndex + 1);
      
      // Remove navigation scroll to test
      logger.app.info('Navigation from case study', currentCaseStudyIndex, 'to', nextIndex);
    } else {
      // Show completion message or restart
      alert('Congratulations! You have completed all case studies. The application will restart.');
      handleRestartApplication();
    }
  };

  const handleRestartApplication = () => {
    // Reset all state and create new session
    window.location.reload();
  };

  const handleHelpClick = () => {
    setIsInstructionsModalOpen(true);
  };

  const handleCloseInstructionsModal = () => {
    setIsInstructionsModalOpen(false);
  };

  if (loading) {
    return (
      <>
        <Header 
          title="Fix That Bias" 
          onLogoClick={handleRestartApplication}
          onHelpClick={handleHelpClick}
        />
        <div className="ftb-container">
          <div className="loading-state">
            <div className="loading-spinner"></div>
            <p>Loading Fix That Bias activity...</p>
          </div>
        </div>
      </>
    );
  }

  if (!currentCaseStudy) {
    return (
      <>
        <Header 
          title="Fix That Bias" 
          onLogoClick={handleRestartApplication}
          onHelpClick={handleHelpClick}
        />
        <div className="ftb-container">
          <div className="error-state">
            <p>Failed to load case study. Please refresh the page.</p>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Header 
        title="Fix That Bias" 
        onLogoClick={handleRestartApplication}
        onHelpClick={handleHelpClick}
        ref={headerRef}
      />
      <div className="ftb-container" ref={containerRef} key={`case-study-${currentCaseStudyIndex}-${currentCaseStudy?.id || 'loading'}`}>
        <div className="case-study-info" ref={caseStudyInfoRef}>
          <div className="progress-indicator">
            Case Study {currentCaseStudyIndex + 1} of {totalCaseStudies}
          </div>
          <h2>{currentCaseStudy.title}</h2>
          <div className="research-details">
            <p><strong>Research Question:</strong> {currentCaseStudy.researchQuestion}</p>
            <p><strong>Independent Variable:</strong> {currentCaseStudy.independentVariable}</p>
            <p><strong>Dependent Variable:</strong> {currentCaseStudy.dependentVariable}</p>
            <p><strong>Subject Population:</strong> {currentCaseStudy.subjectPopulation}</p>
          </div>
        </div>

        <div className="instructions">
          <p>Review the research methods below and select the step where you think there might be a methodological concern or bias issue.</p>
        </div>

      {phase === 'problem' && (
        <div className="problem-phase">
          
          <div className="flowchart-container">
            <ResearchMethodsSteps
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
          
          <div className="flowchart-container">
            <ResearchMethodsSteps
              caseStudy={currentCaseStudy}
              selectedNodeId={selectedNodeId}
              onNodeClick={() => {}} // No interaction in solution phase
              showFeedback={true}
              incorrectSelectionId={incorrectSelectionId}
            />
          </div>

          {researchFeedback && researchFeedbackType === 'success' && (
            <div className={`feedback-container ${researchFeedbackType}`}>
              <p>{researchFeedback}</p>
            </div>
          )}

          <SolutionCards
            solutionCards={currentCaseStudy.solutionCards}
            onSolutionSelect={handleSolutionSelect}
            onConfirmSolution={handleConfirmSolution}
            disabledCards={disabledSolutions}
            selectedCard={selectedSolution}
            pendingCard={pendingSolution}
            confirming={confirming}
            justConfirmedWrong={justConfirmedWrong}
          />

          {feedback && feedbackSource === 'solution' && (
            <div className={`feedback-container ${feedbackType}`}>
              <p>{feedback}</p>
            </div>
          )}
        </div>
      )}

      {feedback && phase === 'problem' && (
        <div className={`feedback-container ${feedbackType}`}>
          <p>{feedback}</p>
        </div>
      )}
      
      {feedbackType === 'success' && phase === 'solution' && selectedSolution && (
        <div className="feedback-container success">
          <button
            className="next-btn"
            onClick={handleNextCaseStudy}
          >
            {currentCaseStudyIndex + 1 < totalCaseStudies ? 'Next Case Study' : 'Complete Activity'}
          </button>
        </div>
      )}
      </div>

      {/* Scroll to Top Button */}
      {/* <button
        onClick={scrollToTop}
        className="scroll-to-top-button"
        aria-label="Scroll to top"
      >
        ↑
      </button>  */}

      <InstructionsModal
        isOpen={isInstructionsModalOpen}
        onClose={handleCloseInstructionsModal}
        title="Instructions"
        content={
          <ol>
            <li>Read each case study summary to understand the research method.</li>
            <li>Review the research methods in detail, then select the step where you think a bias issue could arise.</li>
            <li>Once you select the step where bias could arise, propose a solution that could address that bias.</li>
          </ol>
        }
      />
    </>
  );
}