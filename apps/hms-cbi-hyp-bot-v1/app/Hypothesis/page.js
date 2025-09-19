'use client';

const logger = require('../../../../packages/logging/logger.js');

import React, { useState, useEffect, useRef, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { v4 as uuidv4 } from 'uuid' // Import uuid for generating unique IDs
import Image from 'next/image'
import Header from '../components/Header/Header'
import {
  Grid,
  Box,
  TextField,
  Button,
  Typography,
  Divider,
} from '@mui/material'
import CustomModal from '../components/CustomModal'
import CustomButton from '../components/Button/Button'

export default function HomePage() {
  const [isFirstInputDisabled, setFirstInputDisabled] = useState(false)
  const [isSecondBoxDisabled, setSecondBoxDisabled] = useState(false)
  const [randomHypothesis, setRandomHypothesis] = useState('')
  const secondBoxRef = useRef(null)
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
  const [hypothesisNumber, setHypothesisNumber] = useState(null)
  const [hypothesisDesc, setHypothesisDesc] = useState('')
  const [userId, setUserId] = useState(uuidv4()) // Generate unique userId
  const [isSecondSelected, setisSecondSelected] = useState(false)
  const [isFirstSelected, setIsFirstSelected] = useState(false)

  const router = useRouter()

  const hypotheses = [
    'Hypothesis 1: Increased dopamine improves working memory in mice.',
    'Hypothesis 2: Neuroplasticity is greater in younger brains.',
    'Hypothesis 3: Stress causes brain damage in humans.',
    'Hypothesis 4: Caffeine increases brain activity.',
    'Hypothesis 5: Sleep improves learning.',
    'Hypothesis 6: The hippocampus is responsible for memory.',
    'Hypothesis 7: Exercise makes the brain healthier.',
    'Hypothesis 8: Increased serotonin reduces depression.',
    "Hypothesis 9: Oxytocin is the 'love hormone' in humans.",
    'Hypothesis 10: Neurons in the visual cortex only process visual information.',
  ]

  const [sessionID, setSessionID] = useState(null)
  const [selectedGroup, setSelectedGroup] = useState(null)

  function UseValues() {
    const searchParams = useSearchParams()

    useEffect(() => {
      const session = searchParams.get('sessionId')
      const groupId = searchParams.get('selectedGroup')

      setSessionID(session)
      setSelectedGroup(groupId)
    }, [searchParams])

    return null
  }

  const closeModal = () => {
    setIsGuideModalVisible(false)
  }

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  // const handleGuideBtn = () => {
  //   logger.app.info('Guide button clicked')
  //   openModal(true)
  // }

  useEffect(() => {
    const randomIndex = Math.floor(Math.random() * hypotheses.length)
    setRandomHypothesis(hypotheses[randomIndex])
    setHypothesisNumber(randomIndex + 1)
  }, [])

  const handleFirstInputChange = (e) => {
    setIsFirstSelected(true)
    const inputValue = e.target.value.trim()
    if (inputValue !== '') {
      setSecondBoxDisabled(true)
      setHypothesisDesc(inputValue) // Save the custom hypothesis description
      setHypothesisNumber(Math.floor(Math.random() * 1000) + 1) // Generate a random number as the hypothesis ID
    } else {
      setSecondBoxDisabled(false)
      setHypothesisDesc('')
      setHypothesisNumber(null)
    }
  }

  const handleSecondBoxClick = () => {
    setSecondBoxDisabled(false)
    setisSecondSelected(true)
    setFirstInputDisabled(true)
    if (secondBoxRef.current) {
      secondBoxRef.current.focus()
    }

    if (!isSecondBoxDisabled) {
      const randomIndex = hypotheses.indexOf(randomHypothesis)
      if (randomIndex !== -1) {
        setHypothesisNumber(randomIndex + 1) // Set the hypothesis number based on the selected hypothesis
        setHypothesisDesc(randomHypothesis.split(': ')[1]) // Extract and save the hypothesis description
      }
    }
  }

  // const handleNextClick = async () => {

  //   router.push(`/LLMBot${queryParam}`)
  // }

  const handleNextClick = async () => {
    try {
      // Prepare the data to be sent to the POST API
      const postData = {
        sessionID,
        grpID: selectedGroup,
        userID: userId,
        hypNumber: hypothesisNumber,
        hypDesc: hypothesisDesc,
      }

      // Call the POST API
      const response = await fetch('/api/hypothesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(postData),
      })

      // Handle the response
      if (!response.ok) {
        const errorData = await response.json()
        logger.app.error('Error posting data:', errorData)
        alert(`Error: ${errorData.message}`)
        return
      }

      const responseData = await response.json()
      logger.app.info('POST API Response:', responseData)

      // Navigate to the next page with the query parameters
      router.push(`/LLMBot${queryParam}`)
    } catch (error) {
      logger.app.error('Error calling POST API:', error)
      alert('An error occurred while submitting data. Please try again.')
    }
  }

  const queryParam = `?sessionID=${sessionID}&selectedGroup=${selectedGroup}&userId=${userId}`

  return (
    <>
      <Suspense>
        <UseValues />
      </Suspense>
      <Box
        sx={{
          minHeight: '100vh',
          display: 'flex',
          flexDirection: 'column',
          padding: 2,
        }}
      >
        <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />

        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            marginBottom: 4,
            marginLeft: '-1%',
          }}
        >
          {/* <Image
            style={{ marginRight: '2%' }}
            src="/logo-sideways.svg"
            alt="Icon"
            width={24}
            height={24}
            onClick={handleGuideBtn}
          />
          <Typography variant="h4" fontWeight="bold">
            Alternative Hypothesis Bot
          </Typography> */}
          <Header />
        </Box>

        <Grid container spacing={2} alignItems="flex-start">
          <Grid item xs={12} sm={5}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Enter a starting hypothesis here!
            </Typography>
            {/* <TextField
              fullWidth
              placeholder="Enter something..."
              variant="outlined"
              sx={{ backgroundColor: 'white', borderRadius: 1 }}
              onChange={handleFirstInputChange}
              disabled={isFirstInputDisabled}
            /> */}
            <TextField
              fullWidth
              placeholder="Enter something..."
              variant="outlined"
              sx={{
                backgroundColor: 'white',
                borderRadius: 1,
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
                transform: 'scale(1)', // Initial state
                boxShadow: 'none', // Initial state
                border: isFirstSelected
                  ? '5px solid #7d3c98' // Purple border when selected
                  : '2px solid transparent', // Default border
                '&:hover': {
                  transform: isFirstInputDisabled ? 'scale(1)' : 'scale(1.05)', // Pop-up effect
                  boxShadow: isFirstInputDisabled
                    ? 'none'
                    : '0 4px 8px rgba(0, 0, 0, 0.1)', // Add subtle shadow
                },
                '& .MuiOutlinedInput-root': {
                  '& fieldset': {
                    borderColor: isFirstInputDisabled ? '#d3d3d3' : 'inherit',
                  },
                  '&:hover fieldset': {
                    borderColor: isFirstInputDisabled ? '#d3d3d3' : '#e0e0e0', // Change border color on hover
                  },
                  '&.Mui-focused fieldset': {
                    borderColor: '#1976d2', // Focus border color
                  },
                },
              }}
              onChange={handleFirstInputChange}
              disabled={isFirstInputDisabled}
            />
          </Grid>

          <Grid
            item
            xs={12}
            sm={2}
            display="flex"
            justifyContent="center"
            alignItems="center"
          >
            <Divider orientation="vertical" flexItem>
              <Typography variant="h4" fontWeight="bold">
                OR
              </Typography>
            </Divider>
          </Grid>

          <Grid item xs={12} sm={5}>
            <Typography variant="h6" sx={{ marginBottom: 1 }}>
              Alternatively, start with one of ours!
            </Typography>
            {/* <Box
              ref={secondBoxRef}
              onClick={!isSecondBoxDisabled ? handleSecondBoxClick : undefined}
              sx={{
                padding: 2,
                transition: "transform 0.2s, box-shadow 0.2s",
                backgroundColor: isSecondBoxDisabled ? '#f0f0f0' : 'rgb(57, 225, 248)',
                borderRadius: 1,
                textAlign: 'center',
                cursor: isSecondBoxDisabled ? 'not-allowed' : 'pointer',
                border:
                  isFirstInputDisabled && !isSecondBoxDisabled
                    ? '2px solid #1976d2'
                    : 'none',
                '&:hover': {
                  backgroundColor: isSecondBoxDisabled ? '#f0f0f0' : '#e0e0e0',
                },
              }}
              tabIndex={isSecondBoxDisabled ? -1 : 0}
            > */}
            <Box
              ref={secondBoxRef}
              onClick={handleSecondBoxClick}
              sx={{
                padding: 2,
                transition:
                  'transform 0.3s ease, box-shadow 0.3s ease, border 0.3s ease',
                transform: 'scale(1)', // Initial state
                backgroundColor: isSecondBoxDisabled
                  ? '#f0f0f0'
                  : 'rgb(57, 225, 248)',
                borderRadius: 1,
                textAlign: 'center',
                cursor: isSecondBoxDisabled ? 'not-allowed' : 'pointer',
                border: isSecondSelected
                  ? '5px solid #7d3c98' // Purple border when selected
                  : '2px solid transparent', // Default border
                '&:hover': {
                  transform: isSecondBoxDisabled ? 'scale(1)' : 'scale(1.05)', // Pop-up effect
                  boxShadow: isSecondBoxDisabled
                    ? 'none'
                    : '0 4px 8px rgba(0, 0, 0, 0.1)', // Add subtle shadow
                },
                '&:focus-visible': {
                  outline: '2px solid #1976d2', // Optional: Focus outline for accessibility
                },
              }}
              tabIndex={isSecondBoxDisabled ? -1 : 0}
            >
              <Typography variant="body1" sx={{ color: '#000' }}>
                {randomHypothesis}
              </Typography>
            </Box>
          </Grid>
        </Grid>

        <Box
          textAlign="right"
          mt={2}
          display="flex"
          justifyContent="flex-end"
          gap={2}
        >
          {/* <Button
            variant="outlined"
            color="secondary"
            sx={{
              paddingX: 4,
              paddingY: 1,
              borderRadius: 2,
              fontWeight: 'bold',
              backgroundColor: '#5801d0',
              color: 'white',
              textAlign: 'center',
            }}
            onClick={handleGuideBtn}
          >
            Guide
          </Button> */}
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'center', // Center horizontally
              alignItems: 'center', // Center vertically
              marginTop: '20px', // Adjust vertical spacing from other elements
              width: '100%', // Full width to ensure proper alignment
              height: '10vh', // Optional: Control the height of the button container
            }}
          >
            {' '}

            {/* <Button
              variant="contained"
              sx={{
                paddingX: 4,
                paddingY: 1,
                borderRadius: 2,
                fontWeight: 'bold',
                backgroundColor: '#9b59b6',
              }}
              onClick={handleNextClick}
            >
              Continue
            </Button> */}


            <CustomButton
              onClick={handleNextClick}
              ariaLabel="Test button"
              disabled={false}
              variant="purple"
              customStyles={{
                paddingX: 4,
                paddingY: 1,
                borderRadius: 2,
                fontWeight: 'bold',
              }}
              className=""
            >
              Continue
            </CustomButton>
          </Box>
        </Box>
      </Box>
    </>
  )
}
