import React from 'react'
import Box from '@mui/material/Box'
import Header from './Header'

function ChartGameBox({ children, isControlVariables = false, oneLineText="" ,isHeader = true, isActivityVariables= false, isActivityUsers=false, isMobile=false}) {
  return (
    <Box
      sx={{
        // width: 1500,
        // height: 850,
         width: isMobile ? 'auto' :1300,
        height:isMobile ? 'auto' : 880,
        //  width: isControlVariables ? 700 : 2000,
        // height: isControlVariables ? 600 : 850,
        // height: isActivityUsers || isActivityVariables ? 800 : isControlVariables ? 1200 : 850,
        backgroundColor: 'white',
        boxShadow: 3,
        borderRadius: 2,
        //  margin: isControlVariables ? '500px' : '10px',
         margin:'10px'
      }}
    >
          {isHeader ? <Header oneLineText={oneLineText}/> : null}

      {children}
    </Box>
  )
}

export default ChartGameBox
