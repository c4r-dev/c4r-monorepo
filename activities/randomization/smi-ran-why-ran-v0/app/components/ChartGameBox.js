import React from 'react'
import Box from '@mui/material/Box'

function ChartGameBox({ children, isControlVariables = false }) {
  return (
    <Box
      sx={{
        // width: 1500,
        // height: 800,
        width: isControlVariables ? 700 : 1500,
        height: isControlVariables ? 700 : 800,
        backgroundColor: 'white',
        boxShadow: 3,
        borderRadius: 2,
        margin: '30px',
      }}
    >
      {children}
    </Box>
  )
}

export default ChartGameBox
