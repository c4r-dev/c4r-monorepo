import React from 'react'
import { Button, Card, TextField, Typography, Box } from '@mui/material'
import { ArrowForward } from '@mui/icons-material'

const DesignChoiceScreen = () => {
  return (
    <>
      {/* Hypothesis Box */}
      {/* <Box
        sx={{
          width: '20%',
          padding: 2,
          justifyContent: 'center',
          alignItems: 'center',
          // marginBottom: 3,
          marginTop:"-50px",
          border: '1px solid black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          //   minHeight: "100vh",
          backgroundColor: '#f4eafc',
          padding: 2,
          width: '50%',
          padding: 2,
          // marginBottom: 5,
          border: '1px solid black',
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
           position: 'relative', // Makes the Box positioned relative to the viewport
          top: '-10%', // Vertically center it
          left: '25%', // Shift it towards the right (adjust as needed)
          // transform: "translate(-50%, -50%)", // Adjusts position to ensure proper centering
        }}
      >
        <Typography variant="body1" gutterBottom>
          <strong>H1:</strong> fMRI analysis can demonstrate which regions of
          the brain
          <br />
          are correlated with responses to positive emotional stimuli.
        </Typography>
      </Box> */}
      <Typography   sx={{ fontSize: 18, color: 'black', fontWeight: 600 }} 
 className='headings'>
        {/* <strong>H2:</strong> fMRI analysis cannot demonstrate which regions of
        the brain <br />
        are correlated with responses to positive emotional stimuli. */}
Consider an fMRI study. H1 is that emotional images have more peaked fMRI activity. Choose the practice that maximally biases for H1 (and hopefully publication in a prestige journal). 
<br/> <br/>

All of these practices are inadvisable, but your job is to decide which is the worst.      </Typography>
      {/* Additional Text Below Box */}
    </>
  )
}

export default function Home() {
  return (
    <div>
      <DesignChoiceScreen />
    </div>
  )
}
