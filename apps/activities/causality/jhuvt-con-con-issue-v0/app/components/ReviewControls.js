'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { 
  Box, 
  Typography, 
  Paper, 
  Button,
  Grid,
  TextField,
  FormControl,
  FormControlLabel,
  Checkbox,
  FormGroup,
  IconButton,
  InputAdornment,
  CircularProgress,
  Container
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CheckIcon from '@mui/icons-material/Check';

// Loading component for suspense
function LoadingResults() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

function ReviewControls() {
  const router = useRouter();
  const searchParams = useSearchParams();
  
  // Define multiple experiment descriptions, concerns, and controls
  const experimentData = [
    {
      experimentTitle: "Experiment 1",
      experimentText: "To study the impact of rhythmic sensory stimulation on fibromyalgia symptoms, the authors had patients fill out symptomatology surveys before and after an intervention, which consisted of self-administered sensory stimulation in the patient's home.",
      concernTitle: "Concern 1",
      concernText: "In order to determine the efficacy of rhythmic sensory stimulation, we need to be able to distinguish between the effects of the proposed treatment and a potential placebo effect.",
      controlTitle: "Proposed control 1",
      controlText: "Add a placebo control group that is told the treatment stimulation is of an alternative mode (e.g. light,melodic sound) and then undergoes a sham stimulation."
    },
    {
      experimentTitle: "Experiment 2",
      experimentText: "Do mice raised on mountain rareberries perform better on rotarod tests than mice raised on a control diet?",
      concernTitle: "Concern 2",
      concernText: "Any difference in performance could be due to nutritional content, such as sugar or antioxidants, rather than any property unique to the rareberries.",
      controlTitle: "Proposed control 2",
      controlText: "Supplement the control group's kibble with sugar water to match the rareberry group's sugar intake."
    },
    {
      experimentTitle: "Experiment 3",
      experimentText: "To study the impact of a particular sensory stimulus on neuronal dynamics, you've grown Caenorhabditis Elegans cultures expressing geenetically encoded calcium indicators. You plan to record volumetric videos of worms being exposed to your stimulus and extract neuronal activity from the luminosity values of individual neurons. This requires your worms to be immobilized, so your experiment will involve flooding a microfluiding device featuring a funnel that will restrict their movement.",
      concernTitle: "Concern 3",
      concernText: "Your lab manager notes that a flaw in your fabricated microfluidic devices would be causing your worms discomfort during the experiment, resulting in a stress response that may confound the neural dynamics you're hoping to observe.",
      controlTitle: "Proposed control 3",
      controlText: "Use a mild anesthetic to restrain the worms instead of the faulty device, aiming to eliminate stress responses caused by mechanical discomfort."
    }
  ];

  // States to track what is visible
  const [showConcern, setShowConcern] = useState(false);
  const [showProposedControl, setShowProposedControl] = useState(false);
  const [showFeedbackBox, setShowFeedbackBox] = useState(false);
  const [showMultipleChoice, setShowMultipleChoice] = useState(false);
  
  // State to track current experiment index
  const [currentExperimentIndex, setCurrentExperimentIndex] = useState(0);
  
  // State to track all user responses
  const [allResponses, setAllResponses] = useState([]);
  
  // State to track if this is the first submission
  const [isFirstSubmission, setIsFirstSubmission] = useState(true);
  
  // State to track if feedback is in edit mode
  const [isEditMode, setIsEditMode] = useState(true);
  
  // State to track which assessment was selected (if any)
  const [selectedAssessment, setSelectedAssessment] = useState(null);
  
  // State for feedback text
  const [feedback, setFeedback] = useState('');
  const [tempFeedback, setTempFeedback] = useState('');
  
  // State to track if text has been edited (NEW)
  const [textEdited, setTextEdited] = useState(false);
  
  // State for selected options in multiple choice (using an object for multiple selections)
  const [selectedOptions, setSelectedOptions] = useState({
    'Imprecise negative control': false,
    'Opportunity for bias': false,
    'Covariates imbalanced': false,
    'Missing positive control': false,
    'Risk of underpowered study': false,
    'Ungeneralizable sample': false,
    'Other': false
  });

  // UPDATED: Session and Student ID states
  const [sessionId, setSessionId] = useState(null);
  const [studentId, setStudentId] = useState(null);

  // Function to generate a unique student ID
  const generateStudentId = () => {
    const timestamp = Date.now();
    const randomNum = Math.floor(Math.random() * 1000);
    return `student_${timestamp}_${randomNum}`;
  };

  // Function to update URL with studentId
  const updateURLWithStudentId = (newStudentId) => {
    const currentUrl = new URL(window.location.href);
    currentUrl.searchParams.set('studentId', newStudentId);
    
    // Update the URL without causing a page refresh
    window.history.replaceState({}, '', currentUrl.toString());
  };

  // UPDATED: Extract sessionId from URL and generate studentId on component mount
  useEffect(() => {
    const sessionIdFromUrl = searchParams.get('sessionID');
    const studentIdFromUrl = searchParams.get('studentId');
    
    console.log('useEffect: sessionIdFromUrl =', sessionIdFromUrl);
    console.log('useEffect: searchParams =', Object.fromEntries(searchParams.entries()));
    
    if (sessionIdFromUrl) {
      console.log('Setting sessionId from URL:', sessionIdFromUrl);
      setSessionId(sessionIdFromUrl);
    } else {
      console.warn('No sessionId found in URL parameters, using fallback');
      // Generate a fallback sessionId for individual sessions
      const fallbackSessionId = `individual_${Date.now()}`;
      console.log('Setting fallback sessionId:', fallbackSessionId);
      setSessionId(fallbackSessionId);
    }

    // Always generate a new studentId when landing on the page
    // Even if one exists in URL, we want a fresh one each time
    const newStudentId = generateStudentId();
    setStudentId(newStudentId);
    updateURLWithStudentId(newStudentId);
    
    console.log('Generated new student ID:', newStudentId);
    console.log('Session ID from URL:', sessionIdFromUrl);
  }, []); // Empty dependency array means this runs once on mount

  // UPDATED: Function to send data to API
  const sendRoundDataToAPI = async (roundData) => {
    // Don't send data if sessionId or studentId is not available
    if (!sessionId || !studentId) {
      console.error('Cannot send data: sessionId or studentId is not available');
      console.error('sessionId:', sessionId);
      console.error('studentId:', studentId);
      return;
    }

    try {
      const requestBody = {
        sessionId: sessionId,
        studentId: studentId,
        selectedSection: 1,
        roundNumber: currentExperimentIndex + 1,
        roundData: roundData
      };

      console.log('Sending data to API:', requestBody);
      console.log('sessionId value:', sessionId);
      console.log('studentId value:', studentId);
      console.log('sessionId type:', typeof sessionId);

      // Updated to use window.location.origin for Next.js API routes
      const apiUrl = `${window.location.origin}/api/studies`;
      console.log('API URL:', apiUrl);
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error('API Error Response:', errorText);
        throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
      }

      const result = await response.json();
      console.log('API response:', result);
      return result;
    } catch (error) {
      console.error('Error sending data to API:', error);
      // Try to parse the error response if possible
      if (error.message.includes('body:')) {
        try {
          const errorBody = error.message.split('body: ')[1];
          const parsedError = JSON.parse(errorBody);
          console.error('Parsed API Error:', parsedError);
        } catch (parseErr) {
          console.error('Could not parse error response');
        }
      }
    }
  };

  const handleProblemClick = () => {
    setShowConcern(true);
  };

  const handleAddressConstraint = () => {
    setShowProposedControl(true);
  };
  
  const handleAssessment = (assessment) => {
    setSelectedAssessment(assessment);
    console.log(`User selected: ${assessment}`);
    
    // Show feedback box regardless of assessment type
    setShowFeedbackBox(true);
    
    // Initially in edit mode
    setIsEditMode(true);
    
    // Clear any previous feedback
    setFeedback('');
    setTempFeedback('');
    
    // Reset the text edited flag (NEW)
    setTextEdited(false);
  };
  
  const handleFeedbackChange = (event) => {
    setTempFeedback(event.target.value);
    // Set text edited to true when user makes changes (NEW)
    setTextEdited(true);
  };
  
  const handleCategorize = () => {
    console.log("User feedback:", feedback);
    // Save the feedback first
    setFeedback(tempFeedback);
    // Exit edit mode
    setIsEditMode(false);
    
    // Only show multiple choice for inadequate assessment
    if (selectedAssessment === 'INADEQUATE') {
      setShowMultipleChoice(true);
    }
  };
  
  const handleEditClick = () => {
    setIsEditMode(true);
    setTempFeedback(feedback);
    // Reset the text edited flag when entering edit mode again (NEW)
    setTextEdited(false);
  };
  
  const handleSaveClick = () => {
    setFeedback(tempFeedback);
    setIsEditMode(false);
  };
  
  // Modified handleCheckboxChange to only allow one selection at a time
  const handleCheckboxChange = (event) => {
    const { name, checked } = event.target;
    
    // Create a new object with all options set to false
    const newSelectedOptions = {};
    Object.keys(selectedOptions).forEach(option => {
      newSelectedOptions[option] = false;
    });
    
    // Only set the clicked option to true if it was checked
    if (checked) {
      newSelectedOptions[name] = true;
    }
    
    setSelectedOptions(newSelectedOptions);
  };
  
  // FIXED: Create a unified submit function to handle both adequate and inadequate responses
  const handleFinalSubmit = async (isAdequateSubmission = false) => {
    console.log("Final submission for Experiment #", currentExperimentIndex + 1);
    
    // For adequate submissions, use tempFeedback; for inadequate, use feedback
    const finalFeedback = isAdequateSubmission ? tempFeedback : feedback;
    
    // Filter selected options (for inadequate assessment)
    const selected = Object.keys(selectedOptions).filter(key => selectedOptions[key]);
    
    // Create a response object for this experiment
    const response = {
      experimentIndex: currentExperimentIndex,
      experimentTitle: experimentData[currentExperimentIndex].experimentTitle,
      concernTitle: experimentData[currentExperimentIndex].concernTitle,
      controlTitle: experimentData[currentExperimentIndex].controlTitle,
      assessment: isAdequateSubmission ? 'ADEQUATE' : 'INADEQUATE',
      feedback: finalFeedback,
      category: selected[0] || ''
    };
    
    // Add this response to our collection
    const updatedResponses = [...allResponses, response];
    setAllResponses(updatedResponses);
    
    console.log("Submitting response:", response);
    console.log("Total responses so far:", updatedResponses.length);
    
    // Send round data to API
    const roundData = {
      option: isAdequateSubmission ? "adequate" : "inadequate",
      response: finalFeedback,
      ...(selected[0] && { category: selected[0] }) // Only include category if it exists
    };
    
    await sendRoundDataToAPI(roundData);
    console.log("Round data sent to API:", roundData);
    
    // IMPORTANT: Check completion BEFORE updating any state
    const isLastExperiment = currentExperimentIndex === 2; // 0, 1, 2 = 3 experiments
    
    if (isLastExperiment) {
      // If we've completed all experiments, navigate to results immediately
      console.log("All experiments completed! Navigating to results page...");
      
      const queryParams = new URLSearchParams();
      queryParams.append('completed', 'true');
      queryParams.append('count', updatedResponses.length.toString());
      queryParams.append('sessionId', sessionId);
      queryParams.append('studentId', studentId);
      
      // Navigate to results page - don't update any other state after this
      router.push(`/results?${queryParams.toString()}`);
      return; // Exit early to prevent any further state updates
    }
    
    // Only execute this if NOT the last experiment
    console.log("Moving to next experiment...");
    
    // Reset all states for the next experiment
    setShowFeedbackBox(false);
    setShowMultipleChoice(false);
    setIsEditMode(true);
    setFeedback('');
    setTempFeedback('');
    setSelectedAssessment(null);
    setTextEdited(false);
    
    // Reset selected options
    const resetOptions = {};
    Object.keys(selectedOptions).forEach(option => {
      resetOptions[option] = false;
    });
    setSelectedOptions(resetOptions);
    
    // Move to next experiment
    setCurrentExperimentIndex(currentExperimentIndex + 1);
    
    // Keep showing the concern and proposed control for the next item
    setShowConcern(true);
    setShowProposedControl(true);
  };

  // Updated handleSubmit for inadequate responses
  const handleSubmit = async () => {
    await handleFinalSubmit(false); // false = inadequate submission
  };

  // Updated handleAdequateSubmit for adequate responses  
  const handleAdequateSubmit = async () => {
    // First update the feedback state for adequate submissions
    setFeedback(tempFeedback);
    setIsEditMode(false);
    
    await handleFinalSubmit(true); // true = adequate submission
  };

  // Check if feedback has at least 10 characters
  const isFeedbackValid = tempFeedback.length >= 10;
  const isFinalFeedbackValid = feedback.length >= 10;
  
  // Check if at least one option is selected
  const hasSelectedOption = Object.values(selectedOptions).some(value => value);
  
  // Get the current experiment data
  const currentExpData = experimentData[currentExperimentIndex];

  // Get the feedback prompt based on assessment
  const getFeedbackPrompt = () => {
    if (selectedAssessment === 'ADEQUATE') {
      return "What is one reason why you think the proposed control is [adequate/inadequate]?";
    } else {
      return "What is one reason why this control may not address the concern...?";
    }
  };

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      {/* Experiment Details */}
      <Paper
        elevation={0}
        sx={{
          p: 2,
          backgroundColor: '#f0f0f0',
          mb: 2,
          borderRadius: 1,
          fontWeight: 'bold',
        }}
      >
        <Typography
          variant="h4"
          component="h3"
          sx={{
            fontWeight: 'bold',
            fontSize: '1.5rem',
            marginBottom: '15px',
          }}
        >
          {currentExpData.experimentTitle}
        </Typography>
        <Typography variant="body1">
          {currentExpData.experimentText}
        </Typography>
      </Paper>

      {/* Concern Box */}
      {showConcern && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: '#ffe8d6', // Peach/light orange color
            mb: 2,
            borderRadius: 1,
          }}
        >
          <Typography 
            variant="h4" 
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              marginBottom: '15px',
              color: '#ff7043', // Orange color for "Concern"
            }}
          >
            {currentExpData.concernTitle}
          </Typography>
          <Typography variant="body1">
            {currentExpData.concernText}
          </Typography>
        </Paper>
      )}

      {/* Proposed Control Box */}
      {showProposedControl && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: '#e8f5e9', // Light green color
            mb: 2,
            borderRadius: 1,
          }}
        >
          <Typography 
            variant="h4" 
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.5rem',
              marginBottom: '15px',
              color: '#4caf50', // Green color for "Proposed control"
            }}
          >
            {currentExpData.controlTitle}
          </Typography>
          <Typography variant="body1">
            {currentExpData.controlText}
          </Typography>
        </Paper>
      )}

      {/* Feedback Box - Shows after assessment */}
      {showFeedbackBox && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            backgroundColor: '#f0f0f0', // Light gray color
            mb: showMultipleChoice ? 0 : 2, // No margin if multiple choice is showing
            borderRadius: showMultipleChoice ? '1px 1px 0 0' : 1, // Rounded only at top if multiple choice is showing
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
            <Typography 
              variant="body1" 
              sx={{ 
                color: '#757575', // Gray color for placeholder-like text
                fontWeight: 'medium',
              }}
            >
              {getFeedbackPrompt()}
            </Typography>
            
            {/* Edit button (only visible in read-only mode) */}
            {!isEditMode && (
              <IconButton 
                onClick={handleEditClick}
                size="small"
                sx={{ 
                  color: '#2196f3',
                  '&:hover': {
                    backgroundColor: 'rgba(33, 150, 243, 0.1)',
                  }
                }}
              >
                <EditIcon />
              </IconButton>
            )}
          </Box>
          
          {/* Conditional rendering based on edit mode */}
          {isEditMode ? (
            <Box>
              <TextField
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                value={tempFeedback}
                onChange={handleFeedbackChange}
                placeholder="Enter your feedback here... (minimum 10 characters)"
                sx={{
                  backgroundColor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: '#e0e0e0',
                    },
                    '&:hover fieldset': {
                      borderColor: '#bdbdbd',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: '#9e9e9e',
                    },
                  },
                  mb: 1,
                }}
              />
              
              {/* Character count indicator */}
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography
                  variant="caption"
                  sx={{ 
                    color: tempFeedback.length >= 10 ? '#4caf50' : '#f44336',
                    fontWeight: 'medium'
                  }}
                >
                  {tempFeedback.length}/10 characters {tempFeedback.length >= 10 ? '✓' : '(minimum required)'}
                </Typography>
              </Box>
              
              {/* Submit Button Below Text Field - Always visible, disabled when < 10 characters */}
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
                <Button
                  variant="contained"
                  onClick={selectedAssessment === 'ADEQUATE' ? handleAdequateSubmit : handleCategorize}
                  disabled={!isFeedbackValid}
                  sx={{
                    bgcolor: isFeedbackValid ? '#000000' : '#9e9e9e',
                    color: 'white',
                    fontWeight: 'bold',
                    '&:hover': {
                      bgcolor: isFeedbackValid ? '#333333' : '#757575',
                    },
                    borderRadius: 0,
                    px: 2,
                    py: 1,
                    '&.Mui-disabled': {
                      bgcolor: '#9e9e9e',
                      color: '#e0e0e0'
                    }
                  }}
                >
                  SUBMIT
                </Button>
              </Box>
            </Box>
          ) : (
            <Typography 
              variant="body1" 
              sx={{ 
                p: 2, 
                backgroundColor: 'white',
                border: '1px solid #e0e0e0',
                borderRadius: '4px',
                minHeight: '80px',
              }}
            >
              {feedback}
            </Typography>
          )}
        </Paper>
      )}
      
      {/* Multiple Choice Options - Only visible when showMultipleChoice is true */}
      {showMultipleChoice && (
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            pt: 0,
            pb: 2,
            backgroundColor: '#f0f0f0', // Light gray color
            mb: 2,
            borderRadius: '0 0 1px 1px', // Rounded only at bottom
          }}
        >
          <Typography 
            variant="body1" 
            sx={{ 
              color: '#757575',
              mb: 1,
              mt: 2,
              fontWeight: 'medium',
            }}
          >
            Which category best describes why this control is inadequate?
          </Typography>
          
          <FormControl component="fieldset" fullWidth>
            <FormGroup>
              {Object.keys(selectedOptions).map((option) => (
                <Paper
                  key={option}
                  elevation={0}
                  sx={{
                    mb: 1,
                    backgroundColor: selectedOptions[option] ? '#e3f2fd' : '#e0e0e0',
                    border: selectedOptions[option] ? '2px solid #2196f3' : 'none',
                    borderRadius: 1,
                  }}
                >
                  <FormControlLabel
                    control={
                      <Checkbox 
                        checked={selectedOptions[option]}
                        onChange={handleCheckboxChange}
                        name={option}
                        sx={{ 
                          color: '#757575',
                          '&.Mui-checked': {
                            color: '#2196f3',
                          },
                        }} 
                      />
                    }
                    label={option}
                    sx={{
                      display: 'flex',
                      width: '100%',
                      m: 0,
                      p: 1,
                      '& .MuiFormControlLabel-label': {
                        fontWeight: selectedOptions[option] ? 'medium' : 'normal',
                      },
                    }}
                  />
                </Paper>
              ))}
            </FormGroup>
          </FormControl>
        </Paper>
      )}

      {/* Assessment Question and Buttons - Only shows if proposed control is visible and feedback box isn't showing yet */}
      {showProposedControl && !showFeedbackBox && (
        <Box sx={{ mb: 3, display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <Typography 
            variant="h6" 
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.2rem',
              marginBottom: '15px',
              textAlign: 'center',
            }}
          >
            Does this control adequately address the provided conern?
          </Typography>
          
          {/* Assessment Buttons */}
          <Grid 
            container 
            spacing={2} 
            sx={{ 
              justifyContent: 'center',
              maxWidth: '800px', // Optional: limit the width for better appearance
            }}
          >
            <Grid item>
              <Button
                variant="contained"
                onClick={() => handleAssessment('ADEQUATE')}
                sx={{ 
                  bgcolor: '#000000', 
                  color: 'white',
                  px: 2,
                  py: 1,
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                  borderRadius: 0,
                }}
              >
                THIS IS AN ADEQUATE CONTROL
              </Button>
            </Grid>
            <Grid item>
              <Button
                variant="contained"
                onClick={() => handleAssessment('INADEQUATE')}
                sx={{ 
                  bgcolor: '#000000', 
                  color: 'white',
                  px: 2,
                  py: 1,
                  fontWeight: 'bold',
                  '&:hover': {
                    bgcolor: '#333333',
                  },
                  borderRadius: 0,
                }}
              >
                THIS IS AN INADEQUATE CONTROL
              </Button>
            </Grid>
          </Grid>
        </Box>
      )}
      
      {/* Submit Button for inadequate assessment - Only shows when multiple choice is visible and not in edit mode */}
      {selectedAssessment === 'INADEQUATE' && showMultipleChoice && !isEditMode && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleSubmit}
            disabled={!hasSelectedOption || !isFinalFeedbackValid}
            sx={{ 
              bgcolor: (hasSelectedOption && isFinalFeedbackValid) ? '#000000' : '#9e9e9e', 
              color: 'white',
              px: 2,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: (hasSelectedOption && isFinalFeedbackValid) ? '#333333' : '#757575',
              },
              borderRadius: 0,
              '&.Mui-disabled': {
                bgcolor: '#9e9e9e',
                color: '#e0e0e0'
              }
            }}
          >
            SUBMIT
          </Button>
        </Box>
      )}
      
      {/* Submit Button for adequate assessment - Only shows when not in edit mode */}
      {selectedAssessment === 'ADEQUATE' && !isEditMode && isFinalFeedbackValid && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 2 }}>
          <Button
            variant="contained"
            onClick={handleAdequateSubmit}
            sx={{ 
              bgcolor: '#000000', // Black button for final submit
              color: 'white',
              px: 2,
              py: 1,
              fontWeight: 'bold',
              '&:hover': {
                bgcolor: '#333333',
              },
              borderRadius: 0,
            }}
          >
            SUBMIT
          </Button>
        </Box>
      )}

      {/* Initial buttons - Only show if appropriate */}
      {!showProposedControl && (
        <Box sx={{ display: 'flex', justifyContent: 'flex-end', mb: 4, mt: 2 }}>
          {!showConcern ? (
            <Button
              variant="contained"
              onClick={handleProblemClick}
              sx={{ 
                bgcolor: '#000000', 
                color: 'white',
                px: 2,
                py: 1,
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#333333',
                },
                borderRadius: 0,
              }}
            >
              THERE&apos;S A PROBLEM!
            </Button>
          ) : (
            <Button
              variant="contained"
              onClick={handleAddressConstraint}
              sx={{ 
                bgcolor: '#000000', 
                color: 'white',
                px: 2,
                py: 1,
                fontWeight: 'bold',
                '&:hover': {
                  bgcolor: '#333333',
                },
                borderRadius: 0,
              }}
            >
              ADDRESS THE CONSTRAINT
            </Button>
          )}
        </Box>
      )}
    </Box>
  );
}

export default function ReviewControlsScreen() {
  return (
    // <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
    <Container >
      <Suspense fallback={<LoadingResults />}>
        <ReviewControls />
      </Suspense>
    </Container>
  )
}