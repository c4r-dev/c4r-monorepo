const logger = require('../../../../../packages/logging/logger.js');
'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  Paper,
  Container,
  CircularProgress,
  Card,
  CardContent,
  Grid,
  Snackbar,
  Alert,
  Tooltip
} from '@mui/material'
import AddIcon from '@mui/icons-material/Add'
import InfoIcon from '@mui/icons-material/Info'

// Categories for the ARRIVE guidelines
const guidelineCategories = [
  { id: '4a', title: '4a. Randomization' },
  { id: '4b', title: '4b. Minimising confounders' },
  { id: '5', title: '5. Blinding' },
  { id: '1b', title: '1b. Experimental unit' },
  { id: '2a', title: '2a. Sample size' },
  { id: 'other', title: 'Other' },
]

// Define tooltip content for each section and category
const tooltipContentBySection = {
  // Default tooltips if no section is selected
  default: {
    '4a': 'State whether randomisation was used to allocate experimental units to control and treatment groups. If done, provide the method used to generate the randomisation sequence.',
    '4b': 'Describe the strategy used to minimise potential confounders such as the order of treatments and measurements, or animal/cage location. If confounders were not controlled, state this explicitly',
    '5': 'Describe who was aware of the group allocation at the different stages of the experiment (during the allocation, the conduct of the experiment, the outcome assessment, and the data analysis).',
    '1b': 'For each experiment, provide brief details of study design including the experimental unit (e.g. a single animal, litter, or cage of animals).',
    '2a': 'Specify the exact number of experimental units allocated to each group, and the total number in each experiment. Also indicate the total number of animals used.',
  },
  // Section A specific tooltips
  sectionA: {
    '4a': 'For Section A: State whether randomisation was used to allocate experimental units to control and treatment groups. If done, provide the method used to generate the randomisation sequence.',
    '4b': 'For Section A: Describe the strategy used to minimise potential confounders such as the order of treatments and measurements, or animal/cage location. If confounders were not controlled, state this explicitly',
    '5': 'For Section A: Describe who was aware of the group allocation at the different stages of the experiment (during the allocation, the conduct of the experiment, the outcome assessment, and the data analysis).',
    '1b': 'For Section A: For each experiment, provide brief details of study design including the experimental unit (e.g. a single animal, litter, or cage of animals).',
    '2a': 'For Section A: Specify the exact number of experimental units allocated to each group, and the total number in each experiment. Also indicate the total number of animals used.',
    'other': 'For Section A: Animal-related questions that don\'t fit into the specific ARRIVE guideline categories.',
  },
  // Section B specific tooltips
  sectionB: {
    '4a': 'For Section A: State whether randomisation was used to allocate experimental units to control and treatment groups. If done, provide the method used to generate the randomisation sequence.',
    '4b': 'For Section A: Describe the strategy used to minimise potential confounders such as the order of treatments and measurements, or animal/cage location. If confounders were not controlled, state this explicitly',
    '5': 'For Section A: Describe who was aware of the group allocation at the different stages of the experiment (during the allocation, the conduct of the experiment, the outcome assessment, and the data analysis).',
    '1b': 'For Section A: For each experiment, provide brief details of study design including the experimental unit (e.g. a single animal, litter, or cage of animals).',
    '2a': 'For Section A: Specify the exact number of experimental units allocated to each group, and the total number in each experiment. Also indicate the total number of animals used.',
    'other': 'For Section A: Animal-related questions that don\'t fit into the specific ARRIVE guideline categories.',
  },
  // Section C specific tooltips
  sectionC: {
    '4a': 'For Section A: State whether randomisation was used to allocate experimental units to control and treatment groups. If done, provide the method used to generate the randomisation sequence.',
    '4b': 'For Section A: Describe the strategy used to minimise potential confounders such as the order of treatments and measurements, or animal/cage location. If confounders were not controlled, state this explicitly',
    '5': 'For Section A: Describe who was aware of the group allocation at the different stages of the experiment (during the allocation, the conduct of the experiment, the outcome assessment, and the data analysis).',
    '1b': 'For Section A: For each experiment, provide brief details of study design including the experimental unit (e.g. a single animal, litter, or cage of animals).',
    '2a': 'For Section A: Specify the exact number of experimental units allocated to each group, and the total number in each experiment. Also indicate the total number of animals used.',
    'other': 'For Section A: Animal-related questions that don\'t fit into the specific ARRIVE guideline categories.',
  },
};

// Question Card Component (Draggable)
function QuestionCard({ id, text, source, onDragStart }) {
  // Truncate text if it's too long
  const truncatedText =
    text.length > 150 ? `${text.substring(0, 150)}...` : text

  const handleDragStart = (e) => {
    e.dataTransfer.setData(
      'application/json',
      JSON.stringify({ id, text, source }),
    )
    e.dataTransfer.effectAllowed = 'move'
    if (onDragStart) onDragStart(id)
  }

  return (
    <Paper
      draggable
      onDragStart={handleDragStart}
      elevation={3}
      sx={{
        width: 280,
        height: 'auto',
        minHeight: 120,
        backgroundColor: '#f47321',
        p: 2,
        display: 'flex',
        flexDirection: 'column',
        borderRadius: 1,
        boxShadow: '0 5px 15px rgba(0,0,0,0.1)',
        cursor: 'grab',
        '&:hover': {
          boxShadow: '0 8px 25px rgba(0,0,0,0.15)',
          transform: 'translateY(-2px)',
        },
        transition: 'all 0.2s ease',
      }}
    >
      <Typography variant="body1" sx={{ fontWeight: 'bold', mb: 1 }}>
        Question
      </Typography>
      <Typography
        variant="body2"
        sx={{
          overflow: 'hidden',
          wordWrap: 'break-word',
          whiteSpace: 'normal',
          flex: 1,
        }}
      >
        {truncatedText}
      </Typography>
      <Typography
        variant="caption"
        sx={{ mt: 2, alignSelf: 'flex-end', color: '#555' }}
      >
        Source: {source === 'user' ? 'You' : 'Other student'}
      </Typography>
    </Paper>
  )
}

// Categorized Question Component
function CategorizedQuestion({ id, text, onRemove, onDuplicate, categoryId }) {
  // Truncate text if it's too long - increased from 50 to 80 characters for better readability
  const truncatedText = text.length > 80 ? `${text.substring(0, 80)}...` : text

  // Function to handle duplication of question
  const handleDuplicate = () => {
    // Call the parent component's onDuplicate function with the question details
    if (onDuplicate) {
      onDuplicate(text);
    }
  };

  return (
    <Box
      sx={{
        p: 1,
        mb: 1,
        bgcolor: '#f8f8f8',
        borderRadius: 1,
        border: '1px solid #ddd',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        boxShadow: 'none',
        transition: 'background-color 0.2s',
      }}
    >
      <Typography
        variant="body2"
        sx={{
          flex: 1,
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          whiteSpace: 'nowrap', // Ensure text stays on a single line and doesn't wrap
        }}
      >
        {truncatedText}
      </Typography>
      <Box sx={{ display: 'flex', alignItems: 'center' }}>
        <Button
          size="small"
          onClick={handleDuplicate}
          sx={{ 
            ml: 1, 
            minWidth: 'auto', 
            p: 0.5,
            fontWeight: 'bold',
            fontSize: '16px',
            color: '#4CAF50' // Green color for the duplicate button
          }}
          title="Create duplicate card in question stack"
        >
          +
        </Button>
        <Button
          size="small"
          onClick={() => onRemove(categoryId, id)}
          sx={{ 
            ml: 1, 
            minWidth: 'auto', 
            p: 0.5,
            fontWeight: 'bold',
            fontSize: '16px'
          }}
          title="Return to question stack"
        >
          ×
        </Button> 
      </Box>
    </Box>
  )
}

export default function DragDropCardsScreen({ onContinue }) {
  // State for both user questions and additional random questions
  const [questionStack, setQuestionStack] = useState([])
  const [categorizedQuestions, setCategorizedQuestions] = useState({})
  const [isComplete, setIsComplete] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [loadingMoreQuestions, setLoadingMoreQuestions] = useState(false)
  const [error, setError] = useState(null)
  const [activeDragId, setActiveDragId] = useState(null)
  const [highlightedCategory, setHighlightedCategory] = useState(null)
  // Track initial questions to know when all have been categorized
  const [initialQuestionCount, setInitialQuestionCount] = useState(0)
  const [
    hasInitialQuestionsBeenCategorized,
    setHasInitialQuestionsBeenCategorized,
  ] = useState(false)
  // Store current user and session info
  const [userId, setUserId] = useState('')
  const [sessionId, setSessionId] = useState('')
  // State for notification
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info',
  })
  // Add a new state to track if the "More Questions" button has been clicked
  const [hasLoadedMoreQuestions, setHasLoadedMoreQuestions] = useState(false)
  // Add a state for the selected section
  const [selectedSection, setSelectedSection] = useState('default')

  // Function to duplicate a question to the question stack
  const handleDuplicateQuestion = (questionText) => {
    // Create a new question card with the same text but a unique ID
    const newQuestion = {
      id: `dup-${Date.now()}`,
      text: questionText,
      source: 'user',
      isDuplicate: true
    };
    
    // Add the duplicated question to the question stack
    setQuestionStack(prevStack => [...prevStack, newQuestion]);
    
    // Show notification
    showNotification('Question duplicated to question stack', 'success');
  }

  // NEW FUNCTION: Update URL Parameters to reflect category status
 // NEW FUNCTION: Update URL Parameters to reflect category status with count
const updateUrlParameters = () => {
  try {
    // Get current URL parameters
    const urlParams = new URLSearchParams(window.location.search)

    // Get userId and sessionID from existing parameters
    const currentUserId = urlParams.get('userId')
    const currentSessionId = urlParams.get('sessionId')
    const selectedSection = urlParams.get('selectedSection')
    // Create a new URLSearchParams object
    const newParams = new URLSearchParams()

    // Preserve userId and sessionID if they exist
    if (currentUserId) newParams.set('userId', currentUserId)
    if (currentSessionId) newParams.set('sessionId', currentSessionId)
    if (selectedSection) newParams.set('selectedSection', selectedSection)

    // Add parameters for each category with the count of questions
    for (const categoryId in categorizedQuestions) {
      // Set parameter to the number of questions in the category
      const questionCount = categorizedQuestions[categoryId].length
      newParams.set(`cat_${categoryId}`, questionCount.toString())
    }

    // Update browser URL without reloading the page
    const newUrl = `${window.location.pathname}?${newParams.toString()}`
    window.history.replaceState({}, '', newUrl)

    logger.app.info('Updated URL parameters with question counts:', newUrl)
  } catch (error) {
    logger.app.error('Error updating URL parameters:', error)
  }
}

  // Function to extract URL parameters
  const getParamsFromUrl = () => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const userId = urlParams.get('userId')
      const sessionId = urlParams.get('sessionId')
      const section = urlParams.get('selectedSection') || 'default'

      logger.app.info('URL Parameters:', {
        userId,
        sessionId,
        selectedSection: section,
        urlSearch: window.location.search,
      })

      return {
        userId: userId || '',
        sessionId: sessionId || '',
        selectedSection: section,
      }
    }
    return { userId: '', sessionId: '', selectedSection: 'default' }
  }

  // Function to fetch questions from the API for a specific user and session
  const fetchUserQuestions = async (userId, sessionId) => {
    try {
      logger.app.info(
        `Fetching questions for user: ${userId}, session: ${sessionId}`,
      )

      // Fetch all sessions from the API
      const response = await fetch('/api/questions')

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()
      logger.app.info('API response:', data)

      if (!data.sessions || data.sessions.length === 0) {
        logger.app.warn('No sessions found in API response')
        return []
      }

      // Find the matching session
      const session = data.sessions.find((s) => s.sessionId === sessionId)
      if (!session) {
        logger.app.warn(`Session not found: ${sessionId}`)
        return []
      }

      logger.app.info('Found session:', session)

      // Extract questions for the specific user
      let userQuestions = []
      for (const section of session.sections) {
        const student = section.students.find((s) => s.studentId === userId)
        if (student && student.questions && student.questions.length > 0) {
          userQuestions = student.questions.map((q) => q.questionText)
          logger.app.info(
            `Found ${userQuestions.length} questions for student ${userId}`,
          )
          break
        }
      }

      return userQuestions
    } catch (error) {
      logger.app.error('Error fetching user questions:', error)
      throw error
    }
  }

  // Function to fetch random questions from other students in the same session
  const fetchRandomQuestionsFromOtherStudents = async (
    userId,
    sessionId,
    count = 5,
  ) => {
    try {
      logger.app.info(
        `Fetching random questions from other students in session: ${sessionId}`,
      )

      // Fetch all sessions from the API
      const response = await fetch('/api/questions')

      if (!response.ok) {
        throw new Error(`API error: ${response.status}`)
      }

      const data = await response.json()

      if (!data.sessions || data.sessions.length === 0) {
        throw new Error('No sessions found in API response')
      }

      // First attempt: Find questions from other students in the same session
      const session = data.sessions.find((s) => s.sessionId === sessionId)
      if (!session) {
        logger.app.warn(`Session not found: ${sessionId}, will try all sessions`)
      }

      // Collect questions from other students in this session
      let otherStudentsQuestions = []

      if (session) {
        for (const section of session.sections) {
          for (const student of section.students) {
            // Skip the current user
            if (
              student.studentId !== userId &&
              student.questions &&
              student.questions.length > 0
            ) {
              // Add student ID to each question to identify the source
              const questions = student.questions.map((q) => ({
                text: q.questionText,
                studentId: student.studentId,
                sessionId: sessionId,
              }))
              otherStudentsQuestions.push(...questions)
            }
          }
        }
      }

      logger.app.info(
        `Found ${otherStudentsQuestions.length} questions from other students in same session`,
      )

      // If no questions found in the current session, try all sessions
      if (otherStudentsQuestions.length === 0) {
        logger.app.info(
          'No questions found in current session. Searching all sessions...',
        )

        for (const anySession of data.sessions) {
          // Skip the current session as we already checked it
          if (anySession.sessionId === sessionId) continue

          for (const section of anySession.sections) {
            for (const student of section.students) {
              // Skip the current user (unlikely but just in case)
              if (
                student.studentId !== userId &&
                student.questions &&
                student.questions.length > 0
              ) {
                // Add student and session ID to each question
                const questions = student.questions.map((q) => ({
                  text: q.questionText,
                  studentId: student.studentId,
                  sessionId: anySession.sessionId,
                }))
                otherStudentsQuestions.push(...questions)
              }
            }
          }
        }

        logger.app.info(
          `Found ${otherStudentsQuestions.length} questions from all other sessions`,
        )
      }

      if (otherStudentsQuestions.length === 0) {
        throw new Error('No questions found from any students in any sessions')
      }

      // Randomly select questions up to the requested count
      const selectedQuestions = []
      const maxCount = Math.min(count, otherStudentsQuestions.length)

      // Create a copy of the array to avoid modifying the original
      const availableQuestions = [...otherStudentsQuestions]

      for (let i = 0; i < maxCount; i++) {
        // Randomly select an index
        const randomIndex = Math.floor(
          Math.random() * availableQuestions.length,
        )
        // Add the question to selected questions
        selectedQuestions.push(availableQuestions[randomIndex])
        // Remove the selected question to avoid duplicates
        availableQuestions.splice(randomIndex, 1)

        // Break if we've used all available questions
        if (availableQuestions.length === 0) break
      }

      return selectedQuestions
    } catch (error) {
      logger.app.error('Error fetching random questions:', error)
      throw error
    }
  }

  // Function to show notification
  const showNotification = (message, severity = 'info') => {
    setNotification({
      open: true,
      message,
      severity,
    })
  }

  // Function to close notification
  const handleCloseNotification = () => {
    setNotification({ ...notification, open: false })
  }

  // Helper function to get the appropriate tooltip content based on section and category
  const getTooltipContent = (categoryId) => {
    // Check if the selected section exists in our mapping
    if (tooltipContentBySection[selectedSection]) {
      return tooltipContentBySection[selectedSection][categoryId];
    }
    // Fallback to default tooltips if section is not found
    return tooltipContentBySection.default[categoryId];
  }

  // Load questions when component mounts
  useEffect(() => {
    const loadQuestions = async () => {
      try {
        setIsLoading(true)
        setError(null)

        // Initialize categorized questions object
        const categories = {}
        guidelineCategories.forEach((cat) => {
          categories[cat.id] = []
        })
        setCategorizedQuestions(categories)

        // Get userId, sessionId, and selectedSection from URL
        const params = getParamsFromUrl()
        setUserId(params.userId)
        setSessionId(params.sessionId)
        setSelectedSection(params.selectedSection)

        logger.app.info(
          'this is the userid, sessionid, and selectedSection',
          params.userId,
          params.sessionId,
          params.selectedSection
        )
        
        let questions = []

        // If URL params are available, fetch from API
        if (params.userId && params.sessionId) {
          questions = await fetchUserQuestions(params.userId, params.sessionId)
        }

        // If no questions were found or params missing, use test data
        if (!questions || questions.length === 0) {
          if (!params.userId || !params.sessionId) {
            logger.app.warn('Missing URL parameters - using test data')
          } else {
            logger.app.warn(
              `No questions found for user ${params.userId} in session ${params.sessionId} - using test data`,
            )
          }

          // Use test data to avoid showing "No more questions to categorize"
          questions = [
            'How was randomization performed in this study?',
            'Was any blinding used in the experimental procedures?',
            'How were the sample sizes for each group determined?',
            'What was considered the experimental unit in this design?',
            'What measures were taken to minimize potential confounding variables?',
          ]
        }

        // Format questions for the UI
        const formattedQuestions = questions.map((q, i) => ({
          id: `user-q-${i}`,
          text: q,
          source: 'user',
        }))

        setQuestionStack(formattedQuestions)
        // Store the initial count of questions to track when all have been categorized
        setInitialQuestionCount(formattedQuestions.length)

        // Initialize URL parameters for category status (all empty at start)
        updateUrlParameters()
      } catch (err) {
        logger.app.error('Error in loadQuestions:', err)
        setError(`Failed to load questions: ${err.message}`)
      } finally {
        setIsLoading(false)
      }
    }

    loadQuestions()
  }, [])

  // Effect to update URL parameters when categorized questions change
  useEffect(() => {
    if (!isLoading) {
      updateUrlParameters()
    }
  }, [categorizedQuestions])

  useEffect(() => {
    const hasCategories = Object.values(categorizedQuestions).some(
      (arr) => arr.length > 0,
    )

    // Track if all initial user questions have been categorized
    if (!hasInitialQuestionsBeenCategorized && initialQuestionCount > 0) {
      const totalCategorizedQuestions = Object.values(
        categorizedQuestions,
      ).reduce(
        (total, arr) => total + arr.filter((q) => q.source === 'user' && !q.isDuplicate).length,
        0,
      )

      // If all initial questions have been categorized, enable the "More Questions" button
      if (totalCategorizedQuestions >= initialQuestionCount) {
        setHasInitialQuestionsBeenCategorized(true)
      }
    }

    // Calculate how many original user questions (from personal stack) are still uncategorized
    // Exclude duplicated questions from this count
    const originalUserQuestionsInStack = questionStack.filter(
      (q) => q.source === 'user' && !q.isDuplicate
    ).length

    // Modified logic: Set isComplete to true once all original user questions are categorized
    // and at least one category has questions
    setIsComplete(
      hasCategories && originalUserQuestionsInStack === 0 && hasInitialQuestionsBeenCategorized
    )
  }, [
    questionStack,
    categorizedQuestions,
    initialQuestionCount,
    hasInitialQuestionsBeenCategorized,
  ])

  // Handle adding more questions - now fetches from other students in the same session
  const handleLoadMoreQuestions = async () => {
    if (!userId || !sessionId) {
      showNotification(
        'Cannot load more questions: Missing user or session ID',
        'error',
      )
      return
    }

    setLoadingMoreQuestions(true)

    try {
      // Try to fetch random questions with the enhanced function
      const randomQuestions = await fetchRandomQuestionsFromOtherStudents(
        userId,
        sessionId,
        5,
      )

      // Format the questions for the UI
      const formattedQuestions = randomQuestions.map((q, i) => ({
        id: `other-q-${Date.now()}-${i}`,
        text: q.text,
        source: 'other',
        studentId: q.studentId,
        // Add session info to help identify which session the question came from
        sessionId: q.sessionId,
      }))

      setQuestionStack((prev) => [...prev, ...formattedQuestions])

      // Customize notification based on where questions came from
      const fromSameSession = formattedQuestions.some(
        (q) => q.sessionId === sessionId,
      )
      if (fromSameSession) {
        showNotification(
          `Added ${formattedQuestions.length} questions from other students in your session`,
          'success',
        )
      } else {
        showNotification(
          `Added ${formattedQuestions.length} questions from other sessions`,
          'success',
        )
      }
    } catch (error) {
      logger.app.error('Error loading more questions:', error)

      // Use fallback questions if API fails
      const fallbackFormattedQuestions = fallbackQuestions.map((q, i) => ({
        id: `fallback-q-${Date.now()}-${i}`,
        text: q,
        source: 'other',
      }))

      setQuestionStack((prev) => [...prev, ...fallbackFormattedQuestions])
      showNotification(
        'Could not load questions from other students. Using sample questions instead.',
        'warning',
      )
    } finally {
      setLoadingMoreQuestions(false)
      // Set hasLoadedMoreQuestions to true after loading more questions
      setHasLoadedMoreQuestions(true)
    }
  }

  // Remove a question from a category and put it back in the stack
  const handleRemoveFromCategory = (categoryId, questionId) => {
    const categoryQuestions = [...categorizedQuestions[categoryId]]
    const questionIndex = categoryQuestions.findIndex(
      (q) => q.id === questionId,
    )

    if (questionIndex !== -1) {
      const question = categoryQuestions[questionIndex]
      categoryQuestions.splice(questionIndex, 1)

      setCategorizedQuestions({
        ...categorizedQuestions,
        [categoryId]: categoryQuestions,
      })

      setQuestionStack([...questionStack, question])

      // Check if the removed question was from initial set, and if so, update the status
      if (hasInitialQuestionsBeenCategorized) {
        const totalCategorizedQuestions = Object.values({
          ...categorizedQuestions,
          [categoryId]: categoryQuestions,
        }).reduce((total, arr) => total + arr.length, 0)

        if (totalCategorizedQuestions < initialQuestionCount) {
          setHasInitialQuestionsBeenCategorized(false)
        }
      }
    }
  }

  // Handle drag start
  const handleDragStart = (id) => {
    setActiveDragId(id)
  }

  // Handle drag over category
  const handleDragOverCategory = (e, categoryId) => {
    e.preventDefault()
    e.stopPropagation()
    e.dataTransfer.dropEffect = 'move'
    setHighlightedCategory(categoryId)
  }

  // Handle drag leave
  const handleDragLeave = () => {
    setHighlightedCategory(null)
  }

  // Handle drop on category
  const handleDropOnCategory = (e, categoryId) => {
    e.preventDefault()
    e.stopPropagation()
    setHighlightedCategory(null)

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      const { id, text, source } = data

      // Check if this question is from the stack
      const questionIndex = questionStack.findIndex((q) => q.id === id)

      if (questionIndex !== -1) {
        // Move from stack to category
        const newStack = [...questionStack]
        newStack.splice(questionIndex, 1)

        const updatedCategories = {
          ...categorizedQuestions,
          [categoryId]: [
            ...categorizedQuestions[categoryId],
            { id, text, source },
          ],
        }

        setCategorizedQuestions(updatedCategories)
        setQuestionStack(newStack)
      } else {
        // Move from another category
        let sourceCategory = null
        let sourceIndex = -1

        // Find which category has this question
        for (const catId in categorizedQuestions) {
          const index = categorizedQuestions[catId].findIndex(
            (q) => q.id === id,
          )
          if (index !== -1) {
            sourceCategory = catId
            sourceIndex = index
            break
          }
        }

        if (sourceCategory && sourceCategory !== categoryId) {
          // Create new state objects
          const newCategorized = { ...categorizedQuestions }

          // Move question between categories
          const question = { ...newCategorized[sourceCategory][sourceIndex] }
          newCategorized[sourceCategory] = [...newCategorized[sourceCategory]]
          newCategorized[sourceCategory].splice(sourceIndex, 1)

          newCategorized[categoryId] = [...newCategorized[categoryId], question]

          setCategorizedQuestions(newCategorized)
        }
      }
    } catch (error) {
      logger.app.error('Error processing drop:', error)
    }

    setActiveDragId(null)
  }

  // Handle drop on question stack
  const handleDropOnStack = (e) => {
    e.preventDefault()
    e.stopPropagation()

    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'))
      const { id } = data

      // Check if this question is from a category
      let sourceCategory = null
      let sourceIndex = -1

      // Find which category has this question
      for (const catId in categorizedQuestions) {
        const index = categorizedQuestions[catId].findIndex((q) => q.id === id)
        if (index !== -1) {
          sourceCategory = catId
          sourceIndex = index
          break
        }
      }

      if (sourceCategory) {
        // Create new state objects
        const newCategorized = { ...categorizedQuestions }

        // Move question from category to stack
        const question = { ...newCategorized[sourceCategory][sourceIndex] }
        newCategorized[sourceCategory] = [...newCategorized[sourceCategory]]
        newCategorized[sourceCategory].splice(sourceIndex, 1)

        setCategorizedQuestions(newCategorized)
        setQuestionStack([...questionStack, question])

        // Check if the removed question was from initial set, and if so, update the status
        if (hasInitialQuestionsBeenCategorized) {
          const totalCategorizedQuestions = Object.values(
            newCategorized,
          ).reduce((total, arr) => total + arr.length, 0)

          if (totalCategorizedQuestions < initialQuestionCount) {
            setHasInitialQuestionsBeenCategorized(false)
          }
        }
      }
    } catch (error) {
      logger.app.error('Error processing drop on stack:', error)
    }

    setActiveDragId(null)
  }

  // NEW FUNCTION: Handle continue button click
  const handleContinueClick = () => {
    // Get the current URL parameters
    const currentUrlParams = new URLSearchParams(window.location.search)

    // Create the new URL with the same parameters
    const newUrl = `/ArriveGuidelines?${currentUrlParams.toString()}`

    // Navigate to the new URL
    window.location.href = newUrl

    // If an onContinue prop was provided, still call it with the categorized questions
    if (onContinue) {
      onContinue(categorizedQuestions)
    }
  }

  return (
    <Container maxWidth="lg" sx={{ py: 3 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h6" component="h2">
          Match your questions to the ARRIVE guideline that best describes them.
        </Typography>
      </Box>

      {isLoading ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            flexDirection: 'column',
          }}
        >
          <CircularProgress size={40} sx={{ mb: 2 }} />
          <Typography>Loading your questions...</Typography>
        </Box>
      ) : error ? (
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            height: '300px',
            flexDirection: 'column',
            color: 'error.main',
          }}
        >
          <Typography>{error}</Typography>
          <Button
            variant="contained"
            sx={{ mt: 2 }}
            onClick={() => window.location.reload()}
          >
            Retry
          </Button>
        </Box>
      ) : (
        <>
          {/* Questions Stack Area */}
          <Box
            onDragOver={(e) => {
              e.preventDefault()
              e.dataTransfer.dropEffect = 'move'
            }}
            onDrop={handleDropOnStack}
            sx={{
              display: 'flex',
              flexWrap: 'wrap',
              gap: 2,
              minHeight: 200,
              p: 2,
              border: activeDragId ? '2px dashed #000' : '1px dashed #ccc',
              borderRadius: 1,
              mb: 3,
              backgroundColor: activeDragId
                ? 'rgba(0, 0, 0, 0.05)'
                : 'transparent',
              transition: 'all 0.2s ease',
            }}
          >
            {questionStack.map((question) => (
              <QuestionCard
                key={question.id}
                id={question.id}
                text={question.text}
                source={question.source}
                onDragStart={handleDragStart}
              />
            ))}

            {questionStack.length === 0 && (
              <Box
                sx={{
                  width: '100%',
                  height: 120,
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#777',
                }}
              >
                <Typography variant="body2">
                  No more questions to categorize
                </Typography>
              </Box>
            )}
          </Box>

          {/* "More Questions" button - UPDATED STYLING */}
          <Button
            variant="outlined"
            startIcon={<AddIcon />}
            onClick={handleLoadMoreQuestions}
            disabled={
              !hasInitialQuestionsBeenCategorized ||
              loadingMoreQuestions ||
              hasLoadedMoreQuestions
            }
            sx={{
              bgcolor:
                hasInitialQuestionsBeenCategorized &&
                !loadingMoreQuestions &&
                !hasLoadedMoreQuestions
                  ? '#000' // Changed to black when enabled
                  : '#e0e0e0', // Kept disabled color
              color:
                hasInitialQuestionsBeenCategorized &&
                !loadingMoreQuestions &&
                !hasLoadedMoreQuestions
                  ? '#fff' // Changed text to white for better contrast
                  : '#999', // Kept disabled text color
              border:
                hasInitialQuestionsBeenCategorized &&
                !loadingMoreQuestions &&
                !hasLoadedMoreQuestions
                  ? '1px solid #000' // Changed to black border when enabled
                  : '1px solid #ccc', // Kept disabled border
              textTransform: 'none',
              fontWeight: 'bold',
              '&:hover': {
                bgcolor:
                  hasInitialQuestionsBeenCategorized &&
                  !loadingMoreQuestions &&
                  !hasLoadedMoreQuestions
                    ? '#6E00FF' // Changed hover color to #6E00FF
                    : '#e0e0e0',
                border:
                  hasInitialQuestionsBeenCategorized &&
                  !loadingMoreQuestions &&
                  !hasLoadedMoreQuestions
                    ? '1px solid #6E00FF' // Changed hover border to match
                    : '1px solid #ccc',
                cursor:
                  hasInitialQuestionsBeenCategorized &&
                  !loadingMoreQuestions &&
                  !hasLoadedMoreQuestions
                    ? 'pointer'
                    : 'not-allowed',
              },
            }}
          >
            {loadingMoreQuestions ? (
              <>
                <CircularProgress size={20} sx={{ mr: 1, color: '#999' }} />
                LOADING...
              </>
            ) : hasLoadedMoreQuestions ? (
              'QUESTIONS ADDED'
            ) : (
              'MORE QUESTIONS'
            )}
          </Button>

          {/* ARRIVE Guideline Categories */}
          <Grid
            container
            spacing={3}
            sx={{
              display: 'grid',
              gridTemplateColumns: 'repeat(3, 1fr)',
              gap: 3,
              mt: 3,
            }}
          >
            {guidelineCategories.map((category) => (
              <Grid item key={category.id} sx={{ width: '100%' }}>
                <Card
                  onDragOver={(e) => handleDragOverCategory(e, category.id)}
                  onDragLeave={handleDragLeave}
                  onDrop={(e) => handleDropOnCategory(e, category.id)}
                  sx={{
                    border: '1px solid #000',
                    borderRadius: 1,
                    boxShadow: '5px 5px 0px #000',
                    height: '100%',
                    minHeight: 250,
                    display: 'flex',
                    flexDirection: 'column',
                    transition: 'transform 0.2s, border 0.2s',
                    backgroundColor:
                      highlightedCategory === category.id
                        ? 'rgba(98, 0, 238, 0.1)'
                        : 'transparent',
                    '&:hover': {
                      transform: 'scale(1.02)',
                    },
                  }}
                >
                  <CardContent
                    sx={{
                      height: '100%',
                      padding: 2,
                      '&:last-child': { paddingBottom: 2 },
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                      <Tooltip 
                        title={getTooltipContent(category.id)}
                        arrow 
                        placement="top"
                        componentsProps={{
                          tooltip: {
                            sx: {
                              bgcolor: '#333',
                              '& .MuiTooltip-arrow': {
                                color: '#333',
                              },
                              fontSize: '0.9rem',
                              padding: '10px',
                              maxWidth: '300px'
                            },
                          },
                        }}
                      >
                        <InfoIcon sx={{ color: '#6200ee', mr: 1, cursor: 'help' }} />
                      </Tooltip>
                      <Typography
                        variant="h6"
                        component="div"
                        textAlign="center"
                      >
                        {category.title}
                      </Typography>
                    </Box>

                    <Box
                      sx={{
                        mt: 2,
                        minHeight: 100,
                        p: 1,
                        border:
                          highlightedCategory === category.id
                            ? '2px solid #6200ee'
                            : activeDragId
                            ? '2px dashed #6200ee'
                            : '1px dashed #ccc',
                        borderRadius: 1,
                        flex: 1,
                        transition: 'all 0.2s ease',
                        backgroundColor: 'rgba(98, 0, 238, 0.05)', // Light purple background
                      }}
                    >
                      {categorizedQuestions[category.id].length > 0 ? (
                        categorizedQuestions[category.id].map((question) => (
                          <CategorizedQuestion
                            key={question.id}
                            id={question.id}
                            text={question.text}
                            onRemove={handleRemoveFromCategory}
                            onDuplicate={handleDuplicateQuestion}
                            categoryId={category.id}
                          />
                        ))
                      ) : (
                        <Box
                          sx={{
                            display: 'flex',
                            justifyContent: 'center',
                            alignItems: 'center',
                            height: '100%',
                            color: 'rgba(98, 0, 238, 0.7)', // Purple text color
                            fontStyle: 'italic',
                          }}
                        >
                          <Typography variant="body2">Drop cards here</Typography>
                        </Box>
                      )}
                    </Box>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </>
      )}

      {/* Continue Button - UPDATED STYLING */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 4 }}>
        <Button
          variant="contained"
          disabled={isLoading || (!hasInitialQuestionsBeenCategorized && !isComplete)}
          onClick={handleContinueClick}
          sx={{
            bgcolor: (hasInitialQuestionsBeenCategorized || isComplete) ? '#000' : '#ccc', // Black when enabled, gray when disabled
            color: '#fff',
            borderRadius: 1,
            px: 3,
            py: 1,
            '&:hover': {
              bgcolor: (hasInitialQuestionsBeenCategorized || isComplete) ? '#6E00FF' : '#ccc', // Purple hover when enabled
            },
          }}
        >
          CONTINUE
        </Button>
      </Box>

      {/* Notification Snackbar */}
      <Snackbar
        open={notification.open}
        autoHideDuration={4000}
        onClose={handleCloseNotification}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert
          onClose={handleCloseNotification}
          severity={notification.severity}
          sx={{ width: '100%' }}
        >
          {notification.message}
        </Alert>
      </Snackbar>
    </Container>
  )
}