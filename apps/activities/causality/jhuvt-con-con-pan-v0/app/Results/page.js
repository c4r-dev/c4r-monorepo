const logger = require('../../../../../../packages/logging/logger.js');
// Updated ResultsScreen.js with black buttons
'use client';

import React, { useState, useEffect, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Container, 
  Button, 
  ToggleButtonGroup, 
  ToggleButton, 
  ButtonGroup,
  Grid,
  useTheme,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Tooltip,
  FormControl,
  Select,
  MenuItem
} from '@mui/material';
import Avatar from '@mui/material/Avatar';
import { styled } from '@mui/material/styles';
import { useSearchParams, useRouter } from 'next/navigation';

// Function to get card description based on card text
const getCardDescription = (cardText) => {
  switch (cardText) {
    case 'Types of sterilization protocol':
      return 'Each step of the sterilization protocol could introduce factors that may impact neuronal development, such as cross-contamination or the introduction of an unknown growth factor.'
    case 'Incubation Procedure':
      return 'Minor procedural details like the temperature uniformity in the incubator could impact neuronal development.'
    case 'Culture Sourcing':
      return 'It is possible that cultures obtained from a particular species or anatomical region could respond differently from those obtained elsewhere. How would you handle the fact that the source of your culture could impact your results?'
    case 'Evaluation Timing':
      return 'Your cells might well grow more mature the more time they are afforded, and they may even grow at variable rates. If cell growth depends on cultivation period, how would you manage the timing of the evaluation step(s)?'
    case 'Neuroserpin Processing':
      return 'Depending on how the neuroserpin was processed & purified, there may be vehicle or recombinant protein artefacts that could have an effect on neuronal development.'
    case 'Neuron Selection':
      return 'Your cultures will feature many cells, not all of which will be viable for analysis, and it may not be feasible to measure the length of every single axon. Could the way you handle this impact your results?'
    default:
      return 'This card represents an important experimental consideration that requires careful planning and implementation to ensure valid results.'
  }
}

// Custom styled components
const ConcernCard = styled(Paper)(({ theme }) => ({
  backgroundColor: '#4caf50',
  color: 'white',
  padding: theme.spacing(3),
  textAlign: 'center',
  height: 160,
  width: 160,
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  fontWeight: 'bold',
  fontSize: '22px',
  boxShadow: '0px 3px 6px rgba(0,0,0,0.2)',
  marginRight: theme.spacing(2),
  '&:hover': {
    transform: 'scale(1.02)',
    transition: 'transform 0.2s ease',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
}));

const ResponseBubble = styled(Paper)(({ theme, align }) => ({
  backgroundColor: '#9c68c8',
  color: 'white',
  padding: theme.spacing(2),
  paddingLeft: theme.spacing(3),
  paddingRight: theme.spacing(3),
  borderRadius: 16,
  maxWidth: '70%',
  marginBottom: theme.spacing(3),
  position: 'relative',
  alignSelf: align === 'left' ? 'flex-start' : 'flex-end',
}));

const NavButton = styled(Button)(({ theme, color }) => ({
  backgroundColor: color || '#000000',
  color: 'white',
  padding: `${theme.spacing(1)} ${theme.spacing(3)}`,
  borderRadius: 4,
  '&:hover': {
    backgroundColor: color ? '#333333' : '#333333',
  },
}));

const NavigationSection = styled(Box)(({ theme }) => ({
  display: 'flex',
  justifyContent: 'space-between',
  margin: `${theme.spacing(4)} 0`,
}));

// Constants for bin names
const BIN_TYPES = {
  constrain: 'CONSTRAIN',
  distribute: 'DISTRIBUTE',
  test: 'TEST'
};

// Loading component for Suspense
function LoadingResults() {
  return (
    <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
      <CircularProgress />
    </Container>
  );
}

// Main component that uses search params
function ResultsContent() {
  const theme = useTheme();
  const router = useRouter();
  const searchParams = useSearchParams();
  
  const [viewMode, setViewMode] = useState('YOUR LAB');
  const [activeBin, setActiveBin] = useState('constrain');
  const [loading, setLoading] = useState(true);
  const [sessionData, setSessionData] = useState(null);
  const [allSessionsData, setAllSessionsData] = useState(null);
  const [responses, setResponses] = useState([]);
  const [concerns, setConcerns] = useState([]);
  const [currentConcernIndex, setCurrentConcernIndex] = useState(0);
  const [error, setError] = useState(null);
  const [debug, setDebug] = useState('');
  const [selectedConcernId, setSelectedConcernId] = useState('');

  // Get sessionId and studentId from URL
  const sessionId = searchParams.get('sessionId');
  const studentId = searchParams.get('studentId');

  // Get the current concern based on index
  const currentConcern = concerns[currentConcernIndex] || {};

  // Debugging function to help diagnose issues
  // Generate dynamic header text based on selections
  const getHeaderText = () => {
    const viewText = viewMode === 'YOUR LAB' ? 'Your Lab' : 'Everyone';
    const binText = activeBin.charAt(0).toUpperCase() + activeBin.slice(1);
    return `Responses by ${viewText} for ${binText}`;
  };

  const debugData = () => {
    logger.app.info("-------- DEBUG DATA --------");
    logger.app.info("SessionId from URL:", sessionId);
    logger.app.info("StudentId from URL:", studentId);
    logger.app.info("Current Concern:", currentConcern);
    logger.app.info("Active Bin:", activeBin);
    
    if (sessionData && sessionData.session) {
      let foundStudent = false;
      let foundResponse = false;
      
      sessionData.session.sections.forEach(section => {
        section.students.forEach(student => {
          if (student.studentId === studentId) {
            logger.app.info("Found student in data:", student.studentId);
            foundStudent = true;
            
            if (student.concernResponses) {
              student.concernResponses.forEach(response => {
                logger.app.info(`Response for ${response.cardText} in bin ${response.binAssignment}:`, response);
                
                if (response.cardText === currentConcern.cardText && 
                    response.binAssignment === activeBin) {
                  logger.app.info("MATCH FOUND! Implementation:", response.implementation?.implementationText);
                  foundResponse = true;
                }
              });
            }
          }
        });
      });
      
      logger.app.info("Found student in data:", foundStudent);
      logger.app.info("Found matching response:", foundResponse);
    }
    
    logger.app.info("-------- END DEBUG --------");
  };

  useEffect(() => {
    if (!sessionId) {
      setError('Session ID is missing from URL');
      setLoading(false);
      return;
    }
    
    // Fetch session data
    const fetchSessionData = async () => {
      try {
        setLoading(true);
        logger.app.info("Fetching data for sessionId:", sessionId);
        
        let data = null;
        
        try {
          // Import the API utility function
          const { apiCall } = await import('../lib/api');
          
          // For current session data
          const response = await apiCall(`/api/concerns/${sessionId}`);
          if (response.ok) {
            data = await response.json();
            logger.app.info("Data fetched from API:", data);
          } else {
            logger.app.error("API error - Status:", response.status);
            setError(`Failed to fetch data from API: ${response.status}`);
            setLoading(false);
            return;
          }
          
          // Fetch all sessions data (for EVERYONE tab)
          const allSessionsResponse = await apiCall(`/api/concerns`);
          if (allSessionsResponse.ok) {
            const allSessionsData = await allSessionsResponse.json();
            logger.app.info("All sessions data fetched");
            // Set to global state for use in EVERYONE tab
            setAllSessionsData(allSessionsData);
          } else {
            logger.app.error("All sessions API error:", allSessionsResponse.status);
            setError(`Failed to fetch all sessions data: ${allSessionsResponse.status}`);
          }
        } catch (err) {
          logger.app.error("Network error during fetch:", err);
          setError('Network error while fetching data. Please check your connection.');
          setLoading(false);
          return;
        }
        
        if (!data || !data.session) {
          logger.app.error("No valid session data returned from API");
          setError('No valid session data returned from API');
          setLoading(false);
          return;
        }
        
        setSessionData(data);
        
        // Extract unique concerns
        if (data.session && data.session.sections) {
          const uniqueConcerns = [];
          const uniqueConcernIds = new Set();
          
          // Go through all sections and students
          data.session.sections.forEach(section => {
            section.students.forEach(student => {
              if (student.concernResponses && student.concernResponses.length > 0) {
                // Look for unique concerns
                student.concernResponses.forEach(concern => {
                  if (!uniqueConcernIds.has(concern.cardId)) {
                    uniqueConcernIds.add(concern.cardId);
                    uniqueConcerns.push({
                      cardId: concern.cardId,
                      cardText: concern.cardText
                    });
                  }
                });
              }
            });
          });
          
          // Sort by cardId
          uniqueConcerns.sort((a, b) => a.cardId - b.cardId);
          logger.app.info("Extracted concerns:", uniqueConcerns);
          
          if (uniqueConcerns.length === 0) {
            logger.app.warn("No concerns found in the data");
          }
          
          setConcerns(uniqueConcerns);
          
          // Set initial values
          if (uniqueConcerns.length > 0) {
            // Default to first concern and constrain bin
            setCurrentConcernIndex(0);
            setActiveBin('constrain');
            setSelectedConcernId(uniqueConcerns[0].cardId.toString());
            
            // Find responses for this initial combination
            const initialResponses = findFilteredResponses(uniqueConcerns[0].cardText, 'constrain', data);
            logger.app.info("Initial responses:", initialResponses);
            setResponses(initialResponses);
          }
        }
        
        setLoading(false);
        
        // Run debug after loading
        setTimeout(() => {
          debugData();
        }, 1000);
        
      } catch (error) {
        logger.app.error('Error:', error);
        setError('Failed to load data. Please try again.');
        setLoading(false);
      }
    };
    
    fetchSessionData();
  }, [sessionId]);

  // Function to find responses filtered by sessionId, studentId, concernText and binType
  const findFilteredResponses = (concernText, binType, data = null) => {
    logger.app.info(`Finding responses for concern "${concernText}" and bin "${binType}" for student "${studentId}" in session "${sessionId}"`);
    
    const matchingResponses = [];
    const dataToUse = data || sessionData;
    
    if (!dataToUse || !dataToUse.session) {
      logger.app.error("No session data available to filter");
      return [];
    }
    
    if (viewMode === 'YOUR LAB') {
      logger.app.info("Filtering in YOUR LAB mode");
      
      // Filter responses by sessionId, studentId, concernText, and binType
      dataToUse.session.sections.forEach((section) => {
        section.students.forEach((student) => {
          // Check if this is the student we're looking for (if specified)
          if (studentId && student.studentId !== studentId) {
            return; // Skip this student if it doesn't match
          }
          
          if (!student.concernResponses || student.concernResponses.length === 0) {
            return;
          }
          
          // Find matching responses based on concern text and bin assignment
          student.concernResponses.forEach(response => {
            if (response.cardText === concernText && 
                response.binAssignment === binType) {
              
              logger.app.info(`Found match for student ${student.studentId}:`, response);
              
              matchingResponses.push({
                studentId: student.studentId,
                text: response.implementation?.implementationText || 'No text provided',
                sessionId: dataToUse.session.sessionId
              });
            }
          });
        });
      });
    } else {
      // EVERYONE mode: Find responses from all sessions
      logger.app.info("Filtering in EVERYONE mode");
      const allData = allSessionsData || { sessions: [] };
      
      allData.sessions?.forEach(session => {
        const currentSessionId = session.sessionId;
        
        // Go through all sections in each session
        session.sections?.forEach(section => {
          // Go through all students
          section.students?.forEach(student => {
            if (student.concernResponses && student.concernResponses.length > 0) {
              // Find matching responses
              student.concernResponses.forEach(response => {
                if (response.cardText === concernText && 
                    response.binAssignment === binType) {
                  
                  matchingResponses.push({
                    studentId: student.studentId,
                    text: response.implementation?.implementationText || 'No text provided',
                    sessionId: currentSessionId
                  });
                }
              });
            }
          });
        });
      });
    }
    
    logger.app.info(`Found ${matchingResponses.length} responses`, matchingResponses);
    return matchingResponses;
  };

  // Handler for bin change
  const handleBinChange = (newBin) => {
    logger.app.info("Changing bin to:", newBin);
    setActiveBin(newBin);
    
    // Update responses for the new bin
    if (currentConcern && currentConcern.cardText) {
      const newResponses = findFilteredResponses(currentConcern.cardText, newBin);
      setResponses(newResponses);
    }
  };
  
  // Handler for view mode change
  const handleViewModeChange = (event, newMode) => {
    if (newMode !== null) {
      logger.app.info("Changing view mode to:", newMode);
      setViewMode(newMode);
      
      // Update responses for the new mode
      if (currentConcern && currentConcern.cardText) {
        const newResponses = findFilteredResponses(currentConcern.cardText, activeBin);
        setResponses(newResponses);
      }
    }
  };
  
  // Navigate to previous concern
  const navigateToPreviousConcern = () => {
    if (currentConcernIndex > 0) {
      const newIndex = currentConcernIndex - 1;
      logger.app.info("Navigating to previous concern, index:", newIndex);
      setCurrentConcernIndex(newIndex);
      
      // Update responses for the new concern
      const newConcern = concerns[newIndex];
      if (newConcern && newConcern.cardText) {
        setSelectedConcernId(newConcern.cardId.toString());
        const newResponses = findFilteredResponses(newConcern.cardText, activeBin);
        setResponses(newResponses);
      }
    }
  };
  
  // Navigate to next concern
  const navigateToNextConcern = () => {
    if (currentConcernIndex < concerns.length - 1) {
      const newIndex = currentConcernIndex + 1;
      logger.app.info("Navigating to next concern, index:", newIndex);
      setCurrentConcernIndex(newIndex);
      
      // Update responses for the new concern
      const newConcern = concerns[newIndex];
      if (newConcern && newConcern.cardText) {
        setSelectedConcernId(newConcern.cardId.toString());
        const newResponses = findFilteredResponses(newConcern.cardText, activeBin);
        setResponses(newResponses);
      }
    }
  };
  
// Check if previous or next buttons should be disabled based on card ID
const isPreviousButtonDisabled = () => {
  return currentConcern.cardId === 1;
};

const isNextButtonDisabled = () => {
  return currentConcern.cardId === 6;
};
  
  // Navigate back to list
  const navigateToList = () => {
    router.push(`/concerns?sessionId=${sessionId}${studentId ? `&studentId=${studentId}` : ''}`);
  };

  // When current concern or bin changes, update responses
  useEffect(() => {
    if (currentConcern && currentConcern.cardText && sessionData) {
      logger.app.info("Updating responses due to concern/bin/data change");
      const newResponses = findFilteredResponses(currentConcern.cardText, activeBin);
      setResponses(newResponses);
    }
  }, [currentConcern, activeBin, sessionData, allSessionsData, viewMode]);

  // Quick-debug button
  const handleDebugClick = () => {
    debugData();
    alert("Debug info printed to console - check browser developer tools");
  };

  // Handle manual concern selection from dropdown
  const handleConcernSelection = (event) => {
    const concernId = event.target.value;
    setSelectedConcernId(concernId);
    
    // Find the concern index based on the selected concern ID
    const concernIndex = concerns.findIndex(concern => concern.cardId === parseInt(concernId));
    if (concernIndex !== -1) {
      setCurrentConcernIndex(concernIndex);
      
      // Update responses for the selected concern
      const selectedConcern = concerns[concernIndex];
      if (selectedConcern && selectedConcern.cardText) {
        const newResponses = findFilteredResponses(selectedConcern.cardText, activeBin);
        setResponses(newResponses);
      }
    }
  };

  if (loading) {
    return (
      <Container sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Container>
    );
  }

  if (error) {
    return (
      <Container sx={{ py: 4, pt: '100px' }}>
        <Paper sx={{ p: 3, backgroundColor: '#fff0f0', borderRadius: 2 }}>
          <Typography variant="h6" color="error">
            Error: {error}
          </Typography>
        </Paper>
      </Container>
    );
  }

  return (
    <Container maxWidth="md" sx={{ py: 4, pt: '100px' }}>
      <Paper 
        elevation={1} 
        sx={{ 
          p: 3, 
          backgroundColor: '#f5f5f5', 
          borderRadius: 2, 
          mb: 4,
          border: '1px solid black'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Typography variant="h5" component="h2" sx={{ fontWeight: 'bold' }}>
              Results 
              {/* {studentId ? `for Student: ${studentId}` : ''} */}
            </Typography>
            
            <FormControl size="small" sx={{ minWidth: 200 }}>
              <Select
                value={selectedConcernId}
                onChange={handleConcernSelection}
                displayEmpty
                sx={{
                  backgroundColor: 'white',
                  '& .MuiSelect-select': {
                    padding: '8px 14px',
                  },
                }}
              >
                <MenuItem value="" disabled>
                  Select a concern
                </MenuItem>
                {concerns.map((concern) => (
                  <MenuItem key={concern.cardId} value={concern.cardId.toString()}>
                    {concern.cardText}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Box>
          
          {/* Debug button - can be removed in production */}
          {/* <Button 
            variant="outlined" 
            size="small" 
            onClick={handleDebugClick}
            sx={{ display: process.env.NODE_ENV === 'production' ? 'none' : 'block' }}
          >
            Debug
          </Button> */}
        </Box>
        
        <Box sx={{ display: 'flex', mb: 3 }}>
          <Tooltip
            title={currentConcern.cardText ? getCardDescription(currentConcern.cardText) : 'No concern selected'}
            placement="right"
            arrow
            componentsProps={{
              tooltip: {
                sx: {
                  bgcolor: 'rgba(0, 0, 0, 0.9)',
                  color: 'white',
                  fontSize: '14px',
                  maxWidth: '300px',
                  padding: '12px',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                }
              },
              arrow: {
                sx: {
                  color: 'rgba(0, 0, 0, 0.9)',
                }
              }
            }}
          >
            <ConcernCard sx={{ cursor: 'help' }}>
              {currentConcern.cardText || 'No concern selected'}
            </ConcernCard>
          </Tooltip>
          <Box sx={{ ml: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Below you can compare different methods for addressing this concern.
            </Typography>
            
            {/* View Mode Toggle */}
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={handleViewModeChange}
              aria-label="view mode"
              sx={{ mb: 2, width: '100%' }}
            >
              <ToggleButton 
                value="YOUR LAB" 
                aria-label="your lab"
                className={viewMode === 'YOUR LAB' ? 'button-primary' : 'button-secondary'}
                style={{ flex: 1 }}
              >
                Your Session
              </ToggleButton>
              <ToggleButton 
                value="EVERYONE" 
                aria-label="everyone"
                className={viewMode === 'EVERYONE' ? 'button-primary' : 'button-secondary'}
                style={{ flex: 1 }}
              >
                EVERYONE
              </ToggleButton>
            </ToggleButtonGroup>
          
            {/* Bin Toggle */}
            <ButtonGroup variant="contained" sx={{ width: '100%' }}>
              <Tooltip
                title="Decrease a variable's influence by limiting its range."
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      fontSize: '14px',
                      maxWidth: '300px',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }
                  },
                  arrow: {
                    sx: {
                      color: 'rgba(0, 0, 0, 0.9)',
                    }
                  }
                }}
              >
                <Button 
                  className={activeBin === 'constrain' ? 'button-primary' : 'button-secondary'}
                  style={{ flex: 1 }}
                  onClick={() => handleBinChange('constrain')}
                >
                  {BIN_TYPES.constrain}
                </Button>
              </Tooltip>
              <Tooltip
                title="Decrease a variable's influence by making it as equal as possible across groups."
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      fontSize: '14px',
                      maxWidth: '300px',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }
                  },
                  arrow: {
                    sx: {
                      color: 'rgba(0, 0, 0, 0.9)',
                    }
                  }
                }}
              >
                <Button 
                  className={activeBin === 'distribute' ? 'button-primary' : 'button-secondary'}
                  style={{ flex: 1 }}
                  onClick={() => handleBinChange('distribute')}
                >
                  {BIN_TYPES.distribute}
                </Button>
              </Tooltip>
              <Tooltip
                title="Use the variable to make comparison groups or adjust for effect during analysis."
                placement="top"
                arrow
                componentsProps={{
                  tooltip: {
                    sx: {
                      bgcolor: 'rgba(0, 0, 0, 0.9)',
                      color: 'white',
                      fontSize: '14px',
                      maxWidth: '300px',
                      padding: '12px',
                      borderRadius: '8px',
                      boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
                    }
                  },
                  arrow: {
                    sx: {
                      color: 'rgba(0, 0, 0, 0.9)',
                    }
                  }
                }}
              >
                <Button 
                  className={activeBin === 'test' ? 'button-primary' : 'button-secondary'}
                  style={{ flex: 1 }}
                  onClick={() => handleBinChange('test')}
                >
                  {BIN_TYPES.test}
                </Button>
              </Tooltip>
            </ButtonGroup>
          </Box>
        </Box>
        
        {/* Student Responses Table */}
        <Paper 
          elevation={1} 
          sx={{ 
            backgroundColor: 'white', 
            borderRadius: 1,
            overflow: 'hidden',
            border: '1px solid #e0e0e0',
            mb: 3
          }}
        >
          {viewMode === 'YOUR LAB' ? (
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table sx={{ minWidth: 650 }} size="medium" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '100%', p: 2, fontSize: '1rem' }}>{getHeaderText()}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.length > 0 ? (
                  responses.map((response, index) => (
                    <TableRow key={`${response.studentId}-${index}`}>
                      <TableCell sx={{ p: 2, verticalAlign: 'top', border: '1px solid #e0e0e0' }}>
                        <Box sx={{ 
                          display: 'inline-block',
                          backgroundColor: '#e8f5e9', 
                          p: 1, 
                          borderRadius: 1,
                          width: '100%'
                        }}>
                          {response.text}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={1} sx={{ textAlign: 'center', p: 3 }}>
                      {studentId ? 
                        `No responses found for "${currentConcern.cardText}" in bin "${activeBin.toUpperCase()}" for student ${studentId}` :
                        `No responses found for "${currentConcern.cardText}" in bin "${activeBin.toUpperCase()}"`
                      }
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </TableContainer>
          ) : (
            <TableContainer sx={{ maxHeight: 400, overflow: 'auto' }}>
              <Table sx={{ minWidth: 650 }} size="medium" stickyHeader>
              <TableHead>
                <TableRow sx={{ backgroundColor: '#e0e0e0' }}>
                  <TableCell sx={{ fontWeight: 'bold', width: '100%', p: 2, fontSize: '1rem' }}>{getHeaderText()}</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {responses.length > 0 ? (
                  responses.map((response, index) => (
                    <TableRow key={`${response.studentId}-${response.sessionId}-${index}`}>
                      <TableCell sx={{ p: 2, verticalAlign: 'top', border: '1px solid #e0e0e0' }}>
                        <Box sx={{ 
                          display: 'inline-block',
                          backgroundColor: '#e8f5e9', 
                          p: 1, 
                          borderRadius: 1,
                          width: '100%'
                        }}>
                          {response.text}
                        </Box>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={1} sx={{ textAlign: 'center', p: 3 }}>
                      No responses found for &quot;{currentConcern.cardText}&quot; in bin &quot;{activeBin.toUpperCase()}&quot; across all sessions
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
            </TableContainer>
          )}
        </Paper>
      </Paper>
      
      {/* Navigation Buttons */}
      <NavigationSection>
        <NavButton 
          onClick={navigateToPreviousConcern}
          disabled={isPreviousButtonDisabled()}
          className="button-navigation"
        >
          PREVIOUS CONCERN
        </NavButton>
        {/* <NavButton 
          variant="contained"
          onClick={navigateToList}
          style={{ backgroundColor: '#000000', color: 'white' }}
          sx={{ '&:hover': { backgroundColor: '#333333' } }}
        >
          RETURN TO LIST
        </NavButton> */}
        <NavButton 
          onClick={navigateToNextConcern}
          disabled={isNextButtonDisabled()}
          className="button-navigation"
        >
          NEXT CONCERN
        </NavButton>
      </NavigationSection>
    </Container>
  );
}

// Wrapper component with Suspense
const ResultsScreen = () => {
  return (
    <Suspense fallback={<LoadingResults />}>
      <ResultsContent />
    </Suspense>
  );
};

export default ResultsScreen;