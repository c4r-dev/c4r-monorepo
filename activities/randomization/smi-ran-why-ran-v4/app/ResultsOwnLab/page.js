'use client'
import React, { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import SexPlot from '../components/Plots/SexPlot'
import SurvivalSexPlot from '../components/Plots/SurvivalSexPlot'
import GeneralSurvivalPlot from '../components/Plots/GeneralSurvivalPlot'
import data from '../Data/new-data.json'
import LitterPlot from '../components/Plots/LitterPlot'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import ChartGameBox from '../components/ChartGameBox'
import SurvivalLitterPlot from '../components/Plots/SurvivalLitterPlot'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import Header from '../components/Header/Header'
import CustomModal from '../components/CustomModal'

function ResultsMultipleLabs() {
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [selectedOption, setSelectedOption] = useState(1)
  const [selectedSecondOption, setSelectedSecondOption] = useState(1)
  const [exploredVariables, setExploredVariables] = useState(['Weight', 'Time to fall', 'Litter', 'Sex', 'Age'])
  const [groupDetails, setGroupDetails] = useState({ students: [] })
  const [selectedVariable, setSelectedVariable] = useState(0)
  const [hasInitialSelection, setHasInitialSelection] = useState(false) // Track initial selection
  const [selectedVariableValue, setSelectedVariableValue] = useState('Weight')
  const [userVariable, setUserVariable] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [studentData, setStudentData] = useState({})
  const [isModalOpen, setIsModalOpen] = useState(false)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const [dagProps, setDagProps] = useState({
    labelA: 'treatment assignment',
    labelB: 'Survival in Days',
    labelC: selectedVariableValue,
    lineA: 'line',
    lineB: 'dottedLineWithBox',
    lineC: 'noneWithBox',
  })

  const dagContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: isMobile ? '300px' : '400px',
    width: isMobile ? '350px' : '500px',
    overflow: 'visible',
    borderRadius: '10px',
    marginLeft: isMobile ? '0px' : '0px',
    marginTop: isMobile ? '0px' : '0px',
  }

  const router = useRouter()
  function Search() {
    const searchParams = useSearchParams()
    setSelectedGroup(searchParams.get('selectedGroup'))
    setUserVariable(searchParams.get('selectedVariable'))
    return
  }
  const handleControlVariables = (e) => {
    e.preventDefault()
    router.push('/ControlVariables')
  }
  const dagKey = Object.values(dagProps).join('-')
  useEffect(() => {
    groupDetails.students?.map((st) => {
      if (st.assignedVariable === selectedVariableValue) {
        setSelectedOption(st.selectedOption)
        setSelectedSecondOption(st.selectedSecondOption)
      }
    })
  })

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('https://smi-ran-why-ran-v4.vercel.app/api/groups') // Adjust the endpoint as needed

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        data.map((grp) => {
          if (grp.students.length > 0 && grp.grp_id === selectedGroup) {
            const newVariables = [...exploredVariables] // Create a copy of the current variables
            setGroupDetails(grp)

            grp.students.forEach((student) => {
              if (student.assignedVariable === selectedVariableValue) {
                setStudentData(student)
                setSelectedOption(student.selectedOption)
                setSelectedSecondOption(student.selectedSecondOption)
              }
              if (!newVariables.includes(student.assignedVariable)) {
                newVariables.push(student.assignedVariable)
              }
            })

            // Ensure the userVariable is always the first index
            const uniqueVariables = newVariables.filter(
              (variable) => variable !== userVariable
            )
            const updatedVariables = [userVariable, ...uniqueVariables]

            setExploredVariables(updatedVariables) // Update the state with the new array
          }
        })
      } catch (error) {
        setError(error.message)
      }
    }

    fetchData()
  }, [selectedGroup, selectedVariableValue, userVariable])

  useEffect(() => {
    if (!hasInitialSelection && exploredVariables.length > 0) {
      setSelectedVariableValue(exploredVariables[0]) // Set the first value of exploredVariables as the default
      setSelectedVariable(0) // Select the first variable by default
      setHasInitialSelection(true) // Set flag to true so this effect doesn't run again
    }
  }, [exploredVariables, hasInitialSelection])

  useEffect(() => {
    let intSelectedOption = parseInt(selectedOption)
    let intSelectedSecondOption = parseInt(selectedSecondOption)
    let newLabelA = 'treatment assignment'
    let newLabelB = 'Survival in Days'
    let newLabelC = selectedVariableValue
    let newLineA = 'line'
    let newLineB = 'dottedLineWithBox'
    let newLineC = 'noneWithBox'

    switch (intSelectedOption) {
      case 1:
        newLineC = 'lineWithBox'
        break
      case 2:
        newLineC = 'dottedLineWithBox'
        break
      case 3:
        newLineC = 'noneWithBox'
        break
    }

    switch (intSelectedSecondOption) {
      case 1:
        newLineB = 'lineWithBox'
        break
      case 2:
        newLineB = 'dottedLineWithBox'
        break
      case 3:
        newLineB = 'noneWithBox'
        break
    }

    setDagProps({
      labelA: newLabelA,
      labelB: newLabelB,
      labelC: newLabelC,
      lineA: newLineA,
      lineB: newLineB,
      lineC: newLineC,
    })
  }, [selectedOption, selectedSecondOption, selectedVariableValue])

  const handleStudent = (variable) => {
    // console.log(variable, 'is variable')
    if (groupDetails.students && groupDetails.students.length > 0) {
      groupDetails.students.map((student) => {
        if (student.assignedVariable === variable) {
          setStudentData(student)
          setSelectedOption(student.selectedOption)
          setSelectedSecondOption(student.selectedSecondOption)
        }
      })
    }
  }

  const handleResults = () => {
    setLoading(false)
  }

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const renderScatterImage = () => {
    switch (selectedVariableValue) {
      case 'Age':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile ? 350 : 500}
            height={360}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[50, 100]}
            yLabel="Age"
            dotRadius={4}
            colors={{
              Control: '#00c802',
                    Lithium: '#f031DD',
            }}
            medians={{ Control: 75, Lithium: 74.5 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'age'}
            xJitterPositions={{
              Control: [-20, -10, 0, 10, 20],
              Lithium: [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'Time to fall':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile ? 350 : 500}
            height={300}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[90, 210]}
            yLabel="Time to fall (seconds)"
            dotRadius={4}
            colors={{
              Control: '#00c802',
                    Lithium: '#f031DD',
            }}
            medians={{ Control: 134, Lithium: 160 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'diseaseStage'}
            xJitterPositions={{
              Control: [-20, -10, 0, 10, 20],
              Lithium: [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'Weight':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile ? 350 : 500}
            height={300}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[10, 40]}
            yLabel="Weight (in grams)"
            dotRadius={4}
            colors={{
              Control: '#00c802',
                    Lithium: '#f031DD',
            }}
            medians={{ Control: 23.9, Lithium: 23.05 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'weight'}
            xJitterPositions={{
              Control: [-20, -10, 0, 10, 20],
              Lithium: [-20, -10, 0, 10, 20],
            }}
            yJitter={[
              -80,
              -70,
              -60,
              -50,
              -40 - 30,
              -20,
              -10,
              0,
              10,
              20,
              30,
              40,
              50,
              60,
              70,
              80,
            ]}
          />
        )

      case 'Litter':
        return <LitterPlot />

      case 'Sex':
        return <SexPlot />

      default:
        return (
          <div style={{ width: isMobile ? '350px' : '500px', height: '360px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Select a variable to view data</span>
          </div>
        )
    }
  }

  const renderScatterPlot2 = () => {
    switch (selectedVariableValue) {
      case 'Sex':
        return (
          <>
            <SurvivalSexPlot
              data={data}
              width={isMobile ? 700 : 500}
              height={380}
              margin={{ top: 30, right: 20, bottom: 50, left: 60 }}
              yDomain={[40, 120]}
              yLabel="Survival (in days)"
              dotRadius={4}
              colors={{
                Female: '#00C802',
                Male: '#F031DD',
              }}
              medians={{ Female: 80, Male: 74.5 }}
              medianTextColor="#6E00FF"
              yField="survivalDays"
              xJitterPositions={{
                Female: [-20, -10, 0, 10, 20],
                Male: [-20, -10, 0, 10, 20],
              }}
              yJitter={[0, -2, 2]}
              xDomain={['Female', 'Male']}
            />
          </>
          // <SexPlot/>
        )

      case 'Age':
        return (
          <GeneralSurvivalPlot
            xLabel={'Age'}
            xDomain={[58, 90]}
            yRange={[30, 120]}
            xValue={'age'}
            yValue={'survivalDays'}
            plotWidth={isMobile ? 400 : 500}
            plotHeight={isMobile ? 500 : 500}
          />
        )

      case 'Time to fall':
        return (
          <GeneralSurvivalPlot
            xLabel={'Time to fall (seconds)'}
            xDomain={[90, 210]}
            yRange={[30, 120]}
            yValue={'survivalDays'}
            xValue={'diseaseStage'}
            plotWidth={isMobile ? 400 : 500}
            plotHeight={isMobile ? 500 : 500}
          />
        )

      case 'Weight':
        return (
          <GeneralSurvivalPlot
            xLabel={'Weight'}
            xDomain={[19, 28]}
            yRange={[30, 120]}
            yValue={'survivalDays'}
            xValue={'weight'}
            plotWidth={isMobile ? 400 : 500}
            plotHeight={isMobile ? 500 : 500}
          />
        )

      case 'Litter':
        return (
          <SurvivalLitterPlot
            data={data}
            width={500}
            height={380}
            margin={{ top: 30, right: 20, bottom: 50, left: 60 }}
            yDomain={[40, 120]}
            yLabel="Survival (in days)"
            dotRadius={4}
            colors={{
              A: '#00C802',
              B: '#F031DD',
            }}
            medians={{ A: 76, B: 78 }}
            medianTextColor="#6E00FF"
            yField="survivalDays"
            xJitterPositions={{
              A: [-20, -10, 0, 10, 20],
              B: [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, -2, 2]}
            xDomain={['A', 'B']}
          />
        )

      case 'Smoking history in years':
        return (
          <GeneralSurvivalPlot
            xLabel={'Smoking History (in years) '}
            yValue={'survivalDays'}
            xDomain={[-1, 30.5]}
            yRange={[90, 370]}
            xValue={'smokingYears'}
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
          />
        )

      case 'Physical activity (daily hours)':
        return (
          <GeneralSurvivalPlot
            xLabel={'Smoking History (in years) '}
            yValue={'survivalDays'}
            xDomain={[-0.2, 4.2]}
            yRange={[80, 370]}
            xValue={'physicalActivity'}
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
          />
        )

      default:
        return (
          <div style={{ width: isMobile ? '350px' : '500px', height: '380px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <span>Select a variable to view survival data</span>
          </div>
        )
    }
  }

  return (
    <div style={{
      backgroundColor: '#EBEBEB',
      minHeight: '100vh',
      paddingBottom: '20px'
    }}>
      <Suspense>
        <Search />
      </Suspense>
      
      <div style={{ 
        width: '80%', 
        margin: '0px auto 20px auto',
        padding: isMobile ? '10px' : '20px'
      }}>
        <Header
          onLogoClick={() => router.push('/')}
          onHelpClick={() => setIsModalOpen(true)}
          text={`Your session explored these variables - Click a variable to see if there is an effect.`}
        />
        
        <div style={{
          display: 'flex',
          justifyContent: 'center',
          width: '100%',
          marginTop: '10px'
        }}>
          <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%'
          }}>
            <div style={{
              width: '90%',
              border: '1px solid black',
              borderRadius: '8px',
              backgroundColor: 'white',
              padding: '20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflow: 'visible',
              position: 'relative',
              textAlign: 'center',
              minHeight: 'fit-content'
            }}>
              
              {/* Variable Selection */}
              <div style={{
                display: 'flex',
                justifyContent: 'center',
                width: '100%',
                marginBottom: '30px'
              }}>
                <div className="box-container">
                  {exploredVariables.length > 0 &&
                    exploredVariables.map((variable, index) => {
                      return (
                        <div
                          onClick={() => {
                            setSelectedVariableValue(variable)
                            setSelectedVariable(index)
                            handleStudent(variable)
                          }}
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
                    })}
                </div>
              </div>

              {/* Main Content Grid */}
              <div style={{
                width: '100%',
                height: 'auto',
                minHeight: 'fit-content',
                position: 'relative',
                overflow: 'hidden'
              }}>
                <Grid
                  container
                  spacing={2}
                  sx={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    justifyContent: 'center',
                  }}
                >
                  {/* Top Left - Questions and Answers */}
                  <Grid item xs={12} md={6}>
                    <div style={{ marginBottom: '20px' }}>
                      <h3 style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '10px' }}>
                        <b>
                          Is there a relationship between the{' '}
                          <span style={{ color: 'rgb(110, 0, 255)' }}>
                            {selectedVariableValue}
                          </span>{' '}
                          of the mice and the type of treatment they received?
                        </b>
                      </h3>
                      <div
                        style={{
                          fontSize: isMobile ? '12px' : '16px',
                          color: 'rgb(110, 0, 255)',
                          marginBottom: '5px',
                        }}
                      >
                        <b>The most common answer:</b>
                      </div>
                      <div className="round-box" style={{ fontSize: isMobile ? '12px' : '14px', marginBottom: '20px' }}>
                        <b>
                          {selectedOption === 1
                            ? 'I SEE A RELATIONSHIP'
                            : selectedOption === 2
                            ? "I'M NOT SURE"
                            : "I DON'T SEE A RELATIONSHIP"}
                        </b>
                      </div>
                    </div>
                    
                    <div>
                      <h3 style={{ fontSize: isMobile ? '14px' : '16px', marginBottom: '10px' }}>
                        <b>
                          Is there a relationship between the{' '}
                          <span style={{ color: 'rgb(110, 0, 255)' }}>
                            {selectedVariableValue}
                          </span>{' '}
                          of the mice and their survival in days?
                        </b>
                      </h3>
                      <div
                        style={{
                          fontSize: isMobile ? '12px' : '16px',
                          color: 'rgb(110, 0, 255)',
                          marginBottom: '5px',
                        }}
                      >
                        <b>The most common answer:</b>
                      </div>
                      <div className="round-box" style={{ fontSize: isMobile ? '12px' : '14px' }}>
                        <b>
                          {selectedSecondOption === 1
                            ? 'I SEE A RELATIONSHIP'
                            : selectedSecondOption === 2
                            ? "I'M NOT SURE"
                            : "I DON'T SEE A RELATIONSHIP"}
                        </b>
                      </div>
                    </div>
                  </Grid>

                  {/* Top Right - First Chart */}
                  <Grid item xs={12} md={6} sx={{ display: 'flex', justifyContent: 'center' }}>
                    {renderScatterImage()}
                  </Grid>

                  {/* Bottom Left - DAG */}
                  <Grid item xs={12} md={6} sx={{ marginTop: '20px' }}>
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        textAlign: 'center',
                      }}
                    >
                      <div 
                        className="dag-container"
                        style={{
                          ...dagContainerStyle,
                          marginBottom: '20px'
                        }}
                      >
                        <DagGenerator
                          key={`${dagKey}-second`}
                          {...dagProps}
                        />
                      </div>
                      <div
                        style={{
                          fontSize: isMobile ? '12px' : '14px',
                          color: 'black',
                          textAlign: 'left',
                          maxWidth: '400px',
                        }}
                      >
                        <p>
                          <b>Discuss!</b> What relationships did you find?
                          Who found relationships between their variable
                          and the treatment assignment and survival? What
                          problem do you see with these relationships?
                        </p>
                      </div>
                    </div>
                  </Grid>

                  {/* Bottom Right - Second Chart */}
                  <Grid item xs={12} md={6} sx={{ marginTop: '20px', display: 'flex', justifyContent: 'center' }}>
                    {renderScatterPlot2()}
                  </Grid>
                </Grid>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default ResultsMultipleLabs
