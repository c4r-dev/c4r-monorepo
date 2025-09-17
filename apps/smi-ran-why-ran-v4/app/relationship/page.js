'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Image from 'next/image'
import Button from '../components/Button'
import scatterPlotAge from '../assets/02_why-randomize_age.svg'
import scatterPlotAhi from '../assets/03_why-randomize_ahi.svg'
import scatterPlotEducation from '../assets/04_why-randomize_education.svg'
import scatterPlotBmi from '../assets/05_why-randomize_bmi.svg'
import scatterPlotSmoking from '../assets/06_why-randomize_smoking.svg'
import scatterPlotActivity from '../assets/07_why-randomize_activity.svg'
import scatterPlotSex from '../assets/14_why-randomize_sex.svg'
import ChartGameBox from '../components/ChartGameBox'
import SexPlot from '../components/Plots/SexPlot'
// import SexPlot from '../components/Plots/SexPlot';
import LitterPlot from '../components/Plots/LitterPlot'
import Scatterplot from '../components/Scatterplot'
import Header from '../components/Header/Header'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
// import data from '../Data/data.json'
import data from '../Data/new-data.json'
import CustomModal from '../components/CustomModal'
import BackgroundBox from '../components/DagGenerator/BackgroundBox'
import logo from '../assets/logo-sideways.svg'

function Relationship(props) {
  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const isTablet = useMediaQuery(theme.breakpoints.between('sm', 'md')) // Detect tablet screens
  const isLargeScreen = useMediaQuery(theme.breakpoints.up('md')) // Detect large screens
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

  //rectangle surrounding the line
  // const greenBoxStyle = {
  //   position: 'absolute',
  //  // position: 'relative',
  //   top: isMobile ? '80%' : '76%',
  //   left: isMobile? '28%' :'39.5%',
  //   width: '85px',
  //   height: '20px',
  //   backgroundColor: '#cefad0',
  //   zIndex: 0,
  //   borderRadius: '5px',
  //   transform: 'rotate(-52deg)',
  // }

  //square box
  const greenBoxStyle = {
    position: 'absolute',
    top: '40%', // Use percentage for vertical positioning
    left: '30%', // Use percentage for horizontal positioning
    width: '10vw', // Use vw to create a square that scales with viewport width
    height: '10vw', // Set height equal to width for a square
    backgroundColor: '#abf7b1', // Green color
    borderRadius: '5px',
    transform: 'rotate(45deg)', // Rotate the square by 45 degrees
    zIndex: 0,
  }

  //  const searchParams = useSearchParams()
  // const selectedUser = searchParams.get('selectedUser')
  // const selectedVariable = searchParams.get('selectedVariable')
  const [selectedSecondOption, setSelectedSecondOption] = useState(1)
  // const selectedGroup = searchParams.get('selectedGroup')
  const [selectedUser, setSelectedUser] = useState('')
  const [selectedGroup, setSelectedGroup] = useState('')
  const [selectedVariable, setSelectedVariable] = useState('')
  const [isOptionSelected, setIsOptionSelected] = useState(false)
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
    console.log('Guide button clicked')
    openModal(true)
  }

  function Search() {
    const searchParams = useSearchParams()
    setSelectedGroup(searchParams.get('selectedGroup'))
    setSelectedUser(searchParams.get('selectedUser'))
    setSelectedVariable(searchParams.get('selectedVariable'))
    return
  }

  const renderScatterImage = () => {
    switch (selectedVariable) {
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
              // Control: '#adf802',
              // Lithium: '#e78bf5',
              Control:"#00c802",
              Lithium:"#f031DD",
            }}
            medians={{ Control: 75, Lithium: 74.5 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'age'}
            xJitterPositions={{
              Control: [-20, -10, 0, 10, 20],
              Lithium: [-20, -10, 0, 10, 20],
            }}
            yJitter={[-15, 0, 15]}
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
              Control:"#00c802",
              Lithium:"#f031DD",
            }}
            medians={{ Control: 134, Lithium: 160 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'diseaseStage'}
            xJitterPositions={{
              Control: [-20, -10, 0, 10, 20],
              Lithium: [-20, -10, 0, 10, 20],
            }}
            yJitter={[-15, 0, 15]}
            // yJitter={[-20,-10, 0, 10,20]}
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
              Control:"#00c802",
              Lithium:"#f031DD",
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
        return <div>Loading...</div>
    }
  }

  useEffect(() => {
    let intSelectedOption = parseInt(selectedOption)

    let newLabelA = 'treatment assignment'
    let newLabelB = 'Survival in Days'
    let newLabelC = selectedVariable
    let newLineA = 'line'
    let newLineB = 'none'
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
      // default:
      //   newLineC = 'dottedBox'
    }

    setDagProps({
      labelA: newLabelA,
      labelB: newLabelB,
      labelC: newLabelC,
      lineA: newLineA,
      lineB: newLineB,
      lineC: newLineC,
    })
  }, [selectedOption, selectedVariable])

  const router = useRouter()

  const handleResults = (e) => {
    e.preventDefault()
    router.push(
      `/RelationshipSecond?selectedGroup=${selectedGroup}&selectedUser=${selectedUser}&selectedVariable=${selectedVariable}&selectedOption=${selectedOption}`
    )
  }

  const dagKey = Object.values(dagProps).join('-')

  return (
    <>
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
          text={`First, check if there might be a difference between groups for the variable ${selectedVariable}`}
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
          }}>
             <div style={{
               width: '100%',
               height: 'auto',
               minHeight: 'fit-content',
               position: 'relative',
               overflow: 'hidden'
             }}>
               <div 
                 style={{
                   width: '100%',
                   height: 'auto',
                   position: 'relative',
                   backgroundColor: 'transparent',
                   boxShadow: 'none',
                   margin: 0,
                   padding: 0
                 }}
                 className="chart-game-box-override"
               >
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
                 <ChartGameBox
                   handleLogoClick={handleLogoClick}
                   handleHelpClick={handleHelpClick}
                   oneLineText={
                     <>
                       First, check if there might be a difference between groups for
                       the variable{' '}
                       <span style={{ color: 'blue' }}>{selectedVariable}</span>
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
              // margin={2}
            >
              <Grid
                item
                xs={12}
                sx={{
                  display: 'flex',
                  justifyContent: 'center',
                  height: '380px',
                }}
              >
                {/* <Scatterplot
                    yLabel={selectedVariable}
                    selectedVariable={selectedVariable}
                  /> */}
                {renderScatterImage()}
              </Grid>
              <Grid
                item
                xs={12}
                sx={{ display: 'flex', justifyContent: 'flex-start' }}
              >
                <Grid
                  container
                  sx={{ display: 'flex', flexDirection: 'row' }}
                  margin={0}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', marginLeft: '15px', marginTop: '0px', marginBottom: '40px' }}
                  >
                    <b style={{ alignItems: 'flex-start' }}>
                      Do you see a possible difference between groups?
                    </b>
                  </Grid>
                  <div style={{ height: '40px', width: '100%' }}></div>
                  <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row' }}
                    margin={0}
                  >
                    <Grid
                      onClick={() => {
                        setIsOptionSelected(true)
                        setSelectedOption(1)
                      }}
                      sx={{
                        // border: '1px solid black',
                        // //   backgroundColor: '#D4D4D4',
                        // backgroundColor:
                        //   selectedOption === 1 ? '#F3F3F3' : '#D4D4D4',
                        //   textAlign:'center'
                        // border: '1px solid black',
                        // backgroundColor:
                        //   selectedSecondOption === 1 ? '#F3F3F3' : '#D4D4D4',
                        //   textAlign:'center'
                        border: '2px solid black',
                        backgroundColor:
                          selectedOption === 1 ? '#cefad0' : '#D4D4D4',
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
                            selectedOption === 1 ? '#cefad0' : '#F3F3F3', // Hover effect
                        },
                      }}
                      xs={isMobile ? 4 : 4}
                    >
                      <b>I see a difference</b>
                    </Grid>
                    <Grid
                      onClick={() => {
                        setIsOptionSelected(true)
                        setSelectedOption(2)
                      }}
                      sx={{
                        border: '2px solid black',
                        backgroundColor:
                          selectedOption === 2 ? '#cefad0' : '#D4D4D4',
                        textAlign: 'center',
                        height: isMobile ? '50px' : '35px',
                        // minHeight: isMobile? '80px' : '0px',
                        borderRadius: '20px', // Rounded corners
                        padding: isMobile ? '2px 2px' : '5px 5px', // Padding for button-like appearance
                        margin: '0 5px', // Space between buttons
                        cursor: 'pointer', // Change cursor to pointer
                        transition: 'background-color 0.3s ease', // Smooth transition for hover
                        '&:hover': {
                          backgroundColor:
                            selectedOption === 2 ? '#cefad0' : '#F3F3F3', // Hover effect
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
                        setSelectedOption(3)
                      }}
                      sx={{
                        // border: '1px solid black',
                        // backgroundColor:
                        //   selectedSecondOption === 1 ? '#F3F3F3' : '#D4D4D4',
                        //   textAlign:'center'
                        border: '2px solid black',
                        backgroundColor:
                          selectedOption === 3 ? '#cefad0' : '#D4D4D4',
                        textAlign: 'center',
                        height: isMobile ? '50px' : '35px',
                        // minHeight: isMobile? '2px' : '0px',
                        borderRadius: '20px', // Rounded corners
                        padding: isMobile ? '2px 2px' : '5px 5px', // Padding for button-like appearance
                        margin: '0 5px', // Space between buttons
                        cursor: 'pointer', // Change cursor to pointer
                        transition: 'background-color 0.3s ease', // Smooth transition for hover
                        '&:hover': {
                          backgroundColor:
                            selectedOption === 3 ? '#cefad0' : '#F3F3F3', // Hover effect
                        },
                      }}
                      xs={isMobile ? 3.5 : 4}
                    >
                      {' '}
                      <b>I don&apos;t see a difference</b>
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
                            style={{ position: 'relative', height: isMobile? '11vh' :'26vh' , right:isMobile? '0%' :'81%', left: isMobile? '19%' :'-21%' , opacity: 0.5, // 50% opacity
                            }}
                          >
                            <BackgroundBox />
                          </div> */}
                          {/* <div style={greenBoxStyle}></div> */}
                          <DagGenerator key={dagKey} {...dagProps} />
                        </div>
                      </div>
                    </Grid>
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
                    </div>
                    {/* <button
                      style={{
                        backgroundColor: '#5801d0',
                        color: 'white',
                        marginTop: isMobile ? '20px' : '0px',
                        marginLeft: isMobile ? '40%' : '15px',
                      }}
                      onClick={handleGuideBtn}
                    >
                      GUIDE
                    </button> */}
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
              </Grid>
            </Grid>
                 </ChartGameBox>
               </div>
             </div>
          </div>
        </div>
        </div>
      </div>
    </>
  )
}

export default Relationship
