const logger = require('../../../../../packages/logging/logger.js');
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import LinearProgress from '@mui/material/LinearProgress'
import variables from '../variables/variables.json'
import ActivityLayout from '../components/ActivityLayout'
import Stack from '@mui/material/Stack'
// import ArrowForwardIosIcon from '@mui/icons-material/ArrowForwardIos'
import Button from '../components/Button'

import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'

function RandomizeActivityVariables(props) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')

  const router = useRouter()

  const handleClick = async (e) => {
    setLoading(true)
    selectRandomVariable()
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }

  // function Search() {
  const searchParams = useSearchParams()
  //   setSelectedUser(searchParams.get('selectedUser'))
  //   // selectUser(selectedUser)
  //   return
  // }
  useEffect(() => {
    setSelectedUser(searchParams.get('selectedUser'))
  }, [searchParams])

  const handleVariables = async (e) => {
    e.preventDefault()
    router.push(
      `/relationship?selectedUser=${selectedUser}&selectedVariable=${selectedVariable}`
    )
  }

  const selectRandomVariable = () => {
    const randomIndex = Math.floor(Math.random() * variables.length)
    // setSelectedVariable(variables[randomIndex].variableName)
    setSelectedVariable('BMI')
  }

  useEffect(() => {
    const fetchData = async () => {
      // setLoading(true)
      try {
        const response = await fetch('/api/users') // Adjust the endpoint as needed

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        // logger.app.info(JSON.stringify(data) + ' this is the response')
        setUsers(data)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchData()
  }, [])

  return (
    <>
      {/* <Suspense>
        <Search />
      </Suspense> */}
      <ActivityLayout
        headerText={'How do I know it is real?'}
        text={
          'Rigorous Raven’s experiment has some great results! They asked you to review their data. Click on the figure below to explore the details behind their experiment.'
        }
        subText={
          ' What relationships between these variables can your lab discover?'
        }
      >
        <Grid
          item
          xs={6}
          sx={{
            display: 'flex',
            justifyContent: 'center',
            marginLeft: '230px',
          }}
        >
          <ChartGameBox>
            <Grid
              container
              sx={{
                display: 'flex',
                flexDirection: 'row',
                alignItems: 'center',
              }}
              margin={2}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'flex-start',
                  height: '400px',
                }}
              >
                <Scatterplot />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Grid
                  container
                  sx={{ display: 'flex', flexDirection: 'row' }}
                  margin={2}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <b>
                      Spin the wheel to find what variable are you going to
                      explore
                    </b>
                  </Grid>
                  <Grid
                    item
                    xs={10}
                    sx={{
                      display: 'flex',
                      justifyContent: 'center',
                      height: '200px',
                      alignItems: 'center',
                    }}
                  >
                    {loading ? (
                      <Box sx={{ width: '100%' }}>
                        <Stack spacing={2} sx={{ flex: 1 }}>
                          <LinearProgress size="lg" />
                        </Stack>
                      </Box>
                    ) : (
                      <b>{selectedVariable}</b>
                    )}
                  </Grid>
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', justifyContent: 'center' }}
                  >
                    <Button
                      text={'SPIN VARIABLES'}
                      style={{
                        backgroundColor: '#6E00FF',
                        color: 'white',
                      }}
                      handleFunction={handleClick}
                      disabled={loading}
                    />
                  </Grid>
                </Grid>
              </Grid>
            </Grid>
          </ChartGameBox>
        </Grid>
        <Grid
          container
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            marginTop: '16px',
          }}
        >
          <Button
            text={'CONTINUE'}
            style={{
              marginRight: '350px',
              backgroundColor: 'black',
              color: 'white',
            }}
            handleFunction={handleVariables}
          />
        </Grid>
        {/* <button onClick={handleVariables}>continue</button> */}
      </ActivityLayout>
    </>
  )
}

export default RandomizeActivityVariables
