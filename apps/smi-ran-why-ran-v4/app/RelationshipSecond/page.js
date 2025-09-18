const logger = require('../../../../packages/logging/logger.js');
'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import SurvivalSexPlot from '../components/Plots/SurvivalSexPlot'
import SurvivalLitterPlot from '../components/Plots/SurvivalLitterPlot'

import DagGenerator from '../components/DagGenerator/DagGenerator'
import Image from 'next/image'
import Grid from '@mui/material/Grid'
import SexPlot from '../components/Plots/SexPlot'
import scatterPlotSurvival_Age from '../assets/08_why-randomize_survival-age.svg'
import scatterPlotSurvival_Ahi from '../assets/09_why-randomize_survival-ahi.svg'
import scatterPlotSurvival_Education from '../assets/10_why-randomize_survival-education.svg'
import scatterPlotSurvival_Bmi from '../assets/11_why-randomize_survival-bmi.svg'
import scatterPlotSurvival_Smoking from '../assets/12_why-randomize_survival-smoking.svg'
import scatterPlotSurvival_Activity from '../assets/13_why-randomize_survival-activity.svg'
import scatterPlotSurvival_Sex from '../assets/15_why-randomize_survival-sex.svg'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import Header from '../components/Header/Header'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CustomModal from '../components/CustomModal'
import GeneralSurvivalPlot from '../components/Plots/GeneralSurvivalPlot'
import SurvivalPlot from '../components/Plots/SurvivalPlot'
// import data from '../Data/data.json'
import data from '../Data/new-data.json'
import BackgroundBox from '../components/DagGenerator/BackgroundBox'

function RelationshipSecond(props) {
  // const searchParams = useSearchParams()
  // const selectedUser = searchParams.get('selectedUser')
  // const selectedVariable = searchParams.get('selectedVariable')
  // const selectedOption = searchParams.get('selectedOption')
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const [selectedSecondOption, setSelectedSecondOption] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [selectedOption, setSelectedOption] = useState('')
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [dagProps, setDagProps] = useState({
    labelA: 'treatment assignment',
    labelB: 'Survival in Days',
    labelC: selectedVariable,
    lineA: 'line',
    lineB: 'dottedLine',
    lineC: 'none',
  })

  function Search() {
    const searchParams = useSearchParams()
    setSelectedUser(searchParams.get('selectedUser'))
    setSelectedVariable(searchParams.get('selectedVariable'))
    setSelectedOption(searchParams.get('selectedOption'))
    setSelectedGroup(searchParams.get('selectedGroup'))
    return
  }

  // UseEffect to set new DAG props
  useEffect(() => {
    let intSelectedOption = parseInt(selectedOption)

    let newLabelA = 'treatment assignment'
    let newLabelB = 'Survival in Days'
    let newLabelC = selectedVariable
    let newLineA = 'line'
    let newLineB = 'noneWithBox'
    let newLineC = 'none'

    switch (intSelectedOption) {
      case 1:
        newLineC = 'line'
        break
      case 2:
        newLineC = 'dottedLine'
        break
      case 3:
        newLineC = 'none'
        break
    }
    switch (selectedSecondOption) {
      case 1:
        newLineB = 'lineWithBox'
        break
      case 2:
        newLineB = 'dottedLineWithBox'
        break
      case 3:
        newLineB = 'noneWithBox'
        break
      // default:
      //   newLineB = 'dottedBox'
    }

    setDagProps({
      labelA: newLabelA,
      labelB: newLabelB,
      labelC: newLabelC,
      lineA: newLineA,
      lineB: newLineB,
      lineC: newLineC,
    })
  }, [selectedOption, selectedSecondOption, selectedVariable])

  const [isOptionSelected, setIsOptionSelected] = useState(false)

  const router = useRouter()
  const dagContainerStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    alignSelf: 'center',
    height: isMobile ? '200px' : '300px',
    width: isMobile ? '300px' : '400px',
    borderRadius: '10px',
    marginTop: '-20px',
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

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  const handleGuideBtn = () => {
    logger.app.info('Guide button clicked')
    openModal(true)
  }

  const renderScatterImage = () => {
    switch (selectedVariable) {
      case 'Sex':
        return (
          <>
            <SurvivalSexPlot
              data={data}
              width={500}
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
        )

      case 'Age':
        return (
          <GeneralSurvivalPlot
            xLabel={'Age'}
            xDomain={[58, 90]}
            yRange={[30, 120]}
            xValue={'age'}
            yValue={'survivalDays'}
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
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
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
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
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
          />

          //  <SurvivalPlot data={data} yLabel={"bmi"}/>
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
            yJitter={[0, 0, 0]}
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

          //  <SurvivalPlot data={data} yLabel={"smokingHistory"}/>
        )

      case 'Physical activity (daily hours)':
        return (
          // <Image
          //   src={scatterPlotSurvival_Activity}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'Smoking History (in years) '}
            yValue={'survivalDays'}
            //xRange={[-1, 32]}
            xDomain={[-0.2, 4.2]}
            yRange={[80, 370]}
            xValue={'physicalActivity'}
            plotWidth={isMobile ? 400 : 700}
            plotHeight={isMobile ? 500 : 400}
          />

          // <SurvivalPlot data={data} yLabel={"physicalActivity"}/>
        )

      default:
        return <div>Loading...</div>
    }
  }

  const handleResults = (e) => {
    fetch('https://smi-ran-why-ran-v4.vercel.app/api/students', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grp_id: selectedGroup,
        name: selectedUser,
        // student_id:9,
        assignedVariable: selectedVariable,
        selectedOption: selectedOption,
        selectedSecondOption: selectedSecondOption,
      }),
    })
      .then((response) => response.json())
      .then((data) => logger.app.info(data))
      .catch((error) => logger.app.error('Error:', error))
    router.push(
      `/ResultsOwnLab?selectedGroup=${selectedGroup}&selectedVariable=${selectedVariable}`
    )
  }

  const dagKey = Object.values(dagProps).join('-')

  return (
    <>
      <Suspense>
        <Search />
        <div style={{ 
          width: '80%', 
          margin: '0px auto 0px auto',
          padding: isMobile ? '10px' : '20px'
        }}>
          <Header
            onLogoClick={() => router.push('/')}
            onHelpClick={() => setIsModalOpen(true)}
            text="Next, Is there a relationship between the Time to fall of the mice and their Survival (in days)?"
          />
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            width: '100%',
            marginTop: '5px'
          }}>
            <div style={{
              width: '80%',
              border: '1px solid black',
              borderRadius: '8px',
              backgroundColor: 'white',
              padding: '20px 20px 0px 20px',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'flex-start',
              overflow: 'visible',
              position: 'relative',
              textAlign: 'center',
              height: 'fit-content'
            }} className="chart-game-box-override">
              <style jsx>{`
                .chart-game-box-override :global(.MuiBox-root) {
                  width: 100% !important;
                  height: auto !important;
                  margin: 0 !important;
                  box-shadow: none !important;
                  background-color: transparent !important;
                  border: none !important;
                  padding: 0 !important;
                }
                .chart-game-box-override :global(.MuiGrid-container) {
                  justify-content: center !important;
                  text-align: center !important;
                  margin: 0 !important;
                }
                .chart-game-box-override :global(.MuiGrid-item) {
                  display: flex !important;
                  justify-content: center !important;
                  align-items: center !important;
                  margin: 0 !important;
                  padding: 0 !important;
                }
                .chart-game-box-override :global(svg) {
                  margin: 0 auto !important;
                  display: block !important;
                }
                .chart-game-box-override :global(.recharts-wrapper) {
                  margin: 0 auto !important;
                }
                .chart-game-box-override :global(div) {
                  text-align: center !important;
                }
                .chart-game-box-override > div {
                  margin: 0 !important;
                  padding: 0 !important;
                }
              button {
                pointer-events: auto !important;
                cursor: pointer !important;
                z-index: 1000 !important;
              }
              `}</style>
          <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

          <Grid
            item
            xs={6}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              marginLeft: isMobile ? '0px' : '230px',
            }}
          >
            <ChartGameBox
              handleHelpClick={handleHelpClick}
              handleLogoClick={handleLogoClick}
              oneLineText={
                <>
                  {selectedVariable === "Weight" 
                    ? "Next, Is there a relationship between the Weight of the mice and their Survival (in days)?"
                    : selectedVariable === "Sex"
                    ? "Next, Is there a relationship between the Sex of the mice and their Survival (in days)?"
                    : selectedVariable === "Time to fall"
                    ? "Next, Is there a relationship between Time to fall (seconds) of the mice and their Survival (in days)?"
                    : selectedVariable === "Age"
                    ? "Next, Is there a relationship between Age of the mice and their Survival (in days)?"
                    : selectedVariable === "Litter"
                    ? "Next, Is there a relationship between Litter of the mice and their Survival (in days)?"
                    : "Next, Is there a relationship between your variable of the mice and their Survival (in days)?"
                  }
                </>
              }
              isRelationship={true}
              isMobile={isMobile}
            >
              <Grid
                container
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  alignItems: 'center',
                }}
                margin={1}
              >
                <Grid
                  item
                  xs={12}
                  sx={{
                    display: 'flex',
                    justifyContent: 'flex-start',
                    height: '380px',
                  }}
                >
                  {/* <Scatterplot
                  yLabel={selectedVariable}
                  selectedVariable={selectedVariable}
                  selectedXVariable={'Survival in days'}
                  xLabel={'Survival in days'}
                /> */}
                  {renderScatterImage()}
                </Grid>
                <div style={{ height: '60px', width: '100%' }}></div>
                <Grid
                  item
                  xs={12}
                  sx={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}
                    margin={0}
                  >
                    <Grid
                      item
                      xs={10.5}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                        marginTop: '0px',
                        marginBottom: '40px'
                      }}
                    >
                      <b>
                        Is there a relationship between the{' '}
                        <span style={{ color: 'rgb(110, 0, 255)' }}>
                          {selectedVariable}
                        </span>{' '}
                        of the patients and their survival in days?
                      </b>
                    </Grid>
                    <div style={{ height: '20px', width: '100%' }}></div>
                    <Grid
                      container
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      margin={0}
                    >
                      <Grid
                        onClick={() => {
                          setIsOptionSelected(true)
                          setSelectedSecondOption(1)
                        }}
                        sx={{
                          // border: '1px solid black',
                          // backgroundColor:
                          //   selectedSecondOption === 1 ? '#F3F3F3' : '#D4D4D4',
                          //   textAlign:'center'
                          border: '2px solid black',
                          backgroundColor:
                            selectedSecondOption === 1 ? '#abf7b1' : '#D4D4D4',
                          textAlign: 'center',
                          height: isMobile ? '50px' : '35px',
                          //minHeight: isMobile? '80px' : '0px',
                          borderRadius: '20px', // Rounded corners
                          padding: isMobile ? '2px 2px' : '5px 5px', // Padding for button-like appearance
                          margin: '0 5px', // Space between buttons
                          cursor: 'pointer', // Change cursor to pointer
                          transition: 'background-color 0.3s ease', // Smooth transition for hover
                          '&:hover': {
                            backgroundColor:
                              selectedSecondOption === 1
                                ? '#abf7b1'
                                : '#F3F3F3', // Hover effect
                          },
                        }}
                        xs={isMobile ? 3.5 : 4}
                      >
                        <b>I see a relationship</b>
                      </Grid>
                      <Grid
                        onClick={() => {
                          setIsOptionSelected(true)
                          setSelectedSecondOption(2)
                        }}
                        sx={{
                          // border: '1px solid black',
                          // backgroundColor:
                          //   selectedSecondOption === 2 ? '#F3F3F3' : '#D4D4D4',
                          //   textAlign:'center'
                          border: '2px solid black',
                          height: isMobile ? '50px' : '35px',
                          // minHeight: isMobile? '80px' : '0px',
                          backgroundColor:
                            selectedSecondOption === 2 ? '#abf7b1' : '#D4D4D4',
                          textAlign: 'center',
                          borderRadius: '20px', // Rounded corners
                          padding: '5px 5px', // Padding for button-like appearance
                          margin: '0 5px', // Space between buttons
                          cursor: 'pointer', // Change cursor to pointer
                          transition: 'background-color 0.3s ease', // Smooth transition for hover
                          '&:hover': {
                            backgroundColor:
                              selectedSecondOption === 2
                                ? '#abf7b1'
                                : '#F3F3F3', // Hover effect
                          },
                        }}
                        xs={3}
                      >
                        {' '}
                        <b>I am not sure</b>
                      </Grid>
                      <Grid
                        onClick={() => {
                          setIsOptionSelected(true)
                          setSelectedSecondOption(3)
                        }}
                        sx={{
                          // border: '1px solid black',
                          // backgroundColor:
                          //   selectedSecondOption === 3 ? '#F3F3F3' : '#D4D4D4',
                          //   textAlign:'center'
                          border: '2px solid black',
                          backgroundColor:
                            selectedSecondOption === 3 ? '#abf7b1' : '#D4D4D4', // Initially grey, green if selected
                          textAlign: 'center',
                          borderRadius: '20px', // Rounded corners
                          padding: '5px 5px', // Padding for button-like appearance
                          margin: '0 5px', // Space between buttons
                          cursor: 'pointer', // Change cursor to pointer
                          height: isMobile ? '50px' : '35px',
                          // minHeight: isMobile? '80px' : '0px',
                          // transition: 'background-color 0.3s ease', // Smooth transition for hover
                          '&:hover': {
                            backgroundColor:
                              selectedSecondOption === 3
                                ? '#abf7b1'
                                : '#F3F3F3', // Hover only if not selected', // Hover effect
                          },
                        }}
                        xs={isMobile ? 4 : 4}
                      >
                        {' '}
                        <b>I don&apos;t see a relationship</b>
                      </Grid>
                      <div style={{ height: '30px', width: '100%' }}></div>
                      <Grid
                        container
                        sx={{
                          border: '1px solid black',
                          display: 'flex',
                          flexDirection: 'row',
                          justifyContent: 'center',
                          alignItems: 'center',
                          height: '250px',
                          margin: '20px',
                        }}
                      >
                        <div className="App">
                          <div
                            className="dag-container"
                            style={dagContainerStyle}
                          >
                            {/* <div
                            style={{ position: 'relative', height: isMobile? '10.5vh':'26vh' , left:isMobile? '50%' :'9%',   opacity: 0.5, // 50% opacity
                            }}
                          >
                            <BackgroundBox />
                          </div> */}
                            <DagGenerator key={dagKey} {...dagProps} />
                          </div>
                        </div>
                      </Grid>
                      {/* <button
                        style={{
                          color: 'white',
                          backgroundColor: 'black',
                         // marginLeft: isMobile ? '35%' : '0px',
                          textAlign:'center',
                          marginRight:isMobile? '0px': '620px'
                        }}
                        onClick={handleResults}
                      >
                        CONTINUE
                      </button> */}
                      <div style={{
                        display: 'flex',
                        justifyContent: 'center',
                        width: '100%',
                        marginTop: '25px',
                        marginBottom: '15px'
                      }}>
                        <button
                          style={{
                            backgroundColor: isOptionSelected ? '#6200EE' : '#cccccc',
                            color: 'white',
                            border: 'none',
                            padding: '10px 20px',
                            borderRadius: '4px',
                            cursor: isOptionSelected ? 'pointer' : 'not-allowed',
                            opacity: isOptionSelected ? 1 : 0.7,
                          }}
                          onClick={handleResults}
                          disabled={!isOptionSelected}
                        >
                          CONTINUE
                        </button>
                        {/* <button
                          style={{
                            backgroundColor: '#5801d0',
                            color: 'white',
                            textAlign: 'center',
                          }}
                          onClick={handleGuideBtn} // Add your Guide button logic here
                        >
                          GUIDE
                        </button> */}
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </ChartGameBox>
          </Grid>
            </div>
          </div>
        </div>
      </Suspense>
    </>
  )
}

export default RelationshipSecond
