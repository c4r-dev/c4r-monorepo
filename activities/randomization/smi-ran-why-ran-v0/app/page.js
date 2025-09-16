'use client'

import * as React from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import { useRouter } from 'next/navigation'

export default function Home() {
  const router = useRouter()
  const handleActivity = (e) => {
    e.preventDefault()
    router.push('/RandomizeActivityUsers')
  }

  return (
    <Box
      sx={{
        width: 1200,
        height: 500,
        backgroundColor: 'lightgrey',
        boxShadow: 3,
        borderRadius: 2,
        margin: '30px',
      }}
    >
      <Grid
        container
        sx={{ flexDirection: 'column', display: 'flex' }}
        margin={2}
      >
        <Grid item xs={4}>
          <h1>Why Randomize</h1>
        </Grid>
        <Grid item xs={8}>
          <h2>
            Decide strategies for certain objects in your research process.
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
        margin={2}
      >
        <Grid item xs={4}>
          <button onClick={handleActivity}>Start Activity</button>
        </Grid>
      </Grid>
    </Box>
  )
}
