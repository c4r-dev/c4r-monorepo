const logger = require('../../../../../packages/logging/logger.js');
'use client';

import React, { useState, useEffect } from 'react';
import {
  Box,
  Container,
  Typography,
  Paper,
  Button,
  Chip,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  LinearProgress,
  Accordion,
  AccordionSummary,
  AccordionDetails,
  Alert,
  Snackbar,
  CircularProgress,
} from '@mui/material';

const CausalRankingPage = () => {
  // Updated keywords list from screenshot (15 total)
  const [allKeyWords] = useState([
    "affects",
    "is associated with",
    "contributes to",
    "correlates with",
    "decreases",
    "enhances",
    "impacts",
    "impairs",
    "induces",
    "influences",
    "is linked to",
    "mediates",
    "predicts",
    "is related to",
    "triggers"
  ]);

  // Define all rounds data
  const roundsData = [
    {
      id: 1,
      topic: "Sleep Deprivation and Memory Formation",
      template: "Sleep deprivation [KEY WORD] hippocampal memory consolidation in young adults"
    },
    {
      id: 2,
      topic: "Dopamine and Learning Behavior", 
      template: "Dopamine receptor activation [KEY WORD] reward-based learning in rats"
    },
    {
      id: 3,
      topic: "Stress Hormones and Cognitive Function",
      template: "Elevated cortisol [KEY WORD] age-related cognitive decline"
    },
    {
      id: 4,
      topic: "Neuroinflammation and Depression",
      template: "Microglial activation [KEY WORD] depressive-like behaviors in mice"
    }
  ];

  const [currentRound, setCurrentRound] = useState(0);
  const [roundKeyWords, setRoundKeyWords] = useState({});
  const [allCards, setAllCards] = useState({});
  const [draggedItem, setDraggedItem] = useState(null);
  const [dragOverIndex, setDragOverIndex] = useState(null);
  const [showResults, setShowResults] = useState(false);
  const [debugMode, setDebugMode] = useState(false);
  const [roundHistory, setRoundHistory] = useState([]);
  
  // API state management
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  const [savedMatrixId, setSavedMatrixId] = useState(null);
  const [existingMatrix, setExistingMatrix] = useState(null);
  const [isLoadingExistingMatrix, setIsLoadingExistingMatrix] = useState(true);
  
  // The specific matrix ID to fetch on load
  const EXISTING_MATRIX_ID = 'causal-ranking-2025-08-11T17-41-13-332Z-ns5ee0';
  
  // Matrix for storing pairwise comparisons - updated to 15x15
  const [comparisonMatrix, setComparisonMatrix] = useState(() => {
    const n = 15; // updated number of words
    return Array(n).fill().map(() => Array(n).fill(0));
  });

  // Function to generate a unique matrix ID
  const generateMatrixId = () => {
    const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
    const randomSuffix = Math.random().toString(36).substring(2, 8);
    return `causal-ranking-${timestamp}-${randomSuffix}`;
  };

  // Function to fetch existing matrix from API
  const fetchExistingMatrix = async (matrixId, baseUrl = 'https://jhuvt-caus-cau-lang-v0.vercel.app') => {
    logger.app.info('🔍 === FETCHING EXISTING MATRIX ===');
    logger.app.info('📋 Matrix ID to fetch:', matrixId);
    
    try {
      const url = `${baseUrl}/api/matrix?matrixId=${matrixId}`;
      logger.app.info('🌐 Making GET request to:', url);
      
      const response = await fetch(url);
      
      logger.app.info('📨 GET Response received:');
      logger.app.info('  - Status:', response.status);
      logger.app.info('  - Status Text:', response.statusText);
      logger.app.info('  - OK:', response.ok);
      
      if (!response.ok) {
        if (response.status === 404) {
          logger.app.info('📭 Matrix not found - will create new one');
          return null; // Matrix doesn't exist yet
        }
        logger.app.info('❌ GET Response not OK, attempting to parse error...');
        const errorData = await response.json();
        logger.app.info('🚫 GET Error Response Data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }
      
      logger.app.info('✅ GET Response OK, parsing data...');
      const result = await response.json();
      logger.app.info('📊 Existing Matrix Data:');
      logger.app.info('  - Matrix ID:', result.matrixId);
      logger.app.info('  - Matrix dimensions:', result.matrix?.length + 'x' + (result.matrix?.[0]?.length || 0));
      logger.app.info('  - Version:', result.version);
      logger.app.info('  - Created by:', result.createdBy);
      logger.app.info('  - Last modified:', result.lastModified);
      logger.app.info('📋 Full Matrix Response:', result);
      
      return result.matrix || null;
    } catch (error) {
      logger.app.info('💥 === FETCH EXISTING MATRIX FAILED ===');
      logger.app.error('🚨 Fetch Error Type:', error.constructor.name);
      logger.app.error('🚨 Fetch Error Message:', error.message);
      logger.app.error('🚨 Full Fetch Error:', error);
      
      if (error instanceof TypeError) {
        logger.app.info('🔍 TypeError suggests network issue - check if server is running on localhost:3002');
      }
      
      throw error;
    }
  };

  // Function to get 4 random unique keywords
  const getRandomKeyWords = () => {
    const shuffled = [...allKeyWords].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, 4);
  };

  // Initialize cards for all rounds with random keywords
  const initializeRounds = () => {
    const allRoundsCards = {};
    const allRoundsKeyWords = {};
    
    roundsData.forEach((round, roundIndex) => {
      const selectedKeyWords = getRandomKeyWords();
      allRoundsKeyWords[roundIndex] = selectedKeyWords;
      
      allRoundsCards[roundIndex] = selectedKeyWords.map((keyWord, index) => ({
        id: index + 1,
        text: round.template.replace("[KEY WORD]", keyWord),
        keyWord: keyWord,
        originalPosition: index + 1
      }));
    });
    
    return { allRoundsCards, allRoundsKeyWords };
  };

  // Initialize on component mount
  useEffect(() => {
    const initializeComponent = async () => {
      logger.app.info('🚀 === COMPONENT INITIALIZATION ===');
      
      try {
        // Initialize rounds data first
        logger.app.info('🔧 Initializing rounds data...');
        const { allRoundsCards, allRoundsKeyWords } = initializeRounds();
        setAllCards(allRoundsCards);
        setRoundKeyWords(allRoundsKeyWords);
        logger.app.info('✅ Rounds data initialized');
        
        // Try to fetch existing matrix
        logger.app.info('🔍 Attempting to fetch existing matrix...');
        setIsLoadingExistingMatrix(true);
        
        const existingMatrixData = await fetchExistingMatrix(EXISTING_MATRIX_ID);
        
        if (existingMatrixData) {
          logger.app.info('📊 Existing matrix found and loaded');
          logger.app.info('📈 Existing matrix row sums:', existingMatrixData.map((row, i) => ({ 
            word: allKeyWords[i], 
            sum: row.reduce((a, b) => a + b, 0) 
          })));
          setExistingMatrix(existingMatrixData);
        } else {
          logger.app.info('📭 No existing matrix found - starting fresh');
          // Initialize with empty 15x15 matrix
          setExistingMatrix(Array(15).fill().map(() => Array(15).fill(0)));
        }
        
      } catch (error) {
        logger.app.error('💥 Error during initialization:', error);
        logger.app.info('🔄 Falling back to empty matrix...');
        // Fallback to empty matrix if fetch fails
        setExistingMatrix(Array(15).fill().map(() => Array(15).fill(0)));
      } finally {
        setIsLoadingExistingMatrix(false);
        logger.app.info('✅ Component initialization complete');
      }
    };

    initializeComponent();
  }, []);

  // Enhanced function to update comparison matrix with debugging
  const updateComparisonMatrix = (rankedCards) => {
    logger.app.info('=== UPDATING MATRIX ===');
    logger.app.info('Round:', currentRound + 1);
    logger.app.info('User ranking:', rankedCards.map(card => card.keyWord));
    
    const newMatrix = comparisonMatrix.map(row => [...row]);
    const wordIndices = rankedCards.map(card => allKeyWords.indexOf(card.keyWord));
    
    logger.app.info('Word indices:', wordIndices);
    
    // Track each pairwise comparison
    const comparisons = [];
    const matrixUpdates = [];
    
    // Generate all pairwise comparisons (6 comparisons for 4 words)
    for (let i = 0; i < wordIndices.length; i++) {
      for (let j = i + 1; j < wordIndices.length; j++) {
        const higherRankedWordIndex = wordIndices[i]; // word ranked higher (more causal)
        const lowerRankedWordIndex = wordIndices[j];  // word ranked lower (less causal)
        
        const higherWord = allKeyWords[higherRankedWordIndex];
        const lowerWord = allKeyWords[lowerRankedWordIndex];
        
        comparisons.push(`${higherWord} > ${lowerWord}`);
        matrixUpdates.push({
          from: higherWord,
          to: lowerWord,
          position: `[${higherRankedWordIndex}][${lowerRankedWordIndex}]`,
          oldValue: newMatrix[higherRankedWordIndex][lowerRankedWordIndex],
          newValue: newMatrix[higherRankedWordIndex][lowerRankedWordIndex] + 1
        });
        
        // Increment matrix element a_ij where i is more causal than j
        newMatrix[higherRankedWordIndex][lowerRankedWordIndex]++;
      }
    }
    
    logger.app.info('Pairwise comparisons:', comparisons);
    logger.app.info('Matrix updates:', matrixUpdates);
    
    // Store round history for debugging
    const roundData = {
      round: currentRound + 1,
      ranking: rankedCards.map(card => card.keyWord),
      comparisons,
      matrixUpdates
    };
    
    setRoundHistory(prev => [...prev, roundData]);
    setComparisonMatrix(newMatrix);
    
    logger.app.info('Updated matrix:', newMatrix);
  };

  // Calculate final rankings based on matrix row sums
  const calculateFinalRankings = () => {
    const rowSums = comparisonMatrix.map((row, index) => ({
      word: allKeyWords[index],
      score: row.reduce((sum, val) => sum + val, 0),
      index: index
    }));
    
    logger.app.info('Row sums (total wins):', rowSums);
    
    // Sort by score (descending) - higher score means more causal
    return rowSums.sort((a, b) => b.score - a.score);
  };

  // API call function
  const submitMatrixData = async (matrix) => {
    logger.app.info('🚀 === STARTING API SUBMISSION ===');
    
    // Use the same matrix ID to update the existing matrix
    const matrixId = EXISTING_MATRIX_ID;
    logger.app.info('📋 Using Matrix ID:', matrixId, '(updating existing matrix)');
    
    const requestBody = {
      matrixId,
      matrix,
      metadata: {
        title: `Causal Ranking Session - ${new Date().toLocaleDateString()}`,
        description: `Cumulative causal word ranking results across multiple sessions`,
        // Removed dataType to use schema default
        tags: ['causal_ranking', 'linguistics', 'user_study', 'cumulative'],
        rounds: roundHistory.length + 1, // +1 for the final round being submitted
        keywords: allKeyWords,
        roundTopics: roundsData.map(round => round.topic),
        sessionInfo: {
          currentSession: new Date().toISOString(),
          totalRoundsThisSession: roundHistory.length + 1
        }
      },
      lastModifiedBy: 'user',
      changes: `Added causal ranking data from ${roundHistory.length + 1} rounds to cumulative matrix`
    };

    logger.app.info('📦 Request Body Structure:');
    logger.app.info('  - matrixId:', requestBody.matrixId);
    logger.app.info('  - matrix dimensions:', matrix.length + 'x' + (matrix[0]?.length || 0));
    logger.app.info('  - metadata:', requestBody.metadata);
    logger.app.info('  - lastModifiedBy:', requestBody.lastModifiedBy);
    logger.app.info('  - changes:', requestBody.changes);
    logger.app.info('📊 Full Request Body:', requestBody);

    try {
      logger.app.info('🌐 Making POST request to /api/matrix...');
      logger.app.info('📡 Request Details:');
      logger.app.info('  - URL: /api/matrix');
      logger.app.info('  - Method: POST');
      logger.app.info('  - Content-Type: application/json');
      logger.app.info('  - Body size:', JSON.stringify(requestBody).length, 'characters');
      
      const response = await fetch('/api/matrix', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody)
      });

      logger.app.info('📨 Response received:');
      logger.app.info('  - Status:', response.status);
      logger.app.info('  - Status Text:', response.statusText);
      logger.app.info('  - OK:', response.ok);
      logger.app.info('  - Headers:', Object.fromEntries(response.headers.entries()));

      if (!response.ok) {
        logger.app.info('❌ Response not OK, attempting to parse error...');
        const errorData = await response.json();
        logger.app.info('🚫 Error Response Data:', errorData);
        throw new Error(errorData.message || `HTTP error! status: ${response.status}`);
      }

      logger.app.info('✅ Response OK, parsing success data...');
      const result = await response.json();
      logger.app.info('🎉 SUCCESS! Cumulative matrix updated successfully:');
      logger.app.info('  - Matrix ID:', result.matrixId);
      logger.app.info('  - Version:', result.version);
      logger.app.info('  - Dimensions:', result.dimensions);
      logger.app.info('  - Last Modified:', result.lastModified);
      logger.app.info('📋 Full Success Response:', result);
      
      return result;
    } catch (error) {
      logger.app.info('💥 === API SUBMISSION FAILED ===');
      logger.app.error('🚨 Error Type:', error.constructor.name);
      logger.app.error('🚨 Error Message:', error.message);
      logger.app.error('🚨 Full Error:', error);
      
      if (error instanceof TypeError) {
        logger.app.info('🔍 TypeError suggests network/fetch issue - check if API endpoint exists');
      }
      
      throw error;
    }
  };

  // Debug function to show matrix
  const showMatrixDebug = () => {
    logger.app.info('=== CURRENT MATRIX STATE ===');
    console.table(comparisonMatrix);
    
    // Show row sums
    const rowSums = comparisonMatrix.map((row, index) => ({
      word: allKeyWords[index],
      wins: row.reduce((sum, val) => sum + val, 0)
    }));
    
    logger.app.info('Row sums (total wins):', rowSums);
    
    // Show matrix as formatted table
    const matrixDisplay = comparisonMatrix.map((row, i) => {
      const obj = { word: allKeyWords[i] };
      row.forEach((val, j) => {
        obj[allKeyWords[j]] = val;
      });
      obj.totalWins = row.reduce((sum, val) => sum + val, 0);
      return obj;
    });
    
    console.table(matrixDisplay);
  };

  // Test function to verify specific scenarios
  const testRankingScenario = () => {
    logger.app.info('=== TESTING RANKING SCENARIO ===');
    
    // Reset matrix for testing - updated to 15x15
    const testMatrix = Array(15).fill().map(() => Array(15).fill(0));
    
    // Simulate known rankings
    const testRounds = [
      ['triggers', 'influences', 'affects', 'correlates with'],
      ['influences', 'triggers', 'impacts', 'affects'],
      ['triggers', 'impacts', 'influences', 'induces']
    ];
    
    logger.app.info('Test rounds:', testRounds);
    
    testRounds.forEach((ranking, roundIndex) => {
      logger.app.info(`Processing test round ${roundIndex + 1}:`, ranking);
      const indices = ranking.map(word => allKeyWords.indexOf(word));
      
      for (let i = 0; i < indices.length; i++) {
        for (let j = i + 1; j < indices.length; j++) {
          testMatrix[indices[i]][indices[j]]++;
          logger.app.info(`${ranking[i]} beats ${ranking[j]} -> matrix[${indices[i]}][${indices[j]}]++`);
        }
      }
    });
    
    // Calculate expected results
    const testRowSums = testMatrix.map((row, index) => ({
      word: allKeyWords[index],
      wins: row.reduce((sum, val) => sum + val, 0)
    })).filter(item => item.wins > 0).sort((a, b) => b.wins - a.wins);
    
    logger.app.info('Test results:', testRowSums);
  };

  const currentCards = allCards[currentRound] || [];

  const handleDragStart = (e, index) => {
    setDraggedItem(index);
    e.dataTransfer.effectAllowed = 'move';
  };

  const handleDragOver = (e, index) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e, dropIndex) => {
    e.preventDefault();
    
    if (draggedItem === null) return;

    const newCards = [...currentCards];
    const draggedCard = newCards[draggedItem];
    
    // Remove the dragged item
    newCards.splice(draggedItem, 1);
    
    // Insert at new position
    newCards.splice(dropIndex, 0, draggedCard);
    
    // Update the cards for current round
    setAllCards(prev => ({
      ...prev,
      [currentRound]: newCards
    }));
    
    setDraggedItem(null);
    setDragOverIndex(null);
  };

  const handleRestart = () => {
    const shuffledCards = [...currentCards].sort(() => 0.5 - Math.random());
    setAllCards(prev => ({
      ...prev,
      [currentRound]: shuffledCards
    }));
  };

  const handleShuffleKeywords = () => {
    const newKeyWords = getRandomKeyWords();
    const newCards = newKeyWords.map((keyWord, index) => ({
      id: index + 1,
      text: roundsData[currentRound].template.replace("[KEY WORD]", keyWord),
      keyWord: keyWord,
      originalPosition: index + 1
    }));

    setRoundKeyWords(prev => ({
      ...prev,
      [currentRound]: newKeyWords
    }));

    setAllCards(prev => ({
      ...prev,
      [currentRound]: newCards
    }));
  };

  const handleNextRound = () => {
    // Update matrix with current round's ranking before moving to next round
    updateComparisonMatrix(currentCards);
    
    if (currentRound < roundsData.length - 1) {
      setCurrentRound(currentRound + 1);
    }
  };

  const handlePreviousRound = () => {
    if (currentRound > 0) {
      setCurrentRound(currentRound - 1);
    }
  };

  const handleSubmitAllRankings = async () => {
    logger.app.info('🎯 === SUBMIT ALL RANKINGS CLICKED ===');
    logger.app.info('📊 Current round:', currentRound + 1);
    logger.app.info('📋 Current round cards ranking:', currentCards.map(card => card.keyWord));
    logger.app.info('📈 Rounds completed so far:', roundHistory.length);
    logger.app.info('🔍 Current comparison matrix state:', comparisonMatrix);
    
    // Clear any previous errors
    setSubmitError(null);
    setSubmitSuccess(false);
    setIsSubmitting(true);
    logger.app.info('⏳ Setting isSubmitting to true...');

    try {
      logger.app.info('🔄 Updating comparison matrix with final round...');
      // Update matrix with final round's ranking
      updateComparisonMatrix(currentCards);
      
      // Wait a moment for the matrix to update (since useState is async)
      logger.app.info('⏱️ Waiting 100ms for state update...');
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Get the updated matrix - we need to manually create it since state might not be updated yet
      logger.app.info('🏗️ Creating final matrix manually...');
      const newSessionMatrix = comparisonMatrix.map(row => [...row]);
      
      // Apply the final round's updates to the matrix
      logger.app.info('🔧 Applying final round updates to matrix...');
      const wordIndices = currentCards.map(card => allKeyWords.indexOf(card.keyWord));
      logger.app.info('📍 Final round word indices:', wordIndices);
      
      let updatesApplied = 0;
      for (let i = 0; i < wordIndices.length; i++) {
        for (let j = i + 1; j < wordIndices.length; j++) {
          const beforeValue = newSessionMatrix[wordIndices[i]][wordIndices[j]];
          newSessionMatrix[wordIndices[i]][wordIndices[j]]++;
          updatesApplied++;
          logger.app.info(`  📝 Updated matrix[${wordIndices[i]}][${wordIndices[j]}]: ${beforeValue} -> ${newSessionMatrix[wordIndices[i]][wordIndices[j]]} (${allKeyWords[wordIndices[i]]} > ${allKeyWords[wordIndices[j]]})`);
        }
      }
      logger.app.info('✅ Applied', updatesApplied, 'matrix updates for final round');
      
      // Create cumulative matrix by adding existing matrix + new session matrix
      logger.app.info('🔗 === CREATING CUMULATIVE MATRIX ===');
      logger.app.info('📊 New session matrix dimensions:', newSessionMatrix.length + 'x' + newSessionMatrix[0].length);
      logger.app.info('📊 Existing matrix dimensions:', existingMatrix?.length + 'x' + (existingMatrix?.[0]?.length || 0));
      
      const cumulativeMatrix = Array(15).fill().map(() => Array(15).fill(0));
      
      // Add existing matrix values
      if (existingMatrix) {
        logger.app.info('➕ Adding existing matrix values...');
        for (let i = 0; i < 15; i++) {
          for (let j = 0; j < 15; j++) {
            cumulativeMatrix[i][j] += (existingMatrix[i]?.[j] || 0);
          }
        }
        logger.app.info('✅ Existing matrix values added');
      } else {
        logger.app.info('📭 No existing matrix to add');
      }
      
      // Add new session matrix values
      logger.app.info('➕ Adding new session matrix values...');
      for (let i = 0; i < 15; i++) {
        for (let j = 0; j < 15; j++) {
          cumulativeMatrix[i][j] += newSessionMatrix[i][j];
        }
      }
      logger.app.info('✅ New session matrix values added');
      
      logger.app.info('📊 Cumulative matrix dimensions:', cumulativeMatrix.length + 'x' + cumulativeMatrix[0].length);
      logger.app.info('📈 Cumulative matrix row sums:', cumulativeMatrix.map((row, i) => ({ 
        word: allKeyWords[i], 
        sum: row.reduce((a, b) => a + b, 0) 
      })));
      logger.app.info('🎯 Final cumulative matrix:', cumulativeMatrix);

      logger.app.info('🚀 Calling submitMatrixData with cumulative matrix...');
      // Submit cumulative matrix to API
      const result = await submitMatrixData(cumulativeMatrix);
      
      // Success handling
      logger.app.info('🎉 === CUMULATIVE SUBMISSION SUCCESSFUL ===');
      logger.app.info('💾 Saved Matrix ID:', result.matrixId);
      logger.app.info('📊 Matrix Version:', result.version);
      logger.app.info('📏 Matrix Dimensions:', result.dimensions);
      logger.app.info('🕒 Last Modified:', result.lastModified);
      
      setSavedMatrixId(result.matrixId);
      setSubmitSuccess(true);
      setShowResults(true);
      
      logger.app.info('✅ State updated - showing results page');
      
    } catch (error) {
      logger.app.info('💥 === SUBMISSION FAILED ===');
      logger.app.error('🚨 Error details:', {
        name: error.name,
        message: error.message,
        stack: error.stack
      });
      
      const errorMessage = error.message || 'Failed to submit rankings. Please try again.';
      logger.app.info('📝 Setting error message:', errorMessage);
      setSubmitError(errorMessage);
    } finally {
      logger.app.info('🏁 Setting isSubmitting to false...');
      setIsSubmitting(false);
    }
  };

  const handleStartNewSession = () => {
    // Reset everything - updated matrix dimensions
    setCurrentRound(0);
    setShowResults(false);
    setSubmitError(null);
    setSubmitSuccess(false);
    setSavedMatrixId(null);
    setComparisonMatrix(Array(15).fill().map(() => Array(15).fill(0)));
    setRoundHistory([]);
    const { allRoundsCards, allRoundsKeyWords } = initializeRounds();
    setAllCards(allRoundsCards);
    setRoundKeyWords(allRoundsKeyWords);
  };

  const highlightKeyWord = (text, keyWord) => {
    const parts = text.split(new RegExp(`(${keyWord})`, 'gi'));
    return parts.map((part, index) => 
      part.toLowerCase() === keyWord.toLowerCase() ? 
        <Box component="span" key={index} sx={{ color: 'primary.main', fontWeight: 600 }}>
          {part}
        </Box> : 
        part
    );
  };

  // Debug Panel Component
  const DebugPanel = () => (
    <Paper elevation={1} sx={{ p: 2, mb: 2, bgcolor: 'grey.100' }}>
      <Typography variant="h6" sx={{ mb: 2 }}>🔧 Debug Panel</Typography>
      
      <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={showMatrixDebug}
          sx={{ textTransform: 'none' }}
        >
          Show Matrix in Console
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={testRankingScenario}
          sx={{ textTransform: 'none' }}
        >
          Test Scenario
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => logger.app.info('Round History:', roundHistory)}
          sx={{ textTransform: 'none' }}
        >
          Show History
        </Button>
        <Button 
          variant="outlined" 
          size="small" 
          onClick={() => {
            logger.app.info('🔍 === EXISTING MATRIX DEBUG ===');
            logger.app.info('Matrix ID:', EXISTING_MATRIX_ID);
            logger.app.info('Existing matrix loaded:', !!existingMatrix);
            if (existingMatrix) {
              logger.app.info('Existing matrix dimensions:', existingMatrix.length + 'x' + existingMatrix[0].length);
              logger.app.info('Existing matrix row sums:', existingMatrix.map((row, i) => ({ 
                word: allKeyWords[i], 
                sum: row.reduce((a, b) => a + b, 0) 
              })));
              logger.app.info('Full existing matrix:', existingMatrix);
            }
          }}
          sx={{ textTransform: 'none' }}
        >
          Show Existing Matrix
        </Button>
      </Box>

      {/* Matrix Status Info */}
      <Box sx={{ mb: 2, p: 1, bgcolor: 'white', borderRadius: 1 }}>
        <Typography variant="subtitle2" sx={{ fontWeight: 600, mb: 1 }}>
          Matrix Status
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.600', mb: 0.5 }}>
          <strong>Target Matrix ID:</strong> {EXISTING_MATRIX_ID}
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.600', mb: 0.5 }}>
          <strong>Existing Matrix Loaded:</strong> {existingMatrix ? '✅ Yes' : '❌ No'}
        </Typography>
        {existingMatrix && (
          <Typography variant="body2" sx={{ color: 'grey.600' }}>
            <strong>Existing Data Points:</strong> {existingMatrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)}
          </Typography>
        )}
      </Box>

      {roundHistory.length > 0 && (
        <Accordion>
          <AccordionSummary sx={{ bgcolor: 'white' }}>
            <Typography variant="subtitle2">
              Round History ({roundHistory.length} rounds completed)
            </Typography>
          </AccordionSummary>
          <AccordionDetails sx={{ bgcolor: 'white' }}>
            {roundHistory.map((round, index) => (
              <Box key={index} sx={{ mb: 2, p: 1, border: 1, borderColor: 'grey.300', borderRadius: 1 }}>
                <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
                  Round {round.round}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Ranking:</strong> {round.ranking.join(' > ')}
                </Typography>
                <Typography variant="body2" sx={{ mb: 1 }}>
                  <strong>Comparisons:</strong>
                </Typography>
                <Box sx={{ display: 'flex', gap: 0.5, flexWrap: 'wrap', mb: 1 }}>
                  {round.comparisons.map((comp, i) => (
                    <Chip 
                      key={i} 
                      label={comp} 
                      size="small" 
                      sx={{ fontSize: '0.7rem', height: 20 }}
                    />
                  ))}
                </Box>
                <Typography variant="caption" sx={{ color: 'grey.600' }}>
                  Matrix updates: {round.matrixUpdates.length} cells incremented
                </Typography>
              </Box>
            ))}
          </AccordionDetails>
        </Accordion>
      )}
    </Paper>
  );

  // Results Component
  const ResultsPage = () => {
    const finalRankings = calculateFinalRankings();
    
    return (
      <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 3 }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 4 }}>
            {/* Success message */}
            {submitSuccess && savedMatrixId && (
              <Alert 
                severity="success" 
                sx={{ mb: 3 }}
                onClose={() => setSubmitSuccess(false)}
              >
                <Box>
                  <Typography variant="body2" sx={{ fontWeight: 600 }}>
                    Rankings submitted successfully!
                  </Typography>
                  <Typography variant="caption" sx={{ color: 'grey.700' }}>
                    Matrix ID: {savedMatrixId}
                  </Typography>
                </Box>
              </Alert>
            )}

            {/* Understanding the Rankings - moved to top */}
            {/* <Box sx={{ mb: 3 }}>
              <Typography variant="h5" component="h3" sx={{ fontWeight: 600, mb: 1 }}>
                Understanding the Rankings
              </Typography>
              <Typography variant="body1" sx={{ color: 'grey.600', mb: 2 }}>
                These rankings show how participants collectively perceived the causal strength of different words across various scientific 
                contexts. Words at the top were consistently ranked as implying stronger causal relationships, while those at the bottom were 
                seen as more correlational or descriptive.
              </Typography>
            </Box> */}
          </Box> 

          {/* Debug toggle for results */}
          {/* <Box sx={{ mb: 2 }}>
            <Button 
              variant="outlined" 
              size="small" 
              onClick={() => setDebugMode(!debugMode)}
              sx={{ textTransform: 'none' }}
            >
              {debugMode ? 'Hide' : 'Show'} Debug Info
            </Button>o0
          </Box> */}

          {/* Debug Panel in Results */}
          {debugMode && (
            <Paper elevation={1} sx={{ p: 2, mb: 3, bgcolor: 'grey.100' }}>
              <Typography variant="h6" sx={{ mb: 2 }}>🔍 Final Results Debug</Typography>
              <Button 
                variant="outlined" 
                size="small" 
                onClick={() => {
                  logger.app.info('=== FINAL RESULTS DEBUG ===');
                  logger.app.info('Final rankings:', finalRankings);
                  logger.app.info('Complete round history:', roundHistory);
                  showMatrixDebug();
                }}
                sx={{ textTransform: 'none', mb: 2 }}
              >
                Export Debug Data to Console
              </Button>
              
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Total comparisons made: {roundHistory.reduce((sum, round) => sum + round.comparisons.length, 0)}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600', mt: 1 }}>
                Matrix ID: {EXISTING_MATRIX_ID}
              </Typography>
              <Typography variant="body2" sx={{ color: 'grey.600' }}>
                Cumulative data points: {existingMatrix ? existingMatrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0) : 'Unknown'}
              </Typography>
              {savedMatrixId && (
                <Typography variant="body2" sx={{ color: 'grey.600', mt: 1 }}>
                  Saved Matrix ID: {savedMatrixId}
                </Typography>
              )}
            </Paper>
          )}

          <Paper elevation={1} sx={{ borderRadius: 2, overflow: 'hidden' }}>
            <Box sx={{ bgcolor: 'grey.100', p: 2, borderBottom: 1, borderColor: 'grey.200' }}>
              <Typography variant="h5" component="h2" sx={{ fontWeight: 600, color: 'grey.900' }}>
                Final Word Rankings (Strongest → Weakest Causal Implication)
              </Typography>
            </Box>
            
            <TableContainer>
              <Table>
                {/* <TableHead>
                  <TableRow sx={{ bgcolor: 'grey.50' }}>
                    <TableCell sx={{ fontWeight: 600, color: 'grey.700', width: 80 }}>RANK</TableCell>
                    <TableCell sx={{ fontWeight: 600, color: 'grey.700' }}>WORD/PHRASE</TableCell>
                    {debugMode && (
                      <TableCell sx={{ fontWeight: 600, color: 'grey.700', width: 100 }}>SCORE</TableCell>
                    )}
                  </TableRow>
                </TableHead> */}
                <TableBody>
                  {finalRankings.map((item, index) => (
                    <TableRow 
                      key={item.index}
                      sx={{ 
                        '&:nth-of-type(even)': { bgcolor: 'grey.25' },
                        '&:hover': { bgcolor: 'primary.50' },
                        borderBottom: 1,
                        borderColor: 'grey.100'
                      }}
                    >
                      <TableCell>
                        <Box sx={{
                          width: 28,
                          height: 28,
                          bgcolor: index < 3 ? 'primary.main' : 'grey.600',
                          color: 'white',
                          borderRadius: '50%',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontWeight: 600,
                          fontSize: '0.875rem'
                        }}>
                          {index + 1}
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography 
                          variant="body1" 
                          sx={{ 
                            fontWeight: index < 3 ? 600 : 400,
                            color: index < 3 ? 'grey.900' : 'grey.700'
                          }}
                        >
                          &quot;{item.word}&quot;
                        </Typography>
                      </TableCell>
                      {debugMode && (
                        <TableCell>
                          <Typography variant="body2" sx={{ color: 'grey.600' }}>
                            {item.score} wins
                          </Typography>
                        </TableCell>
                      )}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </Paper>

          <Box sx={{ mt: 4 }}>
            <Button
              onClick={handleStartNewSession}
              variant="contained"
              startIcon={<span>▶</span>}
              sx={{
                bgcolor: 'primary.main',
                fontWeight: 500,
                px: 3,
                py: 1.5,
                '&:hover': {
                  bgcolor: 'primary.dark'
                }
              }}
            >
              Start New Session
            </Button>
          </Box>
        </Container>
      </Box>
    );
  };

  // Show loading screen while fetching existing matrix
  if (isLoadingExistingMatrix) {
    return (
      <Box sx={{ 
        minHeight: '100vh', 
        bgcolor: 'grey.50', 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        flexDirection: 'column',
        gap: 2
      }}>
        <CircularProgress size={40} />
        <Typography variant="h6" sx={{ color: 'grey.600' }}>
          Loading existing matrix data...
        </Typography>
        <Typography variant="body2" sx={{ color: 'grey.500' }}>
          Matrix ID: {EXISTING_MATRIX_ID}
        </Typography>
      </Box>
    );
  }

  // Show results page if completed
  if (showResults) {
    return <ResultsPage />;
  }

  const progress = ((currentRound + 1) / roundsData.length) * 100;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: 'grey.50', py: 2 }}>
      <Container maxWidth="md">
        {/* Error and Success Notifications */}
        <Snackbar 
          open={!!submitError} 
          autoHideDuration={6000} 
          onClose={() => setSubmitError(null)}
          anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        >
          <Alert severity="error" onClose={() => setSubmitError(null)}>
            {submitError}
          </Alert>
        </Snackbar>

        {/* Header */}
        <Box sx={{ mb: 2 }}>
          {/* <Typography variant="h5" component="h1" sx={{ fontWeight: 'bold', color: 'grey.900', mb: 0.5 }}>
            Ranking Causal-ish Paper Titles
          </Typography>
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 1.5, lineHeight: 1.4 }}>
            Drag and drop the different word options to rank them by strength of causal implication. The same sentence 
            template is used with different causal words - rank from strongest to weakest causal implication.
          </Typography> */}

          {/* Existing Matrix Status
          {existingMatrix && (
            <Alert 
              severity="info" 
              sx={{ mb: 2, fontSize: '0.875rem' }}
            >
              <Typography variant="body2">
                📊 <strong>Cumulative Mode:</strong> Your rankings will be added to existing data. 
                Matrix has {existingMatrix.reduce((sum, row) => sum + row.reduce((a, b) => a + b, 0), 0)} existing comparisons.
              </Typography>
            </Alert>
          )} */}
          
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ color: 'grey.500' }}>
              Round {currentRound + 1} of {roundsData.length}
            </Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              {/* <Button 
                variant="outlined" 
                size="small" 
                onClick={() => setDebugMode(!debugMode)}
                sx={{ textTransform: 'none' }}
              >
                {debugMode ? 'Hide' : 'Show'} Debug
              </Button> */}
              {/* <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                <Typography sx={{ color: 'grey.500' }}>👥</Typography>
                <Typography variant="body2" sx={{ color: 'grey.500' }}>
                  3 participants so far
                </Typography>
              </Box> */}
            </Box>
          </Box>

          {/* Progress Bar */}
          <LinearProgress 
            variant="determinate" 
            value={progress} 
            sx={{ 
              height: 8, 
              borderRadius: 1,
              bgcolor: 'grey.200',
              mb: 2,
              '& .MuiLinearProgress-bar': {
                borderRadius: 1,
                bgcolor: 'primary.main'
              }
            }} 
          />
        </Box>

        {/* Debug Panel */}
        {debugMode && <DebugPanel />}

        {/* Topic Section */}
        <Paper elevation={1} sx={{ p: 2, mb: 2, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1.5 }}>
            <Typography variant="h6" component="h2" sx={{ fontWeight: 600, color: 'grey.900' }}>
              Topic: {roundsData[currentRound]?.topic}
            </Typography>
            <Button
              onClick={handleShuffleKeywords}
             // startIcon={<span>🔀</span>}
              sx={{ 
                color: 'primary.main',
                fontSize: '0.875rem',
                fontWeight: 500,
                textTransform: 'none',
                '&:hover': {
                  bgcolor: 'primary.50'
                }
              }}
            >
              New Keywords
            </Button>
          </Box>
          
          <Typography variant="body2" sx={{ color: 'grey.600', mb: 1.5 }}>
            Drag and drop the different word options to rank them by strength of causal implication.
          </Typography>

          {/* Current Keywords Display */}
          <Box sx={{ mb: 1.5 }}>
            {/* <Typography variant="caption" sx={{ color: 'grey.500', mb: 1, display: 'block' }}>
              Current keywords for this round:
            </Typography>
            <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
              {(roundKeyWords[currentRound] || []).map((keyword, index) => (
                <Chip 
                  key={index}
                  label={keyword}
                  size="small"
                  sx={{ bgcolor: 'grey.100', color: 'grey.700', fontSize: '0.75rem' }}
                />
              ))}
            </Box> */}
          </Box>

          {/* Ranking Area */}
          <Box sx={{ 
            border: '2px dashed', 
            borderColor: 'grey.300', 
            borderRadius: 2, 
            p: 1.5,
            bgcolor: 'grey.25'
          }}>
            {/* Strongest Label */}
            <Box sx={{ mb: 1.5 }}>
              <Chip 
                label="Strongest Causal Implication"
                sx={{ 
                  bgcolor: 'error.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>

            {/* Draggable Cards with Fixed Position Markers */}
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {currentCards.map((card, index) => (
                <Box key={card.id} sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  {/* Fixed Position Marker */}
                  <Box sx={{
                    width: 32,
                    height: 32,
                    bgcolor: 'primary.main',
                    color: 'white',
                    borderRadius: '50%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontWeight: 600,
                    fontSize: '0.875rem',
                    flexShrink: 0,
                    boxShadow: 1
                  }}>
                    {index + 1}
                  </Box>
                  
                  {/* Draggable Card */}
                  <Paper
                    draggable
                    onDragStart={(e) => handleDragStart(e, index)}
                    onDragOver={(e) => handleDragOver(e, index)}
                    onDragLeave={handleDragLeave}
                    onDrop={(e) => handleDrop(e, index)}
                    elevation={draggedItem === index ? 1 : 2}
                    sx={{
                      p: 1.5,
                      cursor: 'move',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 1,
                      transition: 'all 0.2s ease',
                      opacity: draggedItem === index ? 0.5 : 1,
                      bgcolor: dragOverIndex === index ? 'primary.50' : 'white',
                      borderColor: dragOverIndex === index ? 'primary.main' : 'grey.200',
                      border: dragOverIndex === index ? 1 : 0,
                      flexGrow: 1,
                      '&:hover': {
                        boxShadow: 3
                      }
                    }}
                  >
                    <Typography sx={{ color: 'grey.400', fontSize: '1.25rem', userSelect: 'none' }}>
                      ⋮⋮
                    </Typography>
                    
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography 
                        variant="body2" 
                        sx={{ 
                          color: 'grey.900', 
                          fontStyle: 'italic', 
                          mb: 0.5,
                          lineHeight: 1.4
                        }}
                      >
                        &quot;{highlightKeyWord(card.text, card.keyWord)}&quot;
                      </Typography>
                      <Typography variant="caption" sx={{ color: 'primary.main' }}>
                        Key word: &quot;{card.keyWord}&quot;
                      </Typography>
                    </Box>
                  </Paper>
                </Box>
              ))}
            </Box>

            {/* Weakest Label */}
            <Box sx={{ mt: 1.5 }}>
              <Chip 
                label="Weakest Causal Implication"
                sx={{ 
                  bgcolor: 'primary.main', 
                  color: 'white',
                  fontWeight: 500,
                  fontSize: '0.75rem'
                }}
              />
            </Box>
          </Box>
        </Paper>

        {/* Action Buttons */}
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Box sx={{ display: 'flex', gap: 1.5 }}>
            {/* <Button
              onClick={handleRestart}
              disabled={isSubmitting}
              startIcon={<span>↻</span>}
              sx={{ 
                color: 'grey.600',
                textTransform: 'none',
                fontWeight: 500,
                '&:hover': {
                  color: 'grey.800',
                  bgcolor: 'transparent'
                }
              }}
            >
              Restart
            </Button> */}

            {currentRound > 0 && (
              <Button
                onClick={handlePreviousRound}
                disabled={isSubmitting}
                startIcon={<span>←</span>}
                sx={{ 
                  color: 'grey.600',
                  textTransform: 'none',
                  fontWeight: 500,
                  '&:hover': {
                    color: 'grey.800',
                    bgcolor: 'transparent'
                  }
                }}
              >
                Previous Round
              </Button>
            )}
          </Box>

          <Box>
            {currentRound < roundsData.length - 1 ? (
              <Button
                onClick={handleNextRound}
                disabled={isSubmitting}
                variant="contained"
                endIcon={<span>→</span>}
                sx={{
                  bgcolor: 'primary.main',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'primary.dark'
                  }
                }}
              >
                Next Round
              </Button>
            ) : (
              <Button
                onClick={handleSubmitAllRankings}
                disabled={isSubmitting}
                variant="contained"
                endIcon={isSubmitting ? <CircularProgress size={16} color="inherit" /> : <span>→</span>}
                sx={{
                  bgcolor: 'success.main',
                  fontWeight: 500,
                  px: 2,
                  py: 1,
                  textTransform: 'none',
                  '&:hover': {
                    bgcolor: 'success.dark'
                  },
                  '&:disabled': {
                    bgcolor: 'grey.400'
                  }
                }}
              >
                {isSubmitting ? 'Submitting...' : 'Submit All Rankings'}
              </Button>
            )}
          </Box>
        </Box>
      </Container>
    </Box>
  );
};

export default CausalRankingPage;