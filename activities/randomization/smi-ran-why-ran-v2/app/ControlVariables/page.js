'use client'
import React, { useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import scatter1 from '../assets/16_why-randomize_randomized-final-plot.svg'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Button from '../components/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'

function ControlVariables(props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)

  const [isPlotRandomized, setIsPlotRandomized] = useState(false)
  const handleplot = () => {
    setIsPlotRandomized(true)
  }
  const router = useRouter()
  const handleActivityEnd = (e) => {
    e.preventDefault()
    router.push('/ActivityEnds')
  }

  const exitActivity = (e) => {
    e.preventDefault()
    router.push('/')
  }

  return (
    <div>
      <Box
        sx={{
          width:isMobile? 'auto' : 1700,
          height: isMobile ? 'auto' : 1000,
          backgroundColor: 'lightgrey',
          boxShadow: 3,
          borderRadius: 2,
          //margin: '30px',
        }}
      >
         {/* <Grid
          container
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems: isMobile ? 'flex-start' : 'center',
            justifyContent: isMobile ? 'flex-start' : 'center',
          }}
        ></Grid>  */}

        <Grid
          container
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            alignItems:  'center',
            justifyContent: 'center',
          }}
          //  margin={2}
        >
          <Grid
            item
            xs={9}
            sx={{
              justifyContent: isMobile ? 'flex-start' : ' center',
              alignItems: isMobile ? 'flex-start' : ' center',
              marginLeft: isMobile ? '0px' : '230px',
                marginTop: '2%'
            }}
          >
            <Box
              sx={{
                width: isMobile ? 300 : 800,
                height: isMobile ? 800 : 700,
                backgroundColor: 'white',
                boxShadow: 3,
                borderRadius: 2,
              }}
            >
              <Grid
                container
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  alignItems: 'center',
                }}
              >
                <Grid item xs={10}>
                  <div>
                    <b>Age is related to treatment type and survival </b> <br />{' '}
                    <br />
                    There is a concern that age seems to be related <br />
                    to both the dependent and independent variables.
                    <br />
                    Age might be a confounding variable. What would happen if{' '}
                    <br />
                    age’s influence was removed? <br />
                    Would the treatment effect change?
                    <br /> <br /> The assignment of treatment type can be
                    randomized in a new study. Randomization will distribute the
                    influence of confounders like age.
                    <br /> <br />
                    WHAT WOULD HAPPEN IF THE TREATMENT WERE RANDOMIZED?
                  </div>
                </Grid>
              </Grid>

              <Grid
                container
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginLeft: '47px',
                }}
              >
                <Grid item xs={10} sx={{ display: 'flex' }}>
                  <Button
                    text={'RANDOMIZE TREATMENT TYPE'}
                    style={{
                      margin: isMobile ? '15%' : ' 20px',
                      backgroundColor: '#6E00FF',
                      color: 'white',
                      marginLeft: isMobile ? '-8%' : '3%',
                    }}
                    handleFunction={handleplot}
                  />
                </Grid>
                <Grid
                  item
                  xs={10}
                  margin={isMobile ? -2 : 2}
                  sx={{
                    display: 'flex',
                    justifyContent:  'center',
                    alignItems: 'center',
                  }}
                >
                  {isPlotRandomized ? (
                    <Image
                      src={scatter1}
                      alt="Description of the image"
                      width={isMobile ? '10%' : 600}
                      height={isMobile ? 250 : 300}
                    />
                  ) : null}
                </Grid>
              </Grid>
            </Box>
          </Grid>
          <Grid
            container
            sx={{
              display: 'flex',
              justifyContent: isMobile ? 'center' : 'flex-end',
              marginTop: '20px', // Adjust this value to position the button below the white box
              width: isMobile ? 300 : 1030, // Ensure this matches the width of the white box
            }}
          >
            <Button
              text={'EXIT ACTIVITY'}
              style={{
                backgroundColor: 'black',
                color: 'white',
              }}
              handleFunction={exitActivity}
            />
          </Grid>
        </Grid>
      </Box>
    </div>
  )
}

export default ControlVariables
