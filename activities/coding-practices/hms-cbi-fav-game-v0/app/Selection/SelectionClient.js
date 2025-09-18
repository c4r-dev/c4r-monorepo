'use client'

import { useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button, TextField, Box } from '@mui/material'
import DesignChoiceScreen from '../components/DesignChoiceScreen/DesignChoiceScreen'
import CustomButton from '../components/CustomButton/CustomButton'

// Function to shuffle array using Fisher-Yates algorithm
function shuffleArray(array) {
  let shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

function generateRounds(choices) {
  const shuffledChoices = shuffleArray(choices.slice(0, 6)) // Only first 6 choices
  const rounds = []
  for (let i = 0; i < 3; i++) {
    // Loop runs 3 times
    rounds.push({
      round: i + 1,
      title1: shuffledChoices[i * 2]?.title || 'Placeholder Title 1',
      choice1: shuffledChoices[i * 2]?.choice || 'Placeholder choice 1',
      title2: shuffledChoices[i * 2 + 1]?.title || 'Placeholder Title 2',
      choice2: shuffledChoices[i * 2 + 1]?.choice || 'Placeholder choice 2',
      input: '', // Initialize input field for user text
      isChoice1Selected: false,
      isChoice2Selected: false,
    })
  }
  return rounds
}

// Your choices array
const choices = [
  {
    title: 'Analysis parameter: smoothing',
    choice:
      'Reduce noise by replacing each three-dimensional pixel (voxel) \u0027 s value with a weighted average of its neighbors within a radius of x pixels. Choose x so that the data most clearly shows a peak. ',
  },
  {
    title: 'Analyzing the most correlated voxel',
    choice:
      'To quantify effect size: define a region of interest based on the three-dimensional pixels (voxels) that show strongest activation. Then, calculate correlation of this region with the stimulus type.',
  },
  {
    title: 'Personality screen',
    choice:
      'Emotional people may have greater peaks in activity in response to emotional images. Have potential participants complete a personality inventory and recruit the more emotional ones.',
  },
  {
    title: 'Simulate subjects',
    choice:
      'Improve efficiency by recruiting only 12 subjects and simulating an additional 12 subjects after data has been collected.',
  },
  {
    title: 'A simple control',
    choice:
      'Compare responses to emotional pictures of humans and animals to a baseline of neutral landscapes.',
  },
  {
    title: 'Multiple comparison correction',
    choice:
      'Divide the threshold for statistical significance for the experiment by the number of tests, i.e. the number of three-dimensional pixels (voxels) examined.',
  },
  {
    title: 'Adjust region of interest',
    choice:
      'Define regions of interest in subject brain images based on known anatomical regions, then adjust the region of interest that gets analyzed for each participant to capture the peak of activation if it falls outside of, but near the anatomically defined region of interest.',
  },
  {
    title: 'Statistical correction',
    choice:
      'Divide the threshold for statistical significance for the experiment by the number of tests, i.e. the number of three-dimensional pixels (voxels) examined.',
  },
]

export default function ObstacleListClient() {
  const router = useRouter()
  const searchParams = useSearchParams()

  // Extract the round parameter directly from the URL
  const roundParam = searchParams.get('round') || '1'
  const currentRoundIndex = parseInt(roundParam, 10) - 1

  // Store sessionID in state so it persists even if searchParams updates.
  const [sessionID, setSessionID] = useState('')
  const [roundsData, setRoundsData] = useState([])
  const [selections, setSelections] = useState({})
  const [lockedAnswers, setLockedAnswers] = useState({})
  const [isSaving, setIsSaving] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // On mount, store the sessionID (if any) from the URL.
  useEffect(() => {
    const sid = searchParams.get('sessionId')
    if (sid) {
      setSessionID(sid)
    }
  }, [searchParams])

  // Generate roundsData once on mount.
  useEffect(() => {
    setRoundsData(generateRounds(choices))
  }, [])

  //same sessionId has same roundsData
  useEffect(() => {
    if (!sessionID) return // Ensure sessionID is available

    // Try to load existing roundsData from localStorage
    const storedRounds = localStorage.getItem(`roundsData-${sessionID}`)

    if (storedRounds) {
      setRoundsData(JSON.parse(storedRounds))
    } else {
      // If no stored data, generate new roundsData and store it
      const newRounds = generateRounds(choices)
      setRoundsData(newRounds)
      localStorage.setItem(`roundsData-${sessionID}`, JSON.stringify(newRounds))
    }
  }, [sessionID])

  // Update the strategy selection, including the round's boolean flags.
  const handleStrategySelection = (strategy) => {
    if (lockedAnswers[currentRoundIndex]) return

    const newRoundsData = [...roundsData]
    const currentRound = newRoundsData[currentRoundIndex]

    if (strategy === currentRound.choice1) {
      currentRound.isChoice1Selected = true
      currentRound.isChoice2Selected = false
    } else if (strategy === currentRound.choice2) {
      currentRound.isChoice1Selected = false
      currentRound.isChoice2Selected = true
    }

    setRoundsData(newRoundsData)
    setSelections((prevSelections) => ({
      ...prevSelections,
      [currentRoundIndex]: { strategy },
    }))
  }

  const handleLockAnswer = () => {
    setLockedAnswers((prevLocked) => ({
      ...prevLocked,
      [currentRoundIndex]: true,
    }))
  }

  const handleTextInputChange = (event) => {
    const newRoundsData = [...roundsData]
    newRoundsData[currentRoundIndex].input = event.target.value
    setRoundsData(newRoundsData)
  }

  // When navigating to the next round, rebuild the URL to include sessionID.
  const handleNextRound = () => {
    logger.app.info('hello1')

    if (currentRoundIndex < roundsData.length - 1) {
      logger.app.info('hello2', sessionID + 'this is the session id')

      let url = `?round=${currentRoundIndex + 2}`
      if (sessionID) {
        logger.app.info('hello')
        url += `&sessionId=${sessionID}`
      }
      router.push(url)
    } else {
      // handleSubmit();
      handleFinalSubmit()
    }
  }

  // Function to extract the last alphabet character from a string
  function extractLastAlphabet(str) {
    // This regex matches the last alphabet letter in the string.
    // Explanation:
    //   [A-Za-z]        => Matches any alphabetical character.
    //   (?!.*[A-Za-z])   => Negative lookahead to ensure no other alphabetical character follows.
    const match = str.match(/[A-Za-z](?!.*[A-Za-z])/)
    return match ? match[0] : ''
  }

  // Function to generate a unique subsessionId
  function generateUniqueSubsessionId() {
    return 'subsession-' + Math.random().toString(36).substring(2, 10) // Generates a random 8-character alphanumeric string
  }

  const handleFinalSubmit = async () => {
    setIsSubmitting(true) // Set loading state

    // Generate a unique subsessionId
    const subsessionId = generateUniqueSubsessionId()

    // Build the payload with sessionId and unique subsessionId
    const payload = {
      sessionId: sessionID,
      subsessionId, // Unique subsessionId
      roundsData,
    }

    logger.app.info('Final payload:', payload)

    try {
      // Send the payload to your POST API endpoint
      const response = await fetch('/api/selection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      })

      if (response.ok) {
        const responseData = await response.json()
        logger.app.info('Successfully saved session data:', responseData)

        // Append subsessionId to URL and navigate
        // router.push(
        //   `/matchup${
        //     sessionID
        //       ? `?sessionId=${sessionID}&subsessionId=${subsessionId}`
        //       : ''
        //   }`,
        // )

        router.push(
          `/analyze?sessionId=${sessionID}`,
        )
      } else {
        logger.app.error('Error saving session data:', response.statusText)
      }
    } catch (error) {
      logger.app.error('Error in POST request:', error)
    } finally {
      setIsSubmitting(false) // Reset loading state after navigation
    }
  }

  const currentChoices = roundsData[currentRoundIndex] || {
    round: currentRoundIndex + 1,
    choice1: '',
    choice2: '',
    input: '',
  }
  const selectedStrategy = selections[currentRoundIndex]
  const isLocked = lockedAnswers[currentRoundIndex]
  const nextRoundNumber =
    currentRoundIndex < roundsData.length - 1 ? currentChoices.round + 1 : null

  // Disable the "next" button if no selection has been made.
  const isNextButtonDisabled = !selectedStrategy

  return (
    <div className="obstacle-container">
      <DesignChoiceScreen />
      {logger.app.info(JSON.stringify(roundsData) + 'this is the rounds data')}
      {/* <div className="obstacle-header" style={{ marginTop: '20px' }}>
        <h3>
          Round {currentChoices.round}: Which choice do you think favors
          hypothesis 1?
        </h3>
      </div> */}

      <div
        className="strategy-buttons"
        style={{ marginTop: '20px', display: 'flex', width: '100%' }}
      >
        <button
          className={`strategy-button ${
            selectedStrategy?.strategy === currentChoices.choice1
              ? 'selected'
              : ''
          } ${isLocked ? 'disabled-hover' : ''}`}
          onClick={() => handleStrategySelection(currentChoices.choice1)}
          disabled={isLocked}
          style={{
            flex: 1, // Each button occupies exactly half
            minWidth: '50%', // Ensures it never shrinks below 50%
            boxSizing: 'border-box', // Includes padding/borders in width calculations
            textAlign: 'center', // Centers text
          }}
        >
          <h4>{currentChoices.title1}</h4>
          <p>{currentChoices.choice1}</p>
        </button>

        <button
          className={`strategy-button ${
            selectedStrategy?.strategy === currentChoices.choice2
              ? 'selected'
              : ''
          } ${isLocked ? 'disabled-hover' : ''}`}
          onClick={() => handleStrategySelection(currentChoices.choice2)}
          disabled={isLocked}
          style={{
            flex: 1, // Each button occupies exactly half
            minWidth: '50%', // Ensures it never shrinks below 50%
            boxSizing: 'border-box', // Includes padding/borders in width calculations
            textAlign: 'center', // Centers text
          }}
        >
          <h4>{currentChoices.title2}</h4>
          <p>{currentChoices.choice2}</p>
        </button>
      </div>

      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          marginTop: 3,
          width: '100%',
        }}
      >
        <TextField
          multiline
          rows={4}
          placeholder="Why would this choice make H1 more likely?..."
          variant="outlined"
          sx={{
            backgroundColor: '#fff',
            borderRadius: '8px',
            width: '70%',
            border: '1px solid black',
            marginBottom: 2,
          }}
          value={currentChoices.input}
          onChange={handleTextInputChange}
        />

        {/* <CustomButton
          onClick={handleNextRound}
          ariaLabel="Test button"
          disabled={isSubmitting || isNextButtonDisabled} // Disable while submitting or if no selection
          //  variant="purple"
          customStyles={{
            backgroundColor:
              isSubmitting || isNextButtonDisabled ? '#AD9FFF !important' : '#6F00FF !important', // Change background based on state
            color: 'white', // Ensure text remains visible
            cursor:
              isSubmitting || isNextButtonDisabled ? 'not-allowed' : 'pointer', // Show "not-allowed" cursor when disabled
            transition: 'background-color 0.3s ease-in-out', // Smooth transition effect
          }}
          className=""
        >
          {isSubmitting
            ? 'Loading...'
            : nextRoundNumber
            ? `Round ${nextRoundNumber}`
            : 'Submit'}
        </CustomButton> */}

        <CustomButton
          onClick={handleNextRound}
          ariaLabel="Test button"
          disabled={isSubmitting || isNextButtonDisabled} // Disable while submitting or if no selection
          customStyles={{
            backgroundColor:
              isSubmitting || isNextButtonDisabled
                ? '#AD9FFF !important'
                : '#6F00FF !important', // Default colors based on state
            color: 'white', // Ensure text remains visible
            cursor:
              isSubmitting || isNextButtonDisabled ? 'not-allowed' : 'pointer', // Show "not-allowed" cursor when disabled
            transition: 'background-color 0.3s ease-in-out', // Smooth transition effect
            '&:hover': {
              backgroundColor:
                isSubmitting || isNextButtonDisabled
                  ? '#AD9FFF !important'
                  : '#5700CA !important', // Change hover color only when enabled
            },
          }}
          className=""
        >
          {isSubmitting
            ? 'Loading...'
            : nextRoundNumber
            ? `Round ${nextRoundNumber}`
            : 'Submit'}
        </CustomButton>
      </Box>
    </div>
  )
}