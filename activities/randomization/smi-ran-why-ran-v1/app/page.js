'use client'

import * as React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/navigation'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

export default function Home() {
  const router = useRouter()
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12)

  const handleActivity = (e) => {
    e.preventDefault()
    router.push('/RandomizeActivityUsers')
  }

  return (
    <Box
      sx={{
        width: isMobile ? '100%' : '1200px',  // Ensure full width on mobile
        maxWidth: '100%',  // Prevent exceeding the viewport width
        height: isMobile ? 'auto' : '500px',  // Adjust height based on device
        backgroundColor: 'lightgrey',
        boxShadow: 3,
        borderRadius: 2,
        margin: isMobile ? '10px auto' : '30px auto',  // Center the box and reduce margins on mobile
        padding: isMobile ? '10px' : '20px', // Add padding for mobile
        overflowX: 'hidden',  // Prevent horizontal overflow
      }}
    >
      <Grid
        container
        direction="column"
        sx={{ display: 'flex' }}
        margin={isMobile ? 0 : 2}  // Adjust margin for mobile
      >
        <Grid item xs={12}>
          <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', margin: 0 }}>
            How do we know it is real?
          </h1>
        </Grid>
        <Grid item xs={12}>
          <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', margin: 0 }}>
            A treatment effect is exciting! But how do we know it is real?
          </h2>
        </Grid>
      </Grid>
      <Grid
        container
        sx={{
          flexDirection: 'row-reverse',
          display: 'flex',
          alignItems: 'flex-end',
        }}
        margin={isMobile ? 0 : 2}  // Adjust margin for mobile
      >
        <Grid item xs={12} sm={4}>
          <button
            onClick={handleActivity}
            style={{
              width: isMobile ? '100%' : 'auto',  // Make button responsive
              padding: isMobile ? '10px' : '15px',
              marginTop: isMobile ? '20px' : '0px',  // Adjust margin for spacing on mobile
            }}
          >
            Start Activity
          </button>
        </Grid>
      </Grid>
    </Box>
  )
}
