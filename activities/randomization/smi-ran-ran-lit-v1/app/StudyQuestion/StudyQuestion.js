'use client'
import React, { useState, useEffect } from 'react'
import {
  Box,
  Typography,
  Button,
  TextField,
  Paper,
  Container,
  IconButton,
  Stack,
  LinearProgress,
  Tooltip,
} from '@mui/material'
import CloseIcon from '@mui/icons-material/Close'
import AddCircleIcon from '@mui/icons-material/AddCircle'
import { useSearchParams, useRouter } from 'next/navigation'
import C4RButton from '../../../../../packages/ui/src/mui/components/C4RButton'

export default function RandomizationQuestionsScreen({
  studyName = 'Study name',
  studyDescription = 'This section contains the brief description of the study provided for this activity.',
  onContinue,
}) {
  const [questions, setQuestions] = useState([])
  const [currentQuestion, setCurrentQuestion] = useState('')
  const [selectedIndex, setSelectedIndex] = useState(null)
  const [userId, setUserId] = useState('')
  const [charCount, setCharCount] = useState(0)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedSection, setSelectedSection] = useState(null)
  const searchParams = useSearchParams()
  const router = useRouter()

  const minCharCount = 10

  // Generate a unique userId when the component mounts
  useEffect(() => {
    // Check if there's already a userId in the URL
    const urlUserId = searchParams.get('userId')

    if (urlUserId) {
      // If userId already exists in URL, use that
      setUserId(urlUserId)
      console.log('Using existing userId from URL:', urlUserId)
    } else {
      // Generate a new unique user ID
      const generateUserId = () => {
        const timestamp = new Date().getTime()
        const randomStr = Math.random().toString(36).substring(2, 10)
        return `user_${timestamp}_${randomStr}`
      }

      const newUserId = generateUserId()
      setUserId(newUserId)

      // Update the URL to include the userId
      const currentUrl = new URL(window.location.href)
      currentUrl.searchParams.set('userId', newUserId)

      // Replace current URL with the new one containing userId
      window.history.replaceState({}, '', currentUrl.toString())

      console.log('Generated new userId and added to URL:', newUserId)
      localStorage.setItem('userId', newUserId)
    }

    // Get the selectedSection from URL params
    const sectionParam = searchParams.get('selectedSection')
    if (sectionParam) {
      setSelectedSection(sectionParam)
      console.log('Using selectedSection from URL:', sectionParam)
    }
  }, [searchParams])

  // Calculate character count when input changes
  useEffect(() => {
    const count = currentQuestion.length
    setCharCount(count)
  }, [currentQuestion])

  const handleQuestionChange = (e) => {
    setCurrentQuestion(e.target.value)
  }

  // Function to save question to the API
  const saveQuestionToAPI = async (questionText) => {
    setIsLoading(true)
    try {
      // Get all URL search params to include in the request
      const allParams = {}
      searchParams.forEach((value, key) => {
        allParams[key] = value
      })

      // Extract sessionId from URL if available
      const sessionId = searchParams.get('sessionID') || 'default-session'

      // Use the selectedSection from state which was set from URL
      const sectionParam =
        selectedSection || searchParams.get('selectedSection') || '1'

      const response = await fetch('/api/questions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionId,
          userId: userId,
          questionText: questionText,
          selectedSection: sectionParam,
          // Include all other URL params
          ...allParams,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.message || 'Failed to save question')
      }

      console.log('Question saved to API:', data)
      return true
    } catch (error) {
      console.error('Error saving question:', error)
      return false
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddQuestion = async () => {
    if (charCount >= minCharCount) {
      // Save to API first
      const saveSuccessful = await saveQuestionToAPI(currentQuestion)

      // Continue with the existing UI flow regardless of API success
      // This maintains the original UI behavior while still saving to the API
      const newQuestion = {
        text: currentQuestion,
        userId: userId,
        timestamp: new Date().toISOString(),
      }

      setQuestions([...questions, newQuestion])
      setCurrentQuestion('')
      setCharCount(0)

      // Log the API result without changing the UI flow
      if (!saveSuccessful) {
        console.warn(
          'Question was added to the UI but failed to save to the API',
        )
      }
    }
  }

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && charCount >= minCharCount) {
      handleAddQuestion()
    }
  }

  const handleRemoveQuestion = (index, e) => {
    e.stopPropagation() // Prevent selection when removing
    const updatedQuestions = [...questions]
    updatedQuestions.splice(index, 1)
    setQuestions(updatedQuestions)
    if (selectedIndex === index) {
      setSelectedIndex(null)
    } else if (selectedIndex > index) {
      setSelectedIndex(selectedIndex - 1)
    }
  }

  const handleSelectQuestion = (index) => {
    setSelectedIndex(index === selectedIndex ? null : index)
  }

  const handleContinue = () => {
    if (onContinue) {
      // Get the selectedSection directly from the URL again to ensure it's current
      const currentSectionParam = searchParams.get('selectedSection')
      // Pass along the questions, userId, and selectedSection
      onContinue(questions, userId, currentSectionParam || selectedSection)
      console.log(
        'Continuing with selectedSection:',
        currentSectionParam || selectedSection,
      )
    }
  }

  // Calculate progress percentage for character count
  const progressPercentage = Math.min((charCount / minCharCount) * 100, 100)

  // Get appropriate color for the progress bar
  const getProgressColor = () => {
    if (progressPercentage < 50) return '#f44336' // Red
    if (progressPercentage < 100) return '#ff9800' // Orange
    return '#00C802' // C4R Green
  }

  // Get status text for character count
  const getCharCountStatus = () => {
    if (charCount === 0) return 'Start typing your question'
    if (charCount < minCharCount)
      return `Add ${minCharCount - charCount} more character${
        minCharCount - charCount !== 1 ? 's' : ''
      }`
    return 'Question meets character requirement ✓'
  }


  return (
    <Container maxWidth="md" sx={{ py: 3 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h6" component="h2">
          Read the methods used in the study. What questions do you have about
          the randomization procedure?
        </Typography>
      </Box>

      {/* Study Information Box */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#e0e0e0',
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography variant="h5" component="h3" fontWeight="bold" gutterBottom>
          {studyName}
        </Typography>
        <Typography
          variant="body1"
          sx={{
            whiteSpace: 'pre-line', // or 'pre-wrap' for more exact spacing preservation
            mb: 2,
          }}
        >
          {studyDescription}
        </Typography>
      </Paper>

      {/* Randomization Questions Section */}
      <Paper
        elevation={0}
        sx={{
          bgcolor: '#e0e0e0',
          p: 3,
          mb: 4,
          borderRadius: 2,
        }}
      >
        <Typography
          variant="subtitle1"
          sx={{
            textTransform: 'uppercase',
            letterSpacing: 1,
            mb: 2,
            fontWeight: 500,
            color: '#555',
          }}
        >
          Additional Randomization Questions
        </Typography>

        <Box sx={{ position: 'relative', mb: 3 }}>
          <TextField
            fullWidth
            variant="outlined"
            placeholder="Enter a question about the randomization procedure in the study..."
            value={currentQuestion}
            onChange={handleQuestionChange}
            onKeyPress={handleKeyPress}
            multiline
            rows={3}
            disabled={isLoading}
            sx={{
              mb: 1,
              bgcolor: 'white',
              borderRadius: 1,
              '& .MuiOutlinedInput-root': {
                borderRadius: 1,
              },
            }}
          />

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
              mb: 1,
            }}
          >
            <Typography
              variant="caption"
              sx={{
                color:
                  charCount >= minCharCount
                    ? '#00C802'
                    : charCount > 0
                    ? '#ff9800'
                    : '#757575',
                fontWeight: 500,
              }}
            >
              {getCharCountStatus()}
            </Typography>
            <Typography variant="caption" sx={{ color: '#757575' }}>
              {charCount} character{charCount !== 1 ? 's' : ''}
            </Typography>
          </Box>

          <LinearProgress
            variant="determinate"
            value={progressPercentage}
            sx={{
              height: 5,
              borderRadius: 5,
              mb: 2,
              bgcolor: '#e0e0e0',
              '& .MuiLinearProgress-bar': {
                bgcolor: getProgressColor(),
              },
            }}
          />

          <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
            <Tooltip
              title={
                charCount < minCharCount
                  ? `Add at least ${minCharCount} characters`
                  : 'Add question'
              }
            >
              <span>
                <C4RButton
                  variant="c4rPrimary"
                  onClick={handleAddQuestion}
                  disabled={charCount < minCharCount || isLoading}
                  startIcon={<AddCircleIcon />}
                >
                  {isLoading ? 'Saving...' : 'Add Question'}
                </C4RButton>
              </span>
            </Tooltip>
          </Box>
        </Box>

        <Typography variant="subtitle2" sx={{ mb: 2, color: '#555' }}>
          Your Questions ({questions.length})
        </Typography>

        <Stack spacing={1}>
          {questions.length > 0 ? (
            questions.map((question, index) => (
              <Box
                key={index}
                onClick={() => handleSelectQuestion(index)}
                sx={{
                  p: 2,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'flex-start',
                  bgcolor: index === selectedIndex ? '#bbdefb' : 'white',
                  border:
                    index === selectedIndex ? '2px solid #2196f3' : 'none',
                  borderRadius: 1,
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  minWidth: 0, // Add this to enable flex item shrinking
                }}
              >
                <Box
                  sx={{
                    flexGrow: 1,
                    overflow: 'hidden',
                    mr: 1, // Add margin to prevent text from touching the close button
                  }}
                >
                  <Typography sx={{ fontWeight: 500, color: '#555', mb: 1 }}>
                    RANDOMIZATION QUESTION
                  </Typography>
                  <Typography
                    variant="body2"
                    sx={{
                      wordBreak: 'break-word', // Ensures long words also wrap
                      whiteSpace: 'pre-wrap', // Preserves whitespace and line breaks
                    }}
                  >
                    {question.text}
                  </Typography>
                </Box>
                <IconButton
                  edge="end"
                  onClick={(e) => handleRemoveQuestion(index, e)}
                  size="small"
                  sx={{
                    ml: 1,
                    flexShrink: 0, // Prevent the button from shrinking
                  }}
                >
                  <CloseIcon />
                </IconButton>
              </Box>
            ))
          ) : (
            <Box
              sx={{
                p: 4,
                bgcolor: 'rgba(255, 255, 255, 0.5)',
                borderRadius: 1,
                textAlign: 'center',
                border: '1px dashed #bdbdbd',
              }}
            >
              <Typography color="textSecondary">
                No questions added yet. Add your first question above.
              </Typography>
            </Box>
          )}
        </Stack>
      </Paper>

      <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
        <C4RButton
          variant="c4rPrimary"
          disabled={questions.length === 0 || isLoading}
          onClick={handleContinue}
          sx={{
            textTransform: 'uppercase',
            fontWeight: 500,
            px: 3,
            py: 1,
          }}
        >
          CONTINUE
        </C4RButton>
      </Box>
    </Container>
  )
}
