'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import scatter1 from '../assets/01_why-randomize.svg'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import variableValues from '../variables/variables.json'
import ActivityLayout from '../components/ActivityLayout'
import Stack from '@mui/material/Stack'
import Button from '../components/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Alert from '@mui/material/Alert';
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline';



function RandomizeActivityVariables(props) {
  const [variables, setVariables] = useState(variableValues)
  const [loading, setLoading] = useState(false)
  const [firstVisitedMessage, setFirstVisitedMessage] = useState('')
  const [groupDetails, setGroupDetails] = useState({})
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [isSpinClicked, setIsSpinClicked] = useState(0)
  const [isNameEntered, setIsNameEntered] = useState(false)
  const [isSpin, setIsSpin] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('')
  // const [showAlert, setShowAlert] = useState(false) 

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const router = useRouter()


  const handleSpin = async (grp_id) => {
    const response = await fetch('https://smi-ran-why-ran-v1.vercel.app/api/firstUsers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grp_id: selectedGroup }),
    })
    const data = await response.json()

    setFirstVisitedMessage(data.message)
    const versionMatch = data.message.match(/__v (\d+)/)
   // alert(data.message)
  //  setShowAlert(true) 
  //   setTimeout(() => {
  //     setShowAlert(false)
  //   }, 3000)
    const randomNumber = Math.floor(1000 + Math.random() * 9000)
    const username = `user${randomNumber}`

    setIsSpin(false)
    setIsSpinClicked(1)
    setSelectedUser(username)
    setLoading(true)
    selectRandomVariable(data.message, (versionMatch && versionMatch[1]) || 0)

    //Spin for 1 second
    setTimeout(() => {
      setLoading(false)
    }, 1000)
  }

  
  function Search() {
    const searchParams = useSearchParams()
    setSelectedGroup(searchParams.get('selectedGroup'))
    return
  }


  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/api/groups') // Adjust the endpoint as needed
        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        data.map((grp) => {
          if (grp.grp_id === selectedGroup) {
            const newVariables = [...exploredVariables] // Create a copy of the current variables
            setGroupDetails(grp)
            grp.students.forEach((student) => {
              // Use forEach instead of map since you're not returning anything
              if (!newVariables.includes(student.assignedVariable)) {
                newVariables.push(student.assignedVariable)
              }
            })
          }
        })
      } catch (error) {
      }
    }
    fetchData()
  })

  useEffect(() => {
    fetch('https://smi-ran-why-ran-v1.vercel.app/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grp_id: selectedGroup,
      }),
    })
      .then((response) => {
        response.json()
      })
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error))
  }, [selectedGroup])

  
  const handleVariablesPage = async (e) => {
    e.preventDefault()
    router.push(
      `/relationship?selectedGroup=${selectedGroup}&selectedUser=${selectedUser}&selectedVariable=${selectedVariable}`
    )
  }

  //  selecting random variables sequentially from the set of variables matching the version number with id of variables
  const selectRandomVariable = (msg, v = 0) => {
    if (
      msg === `Group with grp_id ${selectedGroup} and __v ${v} has already been visited.`
    ) {
      console.log('grp id already exists')
      if (v < 5) {
        setSelectedVariable(variables[v].variableName)
      } else {
        setSelectedVariable(variables[v % 5].variableName)
      }
    } else {
      setSelectedVariable('Age')
    }
  }

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      {/* {showAlert && (
           <Box
           sx={{
            // position: 'fixed',
           // marginLeft:isMobile? '0px' : '1%',
             display: 'flex',
             justifyContent: 'center',
             alignItems: 'center',
             zIndex: 1000, // Ensure it's on top of other elements
           }}
         >
          <Alert   iconMapping={{
          success: <CheckCircleOutlineIcon fontSize="inherit" />,
        }}
      >
            {firstVisitedMessage}
          </Alert>
          </Box>
        )} */}
      <ActivityLayout
        isMobileProp={isMobile}
        //isRandomizeVariables= {true}
        // headerText={'How do I know it is real?'}
        //         text={'Let's explore each variable in the study \n Skeptical Stork wants to take a closer look at each variable in the study to see if there are relationships between them. They will assign each of you a variable to explore. '
        //         }
        //         subText={
        // 'Click Continue to get your variable.'}
      >
       
        <Grid
          item
          xs={12}
          sx={{
            display: 'flex',
            justifyContent: 'left', // Align content to the left
            marginLeft: isMobile ? '0px' : '230px',
            //overflowX: 'hidden', // Prevent horizontal overflow
          }}
        >
          {/* <ChartGameBox isHeader={true} oneLineText={"How do I know it is real? Let's explore each variable in the study."}> */}
          <Box
            sx={{
              width: isMobile ? 'auto' : '1000px', // Ensure full width on mobile without exceeding viewport
              maxWidth: '100%', // Make sure the container never exceeds the screen width
              height: isMobile ? 'auto' : '900px',
              backgroundColor: 'white',
              boxShadow: 3,
              borderRadius: 2,
              margin: isMobile ? '0px' : '10px',
              padding: isMobile ? '10px' : '20px', // Adjust padding for smaller screens
              overflow: 'hidden', // Ensure no horizontal scrolling
            }}
          >
            <Grid
              container
              sx={{
                display: 'flex',
                justifyContent: 'flex-start', // Align content to the left
                alignItems: 'flex-start',
                flexDirection: isMobile ? 'column' : 'row', // Stack items for smaller screens
              }}
            >
              <Grid
                item
                xs={12}
                sm={10}
                sx={{
                  display: 'flex',
                  justifyContent: 'left', // Align content to the left
                  alignItems: 'left',
                  marginLeft: !isMobile ? '10%' : '5%',
                }}
              >
                <div style={{ textAlign: 'flex-start', fontSize: '20px' }}>
                  {' '}
                  <b>
                    How do I know it is real? <br /> Let&apos;s explore each
                    variable in the study.
                  </b>
                </div>
              </Grid>
            </Grid>
            <Grid
              container
              sx={{
                display: 'flex',
                flexDirection: isMobile ? 'column' : 'row', // Column direction for mobile
                alignItems: 'center', // Align items to the left,
              }}
              margin={isMobile ? 1 : 2}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'left', // Align to the left
                  height: '395px',
                }}
              >
                <Image
                  src={scatter1}
                  alt="Description of the image"
                  width={isMobile ? 300 : 400}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: isMobile ? 'center' : 'center', // Align to the left
                  flexDirection: 'column',
                  alignItems: isMobile ? 'center' : 'center', // Align items to the left
                  marginLeft: isMobile ? '10%' : '0%',
                }}
                margin={isMobile ? 2 : 2}
              >
                <b
                  style={{ margin: isMobile ? '10%' : '5%', fontSize: '20px' }}
                >
                  Type in your name and then Click on Spin the Variables button
                  to find what variable are you going to explore
                </b>
                <Button
                  text={'SPIN VARIABLES'}
                  style={{
                    color: 'white',
                    margin: isMobile ? '5px' : '10px',
                    width: isMobile ? '90%' : 'auto', // Full width on mobile for buttons
                    textAlign: 'center', // Align button text to the left
                  }}
                  handleFunction={() => {
                    handleSpin(selectedGroup)
                  }}
                  disabled={isSpinClicked === 1}
                />
              </Grid>
              <Grid
                item
                padding={3}
                xs={12}
                sx={{
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: isMobile ? 'center' : 'center', // Align to the left
                  alignItems: isMobile ? 'center' : 'center', // Align items to the left
                  marginLeft: '0%',
                }}
              >
                {loading ? (
                  <Box sx={{ width: '100%' }}>
                    <Stack spacing={1} sx={{ flex: 1 }}>
                      <LinearProgress size="lg" />
                    </Stack>
                  </Box>
                ) : (
                  <b>{selectedVariable}</b>
                )}
                <br />
              </Grid>
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: isMobile ? 'flex-start' : 'center', // Align to the left
                  alignItems: isMobile ? 'flex-start' : 'center',
                  marginLeft: '0%',
                }} // Align the button to the left
              >
                <Button
                  text={'CONTINUE'}
                  disabled={isSpin}
                  style={{
                    color: 'white',
                    width: isMobile ? '100%' : 'auto', // Full width for mobile
                    textAlign: 'center', // Align button text to the left
                  }}
                  handleFunction={handleVariablesPage}
                />
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </ActivityLayout>
    </>
  )
}

export default RandomizeActivityVariables
