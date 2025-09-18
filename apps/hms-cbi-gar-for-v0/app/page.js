const logger = require('../../../packages/logging/logger.js');
'use client'
import React, { useState, useEffect, Suspense } from 'react'
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Radio,
  RadioGroup,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import { useRouter, useSearchParams } from 'next/navigation'
import ScatterPlot from './components/ScatterPlot'
// import data from './data/data.json'
import data from './data/new-data.json'
import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup'

import ResultStatus from './components/ResultStatus'

export default function UserChoices() {
  const [selectedX, setSelectedX] = useState('grade_cs65')
  const [selectedY, setSelectedY] = useState('sleep')
  const [correlation, setCorrelation] = useState(null)
  const [selectedRadioButton, setSelectedRadioButton] = useState(
    'yearly_average',
  )
  const [sessionID, setSessionID] = useState(null)
  const [hypothesisNumber, setHypothesisNumber] = useState(null)
  const [dataFetched, setDataFetched] = useState(false) // Track if data is already fetched
  const [firstTimeVisit, setFirstTimeVisit] = useState(true)
  const [loading, setLoading] = useState(false) // Track loading state
  const hypotheses = [
    'DAILY ACTIVITIES INCFLUENCE STUDENT OUTCOMES',
    'DAILY ACTIVITIES DO NOT INCFLUENCE STUDENT OUTCOMES',
  ]
  // State to track selected radio button value
  const [selectedValue, setSelectedValue] = useState('grade_cs65')
  const [openDialog, setOpenDialog] = useState(false) // State to handle dialog visibility
  const [showSessionPopup, setShowSessionPopup] = useState(true)
  const [selectedGroup, setSelectedGroup] = useState('defaultGroup')

  const handleAboutDataClick = () => {
    setOpenDialog(true) // Open the dialog
  }

  const handleCloseDialog = () => {
    setOpenDialog(false) // Close the dialog
  }

  const handleSessionPopupClose = () => {
    setShowSessionPopup(false)
  }

  const handleXChange = (event) => {
    setSelectedX(event.target.value)
  }

  const handleYChange = (event) => {
    setSelectedY(event.target.value)
  }

  // Handle radio button change
  const handleChange = (event) => {
    setSelectedValue(event.target.value)
    logger.app.info('Selected Value:', event.target.value) // Logs the selected value
  }

  const router = useRouter()

  // function UseValues() {
  //   const searchParams = useSearchParams()

  //   useEffect(() => {
  //     // Check if sessionID exists in the query parameters
  //     const sessionIDFromQuery = searchParams.get('sessionID')
  //     const hypothesisNumberFromQuery = searchParams.get('hypothesisNumber')

  //     if (sessionIDFromQuery) {
  //       setSessionID(sessionIDFromQuery)
  //       setHypothesisNumber(hypothesisNumberFromQuery)

  //       // Only fetch data if it hasn't been fetched yet
  //       // if (!dataFetched) {
  //       //   fetchData(sessionIDFromQuery)
  //       // }
  //     } else {
  //       // Generate a new sessionID and hypothesis number
  //       const newSessionID = Math.random().toString(36).substring(2, 15)
  //       const randomHypothesisNumber = Math.floor(Math.random() * 2) + 1

  //       setSessionID(newSessionID)
  //       setHypothesisNumber(randomHypothesisNumber)

  //       // Update the URL with the new sessionID and hypothesis number
  //       router.replace(
  //         `?sessionID=${newSessionID}&hypothesisNumber=${randomHypothesisNumber}`,
  //       )
  //     }
  //   }, [searchParams])

  //   return null
  // }

  // Handle navigation back to this screen
  useEffect(() => {
    logger.app.info('in use effect')
    const handleRouteChange = () => {
      if (sessionID) {
        fetchData(sessionID)
      }
    }

    router.events?.on('routeChangeComplete', handleRouteChange)

    return () => {
      router.events?.off('routeChangeComplete', handleRouteChange)
    }
  }, [sessionID, router])

  ///
  function UseValues() {
    const searchParams = useSearchParams()

    useEffect(() => {
      // Check if sessionID exists in the query parameters
      const sessionIDFromQuery = searchParams.get('sessionID')
      const hypothesisNumberFromQuery = searchParams.get('hypothesisNumber')

      // if (!sessionIDFromQuery || !hypothesisNumberFromQuery) {
      //   // Generate a new sessionID and hypothesis number
      //   const newSessionID = Math.random().toString(36).substring(2, 15);
      //   const randomHypothesisNumber = Math.floor(Math.random() * 2) + 1;

      //   // Update the URL with the new sessionID and hypothesis number
      //   router.replace(
      //     `?sessionID=${newSessionID}&hypothesisNumber=${randomHypothesisNumber}`
      //   );
      // } else {
      //   // Set sessionID and hypothesis number if they exist
      setSessionID(sessionIDFromQuery)
      setHypothesisNumber(hypothesisNumberFromQuery)
      // }
    }, [searchParams])

    return null
  }

  // Show popup only on first visit (when no sessionID in URL)
  useEffect(() => {
    const searchParams = new URLSearchParams(window.location.search)
    const sessionIdParam = searchParams.get('sessionID') || searchParams.get('sessionId')
    
    // Only show popup if no sessionID exists in URL (first time visit)
    if (!sessionIdParam) {
      setShowSessionPopup(true)
    } else {
      setShowSessionPopup(false)
    }
  }, [])

  // Fetch data when firstTimeVisit is true
  useEffect(() => {
    if (firstTimeVisit && sessionID) {
      fetchData(sessionID)
    }
  }, [firstTimeVisit, sessionID])

  const fetchData = async (sessionID) => {
    try {
      setLoading(true)

      const response = await fetch(`/api/garden`)
      if (!response.ok) throw new Error(`Error: ${response.statusText}`)

      const data = await response.json()
      logger.app.info('GET API Response:', data)

      const currentSessionData = data.find(
        (item) => item.sessionID === sessionID,
      )
      if (currentSessionData) {
        logger.app.info('Session data:', currentSessionData)
        setSelectedY(currentSessionData.xVariable || 'grade_cs65')
        setSelectedX(currentSessionData.yVariable || 'sleep')
        setFirstTimeVisit(false) // Set to false after fetching data
      }
    } catch (error) {
      logger.app.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCorrelationChange = (value) => {
    setCorrelation(value)
  }

  const handleNextClick = async () => {
    try {
      if (firstTimeVisit) {
        setLoading(true) // Start loading
        const requestBody = {
          sessionID,
          hypothesis: hypothesisNumber,
          coefficient: correlation?.toFixed(3),
          xVariable: selectedY,
          yVariable: selectedX,
          // yVariables: selectedY,
          // outcome: selectedRadioButton,
        }

        logger.app.info('POST API Request:', requestBody)

        const response = await fetch('/api/garden', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(requestBody),
        })

        if (!response.ok) {
          throw new Error(`Error: ${response.statusText}`)
        }

        const responseData = await response.json()
        logger.app.info('API Response:', responseData)

        // Set firstTimeVisit to false after successful API call
        setFirstTimeVisit(false)
      }

      // Navigate to the next page
      router.push(
        `/UserComparison?sessionID=${sessionID}&hypothesisNumber=${hypothesisNumber}`,
      )
    } catch (error) {
      logger.app.error('Error calling POST API:', error)
    } finally {
      setLoading(false) // End loading
    }
  }

  // Loading screen
  if (loading) {
    logger.app.info('in lodading')
    return (
      <Box
        display="flex"
        justifyContent="center"
        alignItems="center"
        minHeight="100vh"
      >
        <CircularProgress />
      </Box>
    )
  }

  return (
    <>
      <Suspense>
        <UseValues />
      </Suspense>
      <Suspense fallback={null}>
        <SessionConfigPopup
          open={showSessionPopup}
          onClose={handleSessionPopupClose}
          sessionID={sessionID}
        />
      </Suspense>
      <Box position="relative" minHeight="100vh" pb={10}>
        <Grid container spacing={3} alignItems="flex-start">
          <Grid item xs={12} md={2.5}>
            {/* <Typography variant="h6">Define Choices</Typography> */}
            <Box mt={2}>
              <Typography variant="subtitle1">
                <b>Student Outcomes</b>
              </Typography>
              <RadioGroup value={selectedX} onChange={handleXChange}>
                {' '}
                <FormControlLabel
                  value="loneliness"
                  control={<Radio />}
                  label="Loneliness"
                />
                <FormControlLabel
                  value="flourishing"
                  control={<Radio />}
                  label="Flourishing"
                />
                <FormControlLabel
                  value="happiness"
                  control={<Radio />}
                  label="Happiness"
                />
                <FormControlLabel
                  value="sadness"
                  control={<Radio />}
                  label="Sadness"
                />
                <FormControlLabel
                  value="stress"
                  control={<Radio />}
                  label="Stress"
                />
                <FormControlLabel
                  value="gpa_qtr"
                  control={<Radio />}
                  label="GPA (Quarter)"
                />
                <FormControlLabel
                  value="grade_cs65"
                  control={<Radio />}
                  label="Grade (CS65)"
                />
              </RadioGroup>
            </Box>
            <Box mt={2}>
              <Typography variant="subtitle1">
                <b>Daily Activities</b>
              </Typography>
              <RadioGroup value={selectedY} onChange={handleYChange}>
                <FormControlLabel
                  value="conversation"
                  control={<Radio />}
                  label="Conversation"
                />
                <FormControlLabel
                  value="exercise"
                  control={<Radio />}
                  label="Exercise"
                />
                <FormControlLabel
                  value="walking"
                  control={<Radio />}
                  label="Walking"
                />{' '}
                <FormControlLabel
                  value="sleep"
                  control={<Radio />}
                  label="Sleep"
                />{' '}
                <FormControlLabel
                  value="socializing"
                  control={<Radio />}
                  label="Socializing"
                />
                <FormControlLabel
                  value="deadlines"
                  control={<Radio />}
                  label="Deadlines"
                />
              </RadioGroup>
            </Box>
          </Grid>
          <Grid item xs={12} md={8}>
            <Box
              mt={2}
              display="flex"
              justifyContent="center"
              alignItems="center"
              minHeight="200px"
            >
              {selectedY.length > 0 ? (
                <ScatterPlot
                  data={data}
                  selectedX={selectedX}
                  selectedY={selectedY}
                  onCorrelationChange={handleCorrelationChange}
                />
              ) : (
                // {selectedY}
                // <h1>hello</h1>
                <Typography
                  mt={4}
                  variant="body1"
                  fontWeight="bold"
                  color="purple"
                  textAlign="center"
                >
                  {/* No variable is selected */}
                  <br />
                  Select an outcome variable to begin
                </Typography>
              )}
            </Box>
            {/* Result Status Section */}
          </Grid>
          <Grid item xs={12} md={1.5} alignItems="flex-end">
            <ResultStatus correlation={correlation} />
            <Box mt={4} display="flex" justifyContent="center">
              {/* <Button
                variant="contained"
                color="primary"
                onClick={handleNextClick}
                style={{ marginLeft: '-10%' }}
              >
                {firstTimeVisit ? 'Submit' : 'Next'}
              </Button> */}

              <Button
                variant="contained"
                color="primary"
                onClick={handleNextClick}
                sx={{
                  marginLeft: '-10%',
                  bgcolor: '#6F00FF',
                  '&:hover': {
                    bgcolor: '#5700CA',
                  },
                }}
              >
                {firstTimeVisit ? 'Submit' : 'Next'}
              </Button>
            </Box>
          </Grid>
        </Grid>
        {/* <Box
          display="flex"
          justifyContent="center"
          position="absolute"
          bottom={170}
          left={100}
          right={0}
        >


          <Button
            variant="contained"
            color="primary"
            onClick={handleNextClick}
            style={{ marginLeft: '40%' }}
          >
            {firstTimeVisit ? 'Submit' : 'Next'}
          </Button>
        </Box> */}
        <Button
          variant="outlined"
          color="secondary"
          onClick={handleAboutDataClick}
          style={{ marginTop: '-10rem', marginLeft: '90%' }}
        >
          Data Source
        </Button>
        <Dialog open={openDialog} onClose={handleCloseDialog}>
          <DialogTitle>Data Source</DialogTitle>
          <DialogContent>
            <Typography variant="body2">
              <b>Data Source: </b> Wang Rui, Fanglin Chen, Zhenyu Chen, Manxing
              Li, Gabriella Harari, Stefanie Tignor, Xia Zhou, Dror Ben-Zeev,
              and Andrew T. Campbell. &quot;StudentLife: Assessing Mental
              Health, Academic Performance and Behavioral Trends of College
              Students using Smartphones.&quot; In Proceedings of the ACM
              Conference on Ubiquitous Computing, 2014.{' '}
              <a
                href="https://studentlife.cs.dartmouth.edu/datasets.html"
                target="_blank"
                rel="noopener noreferrer"
              >
                https://studentlife.cs.dartmouth.edu/datasets.html
              </a>
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} color="primary">
              Close
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  )
}

// import React, { useState, useEffect, Suspense } from 'react';
// import {
//   Box,
//   Typography,
//   Grid,
//   Button,
//   RadioGroup,
//   FormControlLabel,
//   Radio,
//   CircularProgress,
//   Dialog,
//   DialogTitle,
//   DialogContent,
//   DialogActions,
// } from '@mui/material';
// import { useRouter, useSearchParams } from 'next/navigation';
// import ScatterPlot from './components/ScatterPlot';
// import ResultStatus from './components/ResultStatus';
// import data from './data/new-data.json';

// export default function UserChoices() {
//   const [selectedX, setSelectedX] = useState('grade_cs65');
//   const [selectedY, setSelectedY] = useState('sleep');
//   const [sessionID, setSessionID] = useState(null);
//   const [hypothesisNumber, setHypothesisNumber] = useState(null);
//   const [loading, setLoading] = useState(false);
//   const [firstTimeVisit, setFirstTimeVisit] = useState(true);
//   const [correlation, setCorrelation] = useState(null);
//   const [openDialog, setOpenDialog] = useState(false); // State to handle dialog visibility
//   const router = useRouter();

//   const handleNextClick = () => {
//     router.push(
//       `/UserComparison?sessionID=${sessionID}&hypothesisNumber=${hypothesisNumber}`
//     );
//   };

//     const handleCorrelationChange = (value) => {
//     setCorrelation(value)
//   }

//   const handleAboutDataClick = () => {
//     setOpenDialog(true); // Open the dialog
//   };

//   const handleCloseDialog = () => {
//     setOpenDialog(false); // Close the dialog
//   };

//   return (
//     <>
//       {loading ? (
//         <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
//           <CircularProgress />
//         </Box>
//       ) : (
//         <Box position="relative" minHeight="100vh" pb={10}>
//           <Grid container spacing={3} alignItems="flex-start">
//             <Grid item xs={12} md={2.5}>
//               <Box mt={2}>
//                 <Typography variant="subtitle1">
//                   <b>Choose an outcome variable</b>
//                 </Typography>
//                 <RadioGroup value={selectedX} onChange={(e) => setSelectedX(e.target.value)}>
//                   <FormControlLabel value="loneliness" control={<Radio />} label="Loneliness" />
//                   <FormControlLabel value="flourishing" control={<Radio />} label="Flourishing" />
//                   <FormControlLabel value="happiness" control={<Radio />} label="Happiness" />
//                   <FormControlLabel value="sadness" control={<Radio />} label="Sadness" />
//                   <FormControlLabel value="stress" control={<Radio />} label="Stress" />
//                   <FormControlLabel value="gpa_qtr" control={<Radio />} label="GPA (Quarter)" />
//                   <FormControlLabel value="grade_cs65" control={<Radio />} label="Grade (CS65)" />
//                 </RadioGroup>
//               </Box>
//               <Box mt={2}>
//                 <Typography variant="subtitle1">
//                   <b>Choose a daily activity</b>
//                 </Typography>
//                 <RadioGroup value={selectedY} onChange={(e) => setSelectedY(e.target.value)}>
//                   <FormControlLabel value="conversation" control={<Radio />} label="Conversation" />
//                   <FormControlLabel value="exercise" control={<Radio />} label="Exercise" />
//                   <FormControlLabel value="walking" control={<Radio />} label="Walking" />
//                   <FormControlLabel value="sleep" control={<Radio />} label="Sleep" />
//                   <FormControlLabel value="socializing" control={<Radio />} label="Socializing" />
//                 </RadioGroup>
//               </Box>
//             </Grid>
//             <Grid item xs={12} md={8}>
//               <ScatterPlot data={data} selectedX={selectedX} selectedY={selectedY} />
//             </Grid>
//             <Grid item xs={12} md={1.5}>
//               <ResultStatus correlation={correlation}/>
//               <Box mt={2} display="flex" flexDirection="column" alignItems="center">
//                 <Button variant="contained" color="primary" onClick={handleNextClick}>
//                   {firstTimeVisit ? 'Submit' : 'Next'}
//                 </Button>
//                 <Button
//                   variant="outlined"
//                   color="secondary"
//                   onClick={handleAboutDataClick}
//                   style={{ marginTop: '1rem' }}
//                 >
//                   About the Data
//                 </Button>
//               </Box>
//             </Grid>
//           </Grid>
//           <Dialog open={openDialog} onClose={handleCloseDialog}>
//             <DialogTitle>About the Data</DialogTitle>
//             <DialogContent>
//               <Typography variant="body2">
//                 Data Source: Wang Rui, Fanglin Chen, Zhenyu Chen, Manxing Li, Gabriella Harari,
//                 Stefanie Tignor, Xia Zhou, Dror Ben-Zeev, and Andrew T. Campbell. "StudentLife:
//                 Assessing Mental Health, Academic Performance and Behavioral Trends of College
//                 Students using Smartphones." In Proceedings of the ACM Conference on Ubiquitous
//                 Computing, 2014.{' '}
//                 <a
//                   href="https://studentlife.cs.dartmouth.edu/datasets.html"
//                   target="_blank"
//                   rel="noopener noreferrer"
//                 >
//                   https://studentlife.cs.dartmouth.edu/datasets.html
//                 </a>
//               </Typography>
//             </DialogContent>
//             <DialogActions>
//               <Button onClick={handleCloseDialog} color="primary">
//                 Close
//               </Button>
//             </DialogActions>
//           </Dialog>
//         </Box>
//       )}
//     </>
//   );
// }
