'use client'

import React, { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Box from '@mui/material/Box'
import Header from '../components/Header'
import raven1 from '../assets/raven-1.svg'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import LinearProgress from '@mui/material/LinearProgress'
import ActivityLayout from '../components/ActivityLayout'
import Button from '../components/Button'
import ArrowForwardIosOutlinedIcon from '@mui/icons-material/ArrowForwardIosOutlined'

function RandomizeActicityUsers(props) {
  const [loading, setLoading] = useState(false)
  const [users, setUsers] = useState([])
  const [error, setError] = useState(null)
  const [selectedUser, setSelectedUser] = useState('')

  const router = useRouter()

  const handleClick = async (e) => {
    setLoading(true)
    selectRandomUser()
    setTimeout(() => {
      setLoading(false)
    }, 3000)
  }

  const handleUsers = async (e) => {
    console.log('in handle users')
    e.preventDefault()
    router.push(`/RandomizeActivityVariables?selectedUser=${selectedUser}`)
  }

  const selectRandomUser = () => {
    const randomIndex = Math.floor(Math.random() * users.length)
    setSelectedUser(users[randomIndex]?.name)
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
        console.log(JSON.stringify(data) + ' this is the response')
        setUsers(data)
      } catch (error) {
        setError(error.message)
      }
    }

    fetchData()
  }, [])

  return (
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
                {/* <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row' }}
                    margin={2}
                  >
                    <Grid
                      sx={{
                        border: '1px solid black',
                      }}
                      xs={4}
                    >
                      I see a Relationship
                    </Grid>
                    <Grid
                      sx={{
                        border: '1px solid black',
                      }}
                      xs={3}
                    >
                      {' '}
                      I'm not Sure
                    </Grid>
                    <Grid
                      sx={{
                        border: '1px solid black',
                      }}
                      xs={5}
                    >
                      {' '}
                      I Don't see a Relationship
                    </Grid>
                    <Grid
                      container
                      sx={{
                        border: '1px solid black',
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        height: '200px',
                      }}
                      margin={2}
                    >
                      Select one option above
                    </Grid>
                    <button>SUBMIT</button>
                  </Grid> */}

                <Grid
                  item
                  xs={10}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  <b>
                    Spin the wheel to delegate who in your lab is going to
                    explore each of the variables
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
                      <LinearProgress />
                    </Box>
                  ) : (
                    <b>{selectedUser}</b>
                  )}
                </Grid>
                <Grid
                  item
                  xs={10}
                  sx={{ display: 'flex', justifyContent: 'center' }}
                >
                  {/* <button disabled={loading} onClick={handleClick} style={{}}>
                    Spin Wheel
                  </button> */}
                  <Button
                    text={'SPIN WHEEL'}
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
        sx={{ display: 'flex', justifyContent: 'flex-end', marginTop: '16px' }}
      >
        <Button
          text={'CONTINUE'}
          style={{
            marginRight: '350px',
            backgroundColor: 'black',
            color: 'white',
          }}
          handleFunction={handleUsers}
        />
      </Grid>
    </ActivityLayout>
  )
}

export default RandomizeActicityUsers
