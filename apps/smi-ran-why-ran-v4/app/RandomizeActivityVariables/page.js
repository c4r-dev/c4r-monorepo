const logger = require('../../../../packages/logging/logger.js');
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import scatter1 from '../assets/01_why-randomize.svg'
import Box from '@mui/material/Box'
import Grid from '@mui/material/Grid'
import LinearProgress from '@mui/material/LinearProgress'
import variableValues from '../variables/variables.json'
import Stack from '@mui/material/Stack'
import Button from '../components/Button'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import logo from '../assets/logo-sideways.svg'
import CustomModal from '../components/CustomModal'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import data from '../Data/new-data.json'
import CustomButton from '../components/CustomButton/CustomButton'
import Alert from '@mui/material/Alert'
import CheckCircleOutlineIcon from '@mui/icons-material/CheckCircleOutline'
import Header from '../components/Header/Header'

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
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const router = useRouter()

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const handleSpin = async (grp_id) => {
    const response = await fetch('/api/firstUsers', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ grp_id: selectedGroup }),
    })
    const data = await response.json()

    setFirstVisitedMessage(data.message)
    const versionMatch = data.message.match(/__v (\d+)/)

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
    fetch('https://smi-ran-why-ran-v4.vercel.app/api/groups', {
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
      .then((data) => logger.app.info(data))
      .catch((error) => logger.app.error('Error:', error))
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
      logger.app.info('grp id already exists')
      if (v < 5) {
        setSelectedVariable(variables[v].variableName)
      } else {
        setSelectedVariable(variables[v % 5].variableName)
      }
    } else {
      setSelectedVariable('Time to fall')
    }
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  const handleGuideBtn = () => {
    logger.app.info('Guide button clicked')
    openModal(true)
  }

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      {/* Logo in the top-left corner */}
      <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

      <div style={{ 
        width: '80%', 
        margin: '0px auto 20px auto',
        padding: isMobile ? '10px' : '20px'
      }}>
            <Header
              onLogoClick={handleLogoClick}
              onHelpClick={handleHelpClick}
              text="Explore how a variable impacted the study"
            />
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              width: '100%',
              marginTop: '5px'
            }}>
              <div 
                className="content-box"
                style={{
                  width: '80%',
                  border: '1px solid black',
                  borderRadius: '8px',
                  padding: '20px',
                  backgroundColor: 'white',
                  overflow: 'hidden'
                }}
              >
                <style jsx>{`
                  .content-box :global(svg) {
                    display: block !important;
                    margin: 10px auto !important;
                    max-width: 100% !important;
                    max-height: 400px !important;
                  }
                  .content-box :global(.recharts-wrapper) {
                    margin: 0 auto !important;
                  }
                  .content-box :global(div) {
                    text-align: center !important;
                  }
                  .content-box {
                    position: relative !important;
                  }
                `}</style>
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
                  justifyContent: 'center', // Center the graph
                  alignItems: 'center',
                  height: isMobile ? '1000px' : '395px',
                  width: '100%'
                }}
              >
                <TreatmentPlot
                  isMobile={isMobile}
                  data={data}
                  width={isMobile ? 330 : 550} // Adjust width for mobile
                  height={isMobile ? 300 : 360} // Adjust height for mobile
                  margin={{
                    top: isMobile ? 0 : 30,
                    right: 20,
                    bottom: isMobile ? 0 : 20,
                    left: 50,
                  }}
                  yDomain={[40, 120]}
                  yLabel="Survival (in days)"
                  dotRadius={4}
                  colors={{
                    Control: '#00c802',
                    Lithium: '#f031DD',
                  }}
                  medians={{
                    Control: 67,
                    Lithium: 85,
                  }}
                  medianTextColor="#6E00FF"
                  medianText={''}
                  yField={'survivalDays'}
                  xJitterPositions={{
                    Control: [-30, -20, -10, 0, 10, 20, 30],
                    Lithium: [-30, -20, -10, 0, 10, 20, 30],
                  }}
                  yJitter={[0, 0, 0]}
                />
              </Grid>

              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center', // Center content
                  flexDirection: 'column',
                  alignItems: 'center', // Center align items
                  marginLeft: '0%',
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
                    backgroundColor: '#6200EE',
                    color: 'white',
                    margin: isMobile ? '5px' : '10px',
                    width: isMobile ? '90%' : 'auto', // Full width on mobile for buttons
                    textAlign: 'center', // Align button text to the left
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: 'pointer'
                  }}
                  handleFunction={() => {
                    handleSpin(selectedGroup)
                  }}
                  disabled={isSpinClicked === 1}
                />
              </Grid>
              <Grid
                item
                padding={1}
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
                // gap={5}
                sx={{
                  display: 'flex',
                  justifyContent: 'center', // Align to the left
                  alignItems: 'center',
                  marginLeft: '0%',
                  marginRight: '2%',
                }} // Align the button to the left
              >
                <Button
                  text={'CONTINUE'}
                  disabled={!selectedVariable}
                  style={{
                    backgroundColor: selectedVariable ? '#6200EE' : '#cccccc',
                    color: 'white',
                    width: isMobile ? '90%' : 'auto', // Full width for mobile
                    textAlign: 'center', // Align button text to the left
                    border: 'none',
                    padding: '10px 20px',
                    borderRadius: '4px',
                    cursor: selectedVariable ? 'pointer' : 'not-allowed'
                  }}
                  handleFunction={handleVariablesPage}
                />
                {/* <Button
                  text={'GUIDE'}
                  // disabled={isSpin}
                  style={{
                    backgroundColor: '#5801d0',
                    color: 'white',
                    width: isMobile ? '100%' : 'auto', // Full width for mobile
                    textAlign: 'center', // Align button text to the left
                  }}
                  handleFunction={handleGuideBtn}
                /> */}
              </Grid>
                </Grid>
              </div>
            </div>
      </div>
    </>
  )
}

export default RandomizeActivityVariables
