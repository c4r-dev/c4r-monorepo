'use client';

import React, { useState, useEffect, Suspense, useRef, useCallback } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import './flowchart.css';
import Header from '../../components/Header/Header';
import InstructionsModal from '../../components/InstructionsModal/InstructionsModal';
import SessionConfigPopup from '../../components/SessionPopup/SessionConfigPopup';
import { set } from 'mongoose';

// Helper function to format seconds into MM:SS
const formatTime = (totalSeconds) => {
  if (totalSeconds < 0) totalSeconds = 0;
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = Math.floor(totalSeconds % 60);
  return `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
};

// The 5 hardcoded ideas (same as grid page)
const HARDCODED_IDEAS = [
  'Housing location randomization',
  'Treatment administration order',
  'Behavioral testing order',
  'Euthanasia/tissue collection order',
  'Sample processing randomization',
];

// Deterministically pick 2 ideas from 5 using sessionID as a seed
function pickTwoFromFive(sessionID, ideas) {
  // Simple hash function to get a number from sessionID
  let hash = 0;
  for (let i = 0; i < sessionID.length; i++) {
    hash = ((hash << 5) - hash) + sessionID.charCodeAt(i);
    hash |= 0; // Convert to 32bit integer
  }
  // Pick first index
  const idx1 = Math.abs(hash) % ideas.length;
  // Pick second index, offset by hash
  const idx2 = (Math.abs(hash * 31) % (ideas.length - 1));
  const secondIdx = idx2 >= idx1 ? idx2 + 1 : idx2;
  return [ideas[idx1], ideas[secondIdx]];
}

function FlowchartPage() {
  const [userIdeas, setUserIdeas] = useState([]);
  const [inputValue, setInputValue] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const router = useRouter();
  const searchParams = useSearchParams();
  const sessionId = searchParams.get('sessionID');
  const [showConfigPopup, setShowConfigPopup] = useState(true);
  const inputRef = useRef(null);
  const pollIntervalRef = useRef(null);
  const countdownIntervalRef = useRef(null);

  // Timer State
  const [timerInfo, setTimerInfo] = useState({ isActive: false, startTime: null, durationSeconds: 90 });
  const [displayTime, setDisplayTime] = useState('--:--');
  const [timeExpired, setTimeExpired] = useState(false);
  const [isTimerConfirmedStarted, setIsTimerConfirmedStarted] = useState(false);
  const [sessionID, setSessionId] = useState(sessionId || null);
  const [isInstructionsModalOpen, setIsInstructionsModalOpen] = useState(false);

  const inspirationIdeas = sessionID ? pickTwoFromFive(sessionID, HARDCODED_IDEAS) : [];

  // Check if sessionID exists and hide popup if it does
  useEffect(() => {
    if (sessionId) {
      setShowConfigPopup(false);
    }
  }, [sessionId]);

  // Only generate sessionID automatically if one doesn't exist after popup is closed
  // This allows the popup to show first when there's no sessionID
  useEffect(() => {
    if (!sessionID && !showConfigPopup) {
      const newSessionID = Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
      const url = new URL(window.location.href);
      url.searchParams.set('sessionID', newSessionID);
      setSessionId(newSessionID); // Set sessionID state
      window.location.href = url.toString(); // Full page reload to get sessionID in URL
    }
  }, [sessionID, showConfigPopup]); // Depend on both sessionID and showConfigPopup

 
  // --- Timer Polling and Calculation --- 

  // Function to fetch timer status
  const fetchTimerStatus = useCallback(async () => {
    if (!sessionID) return;
    try {
      const response = await fetch(`/api/getSessionTimerStatus?sessionID=${sessionID}`);
      if (!response.ok) {
        if (response.status !== 404) {
            console.error(`HTTP error! status: ${response.status}`); // Log non-404 errors
        }
        // Ensure timer is reset if status fetch fails or returns 404
        setTimerInfo({ isActive: false, startTime: null, durationSeconds: 90 });
        setIsTimerConfirmedStarted(false); // Reset confirmation on error/not found
      } else {
        const data = await response.json();
        setTimerInfo(data);
        // If we get a start time from the server, confirm the timer has started
        if (data.startTime) {
            setIsTimerConfirmedStarted(true); // <-- Set confirmation
        }
      }
    } catch (error) {
      console.error('Error fetching timer status:', error);
      // Don't set errorMessage here to avoid spamming user for background errors
    }
  }, [sessionID]);

  // Function to start/restart polling interval
  const startPolling = useCallback(() => {
    // Prevent starting if no sessionID or polling already active
    if (!sessionID || pollIntervalRef.current) return; 

    console.log("[Polling] Starting polling...");
    fetchTimerStatus(); // Fetch immediately

    const pollFrequency = isTimerConfirmedStarted ? 30000 : 5000;
    pollIntervalRef.current = setInterval(fetchTimerStatus, pollFrequency);

  }, [sessionID, fetchTimerStatus, isTimerConfirmedStarted]);

  // Function to stop polling interval
  const stopPolling = useCallback(() => {
    if (pollIntervalRef.current) {
      console.log("[Polling] Stopping polling...");
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  // Effect for managing polling interval lifecycle based on dependencies
  useEffect(() => {
    // Start polling only if sessionID exists
    if (sessionID) {
       // Clear any previous interval before starting a new one with potentially updated frequency
       stopPolling(); 
       startPolling(); 
    }
    
    // Cleanup function to stop polling on unmount or when sessionID/isTimerConfirmed changes
    return stopPolling;
  }, [sessionID, isTimerConfirmedStarted, startPolling, stopPolling]);

  // Effect for Page Visibility API Integration
  useEffect(() => {
    const handleVisibilityChange = () => {
      if (!sessionID) return; // Exit if no sessionID is set yet
      
      if (document.hidden) {
        console.log("[Visibility] Tab hidden, pausing polling.");
        stopPolling();
      } else {
        console.log("[Visibility] Tab visible, resuming polling.");
        // Restart polling. startPolling checks if it's already running.
        startPolling(); 
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);
    console.log("[Visibility] Listener added.");

    // Cleanup listener on component unmount
    return () => {
      console.log("[Visibility] Removing listener.");
      document.removeEventListener("visibilitychange", handleVisibilityChange);
      // Ensure polling stops if component unmounts while tab is hidden
      stopPolling(); 
    };
    // Only depends on sessionID (to ensure it exists) and the stable polling functions
  }, [sessionID, startPolling, stopPolling]); 

  // Effect for calculating and displaying countdown
  useEffect(() => {
    // Clear previous countdown interval
    if (countdownIntervalRef.current) {
      clearInterval(countdownIntervalRef.current);
    }

    if (timerInfo.startTime) {
      const calculateAndDisplay = () => {
        const startTimeMs = new Date(timerInfo.startTime).getTime();
        const durationMs = (timerInfo.durationSeconds || 90) * 1000;
        const elapsedMs = Date.now() - startTimeMs;
        const remainingSeconds = (durationMs - elapsedMs) / 1000;

        if (remainingSeconds > 0) {
          setDisplayTime(formatTime(remainingSeconds));
          setTimeExpired(false);
        } else {
          setDisplayTime(formatTime(0)); // Show 00:00 when expired
          setTimeExpired(true);
          if (countdownIntervalRef.current) {
             clearInterval(countdownIntervalRef.current); // Stop interval once expired
          }
        }
      };

      calculateAndDisplay(); // Run immediately
      countdownIntervalRef.current = setInterval(calculateAndDisplay, 1000); // Update every second
    
    } else {
      // Timer hasn't started
      setDisplayTime('--:--');
      setTimeExpired(false);
    }

    // Cleanup interval on component unmount or timerInfo change
    return () => {
      if (countdownIntervalRef.current) {
        clearInterval(countdownIntervalRef.current);
      }
    };
  }, [timerInfo]);

  // --- End Timer Logic --- 

  const handleInputChange = (event) => {
    setInputValue(event.target.value);
  };

  const handleAddIdea = () => {
    if (inputValue.trim() !== '' && !timeExpired) {
      setUserIdeas([...userIdeas, inputValue.trim()]);
      setInputValue('');
      inputRef.current?.focus();
    }
  };

  const handleKeyDown = (event) => {
    if (event.key === 'Enter') {
      handleAddIdea();
    }
  };

  const handleRemoveIdea = (indexToRemove) => {
    setUserIdeas(userIdeas.filter((_, index) => index !== indexToRemove));
  };

  // Renamed from handleContinue - Now only saves ideas
  const handleSaveIdeas = async () => {
    if (!sessionID) {
      setErrorMessage('Session ID not found. Please refresh the page.');
      return;
    }
    if (timeExpired) {
        setErrorMessage('Cannot submit ideas, the time has expired.');
        return;
    }
    if (userIdeas.length === 0) {
        setErrorMessage('Please enter at least one idea before submitting.');
        return;
    }
    setIsSaving(true);
    setErrorMessage('');
    try {
      const response = await fetch('/api/saveRandomizationIdeas', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ideas: userIdeas,
          sessionID: sessionID
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw new Error(result.message || 'Failed to submit randomization ideas');
      }
      if (result.timerStarted) {
          setIsTimerConfirmedStarted(true);
          fetchTimerStatus();
      }
    } catch (error) {
      setErrorMessage(`Failed to submit: ${error.message}`);
      setIsTimerConfirmedStarted(false); 
    } finally {
      setIsSaving(false);
    }
  };

  // New function for Continue button - only navigates
  const handleNavigateToGrid = () => {
     if (!sessionID) {
      setErrorMessage('Session ID not found. Cannot continue.');
      return;
    }
     router.push(`/pages/grid?sessionID=${sessionID}`);
  };

  const handleConfigClose = () => {
    setShowConfigPopup(false);
  };

  // Determine if input/saving should be disabled
  const isInputDisabled = timeExpired || isSaving;
  const canSubmit = !isInputDisabled && userIdeas.length > 0;

  // Handler for opening instructions modal
  const handleHelpClick = useCallback(() => {
    setIsInstructionsModalOpen(true);
  }, []);

  // Handler for closing instructions modal
  const handleCloseInstructionsModal = useCallback(() => {
    setIsInstructionsModalOpen(false);
  }, []);

  return (
    <>
      <Header onHelpClick={handleHelpClick} />
      <div className="flowchart-container">
        <p className="flowchart-instruction">
          In this study testing a novel NMDA receptor antagonist on spatial memory in mice, treatment allocation has already been randomized.
          <br /><br />
          Examine the study flowchart below and identify aspects beyond treatment allocation that could be randomized.
        </p>

         {showConfigPopup && (
        <SessionConfigPopup
          open={showConfigPopup}
          onClose={handleConfigClose}
          sessionID={sessionID}
        />
      )}

        <div className="programmatic-flowchart">
          {/* Arrow elements */}
          <div className="flowchart-arrow arrow-prepare-to-baseline"></div>
          <div className="flowchart-arrow arrow-left arrow-baseline-to-generate"></div>
          <div className="flowchart-arrow arrow-right arrow-syringes-to-habituate"></div>
          <div className="flowchart-arrow arrow-down arrow-generate-to-syringes"></div>
          <div className="flowchart-arrow arrow-down arrow-habituate-to-administer"></div>
          <div className="flowchart-arrow arrow-down arrow-administer-to-record"></div>
          <div className="flowchart-arrow arrow-record-to-conceal"></div>
          <div className="flowchart-arrow arrow-right arrow-conceal-to-analyze"></div>
          <div className="flowchart-arrow arrow-analyze-to-reveal"></div>
          <div className="flowchart-arrow arrow-reveal-to-manuscript"></div>

          {/* Row 1: Team Headers */}
          <div className="flowchart-row-header">
            <div className="flowchart-step team-a-header">
              Team A: Access<br />(Randomization Team)
            </div>
            <div className="flowchart-step team-b-header">
              Team B: Blind<br />(Experimental Team)
            </div>
          </div>

          {/* Row 2: PREPARE Step */}
          <div className="flowchart-row">
            <div className="flowchart-step shared-step prepare-step">
              PREPARE and define NMDA receptor study protocols
            </div>
          </div>

          {/* Row 3: Generate random / Collect baseline */}
          <div className="flowchart-row">
            <div className="flowchart-step team-a-step">
              Generate random treatment allocation
            </div>
            <div className="flowchart-step team-b-step">
              Collect baseline data (weight, sex, age)
            </div>
          </div>

          {/* Row 4: Prepare coded / Habituate mice */}
          <div className="flowchart-row">
            <div className="flowchart-step team-a-step">
              Prepare coded syringes with drug/vehicle
            </div>
            <div className="flowchart-step team-b-step">
              Habituate mice to handling (3 days)
            </div>
          </div>

          {/* Row 5: (Empty A) / Administer treatments */}
          <div className="flowchart-row">
            <div className="flowchart-step empty-step"></div> {/* Placeholder for Team A */}
            <div className="flowchart-step team-b-step">
              Administer treatments and run maze tests
            </div>
          </div>

          {/* Row 6: (Empty A) / Record maze performance */}
          <div className="flowchart-row">
            <div className="flowchart-step empty-step"></div> {/* Placeholder for Team A */}
            <div className="flowchart-step team-b-step">
              Record maze performance and behavioral data
            </div>
          </div>

          {/* Row 7: Conceal allocations / Analyze blinded data */}
          <div className="flowchart-row">
            <div className="flowchart-step team-a-step">
              Conceal allocations in collected data
            </div>
            <div className="flowchart-step team-b-step">
              Analyze blinded data (Groups A vs B)
            </div>
          </div>

          {/* Row 8: Reveal treatment / (Empty B) */}
          <div className="flowchart-row">
            <div className="flowchart-step team-a-step">
              Reveal treatment group identities
            </div>
            <div className="flowchart-step empty-step"></div> {/* Placeholder for Team B */}
          </div>

          {/* Row 9: Write manuscript */}
          <div className="flowchart-row">
            <div className="flowchart-step shared-step manuscript-step">
              Write manuscript according to ARRIVE guidelines
            </div>
          </div>
        </div>

        <div className="randomization-section">
          <div className="header-container"> 
            <h2>ADDITIONAL RANDOMIZATION IDEAS</h2>
            {timerInfo.startTime && (
                <div className={`timer-display ${timeExpired ? 'expired' : ''}`}>
                    TIME REMAINING: {displayTime}
                </div>
            )}
          </div>

          <div className="input-container">
            <input
              ref={inputRef}
              type="text"
              value={inputValue}
              onChange={handleInputChange}
              onKeyDown={handleKeyDown}
              placeholder={timeExpired ? "Time's up!" : "Enter an aspect that could be randomized..."}
              disabled={isInputDisabled}
            />
            <button 
              onClick={handleAddIdea}
              className="add-idea-button"
              disabled={!inputValue.trim() || isInputDisabled}
            >
              Add idea
            </button>
          </div>

          <ul className="ideas-list">
            {/* Inspiration ideas at the top, non-removable */}
            {inspirationIdeas.map((idea, idx) => (
              <li key={`insp-${idx}`} className="inspiration-idea">
                <span>System Generated: {idea}</span>
              </li>
            ))}
            {/* User ideas, removable */}
            {userIdeas.map((idea, index) => (
              <li key={index}>
                <span>{idea}</span>
                <button onClick={() => handleRemoveIdea(index)} className="remove-button">
                  &times;
                </button>
              </li>
            ))}
          </ul>
          
          {errorMessage && <p className="error-message">{errorMessage}</p>}
        </div>

        <div className="action-buttons-container">
           <button 
            onClick={handleSaveIdeas} 
            className="save-ideas-button"
            disabled={!canSubmit}
          >
            {isTimerConfirmedStarted ? 'Submit Ideas' : 'Submit Ideas and Start Timer'}
          </button>

          <button 
            onClick={handleNavigateToGrid}
            className="continue-button"
            disabled={!timeExpired}
          >
            {timeExpired ? 'CONTINUE TO NEXT STEP' : 'WAITING FOR TIME TO EXPIRE...'}
          </button>
        </div>
      </div>
      
      <InstructionsModal 
        isOpen={isInstructionsModalOpen} 
        onClose={handleCloseInstructionsModal}
      >
        <h3>Step 1: Brainstorming</h3>
        <p>
          Identify components of the study, beyond treatment allocation, that could work to address bias. 
          We&apos;ve provided you with a few to start with! Everyone&apos;s contributions are needed to advance to 
          the next step, so make sure you start the timer once everyone completing the activity is ready.
        </p>
      </InstructionsModal>
    </>
  );
}

export default function PageContent() {
  return (
    <Suspense fallback={<div className="loading-indicator"><div className="spinner"></div><p>Loading...</p></div>}>
      <FlowchartPage />
    </Suspense>
  );
}
