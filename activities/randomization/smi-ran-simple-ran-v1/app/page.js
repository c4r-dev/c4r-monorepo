'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useDrag, useDrop, DndProvider } from 'react-dnd'
import { HTML5Backend } from 'react-dnd-html5-backend'
import {
  Box,
  Grid,
  Paper,
  Typography,
  Button,
  TextField,
  Alert,
  Snackbar,
  Fade,
  Badge,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from '@mui/material'
import CheckCircleIcon from '@mui/icons-material/CheckCircle'
import ErrorIcon from '@mui/icons-material/Error'
import SwapHorizIcon from '@mui/icons-material/SwapHoriz'
import InfoIcon from '@mui/icons-material/Info'
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward'
import AutoGraphIcon from '@mui/icons-material/AutoGraph'
import Header from './components/Header/Header' // Original Header import
import CustomButton from './components/CustomButton/CustomButton'
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup' // Import the SessionConfigPopup component

// Define the ClientOnlyHeader component
const ClientOnlyHeader = (props) => {
  const [isMounted, setIsMounted] = useState(false)

  useEffect(() => {
    setIsMounted(true)
  }, [])

  if (!isMounted) {
    // Return a placeholder with similar dimensions to avoid layout shift
    return (
      <div
        style={{
          width: '100%',
          height: '80px',
          backgroundColor: '#f8f8f8',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <div
          style={{
            fontSize: '1.5rem',
            fontWeight: 'bold',
            textAlign: 'center',
            padding: '0 20px',
          }}
        >
          {props.text || 'NMDA Study Task Assignment'}
        </div>
      </div>
    )
  }

  // Once component is mounted (client-side only), render the actual Header
  return <Header {...props} />
}

// Define feedback messages for each task and team combination
const taskFeedback = {
  'Generate Random Treatment Allocation': {
    A:
      '✅ Team A handles randomization to ensure proper blinding. This prevents any bias in treatment assignment and maintains the integrity of the blinding process.',
    B:
      '❗️ This task should be done by Team A. The team performing the experiments (Team B) must remain blinded to treatment assignments to prevent bias.',
  },
  'Prepare Coded Syringes with Drug or Vehicle': {
    A:
      '✅ Team A prepares and codes all treatments to maintain blinding. This ensures Team B cannot identify which treatment each animal receives.',
    B:
      '❗️ This task should be done by Team A. If Team B prepared the treatments, they would know the treatment assignments and compromise the blinding.',
  },
  'Record Maze Performance and Behavioral Data': {
    A:
      '❗️ This task should be done by Team B. They conduct all experimental procedures while remaining blinded to prevent bias in data collection.',
    B:
      '✅ Team B conducts and records all experimental procedures while remaining blinded to treatment assignments. This prevents experimenter bias from affecting the results.',
  },
}

const ItemType = {
  BOX: 'box',
}

// Task List (Fixed Order)
const taskList = [
  'Generate Random Treatment Allocation',
  'Prepare Coded Syringes with Drug or Vehicle',
  'Record Maze Performance and Behavioral Data',
]

// Modified Draggable Box Component
const DraggableBox = ({ text, isDraggable = true, onDragStart, onDragEnd }) => {
  const [{ isDragging }, drag] = useDrag(() => ({
    type: ItemType.BOX,
    item: () => {
      // Call onDragStart before returning the item
      if (onDragStart) onDragStart(text);
      return { text };
    },
    canDrag: isDraggable,
    end: (item, monitor) => {
      if (onDragEnd) onDragEnd();
    },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  }));

  return (
    <Paper
      ref={drag}
      sx={{
        bgcolor: '#F5F5F5',
        color: 'black',
        p: 2,
        textAlign: 'center',
        cursor: isDraggable ? 'grab' : 'not-allowed',
        opacity: isDragging ? 0.5 : 1,
        border: '1px dashed black',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        fontWeight: 'bold',
      }}
    >
      {text}
    </Paper>
  );
};

// Arrow Component for connecting flowchart boxes
const Arrow = ({ visible, direction = 'down', color = '#555', sx = {} }) => {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        opacity: visible ? 1 : 0,
        transition: 'opacity 0.5s ease-in-out',
        height: direction === 'down' ? 30 : 20,
        ...sx,
      }}
    >
      {direction === 'down' && (
        <ArrowDownwardIcon sx={{ color, fontSize: 30 }} />
      )}
      {direction === 'right' && (
        <Box
          sx={{
            width: '100%',
            height: 2,
            bgcolor: color,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              right: 0,
              top: -4,
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderLeft: `10px solid ${color}`,
              borderBottom: '5px solid transparent',
            }}
          />
        </Box>
      )}
      {direction === 'left' && (
        <Box
          sx={{
            width: '100%',
            height: 2,
            bgcolor: color,
            position: 'relative',
          }}
        >
          <Box
            sx={{
              position: 'absolute',
              left: 0,
              top: -4,
              width: 0,
              height: 0,
              borderTop: '5px solid transparent',
              borderRight: `10px solid ${color}`,
              borderBottom: '5px solid transparent',
            }}
          />
        </Box>
      )}
    </Box>
  )
}

// Modified Drop Area Component
const DropArea = ({
  onDrop,
  bgcolor,
  boxInDropZone,
  defaultText,
  zoneId,
  onSubmitResponse,
  savedResponse,
  team,
  showDropNotification,
  expectedTask,
  isFlowchart,
  taskNumber,
  moveCount,
  maxMoves,
  hasSubmitted,
  canMove,
  responses,
  currentDraggedTask, // Add this to track the current dragged task
  handleDragStart,
  handleDragEnd
}) => {
  // Determine if this drop zone should be disabled for the current dragged task
  const isWrongTaskForZone = currentDraggedTask && currentDraggedTask !== expectedTask;
  
  const [{ isOver, canDrop }, drop] = useDrop(
    () => ({
      accept: ItemType.BOX,
      canDrop: (item) => {
        // Only allow dropping if the task matches the expected task for this section
        return item.text === expectedTask;
      },
      drop: (item) => {
        // Since canDrop handles the task matching, we don't need to check again
        // But we still need to check move limits if the task has been submitted
        if (hasSubmitted && !canMove) {
          showDropNotification(team, item.text, true); // Move limit reached
          return;
        }

        // If all checks pass, allow the drop
        onDrop(item.text, true, taskNumber, team); 
        showDropNotification(team, item.text); // Show notification when item is dropped
        
        // Only show the form if this is a new drop OR it's a reassignment after submission
        const currentResponseKey = team === 'A' ? `task${taskNumber}A` : `task${taskNumber}B`;
        const noExistingResponse = !responses[currentResponseKey];
        
        // Before submission, always show the form
        // After submission, only show it for new responses
        setShowForm(hasSubmitted ? noExistingResponse : true);
      },
      collect: (monitor) => ({
        isOver: monitor.isOver(),
        canDrop: monitor.canDrop(),
      }),
    }),
    [boxInDropZone, canMove, hasSubmitted, responses, expectedTask, currentDraggedTask],
  );

  const [whyResponse, setWhyResponse] = useState(savedResponse || '');
  const [showForm, setShowForm] = useState(!savedResponse);
  const [showFeedback, setShowFeedback] = useState(false);

  // Define button color based on the team/dropzone
  const buttonColor = team === 'A' ? '#4CAF50' : '#1976D2';
  const buttonHoverColor = team === 'A' ? '#3b8a3d' : '#1565c0';

  useEffect(() => {
    if (boxInDropZone) {
      // Only show the form when there's no saved response yet
      const currentResponseKey = team === 'A' ? `task${taskNumber}A` : `task${taskNumber}B`;
      const noExistingResponse = !responses[currentResponseKey];
      
      // Before submission, always show the form
      // After submission, only show for new responses
      setShowForm(hasSubmitted ? noExistingResponse : true);
      setWhyResponse(savedResponse || '');
    }
  }, [boxInDropZone, savedResponse, hasSubmitted, responses, team, taskNumber]);

  const handleSubmit = () => {
    if (!boxInDropZone) return;

    if (whyResponse.trim() === '') {
      onSubmitResponse(
        zoneId,
        whyResponse,
        false,
        team,
        boxInDropZone,
        taskNumber,
      );
      return;
    }

    onSubmitResponse(zoneId, whyResponse, true, team, boxInDropZone, taskNumber);
    setShowForm(false);
    setShowFeedback(true);

    setTimeout(() => {
      setShowFeedback(false);
    }, 3000);
  };

  // Calculate remaining moves for display
  const remainingMoves = hasSubmitted ? maxMoves - moveCount : null;

  // Determine background color based on drag state
  let dropZoneBgColor = bgcolor;
  
  // Grey out the drop zone if it's the wrong task (when something is being dragged)
  if (isWrongTaskForZone && currentDraggedTask) {
    dropZoneBgColor = '#cccccc'; // Grey out color
  } else if (isOver && !canDrop) {
    dropZoneBgColor = '#ffcccc'; // Light red to indicate invalid drop
  } else if (isOver && canDrop) {
    dropZoneBgColor = '#ccffcc'; // Light green to indicate valid drop
  }

  return (
    <Paper
      ref={drop}
      sx={{
        bgcolor: dropZoneBgColor,
        color: isWrongTaskForZone ? '#999999' : 'white', // Grey out text if wrong task
        p: 2,
        textAlign: 'center',
        border: isOver 
          ? (canDrop ? '2px dashed green' : '2px dashed red') 
          : 'none',
        minHeight: 80,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        zIndex: 1,
        opacity: isWrongTaskForZone ? 0.5 : 1, // Reduce opacity for wrong tasks
        cursor: isWrongTaskForZone ? 'not-allowed' : 'default',
        transition: 'all 0.3s ease',
      }}
    >
      {boxInDropZone ? (
        <Box sx={{ width: '100%', position: 'relative' }}>
          {/* Show remaining moves indicator only after submission */}
          {/* {hasSubmitted && remainingMoves !== null && (
            <Chip
              color={remainingMoves > 0 ? 'success' : 'error'}
              label={
                remainingMoves > 0
                  ? `${remainingMoves} moves left`
                  : 'No moves left'
              }
              size="small"
              sx={{
                position: 'absolute',
                top: -10,
                right: -10,
                zIndex: 2,
                fontSize: '0.7rem',
              }}
            />
          )} */}

          <DraggableBox
            text={boxInDropZone}
            isDraggable={true}
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
          />

          {!isFlowchart && showForm && (
            <>
              <TextField
                label={hasSubmitted ? "Why did you reassign this task?" : "Why did you assign this task to this team?"}
                variant="outlined"
                fullWidth
                margin="normal"
                value={whyResponse}
                onChange={(e) => setWhyResponse(e.target.value)}
                multiline
                rows={2}
                sx={{
                  mt: 2,
                  bgcolor: 'white',
                  '& .MuiOutlinedInput-root': {
                    '& fieldset': {
                      borderColor: 'white',
                    },
                    '&:hover fieldset': {
                      borderColor: 'white',
                    },
                    '&.Mui-focused fieldset': {
                      borderColor: 'white',
                    },
                  },
                  '& .MuiFormLabel-root': {
                    color: 'black',
                  },
                  '& .MuiInputBase-input': {
                    color: 'black',
                  },
                }}
              />
              <Button
                variant="contained"
                onClick={handleSubmit}
                sx={{
                  mt: 1,
                  bgcolor: buttonColor,
                  '&:hover': {
                    bgcolor: buttonHoverColor,
                  },
                }}
                fullWidth
              >
                {hasSubmitted ? "Submit Reassignment Reason" : "Submit"}
              </Button>
            </>
          )}

          <Fade in={showFeedback}>
            <Box
              sx={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                bgcolor: 'rgba(255, 255, 255, 0.9)',
                borderRadius: '50%',
                p: 2,
                zIndex: 5,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
              }}
            >
              <CheckCircleIcon sx={{ fontSize: 60, color: 'success.main' }} />
            </Box>
          </Fade>
        </Box>
      ) : (
        // Add visual indicator when wrong task is being dragged
        <Typography sx={{ fontStyle: isWrongTaskForZone ? 'italic' : 'normal' }}>
          {isWrongTaskForZone ? (
            <>
              <span style={{ color: '#ff6b6b' }}>Wrong Task Section</span>
              <br />
              <span style={{ fontSize: '0.8rem' }}>
                This is for &quot;{expectedTask}&quot; only
              </span>
            </>
          ) : (
            defaultText
          )}
        </Typography>
      )}
    </Paper>
  );
};

// Results Table Component
const ResultsTable = ({ data, taskList, onRestart }) => {
  const [tabValue, setTabValue] = useState(0)

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue)
  }

  if (!data || !data.moveHistory) {
    return (
      <Box sx={{ textAlign: 'center', py: 4 }}>
        <Typography>Loading results...</Typography>
      </Box>
    )
  }

  const getCurrentTaskData = () => {
    const taskKey = `task${tabValue + 1}`
    const taskData = data.moveHistory[taskKey] || []
    logger.app.info(`Task ${tabValue + 1} data:`, taskData)
    if (taskData.length > 0) {
      logger.app.info('First move structure:', taskData[0])
      logger.app.info('Keys in first move:', Object.keys(taskData[0]))
    }
    return taskData
  }

  return (
    <Box sx={{ width: '100%', mt: 3 }}>
      <Box sx={{ textAlign: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ mb: 1 }}>
          Task Assignment Results
        </Typography>
      </Box>
      
      <Tabs 
        value={tabValue} 
        onChange={handleTabChange} 
        variant="fullWidth"
        sx={{ 
          borderBottom: 1, 
          borderColor: 'divider', 
          mb: 2,
          '& .MuiTab-root': {
            backgroundColor: '#f5f5f5',
            color: '#666',
            fontWeight: 'normal',
            border: '3px solid #ddd',
            borderBottom: 'none',
            borderRadius: '8px 8px 0 0',
            '&.Mui-selected': {
              backgroundColor: '#999',
              color: 'white',
              fontWeight: 'bold'
            }
          }
        }}
      >
        {taskList.map((task, index) => (
          <Tab 
            key={index} 
            label={`Task ${index + 1}`}
          />
        ))}
      </Tabs>

      <Paper elevation={3} sx={{ borderRadius: 2 }}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" sx={{ mb: 2, color: '#6e00ff' }}>
            {taskList[tabValue]}
          </Typography>
          
          <TableContainer sx={{ 
            maxHeight: 300, 
            borderRadius: 2,
            border: '3px solid #ddd'
          }}>
            <Table stickyHeader sx={{ borderRadius: 2 }}>
              <TableHead>
                <TableRow>
                  {data.aggregated && (
                    <TableCell sx={{ 
                      fontWeight: 'bold', 
                      color: 'white',
                      bgcolor: '#888',
                      border: '3px solid #ddd',
                      width: '120px',
                      position: 'sticky',
                      top: 0,
                      zIndex: 100
                    }}>
                      Session ID
                    </TableCell>
                  )}
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    bgcolor: '#888',
                    border: '3px solid #ddd',
                    width: '100px',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                  }}>
                    Move #
                  </TableCell>
                  <TableCell sx={{ 
                    fontWeight: 'bold', 
                    color: 'white',
                    bgcolor: '#888',
                    border: '3px solid #ddd',
                    width: 'auto',
                    position: 'sticky',
                    top: 0,
                    zIndex: 100
                  }}>
                    Rationale
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {getCurrentTaskData().map((move, index) => (
                  <TableRow key={index} sx={{ bgcolor: '#b3b3b3' }}>
                    {data.aggregated && (
                      <TableCell sx={{ 
                        border: '3px solid #ddd',
                        width: '120px'
                      }}>
                        <Typography variant="body2" sx={{ color: '#333', fontSize: '0.75rem' }}>
                          {move.sessionId ? move.sessionId.split('_')[1] : 'N/A'}
                        </Typography>
                      </TableCell>
                    )}
                    <TableCell sx={{ 
                      border: '3px solid #ddd',
                      width: '100px'
                    }}>
                      <Typography sx={{ color: '#333' }}>
                        {move.moveNumber || 'No moveNumber'}
                      </Typography>
                    </TableCell>
                    <TableCell sx={{ 
                      border: '3px solid #ddd',
                      width: 'auto'
                    }}>
                      <Typography variant="body2" sx={{ color: '#333' }}>
                        {move.selectedReason || 'No selectedReason'}
                      </Typography>
                    </TableCell>
                  </TableRow>
                ))}
                {getCurrentTaskData().length === 0 && (
                  <TableRow sx={{ bgcolor: '#b3b3b3' }}>
                    <TableCell colSpan={data.aggregated ? 3 : 2} sx={{ 
                      textAlign: 'center', 
                      py: 3,
                      border: '3px solid #ddd'
                    }}>
                      <Typography sx={{ color: '#333' }}>
                        No data available for this task
                      </Typography>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Box>
      </Paper>
      
      <Box sx={{ textAlign: 'center', mt: 3 }}>
        <CustomButton
          onClick={onRestart}
          ariaLabel="Start over button"
          disabled={false}
          variant="purple"
          customStyles={{}}
          className=""
        >
          START OVER
        </CustomButton>
      </Box>
    </Box>
  )
}

// Add a Client Component wrapper to handle hydration issues
const ClientOnlyComponent = ({ children }) => {
  const [mounted, setMounted] = useState(false)
  
  useEffect(() => {
    setMounted(true)
  }, [])
  
  if (!mounted) {
    return null // Return null or a simple placeholder on server-side
  }
  
  return <>{children}</>
}

function App() {
  // Generate a unique session ID
  const [sessionId, setSessionId] = useState('')
  const [showConfigPopup, setShowConfigPopup] = useState(false)
  const [sessionData, setSessionData] = useState({
    moveHistory: {
      task1: [],
      task2: [],
      task3: []
    },
    finalState: {
      task1: {},
      task2: {},
      task3: {}
    }
  });

  useEffect(() => {
    // Update the document title initially
    document.title = 'NMDA Study Task Assignment'
    
    // Add event listener for when the page becomes visible again
    // This handles cases when user switches back to this tab
    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        document.title = 'NMDA Study Task Assignment'
      }
    }
    
    // Add event listener for focus events
    // This handles cases when user clicks on the tab
    const handleFocus = () => {
      document.title = 'NMDA Study Task Assignment'
    }
    
    // Register the event listeners
    document.addEventListener('visibilitychange', handleVisibilityChange)
    window.addEventListener('focus', handleFocus)
    
    // Clean up the event listeners when component unmounts
    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange)
      window.removeEventListener('focus', handleFocus)
    }
  }, []) 

  // Check for existing sessionID in URL or generate a new one
  useEffect(() => {
    // Function to generate a new session ID
    const generateSessionId = () => {
      const timestamp = new Date().getTime()
      const randomPart = Math.random().toString(36).substring(2, 10)
      return `session_${timestamp}_${randomPart}`
    }

    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      const existingSessionId = url.searchParams.get('sessionID') || url.searchParams.get('sessionId')
      
      if (existingSessionId) {
        // Use existing sessionID from URL and skip popup (user is joining a group)
        setSessionId(existingSessionId)
        setShowConfigPopup(false)
        logger.app.info('Using existing session ID from URL:', existingSessionId)
      } else {
        // No sessionID in URL, generate new one and show popup
        const newSessionId = generateSessionId()
        setSessionId(newSessionId)
        setShowConfigPopup(true)
        
        // Update the URL with the new session ID
        url.searchParams.set('sessionId', newSessionId)
        window.history.pushState({}, '', url.toString())
        logger.app.info('New session ID generated and added to URL:', newSessionId)
      }
    }
  }, []) // Empty dependency array means this runs once on component mount

  const [taskIndex, setTaskIndex] = useState(0)
  const [draggableTasks, setDraggableTasks] = useState([])
  const [dropZones, setDropZones] = useState({
    task1A: null,
    task1B: null,
    task2A: null,
    task2B: null,
    task3A: null,
    task3B: null,
  })
  const [responses, setResponses] = useState({})
  const [feedbackOpen, setFeedbackOpen] = useState(false)
  const [feedbackMessage, setFeedbackMessage] = useState('')
  const [feedbackSeverity, setFeedbackSeverity] = useState('success')
  const [feedbackIcon, setFeedbackIcon] = useState(<CheckCircleIcon />)

  // Add state to track currently dragged task
  const [currentDraggedTask, setCurrentDraggedTask] = useState(null);

  // State for tracking task submissions and move counts after submission
  const [taskSubmitted, setTaskSubmitted] = useState({
    task1: false,
    task2: false,
    task3: false,
  })

  const [taskMoveCount, setTaskMoveCount] = useState({
    task1: 0,
    task2: 0,
    task3: 0,
  })

  // Track the current team for each task
  const [currentTeamForTask, setCurrentTeamForTask] = useState({
    task1: null,
    task2: null,
    task3: null,
  })

  const MAX_MOVES_AFTER_SUBMIT = 2

  // Function to restart the application
  const handleRestart = () => {
    // Reset all state to initial values
    setTaskIndex(0)
    setDraggableTasks([])
    setDropZones({
      task1A: null,
      task1B: null,
      task2A: null,
      task2B: null,
      task3A: null,
      task3B: null,
    })
    setResponses({})
    setCurrentDraggedTask(null)
    setTaskSubmitted({
      task1: false,
      task2: false,
      task3: false,
    })
    setTaskMoveCount({
      task1: 0,
      task2: 0,
      task3: 0,
    })
    setCurrentTeamForTask({
      task1: null,
      task2: null,
      task3: null,
    })
    setIsFlowchart(false)
    setArrowsVisible({})
    setShowResults(false)
    setResultsData(null)
    setSessionData({
      moveHistory: {
        task1: [],
        task2: [],
        task3: []
      },
      finalState: {
        task1: {},
        task2: {},
        task3: {}
      }
    })
    
    // Generate a new session ID
    const timestamp = new Date().getTime()
    const randomPart = Math.random().toString(36).substring(2, 10)
    const newSessionId = `session_${timestamp}_${randomPart}`
    setSessionId(newSessionId)
    
    // Update the URL with the new session ID
    if (typeof window !== 'undefined') {
      const url = new URL(window.location.href)
      url.searchParams.set('sessionId', newSessionId)
      window.history.pushState({}, '', url.toString())
    }
    
    logger.app.info('Application restarted with new session ID:', newSessionId)
  }

  // New state for flowchart view
  const [isFlowchart, setIsFlowchart] = useState(false)
  const [arrowsVisible, setArrowsVisible] = useState({})
  
  // State for results view
  const [showResults, setShowResults] = useState(false)
  const [resultsData, setResultsData] = useState(null)


  // Update to handle start/end of drag
  const handleDragStart = (taskText) => {
    setCurrentDraggedTask(taskText);
  };
  
  const handleDragEnd = () => {
    setCurrentDraggedTask(null);
  };

  // Check if a task can be moved (either not submitted or has moves left)
  const canMoveTask = (taskNumber) => {
    if (!taskSubmitted[`task${taskNumber}`]) {
      return true
    }
    return taskMoveCount[`task${taskNumber}`] < MAX_MOVES_AFTER_SUBMIT
  }

  // Check if all tasks are completed
  const allTasksCompleted =
    Object.values(dropZones).filter(Boolean).length === 3 &&
    Object.keys(responses).length === 3

  // Function to show animation for arrows one after another
  const animateArrows = () => {
    const arrowOrder = [
      'header',
      'prepare',
      'collect',
      'task1',
      'task2',
      'habituate',
      'administer',
      'task3',
      'teamA',
      'teamB',
      'reveal',
      'manuscript',
    ]

    // Reset all arrows
    setArrowsVisible({})

    // Animate arrows in sequence
    arrowOrder.forEach((arrow, index) => {
      setTimeout(() => {
        setArrowsVisible((prev) => ({
          ...prev,
          [arrow]: true,
        }))
      }, 300 * (index + 1))
    })
  }

  // Function to convert to flowchart view
  const handleConvertToFlowchart = () => {
    setIsFlowchart(true)
    // Trigger arrow animation with a slight delay
    setTimeout(animateArrows, 500)
  }

  // Function to show drop notification
  const showDropNotification = (team, taskText, isMoveLimitReached = false) => {
    let message = ''

    if (isMoveLimitReached) {
      message = "You've used all your moves for this task after submission"
      alert(message)
      return
    }

    // Check if it's a reassignment (task was previously in another zone)
    const wasInOtherTeam = Object.entries(dropZones).some(([key, value]) => {
      const keyTeam = key.includes('A') ? 'A' : 'B'
      return value === taskText && keyTeam !== team
    })

    if (wasInOtherTeam) {
      message = `Reassigned from Team ${
        team === 'A' ? 'B' : 'A'
      } to Team ${team}`
      setFeedbackIcon(<SwapHorizIcon />)
    } else {
      message = `Assigned to Team ${team}`
      setFeedbackIcon(<InfoIcon />)
    }

    // Always use info severity for neutral notifications before submission
    setFeedbackSeverity('info')
    setFeedbackMessage(message)
    setFeedbackOpen(true)
  }

  const handleStart = () => {
    if (taskIndex < taskList.length) {
      setDraggableTasks([...draggableTasks, taskList[taskIndex]])
      setTaskIndex(taskIndex + 1)
    }
  }

  // Function to fetch session data from MongoDB
  const fetchSessionData = async () => {
    try {
      const response = await fetch(`/api/nmda-sessions?sessionId=${sessionId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      return data;
    } catch (error) {
      logger.app.error('Error fetching session data:', error);
      alert(`Failed to load results: ${error.message}`);
      return null;
    }
  };

  // Function to fetch aggregated data (last 15 entries for each task from all sessions)
  const fetchAggregatedData = async () => {
    try {
      const response = await fetch('/api/nmda-sessions?aggregated=true', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`);
      }

      const data = await response.json();
      logger.app.info('Aggregated data received:', data);
      return data;
    } catch (error) {
      logger.app.error('Error fetching aggregated data:', error);
      alert(`Failed to load aggregated results: ${error.message}`);
      return null;
    }
  };

  // Create the NEXT button handler function
  const handleNextButton = async () => {
    const data = await fetchAggregatedData();
    if (data) {
      setResultsData(data);
      setShowResults(true);
      // Scroll to bottom after a brief delay to allow rendering
      setTimeout(() => {
        window.scrollTo({
          top: document.body.scrollHeight,
          behavior: 'smooth'
        });
      }, 100);
    }
  };

  //api call
  // Add this function to your App component
  const saveSessionData = async (taskNumber, team, userResponse, moveNumber) => {
    try {
      // Create the move data structure
      const moveData = {
        moveNumber,
        selectedOption: team,
        selectedTask: taskList[taskNumber - 1],
        selectedReason: userResponse,
        timestamp: new Date()
      };
  
      logger.app.info(`Creating move data for task ${taskNumber}, move ${moveNumber}:`, moveData);
  
      // Create the updated moveHistory object with existing data
      const moveHistory = {
        task1: [...(sessionData?.moveHistory?.task1 || [])],
        task2: [...(sessionData?.moveHistory?.task2 || [])],
        task3: [...(sessionData?.moveHistory?.task3 || [])]
      };
  
      // Add the new move to the appropriate task
      moveHistory[`task${taskNumber}`].push(moveData);
  
      // Create final state object with existing data
      // Important: Make sure we're providing valid default values for required fields
      const finalState = {
        task1: sessionData?.finalState?.task1 || { team: "unassigned", response: "" },
        task2: sessionData?.finalState?.task2 || { team: "unassigned", response: "" },
        task3: sessionData?.finalState?.task3 || { team: "unassigned", response: "" }
      };
  
      // Update the final state for the current task
      finalState[`task${taskNumber}`] = {
        team,
        response: userResponse
      };
  
      // Prepare the data to send to the API
      const payload = {
        sessionId,
        moveHistory,
        finalState,
        timestamp: new Date()
      };
  
      logger.app.info('Sending data to API:', JSON.stringify(payload, null, 2));
  
      // Make the API call
      const apiResponse = await fetch('/api/nmda-sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });
  
      logger.app.info('API response status:', apiResponse.status);
      
      const responseText = await apiResponse.text();
      logger.app.info('API response text:', responseText);
      
      let result;
      try {
        // Check if response is HTML (likely an error page)
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          logger.app.warn('Received HTML response instead of JSON. API may not be available.');
          result = { error: 'API not available', raw: responseText };
        } else {
          // Try to parse the response as JSON
          result = JSON.parse(responseText);
          logger.app.info('API response parsed:', result);
        }
      } catch (e) {
        logger.app.error('Failed to parse API response as JSON:', e);
        result = { error: 'Invalid JSON response', raw: responseText };
      }
  
      if (!apiResponse.ok) {
        logger.app.error(`API error: ${apiResponse.status}`, result);
        // If we get HTML response (like 404 page), handle it gracefully
        if (responseText.includes('<!DOCTYPE') || responseText.includes('<html')) {
          logger.app.warn('API endpoint not found or misconfigured. Running in offline mode.');
          return { success: false, offline: true };
        }
        throw new Error(`API error: ${apiResponse.status} - ${result.error || 'Unknown error'}`);
      }
  
      // Update the session data in state
      setSessionData({
        ...sessionData,
        moveHistory,
        finalState
      });
  
      return result;
    } catch (error) {
      logger.app.error('Error saving session data:', error);
      // Only show alert for unexpected errors, not API unavailability
      if (!error.message.includes('API not available')) {
        logger.app.warn('Running in offline mode - your progress will not be saved to the database.');
      }
    }
  };

  //api call
  const handleDrop = (taskSectionA, taskSectionB, taskText, team, expectedTask, isCorrectSection, taskNumber) => {
    // Since canDrop in useDrop now handles the task matching, we should never reach here with a wrong task
    // But just in case, keep this check
    if (!isCorrectSection) {
      alert(`Wrong section! "${taskText}" can only be dropped in "${taskText}" section.`);
      return;
    }
    
    const targetZone = team === 'A' ? taskSectionA : taskSectionB;
    const oppositeZone = team === 'A' ? taskSectionB : taskSectionA;
    
    // Get current team for this task
    const prevTeam = currentTeamForTask[`task${taskNumber}`];
    
    // Check if this is a team switch after submission
    // Only count moves and check limits if the task has been submitted
    if (taskSubmitted[`task${taskNumber}`] && prevTeam !== null && prevTeam !== team) {
      // Check if we've reached max moves
      if (taskMoveCount[`task${taskNumber}`] >= MAX_MOVES_AFTER_SUBMIT) {
        alert(`You've used all your allowed moves after submission for this task.`);
        return;
      }
      
      // Show warning if this is the last move (when moveCount is 1, which means this will be their 2nd move)
      if (taskMoveCount[`task${taskNumber}`] === MAX_MOVES_AFTER_SUBMIT - 1) {
        alert(`Make your final move for this task.`);
      }
      
      // Increment move count when switching teams after submission
      setTaskMoveCount(prev => ({
        ...prev,
        [`task${taskNumber}`]: prev[`task${taskNumber}`] + 1
      }));
    }
    
    // Update the current team for this task
    setCurrentTeamForTask(prev => ({
      ...prev,
      [`task${taskNumber}`]: team
    }));
  
    // Update dropZones and responses
    setDropZones((prevZones) => {
      if (prevZones[targetZone] === taskText) {
        return prevZones;
      }
      
      if (prevZones[oppositeZone] === taskText) {
        const oppositeResponseKey = oppositeZone;
        
        // Only clear the response if the task has been submitted already
        // This ensures users can freely move tasks before submission
        if (taskSubmitted[`task${taskNumber}`]) {
          setResponses(prev => {
            const newResponses = {...prev};
            // Delete the previous response, don't copy it over
            delete newResponses[oppositeResponseKey];
            return newResponses;
          });
        }
      }
      
      return {
        ...prevZones,
        [targetZone]: taskText,
        [oppositeZone]: null,
      };
    });
  
    if (!draggableTasks.includes(taskText)) {
      return;
    }
    
    setDraggableTasks((prevTasks) => prevTasks.filter((t) => t !== taskText));
    
    // Call showDropNotification to show assignment notification via Snackbar
    showDropNotification(team, taskText);
  };

  //api call
  const handleSubmitResponse = (zoneId, response, isValid, team, task, taskNumber) => {
    if (!isValid) {
      alert("Please provide a reason for your assignment.");
      return;
    }
    
    // Only mark the task as submitted if it's not already submitted
    // This is when we start tracking and limiting moves
    if (!taskSubmitted[`task${taskNumber}`]) {
      setTaskSubmitted(prev => ({
        ...prev,
        [`task${taskNumber}`]: true
      }));
      
      // Initialize move count to 0 when first submitting
      setTaskMoveCount(prev => ({
        ...prev,
        [`task${taskNumber}`]: 0
      }));
    }
    
    // Update the response in state
    setResponses(prev => ({
      ...prev,
      [zoneId]: response
    }));
  
    // Get the current move number for this task - for reassignments, it's the move count + 1
    const moveNumber = (sessionData?.moveHistory?.[`task${taskNumber}`]?.length || 0) + 1;
    
    // Save the session data to the API with the new response
    saveSessionData(taskNumber, team, response, moveNumber);
  
    // Get the specific feedback message from the taskFeedback object
    // The feedback is organized by task name and team letter
    if (taskFeedback && taskFeedback[task] && taskFeedback[task][team]) {
      const feedback = taskFeedback[task][team];
      alert(feedback);
    } else {
      // Fallback in case a specific feedback message isn't found
      alert(`Task "${task}" assigned to Team ${team}`);
      
      // Log error for debugging
      logger.app.error(`Missing feedback for task "${task}" and team "${team}"`);
    }
  };

  const handleCloseFeedback = (event, reason) => {
    if (reason === 'clickaway') {
      return
    }
    setFeedbackOpen(false)
  }

  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionId) {
      setShowConfigPopup(false)
    }
  }

  // Create a client-side only wrapper for the DnD provider to avoid hydration issues
  return (
    <>
      {showConfigPopup && (
        <Suspense fallback={<div>Loading...</div>}>
          <SessionConfigPopup
            open={showConfigPopup}
            onClose={handleConfigClose}
            sessionID={sessionId}
          />
        </Suspense>
      )}
      
      <ClientOnlyComponent>
        <DndProvider backend={HTML5Backend}>
          {/* Use the client-only header wrapper instead of directly using Header */}
          <ClientOnlyHeader
            onLogoClick={handleRestart}
            text="NMDA Study Task Assignment"
          />

        {/* Add a small description below the header */}
        <Box
          sx={{
            maxWidth: 900,
            mx: 'auto',
            px: 4,
            pt: 2,
            pb: 0,
            textAlign: 'center',
          }}
        >
          <Typography
            variant="subtitle1"
            sx={{
              color: '#555',
              fontWeight: 'bold',
              mb: 2,
            }}
          >
            For each highlighted task in the flowchart, select whether it should
            be performed by Team A (Access) or Team B (Blind).
          </Typography>

          {/* Add a note about the move restriction */}
          <Typography
            variant="body2"
            sx={{
              color: '#666',
              fontStyle: 'italic',
              mb: 2,
            }}
          >
            Note: After submitting your reasoning, you&apos;ll be limited to 2
            additional team reassignments per task.
          </Typography>
        </Box>

        <Box sx={{ maxWidth: 900, mx: 'auto', p: 4 }}>
          <Snackbar
            open={feedbackOpen}
            autoHideDuration={6000}
            onClose={handleCloseFeedback}
            anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
          >
            <Alert
              onClose={handleCloseFeedback}
              severity={feedbackSeverity}
              sx={{ width: '100%' }}
              variant="filled"
              elevation={6}
              iconMapping={{
                success: feedbackIcon,
                error: feedbackIcon,
                info: feedbackIcon,
                warning: feedbackIcon,
              }}
            >
              {feedbackMessage}
            </Alert>
          </Snackbar>

          <>

          <Box sx={{ textAlign: 'center', mb: 3 }}>
            {taskIndex < taskList.length && !isFlowchart && (
              <CustomButton
                onClick={handleStart}
                ariaLabel="Test button"
                disabled={false}
                variant="purple"
                customStyles={{}}
                className=""
              >
                Start
              </CustomButton>
            )}

            {allTasksCompleted && !isFlowchart && !showResults && (
              <CustomButton
                onClick={handleNextButton}
                disabled={false}
                variant="purple"
                customStyles={{}}
                className=""
              >
                NEXT
              </CustomButton>
            )}
          </Box>

          {!isFlowchart &&
            draggableTasks.map((task, index) => (
              <Box
                key={index}
                sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}
              >
                <DraggableBox 
                  text={task} 
                  onDragStart={handleDragStart}
                  onDragEnd={handleDragEnd}
                />
              </Box>
            ))}

          <Paper elevation={3} sx={{ p: 3, borderRadius: 2 }}>
            <Grid container spacing={2} sx={{ mb: 3 }}>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    bgcolor: '#4CAF50',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography fontWeight="bold">Team A: Access</Typography>
                  <Typography variant="body2">(Randomization Team)</Typography>
                </Paper>
              </Grid>
              <Grid item xs={6}>
                <Paper
                  sx={{
                    bgcolor: '#1976D2',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                  }}
                >
                  <Typography fontWeight="bold">Team B: Blind</Typography>
                  <Typography variant="body2">(Experimental Team)</Typography>
                </Paper>
              </Grid>
            </Grid>

            <Paper
              sx={{
                background: 'linear-gradient(to right, #388E3C, #1976D2)',
                color: 'white',
                p: 2,
                textAlign: 'center',
                mb: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              PREPARE and define NMDA receptor study protocols
            </Paper>

            <Arrow visible={arrowsVisible.header} />

            <Grid container justifyContent="flex-end">
              <Grid item xs={6}>
                <Paper
                  sx={{
                    bgcolor: '#90CAF9',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Collect baseline data (weight, sex, age)
                </Paper>
              </Grid>
            </Grid>

            <Arrow visible={arrowsVisible.collect} />

            {(taskIndex > 0 || isFlowchart) && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          `task1A`,
                          `task1B`,
                          taskText,
                          'A',
                          taskList[0],
                          isCorrectSection,
                          1,
                        )
                      }
                      bgcolor="#A5D6A7"
                      boxInDropZone={dropZones[`task1A`]}
                      defaultText="Drop Here for Team A"
                      zoneId={`task1A`}
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses[`task1A`]}
                      team="A"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[0]}
                      isFlowchart={isFlowchart}
                      taskNumber={1}
                      moveCount={taskMoveCount.task1}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task1}
                      canMove={canMoveTask(1)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          `task1A`,
                          `task1B`,
                          taskText,
                          'B',
                          taskList[0],
                          isCorrectSection,
                          1,
                        )
                      }
                      bgcolor="#90CAF9"
                      boxInDropZone={dropZones[`task1B`]}
                      defaultText="Drop Here for Team B"
                      zoneId={`task1B`}
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses[`task1B`]}
                      team="B"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[0]}
                      isFlowchart={isFlowchart}
                      taskNumber={1}
                      moveCount={taskMoveCount.task1}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task1}
                      canMove={canMoveTask(1)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            {!isFlowchart && taskIndex === 0 && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#F5F5F5' }}>
                <Typography>
                  {taskList[0]}
                  <br />
                 {taskIndex === 0 ? "(Click Start and Drag and Drop your task to the desired Team - Team A on left and Team B on right)" : ""} 
                </Typography>
              </Paper>
            )}

            <Arrow visible={arrowsVisible.task1} />

            {!isFlowchart && taskIndex < 2 && (
              <Paper sx={{ p: 2, mb: 2, bgcolor: '#F5F5F5' }}>
                <Typography>
                  {taskList[1]}
                  <br />

                  {taskIndex === 1 ? "(Click Start and Drag and Drop your task to the desired Team - Team A on left and Team B on right)" : ""} 

                
                </Typography>
              </Paper>
            )}

            {(taskIndex >= 2 || isFlowchart) && (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          `task2A`,
                          `task2B`,
                          taskText,
                          'A',
                          taskList[1],
                          isCorrectSection,
                          2,
                        )
                      }
                      bgcolor="#A5D6A7"
                      boxInDropZone={dropZones[`task2A`]}
                      defaultText="Drop Here for Team A"
                      zoneId={`task2A`}
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses[`task2A`]}
                      team="A"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[1]}
                      isFlowchart={isFlowchart}
                      taskNumber={2}
                      moveCount={taskMoveCount.task2}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task2}
                      canMove={canMoveTask(2)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          `task2A`,
                          `task2B`,
                          taskText,
                          'B',
                          taskList[1],
                          isCorrectSection,
                          2,
                        )
                      }
                      bgcolor="#90CAF9"
                      boxInDropZone={dropZones[`task2B`]}
                      defaultText="Drop Here for Team B"
                      zoneId={`task2B`}
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses[`task2B`]}
                      team="B"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[1]}
                      isFlowchart={isFlowchart}
                      taskNumber={2}
                      moveCount={taskMoveCount.task2}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task2}
                      canMove={canMoveTask(2)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                </Grid>
              </Box>
            )}

            <Arrow visible={arrowsVisible.task2} />

            <Grid container justifyContent="flex-end">
              <Grid item xs={6}>
                <Paper
                  sx={{
                    bgcolor: '#90CAF9',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    mt: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Habituate mice to handling (3 days)
                </Paper>
              </Grid>
            </Grid>

            <Arrow visible={arrowsVisible.habituate} />

            <Grid container justifyContent="flex-end">
              <Grid item xs={6}>
                <Paper
                  sx={{
                    bgcolor: '#90CAF9',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Administer treatments and run maze tests
                </Paper>
              </Grid>
            </Grid>

            <Arrow visible={arrowsVisible.administer} />

            {taskIndex >= 3 || isFlowchart ? (
              <Box sx={{ mt: 2, position: 'relative' }}>
                <Grid container spacing={2} sx={{ mt: 1 }}>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          'task3A',
                          'task3B',
                          taskText,
                          'A',
                          taskList[2],
                          isCorrectSection,
                          3,
                        )
                      }
                      bgcolor="#A5D6A7"
                      boxInDropZone={dropZones.task3A}
                      defaultText="Drop Here for Team A"
                      zoneId="task3A"
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses.task3A}
                      team="A"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[2]}
                      isFlowchart={isFlowchart}
                      taskNumber={3}
                      moveCount={taskMoveCount.task3}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task3}
                      canMove={canMoveTask(3)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                  <Grid item xs={6}>
                    <DropArea
                      onDrop={(taskText, isCorrectSection) =>
                        handleDrop(
                          'task3A',
                          'task3B',
                          taskText,
                          'B',
                          taskList[2],
                          isCorrectSection,
                          3,
                        )
                      }
                      bgcolor="#90CAF9"
                      boxInDropZone={dropZones.task3B}
                      defaultText="Drop Here for Team B"
                      zoneId="task3B"
                      onSubmitResponse={handleSubmitResponse}
                      savedResponse={responses.task3B}
                      team="B"
                      showDropNotification={showDropNotification}
                      expectedTask={taskList[2]}
                      isFlowchart={isFlowchart}
                      taskNumber={3}
                      moveCount={taskMoveCount.task3}
                      maxMoves={MAX_MOVES_AFTER_SUBMIT}
                      hasSubmitted={taskSubmitted.task3}
                      canMove={canMoveTask(3)}
                      responses={responses}
                      currentDraggedTask={currentDraggedTask}
                      handleDragStart={handleDragStart}
                      handleDragEnd={handleDragEnd}
                    />
                  </Grid>
                </Grid>
              </Box>
            ) : (
              !isFlowchart &&
              taskIndex < 3 && (
                <Paper sx={{ p: 2, mb: 2, bgcolor: '#F5F5F5' }}>
                  <Typography>
                    {taskList[2]} <br />
                    {taskIndex === 2 ? "(Click Start and Drag and Drop your task to the desired Team - Team A on left and Team B on right)" : ""} 
                  </Typography>
                </Paper>
              )
            )}

            <Arrow visible={arrowsVisible.task3} />

            <Box sx={{ mt: 2, position: 'relative' }}>
              <Grid container spacing={2} sx={{ mt: 2, position: 'relative' }}>
                <Grid item xs={6}>
                  <Paper
                    sx={{
                      bgcolor: '#A5D6A7',
                      p: 2,
                      textAlign: 'center',
                      color: 'white',
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Conceal allocations in collected data
                  </Paper>
                </Grid>

                {/* Horizontal connection arrow */}
                <Grid item xs={6} sx={{ position: 'relative' }}>
                  <Box
                    sx={{
                      position: 'absolute',
                      top: '50%',
                      left: 0,
                      width: '100%',
                      transform: 'translateY(-50%)',
                    }}
                  >
                    <Arrow
                      visible={arrowsVisible.teamA}
                      direction="right"
                      sx={{ position: 'absolute', left: -12, top: 0, width: 24 }}
                    />
                  </Box>

                  <Paper
                    sx={{
                      bgcolor: '#90CAF9',
                      p: 2,
                      textAlign: 'center',
                      color: 'white',
                      mb: 2,
                      position: 'relative',
                      zIndex: 1,
                    }}
                  >
                    Analyze blinded data
                  </Paper>
                </Grid>
              </Grid>
            </Box>

            <Arrow visible={arrowsVisible.teamB} />

            <Grid container justifyContent="flex-start">
              <Grid item xs={5.9}>
                <Paper
                  sx={{
                    bgcolor: '#A5D6A7',
                    color: 'white',
                    p: 2,
                    textAlign: 'center',
                    mb: 2,
                    position: 'relative',
                    zIndex: 1,
                  }}
                >
                  Reveal treatment group identities
                </Paper>
              </Grid>
            </Grid>

            <Arrow visible={arrowsVisible.reveal} />

            <Paper
              sx={{
                background: 'linear-gradient(to right, #388E3C, #1976D2)',
                color: 'white',
                p: 2,
                textAlign: 'center',
                mt: 2,
                position: 'relative',
                zIndex: 1,
              }}
            >
              Write manuscript according to ARRIVE guidelines
            </Paper>
          </Paper>

          {/* Duplicate NEXT button below the flowchart */}
          {allTasksCompleted && !isFlowchart && !showResults && (
            <Box sx={{ textAlign: 'center', mt: 3 }}>
              <CustomButton
                onClick={handleNextButton}
                disabled={false}
                variant="purple"
                customStyles={{}}
                className=""
              >
                NEXT
              </CustomButton>
            </Box>
          )}
            </>

          {showResults && (
            <ResultsTable data={resultsData} taskList={taskList} onRestart={handleRestart} />
          )}
        </Box>
      </DndProvider>
    </ClientOnlyComponent>
    </>
  )
}

// Export the App component wrapped in a component that suppresses hydration warnings
export default function AppWithHydrationHandling() {
  return (
    <div suppressHydrationWarning={true}>
      <App />
    </div>
  )
}