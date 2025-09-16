'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Grid from '@mui/material/Grid'
import Image from 'next/image'
import scatterPlotAge from '../assets/02_why-randomize_age.svg'
import scatterPlotAhi from '../assets/03_why-randomize_ahi.svg'
import scatterPlotEducation from '../assets/04_why-randomize_education.svg'
import scatterPlotBmi from '../assets/05_why-randomize_bmi.svg'
import scatterPlotSmoking from '../assets/06_why-randomize_smoking.svg'
import scatterPlotActivity from '../assets/07_why-randomize_activity.svg'
import scatterPlotSex from '../assets/14_why-randomize_sex.svg'
import ChartGameBox from '../components/ChartGameBox'
import Scatterplot from '../components/Scatterplot'
import ActivityLayout from '../components/ActivityLayout'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import BackgroundBox from '../components/DagGenerator/BackgroundBox'

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

  const [dagProps, setDagProps] = useState({
    labelA: 'Treatment Type',
    labelB: 'Survival in Days',
    labelC: selectedVariable,
    lineA: 'line',
    lineB: 'dottedLine',
    lineC: 'none',
  })

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
          <Image
            src={scatterPlotAge}
            alt="Description of the Age plot"
            width={400}
            // height={300}
          />
        )

      case 'Annual household income':
        return (
          <Image
            src={scatterPlotAhi}
            alt="Description of the Annual household income plot"
            width={400}
            // height={300}
          />
        )

      case 'BMI':
        return (
          <Image
            src={scatterPlotBmi}
            alt="Description of the BMI plot"
            width={400}
            // height={300}
          />
        )
      case 'Years of education':
        return (
          <Image
            src={scatterPlotEducation}
            alt="Description of the Years of education plot"
            width={400}
            // height={300}
          />
        )
      case 'Smoking history in years':
        return (
          <Image
            src={scatterPlotSmoking}
            alt="Description of the Smoking history in years plot"
            width={400}
            // height={300}
          />
        )
      case 'Physical activity (daily hours)':
        return (
          <Image
            src={scatterPlotActivity}
            alt="Description of the Physical activity (daily hours) plot"
            width={400}
            // height={300}
          />
        )

      case 'Sex':
        return (
          <Image
            src={scatterPlotSex}
            alt="Description of the Sex Plot"
            width={400}
            // height={300}
          />
        )
      default:
        return <div>Loading...</div>
    }
  }

  useEffect(() => {
    // console.log(selectedOption, 'the selected option is')
    // console.log(typeof selectedOption)

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
            oneLineText={`First, check if there might be a  difference between groups for the variable ${selectedVariable}`}
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
