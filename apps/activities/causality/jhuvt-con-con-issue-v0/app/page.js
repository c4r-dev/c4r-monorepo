'use client'

import React, { useState, Suspense } from 'react'
import { Box, Typography, Paper, Button, Container } from '@mui/material'
import { useRouter } from 'next/navigation'
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup'

// Create a client component that will be wrapped with Suspense
function HomePageContent() {
  const [sessionID, setSessionID] = useState('')
  const [showConfigPopup, setShowConfigPopup] = useState(true)
  const router = useRouter()

  // Sample experiment data for the first screen
  const experimentData = {
    experimentTitle: 'Experiment 1',
    experimentText:
      "To study the impact of rhythmic sensory stimulation on fibromyalgia symptoms, the authors had patients fill out symptomatology surveys before and after an intervention, which consisted of self-administered sensory stimulation in the patient's home.",
  }

  const handleProblemClick = () => {
    // Navigate to the review controls page when button is clicked
    router.push('/review-controls')
  }

  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionID) {
      setShowConfigPopup(false)
    }
  }

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
          {experimentData.experimentTitle}
        </Typography>
        <Typography variant="body1">{experimentData.experimentText}</Typography>
      </Paper>

      {/* Problem Button - Using the same styling as in ReviewControls */}
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
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
      </Box>

      {/* Session Config Popup */}
      {showConfigPopup && (
        <SessionConfigPopup
          open={showConfigPopup}
          onClose={handleConfigClose}
          setSessionID={setSessionID}
        />
      )}
    </Box>
  )
}

// Main component with Suspense boundary
export default function HomePage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <HomePageContent />
    </Suspense>
  )
}
