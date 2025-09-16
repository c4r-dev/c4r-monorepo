'use client'
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Header from './Header'
import Image from 'next/image'
import raven1 from '../assets/raven-1.svg'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

function ActivityLayout({
  children,
  headerText,
  text,
  subText,
  oneLineText = '',
  isExploreVariables = false,
  groupData = '',
  variables = [],
  isRandomizeVariables=false,
  isMobileProp=false,
}) {
  const [selectedVariable, setSelectedVariable] = useState(1)
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  //console.log(oneLineText, "this is one line text in activity layout")
  return (
    <Box
      xs={12} 
      sx={{
        width:  isMobileProp ?  450  : 1700, //web/laptop version
        height: isMobileProp? 1800 : 1000 , //web/laptop version
       // width:'auto',
       // height: 'auto',
        // width: isMobile ? 0 : 1700,
        // height: isMobile ? 0 : 1200,
        // width: isRandomizeVariables ? 1000 : 1700, //mobile version
        // height: isRandomizeVariables ? 900 : 1000,  //mobile version
        // width: 1000, 
        // height: 900,
        backgroundColor: 'lightgrey',
        boxShadow: isMobileProp ?  0 : 3,
        borderRadius: isMobileProp ? 0 : 2
      }}
    >
      {/* <Header oneLineText={oneLineText}/> */}
 
      {/* <Grid
        container
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        // margin={2}
      >
        <Grid item xs={6} sx={{ display: 'flex', justifyContent: 'center' }}>
          <div>
            <b>{headerText}</b>
          </div>
        </Grid>
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '230px',
          }}
        >
          <p>{text}</p>
        </Grid>
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '175px',
          }}
        >
          <p>{subText}</p>
        </Grid>
      </Grid>  */}

      <Grid
        container
        sx={{ display: 'flex', flexDirection: isMobileProp? 'column' :'row', alignItems: 'center' }}
        margin={isMobileProp? 0 :2}
      >
        {isExploreVariables ? (
          <>
            <Grid
              item
              // m={2}
              xs={12}
              sx={{
                display: 'flex',
                flexDirection: isMobileProp? 'column' :'row',
                justifyContent: 'center',
                marginLeft: isMobileProp? '-10px' : '-295px',
              }}
            >
              <b>EXPLORED VARIABLES</b>
            </Grid>
            <Grid
              item
              xs={12}
              // m={2}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                marginLeft: '253px',
                // justifyContent: 'center',
              }}
            >
              <div className="box-container">
                {variables.length > 0 ? (
                  variables.map((variable, index) => {
                    return (
                      <div
                        onClick={() => setSelectedVariable(index)}
                        key={variable}
                        className="rounded-box"
                        style={{
                          backgroundColor:
                            selectedVariable === index ? 'black' : 'grey',
                        }}
                      >
                        <b>{variable}</b>
                      </div>
                    )
                  })
                ) : (
                  <p> no variables </p>
                )}
              </div>
            </Grid>{' '}
          </>
        ) : null}
        {/* <Grid
          item
          xs={1}
          sx={{ display: 'flex', justifyContent: 'flex-start' }}
        >
          <Image style={{ marginLeft: '-50px' }} src={raven1} alt="raven-1" />
        </Grid> */}
        {children}
      </Grid>
    </Box>
  )
}

export default ActivityLayout