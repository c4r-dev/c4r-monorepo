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
import SexPlot from '../components/Plots/SexPlot';
import Scatterplot from '../components/Scatterplot'
import ActivityLayout from '../components/ActivityLayout'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import data from '../Data/data.json'
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

  const [dagProps, setDagProps] = useState({
    labelA: 'Treatment Type',
    labelB: 'Survival in Days',
    labelC: selectedVariable,
    lineA: 'line',
    lineB: 'dottedLine',
    lineC: 'none',
  })

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
            width={isMobile? 350 : 500}
            height={360}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[10, 100]}
            yLabel="Age"
            dotRadius={4}
            colors={{
              'In-person treatment': '#adf802',
              'Virtual treatment': '#e78bf5',
            }}
            medians={{ 'In-person treatment': 55, 'Virtual treatment': 40.5 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'age'}
            xJitterPositions={{
              'In-person treatment': [-20, -10, 0, 10, 20],
              'Virtual treatment': [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'Annual household income':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile? 350 : 500}
            height={300}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[15000, 130000]}
            yLabel="Annual Household Income"
            dotRadius={4}
            colors={{
              'In-person treatment': '#adf802',
              'Virtual treatment': '#e78bf5',
            }}
            medians={{ 'In-person treatment': 47282, 'Virtual treatment': 80556 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'income'}
            xJitterPositions={{
              'In-person treatment': [-20, -10, 0, 10, 20],
              'Virtual treatment': [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'BMI':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile? 350 : 500}
            height={300}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[17.5, 31.5]}
            yLabel="BMI"
            dotRadius={4}
            colors={{
              'In-person treatment': '#adf802',
              'Virtual treatment': '#e78bf5',
            }}
            medians={{ 'In-person treatment': 25, 'Virtual treatment': 24 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'bmi'}
            xJitterPositions={{
              'In-person treatment': [-20, -10, 0, 10, 20],
              'Virtual treatment': [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'Years of education':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile? 350 : 500}
            height={300}
            margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
            yDomain={[9, 20]}
            yLabel="Years of education"
            dotRadius={4}
            colors={{
              'In-person treatment': '#adf802',
              'Virtual treatment': '#e78bf5',
            }}
            medians={{ 'In-person treatment': 15, 'Virtual treatment': 15 }}
            medianTextColor="#6E00FF"
            medianText={''}
            yField={'educationYears'}
            xJitterPositions={{
              'In-person treatment': [-20, -10, 0, 10, 20],
              'Virtual treatment': [-20, -10, 0, 10, 20],
            }}
            yJitter={[0, 0, 0]}
          />
        )

      case 'Smoking history in years':
        return (
          <TreatmentPlot
          data={data}
          width={isMobile? 350 : 500}
          height={300}
          margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
          yDomain={[-4, 35]}
          yLabel="Smoking history (in years)"
          dotRadius={4}
          colors={{
            'In-person treatment': '#adf802',
            'Virtual treatment': '#e78bf5',
          }}
          medians={{ 'In-person treatment': 0, 'Virtual treatment': 0 }}
          medianTextColor="#6E00FF"
          medianText={''}
          yField={'smokingYears'}
          xJitterPositions={{
            'In-person treatment': [-20, -10, 0, 10, 20],
            'Virtual treatment': [-20, -10, 0, 10, 20],
          }}
          yJitter={[0, 0, 0]}
        />
        )

      case 'Physical activity (daily hours)':
        return (
          <TreatmentPlot
          data={data}
          width={isMobile? 350 : 500}
          height={300}
          margin={{ top: 30, right: 20, bottom: 20, left: 50 }}
          yDomain={[-1, 5]}
          yLabel="Physical activity level (hours per day)"
          dotRadius={4}
          colors={{
            'In-person treatment': '#adf802',
            'Virtual treatment': '#e78bf5',
          }}
          medians={{ 'In-person treatment': 0, 'Virtual treatment': 1 }}
          medianTextColor="#6E00FF"
          medianText={''}
          yField={'physicalActivity'}
          xJitterPositions={{
            'In-person treatment': [-20, -10, 0, 10, 20],
            'Virtual treatment': [-20, -10, 0, 10, 20],
          }}
          yJitter={[0, 0, 0]}
        />
        )

      case 'Sex':
        return (
          <SexPlot/>
        )

      default:
        return <div>Loading...</div>
    }
  }

  useEffect(() => {
    let intSelectedOption = parseInt(selectedOption)

    let newLabelA = 'Treatment Type'
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

      <ActivityLayout
        isMobileProp={isMobile}
        headerText={`${selectedVariable} and treatment type`}
        text={`Skeptical Stork wants to know if there might be a relationship between the treatment in this study and the variable ${selectedVariable}. They created a graph to see if there is a difference in treatment effect for patients with different ${selectedVariable}s.`}
        subText={'What do you think?'}
        oneLineText={`First, check if there might be a difference between groups for the variable ${selectedVariable}`}
      >
        <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />

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
                  justifyContent: 'flex-start',
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
                  margin={2}
                >
                  <Grid
                    item
                    xs={10}
                    sx={{ display: 'flex', marginLeft: '15px' }}
                  >
                    <b style={{ alignItems: 'flex-start' }}>
                      Do you see a possible difference between groups?
                    </b>
                  </Grid>
                  <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row' }}
                    margin={1}
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
                    <button
                      style={{
                        color: 'white',
                        backgroundColor: 'black',
                        marginLeft: isMobile ? '35%' : '15px',
                      }}
                      onClick={handleResults}
                    >
                      CONTINUE
                    </button>
                    <button
                      style={{
                        backgroundColor: '#5801d0',
                        color: 'white',
                        marginTop: isMobile ? '20px' : '0px',
                        marginLeft: isMobile ? '40%' : '15px',
                      }}
                      onClick={handleGuideBtn}
                    >
                      GUIDE
                    </button>
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
        </Grid>
      
      </ActivityLayout>
    </>
  )
}

export default Relationship
