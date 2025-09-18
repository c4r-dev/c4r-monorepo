const logger = require('../../../../packages/logging/logger.js');
// 'use client'
// import React, { useState, useEffect, Suspense } from 'react'
// import {
//   Box,
//   Typography,
//   Grid,
//   FormControlLabel,
//   Checkbox,
//   Button,
// } from '@mui/material'
// import Histogram from '../components/Histogram'
// import { useRouter, useSearchParams } from 'next/navigation'
// import olympiansData from '../components/data.json'

// export default function UserComparison() {
//   const [gardenData, setGardenData] = useState(null) // State for fetched data
//   const router = useRouter()

//   const [sessionID, setSessionID] = useState(null)
//   const [hypothesisNumber, setHypothesisNumber] = useState(null)
//   const [showMale, setShowMale] = useState(false)
//   const [showFemale, setShowFemale] = useState(false)
//   const [initialized, setInitialized] = useState(false) // Track if initialization is done
//   const hypotheses = [
//     "Daily activities influence student outcomes.",
//      "Daily activities do not influence student outcomes."
//     ];

//   function UseValues() {
//     const searchParams = useSearchParams()

//     useEffect(() => {
//       const hypothesis = searchParams.get('hypothesisNumber')
//       const session = searchParams.get('sessionID')

//       setHypothesisNumber(hypothesis)
//       setSessionID(session)

//       // Initialize checkboxes only once
//       if (!initialized) {
//         if (hypothesis === '1') {
//           setShowMale(true)
//           setShowFemale(false)
//         } else if (hypothesis === '2') {
//           setShowMale(false)
//           setShowFemale(true)
//         }
//         setInitialized(true) // Mark initialization as complete
//       }
//     }, [searchParams, initialized])

//     return null
//   }

//   useEffect(() => {
//     // Fetch data from the API
//     const fetchGardenData = async () => {
//       try {
//         const response = await fetch('/api/garden') // Replace with your actual API endpoint
//         const data = await response.json()
//         logger.app.info('Data fetched:', 'data in user Comparison page', data)
//         setGardenData(data)
//       } catch (error) {
//         logger.app.error('Error fetching garden data:', error)
//       }
//     }

//     fetchGardenData()
//   }, []) // Empty dependency array to fetch data only on component mount

//   const handleHypothesisMale = () => {
//     setShowMale((prev) => !prev) // Toggle Hypothesis 1 checkbox
//   }

//   const handleHypothesisFemale = () => {
//     setShowFemale((prev) => !prev) // Toggle Hypothesis 2 checkbox
//   }

//   const queryParam = `?sessionID=${sessionID}&hypothesisNumber=${hypothesisNumber}`

//   return (
//     <>
//       <Suspense>
//         <UseValues />
//       </Suspense>

//       <Box position="relative" minHeight="100vh" pb={10}>
//         <Grid container spacing={10} alignItems="flex-start">
//           <Grid item xs={12} md={3}>
//             {/* <Typography variant="h6">Compare Hypothesis</Typography> */}
//             <Box mt={2}>
//               {/* <Typography variant="subtitle1">
//                 <b>Which hypothesis do you want to include?</b>
//               </Typography> */}
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={showMale}
//                     onChange={handleHypothesisMale}
//                   />
//                 }
//                 label="Hypothesis 1"
//               />
//               <FormControlLabel
//                 control={
//                   <Checkbox
//                     checked={showFemale}
//                     onChange={handleHypothesisFemale}
//                   />
//                 }
//                 label="Hypothesis 2"
//               />
//             </Box>
//           </Grid>

//           <Grid item xs={12} md={8}>
//             <Typography variant="h6" gutterBottom>
//               {/* Is There a Relationship? */}
//             </Typography>
//             {/* <Typography variant="body2" color="textSecondary" mb={2} style={{width:"110%"}}>

//               Conduct a data analysis to test the hypothesis: {hypotheses[hypothesisNumber - 1]}
//               <br/>Each point represents aggregated data from a single student.
//               <br/>
//               Hypothesis 1: &quot;Daily activities influence student
//               outcomes&quot; <br/>Hypothesis 2: &quot;Daily activities do not
//               influence student outcomes&quot;
//             </Typography> */}
//             <Box mt={2}>
//               {gardenData ? (
//                 <Histogram
//                   data={gardenData}
//                   showFemale={showFemale}
//                   showMale={showMale}
//                 />
//               ) : (
//                 <Typography variant="body2" color="textSecondary">
//                   Loading data, please wait...
//                 </Typography>
//               )}
//             </Box>
//           </Grid>
//         </Grid>
//         <Box
//           display="flex"
//           justifyContent="space-between"
//           position="absolute"
//           bottom={320}
//           left={0}
//           right={0}
//           p={2}
//         >
//           <Button
//             variant="contained"
//             color="primary"
//             onClick={() => router.push(`/${queryParam}`)}
//           >
//             Back
//           </Button>
//         </Box>
//       </Box>
//     </>
//   )
// }

'use client'
import React, { useState, useEffect, Suspense } from 'react'
import {
  Box,
  Typography,
  Grid,
  FormControlLabel,
  Checkbox,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material'
import Histogram from '../components/Histogram'
import { useRouter, useSearchParams } from 'next/navigation'
import olympiansData from '../components/data.json'

export default function UserComparison() {
  const [gardenData, setGardenData] = useState(null) // State for fetched data
  const router = useRouter()

  const [sessionID, setSessionID] = useState(null)
  const [hypothesisNumber, setHypothesisNumber] = useState(null)
  const [showMale, setShowMale] = useState(false)
  const [showFemale, setShowFemale] = useState(false)
  const [initialized, setInitialized] = useState(false) // Track if initialization is done
  const hypotheses = [
    'DAILY ACTIVITIES INCFLUENCE STUDENT OUTCOMES',
    'DAILY ACTIVITIES DO NOT INCFLUENCE STUDENT OUTCOMES',
  ]
  const [openDialog, setOpenDialog] = useState(false) // State to handle dialog visibility

  const handleAboutDataClick = () => {
    setOpenDialog(true) // Open the dialog
  }

  const handleCloseDialog = () => {
    setOpenDialog(false) // Close the dialog
  }

  function UseValues() {
    const searchParams = useSearchParams()

    useEffect(() => {
      const hypothesis = searchParams.get('hypothesisNumber')
      const session = searchParams.get('sessionID')

      setHypothesisNumber(hypothesis)
      setSessionID(session)

      // Initialize checkboxes only once
      if (!initialized) {
        if (hypothesis === '1') {
          setShowMale(true)
          setShowFemale(false)
        } else if (hypothesis === '2') {
          setShowMale(false)
          setShowFemale(true)
        }
        setInitialized(true) // Mark initialization as complete
      }
    }, [searchParams, initialized])

    return null
  }

  useEffect(() => {
    // Fetch data from the API
    const fetchGardenData = async () => {
      try {
        const response = await fetch('/api/garden') // Replace with your actual API endpoint
        const data = await response.json()
        logger.app.info('Data fetched:', 'data in user Comparison page', data)
        setGardenData(data)
      } catch (error) {
        logger.app.error('Error fetching garden data:', error)
      }
    }

    fetchGardenData()
  }, []) // Empty dependency array to fetch data only on component mount

  // const handleHypothesisMale = () => {
  //   setShowMale((prev) => !prev) // Toggle Hypothesis 1 checkbox
  // }

  // const handleHypothesisFemale = () => {
  //   setShowFemale((prev) => !prev) // Toggle Hypothesis 2 checkbox
  // }

  const handleHypothesisMale = () => {
    if (showMale && !showFemale) {
      // Prevent deselecting if it's the only one checked
      return
    }
    setShowMale((prev) => !prev)
  }

  const handleHypothesisFemale = () => {
    if (showFemale && !showMale) {
      // Prevent deselecting if it's the only one checked
      return
    }
    setShowFemale((prev) => !prev)
  }

  const queryParam = `?sessionID=${sessionID}&hypothesisNumber=${hypothesisNumber}`

  return (
    <>
      <Suspense>
        <UseValues />
      </Suspense>

      <Box position="relative" minHeight="100vh" pb={10}>
        <Grid container spacing={10} alignItems="flex-start">
          {/* Left side: Histogram */}
          <Grid item xs={12} md={9}>
            <Typography variant="h6" gutterBottom>
              {/* Is There a Relationship? */}
            </Typography>
            <Box mt={2}>
              {gardenData ? (
                // <div style={{marginLeft:'20px'}}>
                <Histogram
                  data={gardenData}
                  showFemale={showFemale}
                  showMale={showMale}
                />
              ) : (
                // </div>
                <Typography variant="body2" color="textSecondary">
                  Loading data, please wait...
                </Typography>
              )}
            </Box>
            {/* About the Data Button */}
            {/* <Box
              mt={2}
              display="flex"
              justifyContent="flex-end"
              position="relative"
            >
              <Button
                variant="outlined"
                color="secondary"
                // onClick={handleAboutDataClick}
              >
                About the Data
              </Button>
            </Box> */}
            {/* About the Data Button */}
            <Box position="absolute" bottom="-80px" right="20px">
              <Button
                variant="outlined"
                color="secondary"
                style={{ marginBottom: '210px' }}
                onClick={handleAboutDataClick}
              >
                Data <br />
                Source
              </Button>
              <Dialog open={openDialog} onClose={handleCloseDialog}>
                <DialogTitle>Data Source</DialogTitle>
                <DialogContent>
                  <Typography variant="body2">
                    <b>Data Source: </b> Wang Rui, Fanglin Chen, Zhenyu Chen,
                    Manxing Li, Gabriella Harari, Stefanie Tignor, Xia Zhou,
                    Dror Ben-Zeev, and Andrew T. Campbell. &quot;StudentLife:
                    Assessing Mental Health, Academic Performance and Behavioral
                    Trends of College Students using Smartphones.&quot; In
                    Proceedings of the ACM Conference on Ubiquitous Computing,
                    2014.{' '}
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
          </Grid>

          {/* Right side: Checkboxes and Back button */}
          <Grid item xs={12} md={3}>
            {/* <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMale}
                    onChange={handleHypothesisMale}
                  />
                }
                label="Daily activities influence student outcomes"
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFemale}
                    onChange={handleHypothesisFemale}
                  />
                }
                label="Daily activities do not influence student outcomes"
              />
            </Box> */}
            <Box mt={2}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showMale}
                    onChange={handleHypothesisMale}
                    sx={{
                      alignSelf: 'flex-start', // Aligns the checkbox with the label
                      color: 'black', // Checkbox color (unchecked state)
                      '&.Mui-checked': {
                        color: '#FF5A00', // Checkbox color (checked state)
                      },
                    }}
                  />
                }
                label="Daily activities influence student outcomes"
                labelPlacement="end" // Ensures the label is next to the checkbox
                sx={{
                  alignItems: 'flex-start', // Align items within FormControlLabel
                  '& .MuiTypography-root': {
                    lineHeight: 1.2, // Adjust line height for proper alignment
                    color: '#FF5A00', // Text color
                   fontWeight: 'bold', // Make the text bold
                  },
                }}
              />
              <FormControlLabel
                control={
                  <Checkbox
                    checked={showFemale}
                    onChange={handleHypothesisFemale}
                    sx={{
                      alignSelf: 'flex-start', // Aligns the checkbox with the label
                      color: 'black', // Checkbox color (unchecked state)
                      '&.Mui-checked': {
                        color: '#1859D7', // Checkbox color (checked state)
                      },
                    }}
                  />
                }
                label="Daily activities do not influence student outcomes"
                labelPlacement="end" // Ensures the label is next to the checkbox
                sx={{
                  alignItems: 'flex-start', // Align items within FormControlLabel
                  '& .MuiTypography-root': {
                    lineHeight: 1.2, // Adjust line height for proper alignment
                    color: '#1859D7', // Text color
                    fontWeight: 'bold', // Make the text bold
                  },
                }}
              />
            </Box>

            <Box
              mt={4}
              display="flex"
              justifyContent="center" // Moves the button to the right
            >
              {/* <Button
                variant="contained"
                color="primary"
                onClick={() => router.push(`/${queryParam}`)}
              >
                Back
              </Button> */}

              <Button
                variant="contained"
                color="primary"
                onClick={() => router.push(`/${queryParam}`)}
                sx={{
                  bgcolor: '#6F00FF',
                  '&:hover': {
                    bgcolor: '#5700CA',
                  },
                }}
              >
                Back
              </Button>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  )
}
