'use client'
import React, { useEffect, Suspense, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Image from 'next/image'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import SexPlot from '../components/Plots/SexPlot'
import SurvivalSexPlot from '../components/Plots/SurvivalSexPlot'
import GeneralSurvivalPlot from '../components/Plots/GeneralSurvivalPlot'
import data from '../Data/data.json'
import DagGenerator from '../components/DagGenerator/DagGenerator'
import Grid from '@mui/material/Grid'
import Box from '@mui/material/Box'
import ChartGameBox from '../components/ChartGameBox'
import raven1 from '../assets/C4R_RAVEN_01.svg'

import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import { Padding } from '@mui/icons-material'

function ResultsMultipleLabs() {
  const [selectedGroup, setSelectedGroup] = useState(1)
  const [selectedOption, setSelectedOption] = useState('')
  const [selectedSecondOption, setSelectedSecondOption] = useState('')
  const [exploredVariables, setExploredVariables] = useState('')
  const [groupDetails, setGroupDetails] = useState({})
  const [selectedVariable, setSelectedVariable] = useState(0)
  const [hasInitialSelection, setHasInitialSelection] = useState(false) // Track initial selection
  const [selectedVariableValue, setSelectedVariableValue] = useState(
    exploredVariables[0]
  )
  const [userVariable, setUserVariable] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [studentData, setStudentData] = useState({})

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
    // marginBottom: isMobile ? '20px' : '0px',
    alignItems: 'center',
    alignSelf: 'center',
    height: isMobile ? '250px' : '350px',
    width: isMobile ? '280px' : '450px',
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
        const response = await fetch('https://smi-ran-why-ran-v3.vercel.app/api/groups') // Adjust the endpoint as needed

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

  const renderScatterImage = () => {
    switch (selectedVariableValue) {
      case 'Age':
        return (
          <TreatmentPlot
            data={data}
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
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
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
            yDomain={[15000, 130000]}
            yLabel="Annual Household Income"
            dotRadius={4}
            colors={{
              'In-person treatment': '#adf802',
              'Virtual treatment': '#e78bf5',
            }}
            medians={{
              'In-person treatment': 47282,
              'Virtual treatment': 80556,
            }}
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
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
            yDomain={[17.5, 31.5]}
            yLabel="BMI"
            dotRadius={5}
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
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
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
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
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
            width={isMobile ? 350 : 500}
            height={isMobile ? 300 : 360}
            margin={{
              top: 30,
              right: isMobile ? 80 : 20,
              bottom: isMobile ? -130 : 20,
              left: isMobile ? 40 : 50,
            }}
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
        return <SexPlot />

      default:
        return <div>Loading...</div>
    }
  }

  // const renderScatterPlot2 = () => {
  //   switch (selectedVariableValue) {
  //     case 'Sex':
  //       return (
  //         <>
  //           <SurvivalSexPlot
  //             data={data}
  //             width={isMobile ? 700 : 500}
  //             height={480}
  //             margin={{ top: 30, right: 20, bottom: 50, left: 60 }}
  //             yDomain={[100, 350]}
  //             yLabel="Survival (in days)"
  //             dotRadius={4}
  //             colors={{
  //               Female: '#adf802',
  //               Male: '#e78bf5',
  //             }}
  //             medians={{ Female: 285, Male: 291 }}
  //             medianTextColor="#6E00FF"
  //             yField="survivalDays"
  //             xJitterPositions={{
  //               Female: [-20, -10, 0, 10, 20],
  //               Male: [-20, -10, 0, 10, 20],
  //             }}
  //             yJitter={[0, -2, 2]}
  //             xDomain={['Female', 'Male']}
  //           />
  //         </>
  //       )

  //     case 'Age':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'Age'}
  //           xRange={[20, 90]}
  //           xValue={'age'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     case 'Annual household income':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'Annual Household Income'}
  //           xRange={[5000, 130000]}
  //           xValue={'income'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     case 'BMI':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'BMI'}
  //           xRange={[17.5, 32]}
  //           xValue={'bmi'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     case 'Years of education':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'Years of Education'}
  //           xRange={[9, 20]}
  //           xValue={'educationYears'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     case 'Smoking history in years':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'Smoking History (in years) '}
  //           xRange={[-10, 32]}
  //           xValue={'smokingYears'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     case 'Physical activity (daily hours)':
  //       return (
  //         <GeneralSurvivalPlot
  //           xLabel={'Smoking History (in years) '}
  //           xRange={[-1, 32]}
  //           xValue={'smokingYears'}
  //           plotWidth={400}
  //           plotHeight={390}
  //         />
  //       )

  //     default:
  //       return <div>Loading...</div>
  //   }
  // }

  const renderScatterPlot2 = () => {
    switch (selectedVariableValue) {
      case 'Sex':
        return (
          <>
            <SurvivalSexPlot
              data={data}
              width={isMobile ? 700 : 500}
              height={480}
              margin={{ top: 30, right: 20, bottom: 50, left: 60 }}
              yDomain={[100, 350]}
              yLabel="Survival (in days)"
              dotRadius={4}
              colors={{
                Female: '#adf802',
                Male: '#e78bf5',
              }}
              medians={{ Female: 285, Male: 291 }}
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
            xDomain={[18, 80]}
            yRange={[80, 370]}
            xValue={'age'}
            yValue={'survivalDays'}
            plotWidth={400}
            plotHeight={390}
          />
        )

      case 'Annual household income':
        return (
          <GeneralSurvivalPlot
            xLabel={'Annual Household Income'}
            xDomain={[17000, 150000]}
            yRange={[90, 370]}
            yValue={'survivalDays'}
            xValue={'income'}
            plotWidth={400}
            plotHeight={390}
          />
        )

      case 'BMI':
        return (
          <GeneralSurvivalPlot
            xLabel={'BMI'}
            xDomain={[17.5, 30.5]}
            yRange={[90, 370]}
            yValue={'survivalDays'}
            xValue={'bmi'}
            plotWidth={400}
            plotHeight={390}
          />

          //  <SurvivalPlot data={data} yLabel={"bmi"}/>
        )

      case 'Years of education':
        return (
          <GeneralSurvivalPlot
            xLabel={'Years of Education'}
            yValue={'survivalDays'}
            xDomain={[9.8, 18.5]}
            yRange={[80, 370]}
            xValue={'educationYears'}
            plotWidth={400}
            plotHeight={390}
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
            plotWidth={400}
            plotHeight={390}
          />
        )

      case 'Physical activity (daily hours)':
        return (
          <GeneralSurvivalPlot
            xLabel={'Smoking History (in years) '}
            yValue={'survivalDays'}
            //xRange={[-1, 32]}
            xDomain={[-0.2, 4.2]}
            yRange={[80, 370]}
            xValue={'physicalActivity'}
            plotWidth={400}
            plotHeight={390}
          />
        )

      default:
        return <div>Loading...</div>
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
            width: isMobile ? 500 : 1370,
            height: isMobile ? 1800 : 1300,
            backgroundColor: 'lightgrey',
            boxShadow: 3,
            borderRadius: 2,
            margin: '30px',
          }}
        >
          <Grid
            container
            sx={{ display: 'flex', flexDirection: 'row', alignItems: 'center' }}
            margin={2}
          >
            <>
              <Grid
                item
                xs={8}
                sx={{
                  display: 'flex',
                  flexDirection: 'row',
                  marginLeft: isMobile ? '7%' : '240px',
                }}
              >
                <h3 style={{ fontSize: isMobile ? '17px' : '20px' }}>
                  {/* These variables were explored. */}
                  Your session explored these variables
                  <br />
                  Click a variable to see if there is an effect.
                </h3>
              </Grid>
              <Grid
                item
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
                  marginBottom: '10px',
                  // justifyContent: 'center',
                }}
              >
                <div className="box-container">
                  {/* {console.log(variables + "this is in return variables of HELLOOOOOO") } */}
                  {/* {!loading ? ( */}
                  {
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
                    // ) : (
                    //   <Loader/>
                    //   <div>
                    //     <p style={{ marginLeft: '20px' }}>
                    //       Loading variables......
                    //     </p>
                    //     <Box sx={{ display: 'flex', marginLeft: '20px' }}>
                    //       <CircularProgress />
                    //     </Box>
                    //   </div>
                    // )
                  }
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
              <ChartGameBox isMobile={isMobile} isControlVariables={true}>
                <div style={{ paddingLeft: '20px' }}>
                  {/* {loading ? (
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
                  ) : (  */}
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
                    {/* <Grid item xs={6} sx={{marginTop:"-50px"}}> */}
                    <Grid item xs={6}>
                      <Grid
                        item
                        xs={12}
                        sx={{ marginLeft: isMobile ? '-70px' : '0px' }}
                      >
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
                          <b>
                            {' '}
                            {selectedSecondOption === 1
                              ? 'I SEE A RELATIONSHIP'
                              : selectedSecondOption === 2
                              ? "I'M NOT SURE"
                              : "I DON'T SEE A RELATIONSHIP"}
                          </b>
                        </div>
                      </Grid>
                    </Grid>
                    <Grid item xs={isMobile ? 10 : 6}>
                      {/* <Scatterplot
                          yLabel={selectedVariableValue}
                          selectedVariable={selectedVariableValue}
                        /> */}
                      {renderScatterImage()}
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
                        {/* <Grid item xs={12}>
                          <div style={{ width: '2px', overflow: 'fixed' }}>
                            <div
                              //  className="dag-container"
                              style={dagContainerStyle}
                            >
                              <DagGenerator
                                key={`${dagKey}-second`}
                                {...dagProps}
                              />
                            </div>
                          </div>
                        </Grid> */}
                        <Grid item xs={12}>
                          <div
                            style={{
                              ...dagContainerStyle,
                              flexDirection: 'column',
                              textAlign: 'center',
                              marginLeft: isMobile ? '-70px' : '0px',
                            }}
                          >
                            {/* DAG Component */}
                            <DagGenerator
                              key={`${dagKey}-second`}
                              {...dagProps}
                            />
                            {/* Text Below the DAG */}
                            <div
                              style={{
                                marginTop: isMobile ? '30px' : '10px',
                                fontSize: isMobile ? '12px' : '16px',
                                color: 'black',
                                // marginBottom: isMobile ? '60px' : '0px',
                              }}
                            >
                              <p>
                                <b>Discuss!</b> What relationships did you find?
                                Who found relationships between their variable
                                and the treatment type and survival? What
                                problem do you see with these relationships?
                              </p>
                            </div>
                          </div>
                        </Grid>
                      </Grid>
                    </Grid>
                    <Grid
                      item
                      xs={isMobile ? 12 : 6}
                      sx={{
                        marginTop: isMobile ? '40px' : '0px',
                        marginLeft: isMobile ? '60px' : '0px',
                        maxWidth: '300%',
                        width: '100%',
                      }}
                    >
                      {/* <Scatterplot
                          xLabel={'Survival in Days'}
                          yLabel={selectedVariableValue}
                          selectedVariable={selectedVariableValue}
                          selectedXVariable={'Survival in days'}
                        /> */}
                      {renderScatterPlot2()}
                    </Grid>
                  </Grid>
                  {/* ) */}
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
            ></Grid>
          </Grid>
        </Box>
      </div>
    </>
  )
}

export default ResultsMultipleLabs
