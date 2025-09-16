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
import logo from '../assets/logo-sideways.svg'
import CustomModal from '../components/CustomModal'
import TreatmentPlot from '../components/Plots/TreatmentPlot';
import data from "../Data/data.json";
import CustomButton from '../components/CustomButton/CustomButton'
import Alert from '@mui/material/Alert'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'

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
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(true)

  // const [showAlert, setShowAlert] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const router = useRouter()

  const handleSpin = async (grp_id) => {
    const response = await fetch(
      'https://smi-ran-why-ran-v3.vercel.app/api/firstUsers',
      {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ grp_id: selectedGroup }),
      }
    )
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
      } catch (error) {}
    }
    fetchData()
  })

  useEffect(() => {
    fetch('https://smi-ran-why-ran-v3.vercel.app/api/groups', {
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
      msg ===
      `Group with grp_id ${selectedGroup} and __v ${v} has already been visited.`
    ) {
      console.log('grp id already exists')
      if (v < 7) {
        setSelectedVariable(variables[v].variableName)
      } else {
        setSelectedVariable(variables[v % 7].variableName)
      }
    } else {
      setSelectedVariable('Age')
    }
  }

  const closeModal = () => {
    setIsGuideModalVisible(false)
  }

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  const handleGuideBtn = () => {
    console.log('Guide button clicked')
    openModal(true)
  }

  //   const buttonStyles = {
  //     flex: 1,
  // };

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      {/* Logo in the top-left corner */}
      <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />

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
              height: isMobile ? '800px' : '900px',
              backgroundColor: 'white',
              boxShadow: 3,
              borderRadius: 2,
              margin: isMobile ? '0px' : '10px',
              padding: isMobile ? '10px' : '20px', // Adjust padding for smaller screens
              overflow: 'hidden', // Ensure no horizontal scrolling
              position: 'relative', // Allow absolute positioning of child elements
            }}
          >
            {/* Logo in the top-left corner inside the white box */}
            <Box
              sx={{
                position: 'absolute',
                top: isMobile ? '10px' : '20px',
                left: isMobile ? '10px' : '20px', // Ensure the logo is always at the top-left corner
              }}
              onClick={handleGuideBtn} // Add your function he
            >
              {/* Logo component here */}
              <Image
                style={{ width: '120%', // Set the desired width
                  height: '120%'}} // Set the desired height }}
                src={logo}
                alt="logo"
                sx={{
                  width: '750px', // Set the desired width
                  height: '150px', // Set the desired height
                }}
              />
            </Box>
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
                  marginLeft: !isMobile ? '10%' : '10%',
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
                  height: isMobile? '1000px':'395px',
                }}
              >
                 {/* <Image
                  src={scatter1}
                  alt="Description of the image"
                  width={isMobile ? 300 : 400}
                />  */}
                <TreatmentPlot
                isMobile={isMobile}
                  data={data}
                  width={isMobile ? 330 : 550} // Adjust width for mobile
                  height={isMobile ? 300 : 360} // Adjust height for mobile
                  margin={{ top: isMobile ? 0 : 30, right: 20, bottom: isMobile ? 0 : 20, left: 50 }}
                  yDomain={[80, 350]}
                  yLabel="Survival Days"
                  dotRadius={4}
                  colors={{
                    'In-person treatment': '#adf802',
                    'Virtual treatment': '#e78bf5',
                  }}
                  medians={{
                    'In-person treatment': 265,
                    'Virtual treatment': 318.5,
                  }}
                  medianTextColor="#6E00FF"
                  medianText={''}
                  yField={'survivalDays'}
                  xJitterPositions={{
                    'In-person treatment': [-20, -10, 0, 10, 20],
                    'Virtual treatment': [-20, -10, 0, 10, 20],
                  }}
                  yJitter={[-5, 0, 5]}
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
                  You will be assigned one variable to explore
                </b>
                <Button
                  text={'GET VARIABLE'}
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
                  <b style={{ color: '#6f00ff' }}>{selectedVariable}</b>
                )}
                <br />
              </Grid>
              <Grid
                item
                xs={12}
                gap={5}
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
                <Button
                  text={'GUIDE'}
                  // disabled={isSpin}
                  style={{
                    backgroundColor: '#5801d0',
                    color: 'white',
                    width: isMobile ? '100%' : 'auto', // Full width for mobile
                    textAlign: 'center', // Align button text to the left
                  }}
                  handleFunction={handleGuideBtn}
                />
                {/* <CustomButton
                  onClick={handleGuideBtn}
                  ariaLabel="Hello"
                  disabled={false}
                  variant="tertiary"
                  // customStyles={buttonStyles}
                >
                  CONTINUE
                </CustomButton> */}

                {/* <CustomButton
                  onClick={handleGuideBtn}
                  ariaLabel="Hello"
                  disabled={false}
                  variant="blue"
                  // customStyles={buttonStyles}
                >
                  GUIDE#5801d0
                </CustomButton> */}
              </Grid>
            </Grid>
          </Box>
        </Grid>
      </ActivityLayout>
    </>
  )
}

export default RandomizeActivityVariables
