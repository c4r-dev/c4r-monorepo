const logger = require('../../../../../packages/logging/logger.js');
'use client'
/* eslint-disable react-hooks/rules-of-hooks */

import React, { Suspense, useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import TreatmentPlot from '../components/Plots/TreatmentPlot'
import SurvivalSexPlot from '../components/Plots/SurvivalSexPlot'
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
import ActivityLayout from '../components/ActivityLayout'
import useMediaQuery from '@mui/material/useMediaQuery'
import { useTheme } from '@mui/material/styles'
import CustomModal from '../components/CustomModal'
import GeneralSurvivalPlot from '../components/Plots/GeneralSurvivalPlot'
import SurvivalPlot from '../components/Plots/SurvivalPlot'
import data from '../Data/data.json'
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
    setSelectedUser(searchParams.get('selectedUser'))
    setSelectedVariable(searchParams.get('selectedVariable'))
    setSelectedOption(searchParams.get('selectedOption'))
    setSelectedGroup(searchParams.get('selectedGroup'))
    return
  }

  // UseEffect to set new DAG props
  useEffect(() => {
    let intSelectedOption = parseInt(selectedOption)

    let newLabelA = 'Treatment Type'
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

  const closeModal = () => {
    setIsGuideModalVisible(false)
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
            {/* <Image
              src={scatterPlotSurvival_Sex}
              alt="Description of the image"
              width={400}
              // height={300}
            /> */}

            <SurvivalSexPlot
              data={data}
              width={500}
              height={380}
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
                Female: [-20,-10, 0, 10,20],
                Male: [-20,-10, 0, 10,20],
              }}
              yJitter={[0, -2, 2]}
              xDomain={['Female', 'Male']}
            />
          </>
          // <SexPlot/>
        )

      case 'Age':
        return (
          // <Image
          //   src={scatterPlotSurvival_Age}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'Age'}
             xDomain={[18, 80]}
            yRange={[80, 370]}
            xValue={'age'}
            yValue={'survivalDays'}
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
          />
        )

      case 'Annual household income':
        return (
          // <Image
          //   src={scatterPlotSurvival_Ahi}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'Annual Household Income'}
            xDomain={[17000, 150000]}
            yRange={[90, 370]}
            yValue={'survivalDays'}
            xValue={'income'}
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
          />

          // <SurvivalPlot data={data} yLabel={"income"}/>
        )

      case 'BMI':
        return (
          // <Image
          //   src={scatterPlotSurvival_Bmi}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'BMI'}
            xDomain={[17.5, 30.5]}
            yRange={[90, 370]}
            yValue={'survivalDays'}
            xValue={'bmi'}
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
          />

          //  <SurvivalPlot data={data} yLabel={"bmi"}/>
        )

      case 'Years of education':
        return (
          // <Image
          //   src={scatterPlotSurvival_Education}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'Years of Education'}
            yValue={'survivalDays'}
           xDomain={[9.8, 18.5]}
           yRange={[80, 370]}
            xValue={'educationYears'}
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
          />

          //  <SurvivalPlot data={data} yLabel={"educationYears"}/>
        )

      case 'Smoking history in years':
        return (
          // <Image
          //   src={scatterPlotSurvival_Smoking}
          //   alt="Description of the image"
          //   width={400}
          //   // height={300}
          // />
          <GeneralSurvivalPlot
            xLabel={'Smoking History (in years) '}
            yValue={'survivalDays'}
            xDomain={[-1, 30.5]}
            yRange={[90, 370]}
            xValue={'smokingYears'}
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
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
            plotWidth={isMobile? 400 :700}
            plotHeight={isMobile? 500 : 400}
          />

          // <SurvivalPlot data={data} yLabel={"physicalActivity"}/>
        )

      default:
        return <div>Loading...</div>
    }
  }

  const handleResults = (e) => {
    fetch('https://smi-ran-why-ran-v3.vercel.app/api/students', {
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
    router.push(`/ResultsOwnLab?selectedGroup=${selectedGroup}&selectedVariable=${selectedVariable}`)
  }

  const dagKey = Object.values(dagProps).join('-')

  return (
    <>
      <Suspense>
        <Search />
        <ActivityLayout
          isMobileProp={isMobile}
          headerText={`${selectedVariable} and Survival in days`}
          text={`Skeptical Stork wants to know if there is a relationship between survival in this study and the variable ${selectedVariable}. They created a graph to see if there is a difference in survival for patients with different ${selectedVariable}s.`}
          subText={'What do you think?'}
          oneLineText={`Next, check if the variable ${selectedVariable} associated with the outcome measure (Survival in days)`}
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
                <Grid
                  item
                  xs={12}
                  sx={{ display: 'flex', justifyContent: 'flex-start' }}
                >
                  <Grid
                    container
                    sx={{ display: 'flex', flexDirection: 'row', gap: '10px' }}
                    margin={2}
                  >
                    <Grid
                      item
                      xs={10.5}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
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
                    <Grid
                      container
                      sx={{
                        display: 'flex',
                        flexDirection: 'row',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                      margin={2}
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
                      <div
                        style={{
                          display: 'flex',
                          justifyContent: isMobile ? 'center' : 'flex-start',
                          alignItems: 'center',
                          gap: '10px', // Adjust the gap as needed
                          marginRight: isMobile ? '0px' : '620px', // Adjust based on your layout
                        }}
                      >
                        <button
                          style={{
                            color: 'white',
                            backgroundColor: 'black',
                            textAlign: 'center',
                          }}
                          onClick={handleResults}
                        >
                          CONTINUE
                        </button>
                        <button
                          style={{
                            backgroundColor: '#5801d0',
                            color: 'white',
                            textAlign: 'center',
                          }}
                          onClick={handleGuideBtn} // Add your Guide button logic here
                        >
                          GUIDE
                        </button>
                      </div>
                    </Grid>
                  </Grid>
                </Grid>
              </Grid>
            </ChartGameBox>
          </Grid>
        </ActivityLayout>
      </Suspense>
    </>
  )
}

export default RelationshipSecond