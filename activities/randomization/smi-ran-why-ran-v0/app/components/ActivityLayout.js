'use client'
import React, { useState } from 'react'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import Header from './Header'
import Image from 'next/image'
import raven1 from '../assets/raven-1.svg'
import variables from '../variables/variables.json'

function ActivityLayout({
  children,
  headerText,
  text,
  subText,
  isExploreVariables = false,
}) {
  const [selectedVariable, setSelectedVariable] = useState(1)

  return (
    <Box
      sx={{
        width: 1300,
        height: 1200,
        backgroundColor: 'lightgrey',
        boxShadow: 3,
        borderRadius: 2,
        margin: '30px',
      }}
    >
      <Header />

      <Grid
        container
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        margin={2}
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
            marginLeft: '170px',
          }}
        >
          <p>{subText}</p>
        </Grid>
      </Grid>

      <Grid
        container
        sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
        margin={2}
      >
        {isExploreVariables ? (
          <>
            <Grid
              item
              // m={2}
              xs={12}
              sx={{
                display: 'flex',
                flexDirection: 'row',
                justifyContent: 'center',
                marginLeft: '-295px',
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
                {/* {variables.map((variable) => {
                  return (
                    <div
                      key={variable.id}
                      className="rounded-box"
                      style={{ backgroundColor: 'grey' }}
                    >
                      <b>{variable.variableName}</b>
                    </div>
                  )
                })} */}
                <div
                  className="rounded-box"
                  onClick={() => setSelectedVariable(1)}
                  style={{
                    backgroundColor: selectedVariable === 1 ? 'black' : 'grey',
                  }}
                >
                  <b>AGE</b>
                </div>
                <div
                  onClick={() => setSelectedVariable(2)}
                  className="rounded-box"
                  style={{
                    backgroundColor: selectedVariable === 2 ? 'black' : 'grey',
                  }}
                >
                  SEX
                </div>
                <div
                  className="rounded-box"
                  onClick={() => setSelectedVariable(3)}
                  style={{
                    backgroundColor: selectedVariable === 3 ? 'black' : 'grey',
                  }}
                >
                  BMI
                </div>
                <div
                  className="rounded-box"
                  onClick={() => setSelectedVariable(4)}
                  style={{
                    backgroundColor: selectedVariable === 4 ? 'black' : 'grey',
                  }}
                >
                  ALCOHOL CONSUMPTION
                </div>
                <div
                  className="rounded-box"
                  onClick={() => setSelectedVariable(5)}
                  style={{
                    backgroundColor: selectedVariable === 5 ? 'black' : 'grey',
                  }}
                >
                  EDUCATION
                </div>
                <div
                  className="rounded-box"
                  onClick={() => setSelectedVariable(6)}
                  style={{
                    backgroundColor: selectedVariable === 6 ? 'black' : 'grey',
                  }}
                >
                  INCOME
                </div>
              </div>
            </Grid>{' '}
          </>
        ) : null}
        <Grid
          item
          xs={1}
          sx={{ display: 'flex', justifyContent: 'flex-start' }}
        >
          <Image style={{ marginLeft: '-50px' }} src={raven1} alt="raven-1" />
        </Grid>
        {children}
      </Grid>
    </Box>
  )
}

export default ActivityLayout
