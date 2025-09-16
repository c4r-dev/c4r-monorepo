'use client'
import React, { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import CircularProgress from '@mui/material/CircularProgress'
import scatterPlotAge from '../assets/02_why-randomize_age.svg'
import scatterPlotAhi from '../assets/03_why-randomize_ahi.svg'
import scatterPlotEducation from '../assets/04_why-randomize_education.svg'
import scatterPlotBmi from '../assets/05_why-randomize_bmi.svg'
import scatterPlotSmoking from '../assets/06_why-randomize_smoking.svg'
import scatterPlotActivity from '../assets/07_why-randomize_activity.svg'
import scatterPlotSex from '../assets/14_why-randomize_sex.svg'
import scatterPlotSurvival_Age from '../assets/08_why-randomize_survival-age.svg'
import scatterPlotSurvival_Ahi from '../assets/09_why-randomize_survival-ahi.svg'
import scatterPlotSurvival_Education from '../assets/10_why-randomize_survival-education.svg'
import scatterPlotSurvival_Bmi from '../assets/11_why-randomize_survival-bmi.svg'
import scatterPlotSurvival_Smoking from '../assets/12_why-randomize_survival-smoking.svg'
import scatterPlotSurvival_Activity from '../assets/13_why-randomize_survival-activity.svg'
import scatterPlotSurvival_Sex from '../assets/15_why-randomize_survival-sex.svg'
import Button from '../components/Button'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import Header from '../components/Header'
import ChartGameBox from '../components/ChartGameBox'
import Loader from '../components/Loader/Loader'
import Scatterplot from '../components/Scatterplot'
import Stack from '@mui/material/Stack'
import LinearProgress from '@mui/material/LinearProgress'
import raven1 from '../assets/raven-1.svg'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Padding } from '@mui/icons-material'
import BackgroundBox from '../components/DagGenerator/BackgroundBox'

function ResultsMultipleLabs() {
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedSecondOption, setSelectedSecondOption] = useState('')
  const [error, setError] = useState('')
  const [studentData, setStudentData] = useState({})
  const [exploredVariables, setExploredVariables] = useState('')
  const [groupDetails, setGroupDetails] = useState({})
  const [selectedVariable, setSelectedVariable] = useState(0)
  const [hasInitialSelection, setHasInitialSelection] = useState(false) // Track initial selection
  const [selectedVariableValue, setSelectedVariableValue] = useState(
    exploredVariables[0]
  )
  const [loading, setLoading] = useState(true)

  const theme = useTheme()
  const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12 Pro)
  const [dagProps, setDagProps] = useState({
    labelA: 'Treatment Type',
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
    height: isMobile ? '130px' : '280px',
    width: isMobile ? '280px' : '400px',
    // height:'auto',
    // width:'auto',
    overflow: 'visible',
    // overflow: "fixed",
    borderRadius: '10px',
    marginLeft: isMobile ? '-20px' : '0px',
    marginTop: isMobile ? '50px' : '0px',
  }

  // const dagContainerStyle = {
  //   display: 'flex',
  //   justifyContent: 'center',
  //   alignItems: 'center',
  //   alignSelf: 'center',
  //   height: isMobile ? '200px' : '300px',
  //   width: isMobile ? '300px': '400px',
  //   borderRadius: '10px',
  //   marginTop:"-20px"
  // }
  const router = useRouter()
  function Search() {
    const searchParams = useSearchParams()
    // setSelectedGroup(searchParams.get('selectedGroup'))
    setSelectedGroup(searchParams.get('selectedGroup'))

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
      // setLoading(true)
      try {
        const response = await fetch('https://smi-ran-why-ran-v2.vercel.app/api/groups') // Adjust the endpoint as needed

        if (!response.ok) {
          throw new Error('Network response was not ok')
        }
        const data = await response.json()
        data.map((grp) => {
          if (grp.students.length > 0 && grp.grp_id === selectedGroup) {
            // console.log('in group aaAAAAA', grp, selectedGroup)
            const newVariables = [...exploredVariables] // Create a copy of the current variables
            setGroupDetails(grp)

            grp.students.forEach((student) => {
              if (student.assignedVariable === selectedVariableValue) {
                setStudentData(student)
                setSelectedOption(student.selectedOption)
                setSelectedSecondOption(student.selectedSecondOption)
              }
              // console.log(student, 'this is student data', newVariables)
              // Use forEach instead of map since you're not returning anything
              if (!newVariables.includes(student.assignedVariable)) {
                // console.log('in new variables')
                // setSelectedVariableValue(student.assignedVariable)
                newVariables.push(student.assignedVariable)
              }
            })

            setExploredVariables(newVariables) // Update the state with the new array
          }
        })
      } catch (error) {
        setError(error.message)
      }
    }

    fetchData()
  }, [selectedGroup, selectedVariableValue, loading])

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
    let newLabelA = 'Treatment Type'
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
    groupDetails.students.map((student) => {
      if (student.assignedVariable === variable) {
        setStudentData(student)
        setSelectedOption(student.selectedOption)
        setSelectedOption(student.selectedSecondOption)
      }
    })
  }

  const handleResults = () => {
    setLoading(false)
  }

  const renderScatterPlot1 = () => {
    switch (selectedVariableValue) {
      case 'Age':
        return (
          <Image
            src={scatterPlotAge}
            alt="Description of the Age plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )

      case 'Annual household income':
        return (
          <Image
            src={scatterPlotAhi}
            alt="Description of the Annual household income plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )

      case 'BMI':
        return (
          <Image
            src={scatterPlotBmi}
            alt="Description of the BMI plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Years of education':
        return (
          <Image
            src={scatterPlotEducation}
            alt="Description of the Years of education plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Smoking history in years':
        return (
          <Image
            src={scatterPlotSmoking}
            alt="Description of the Smoking history in years plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Physical activity (daily hours)':
        return (
          <Image
            src={scatterPlotActivity}
            alt="Description of the Physical activity (daily hours) plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )

      case 'Sex':
        return (
          <Image
            src={scatterPlotSex}
            alt="Description of the Sex Plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      default:
        return (
          <Image
            src={scatterPlotAge}
            alt="Description of the Age plot"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
    }
  }

  const renderScatterPlot2 = () => {
    switch (selectedVariableValue) {
      case 'Sex':
        return (
          <Image
            src={scatterPlotSurvival_Sex}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Age':
        return (
          <Image
            style={{ marginTop: isMobile ? '0px' : '0px' }}
            src={scatterPlotSurvival_Age}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )

      case 'Annual household income':
        return (
          <Image
            src={scatterPlotSurvival_Ahi}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )

      case 'BMI':
        return (
          <Image
            src={scatterPlotSurvival_Bmi}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Years of education':
        return (
          <Image
            src={scatterPlotSurvival_Education}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Smoking history in years':
        return (
          <Image
            src={scatterPlotSurvival_Smoking}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      case 'Physical activity (daily hours)':
        return (
          <Image
            src={scatterPlotSurvival_Activity}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
      default:
        return (
          <Image
            src={scatterPlotSurvival_Age}
            alt="Description of the image"
            width={isMobile ? 200 : 400}
            // height={300}
          />
        )
    }
  }

  return (
    <>
      <Suspense>
        <Search />
      </Suspense>
      <div>
        <Box
          sx={{
            width: isMobile ? 400 : 1370,
            height: isMobile ? 1200 : 1000,
            backgroundColor: 'lightgrey',
            boxShadow: 3,
            borderRadius: 2,
            margin: '30px',
          }}
        >
          {/* <Header /> */}
          {/* <Grid
            container
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            margin={2}
          >
            <Grid
              item
              xs={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: '226px',
              }}
            >
              <div style={{ alignItems: 'flex-start' }}>
                <b>What relationships did you find?</b>
              </div>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: '226px',
              }}
            >
              <p style={{ alignItems: 'flex-start' }}>
                Who found relationships between their variable and the treatment
                type and survival?
              </p>
            </Grid>
            <Grid
              item
              xs={6}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: '116px',
              }}
            >
              <p style={{ alignItems: 'flex-start' }}>
                What problem do you see with these relationships?
              </p>
            </Grid>
          </Grid> */}

          <Grid
            container
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            margin={2}
          >
            <>
              <Grid
                item
                // m={2}
                xs={8}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  // justifyContent: 'left',
                  marginLeft: isMobile ? '7%' : '240px',
                  // marginLeft: '10px',
                }}
              >
                <h3 style={{ fontSize: isMobile ? '17px' : '20px' }}>
                  These variables were explored.
                  <br />
                  Click a variable to see if there is an effect.
                </h3>
              </Grid>
              <Grid
                item
                // m={2}
                xs={1}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  justifyContent: 'flex-start',
                  alignItems: 'flex-start',
                  // marginRight:'18%',
                  // marginLeft: '-280px',
                }}
              >
                {/* <Button
                  text={'CONTINUE'}
                  style={{
                    padding: isMobile ? '6px 7px' : '10px 20px',
                    marginRight: '250px',
                    backgroundColor: 'black',
                    color: 'white',
                  }}
                  handleFunction={handleControlVariables}
                /> */}
              </Grid>
              <Grid
                item
                xs={12}
                // m={2}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginLeft: isMobile ? '5%' : '233px',
                  marginTop: isMobile ? '0px' : '-20px',
                  // justifyContent: 'center',
                }}
              >
                <div className="box-container">
                  {/* {console.log(variables + "this is in return variables of HELLOOOOOO") } */}
                  {!loading ? (
                    exploredVariables.length > 0 &&
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
                            // (selectedVariableValue === 'Age' || (selectedVariable === index && selectedVariableValue === variable)) ? 'black' : 'grey'
                          }}
                        >
                          <b>{variable}</b>
                        </div>
                      )
                    })
                  ) : (
                    // <Loader/>
                    <div>
                      <p style={{ marginLeft: '20px' }}>
                        Loading variables......
                      </p>
                      {/* <Box
                        sx={{
                          width: '100%',
                         marginLeft:'20px'
                        }}
                      >
                  <Stack spacing={2} sx={{ flex: 1 }}>
                    <LinearProgress size="lg" />
                    </Stack>
                    </Box> */}
                      <Box sx={{ display: 'flex', marginLeft: '20px' }}>
                        <CircularProgress />
                      </Box>
                    </div>
                  )}
                </div>
              </Grid>{' '}
            </>

            <Grid
              item
              xs={isMobile ? 0 : 1}
              sx={{ display: 'flex', justifyContent: 'flex-start' }}
            >
              <Image
                style={{ marginLeft: '-50px' }}
                src={raven1}
                alt="raven-1"
              />
            </Grid>

            <Grid
              item
              xs={9}
              sx={{
                display: 'flex',
                justifyContent: 'center',
                marginLeft: isMobile ? '50px ' : '230px',
                marginTop: '-390px',
              }}
            >
              <ChartGameBox isMobile={isMobile}>
                <div style={{ paddingLeft: '20px' }}>
                  {loading ? (
                    <div
                      style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        height: isMobile ? 'auto' : '40vh',
                      }}
                    >
                      <div style={{ textAlign: 'center', margin: '100px' }}>
                        <h1 style={{ fontSize: isMobile ? '12px' : '20px' }}>
                          Loading......
                        </h1>
                        <h2 style={{ fontSize: isMobile ? '10px' : '20px' }}>
                          We&apos;re almost ready! Please wait for all
                          participants before clicking &quot;View Results&quot;
                        </h2>
                        <Box
                          sx={{
                            width: '100%',
                            margin: isMobile ? '0px' : '50px',
                          }}
                        >
                          <Stack spacing={2} sx={{ flex: 1 }}>
                            <LinearProgress size="lg" />
                          </Stack>
                        </Box>
                      </div>
                      <div>
                        <Button
                          text={'View Results'}
                          style={{
                            backgroundColor: 'rgb(110, 0, 255)',
                            color: 'white',
                            // marginTop : '-120px',
                            padding: isMobile ? '3px 3px' : '15px 15px',
                            // size: isMobile ? '20px' : '50px',
                          }}
                          handleFunction={handleResults}
                        />
                      </div>
                    </div>
                  ) : (
                    <Grid
                      sx={{
                        display: 'flex',
                        flexDirection: isMobile ? 'column' : 'row',
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                      container
                      rowSpacing={1}
                      columnSpacing={{ xs: 1, sm: 2, md: 3 }}
                    >
                      <Grid item xs={6}>
                        <Grid item xs={12}>
                          <h3 style={{ fontSize: isMobile ? '12px' : '20px' }}>
                            <b>
                              Is there a relationship between the{' '}
                              <span style={{ color: 'rgb(110, 0, 255)' }}>
                                {selectedVariableValue}
                              </span>{' '}
                              of the patients and the type of treatment they
                              received?
                            </b>
                          </h3>
                        </Grid>
                        <Grid item xs={12}>
                          <div
                            style={{
                              fontSize: isMobile ? '12px' : '18px',
                              //backgroundColor: 'purple',
                              color: 'rgb(110, 0, 255)',
                              display: 'inline-block',
                              padding: '2px 5px',
                              marginBottom: '5px',
                            }}
                          >
                           <b>The most common answer:</b> 
                          </div>
                        </Grid>
                        <Grid className="round-box" item xs={12}>
                          <div style={{ fontSize: isMobile ? '12px' : '15px' }}>
                            {/* MOST COMMON .{' '} */}
                            <b>
                            {selectedOption === 1
                              ? 'I SEE A RELATIONSHIP'
                              : selectedOption === 2
                              ? "I'M NOT SURE"
                              : "I DON'T SEE A RELATIONSHIP"}
                              </b>
                          </div>
                          {/* <div className="App">
                            <div
                              className="dag-container"
                              style={dagContainerStyle}
                            >
                               <DagGenerator
                                key={`${dagKey}-first`}
                                {...dagProps}
                                lineB="none"
                              /> 
                            </div>
                          </div> */}
                        </Grid>
                        <Grid item xs={12}>
                          <h3 style={{ fontSize: isMobile ? '12px' : '20px' }}>
                            <b>
                              Is there a relationship between the{' '}
                              <span style={{ color: 'rgb(110, 0, 255)' }}>
                                {selectedVariableValue}
                              </span>{' '}
                              of the patients and their survival in days?
                            </b>
                          </h3>
                        </Grid>
                        <Grid item xs={12}>
                          <div
                            style={{
                              fontSize: isMobile ? '12px' : '18px',
                              //backgroundColor: 'purple',
                              color: 'rgb(110, 0, 255)',
                              display: 'inline-block',
                              padding: '2px 5px',
                              marginBottom: '5px',
                            }}
                          >
                           <b>The most common answer:</b> 
                          </div>
                        </Grid>
                        <Grid className="round-box" item xs={12}>
                          <div style={{ fontSize: isMobile ? '12px' : '15px' }}>
                            {/* MOST COMMON .{' '} */}
                           <b> {selectedSecondOption === 1
                              ? 'I SEE A RELATIONSHIP'
                              : selectedSecondOption === 2
                              ? "I'M NOT SURE"
                              : "I DON'T SEE A RELATIONSHIP"}
                              </b>
                          </div>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        {/* <Scatterplot
                          yLabel={selectedVariableValue}
                          selectedVariable={selectedVariableValue}
                        /> */}
                        {renderScatterPlot1()}
                      </Grid>
                      <Grid item xs={6}>
                        <Grid item xs={12}>
                          <h3 style={{ fontSize: isMobile ? '12px' : '20px' }}>
                            <b>
                              Is there a relationship between the{' '}
                              <span style={{ color: 'rgb(110, 0, 255)' }}>
                                {selectedVariableValue}
                              </span>{' '}
                              of the patients and their survival (in days)?
                            </b>
                          </h3>
                        </Grid>
                        <Grid
                          container
                          sx={{
                            // border: '1px solid black',
                            display: 'flex',
                            flexDirection: 'row',
                            justifyContent: 'left',
                            alignItems: 'left',
                            height: '250px',
                          }}
                          // margin={1}
                        >
                          <Grid item xs={12}>
                            <div style={{ width: '2px', overflow: 'fixed' }}>
                              <div
                                //  className="dag-container"
                                style={dagContainerStyle}
                              >
                                {/* <div
                              style={{ position: 'relative', height: isMobile?  '11vh' : '26vh' , right:isMobile? '-20%' :'21%',   opacity: 0.5, // 50% opacity
                              }}
                            >
                              <BackgroundBox />
                            </div> */}
                                {/* <div
                              style={{ position: 'relative', height: isMobile? '10vh':'26vh' , left:isMobile? '48%':'9%',   opacity: 0.5, // 50% opacity
                              }}
                            >
                              <BackgroundBox />
                            </div> */}
                                <DagGenerator
                                  key={`${dagKey}-second`}
                                  {...dagProps}
                                />
                              </div>
                            </div>
                          </Grid>
                        </Grid>
                      </Grid>
                      <Grid item xs={6}>
                        {/* <Scatterplot
                          xLabel={'Survival in Days'}
                          yLabel={selectedVariableValue}
                          selectedVariable={selectedVariableValue}
                          selectedXVariable={'Survival in days'}
                        /> */}
                        {renderScatterPlot2()}
                      </Grid>
                    </Grid>
                  )}
                </div>
              </ChartGameBox>
            </Grid>
            <Grid
              container
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                marginTop: '-100px',
              }}
            >
              {/* <Button
                text={'CONTINUE'}
                style={{
                  marginRight: '250px',
                  backgroundColor: 'black',
                  color: 'white',
                }}
                handleFunction={handleControlVariables}
              /> */}
            </Grid>
          </Grid>
        </Box>
      </div>
    </>
  )
}

export default ResultsMultipleLabs