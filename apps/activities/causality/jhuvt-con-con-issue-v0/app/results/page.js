const logger = require('../../../../../../packages/logging/logger.js');
'use client'

import React, { useState, useEffect, Suspense } from 'react'
import {
  Box,
  Typography,
  Paper,
  Button,
  Container,
  Grid,
  Tab,
  Tabs,
  List,
  ListItem,
  Avatar,
  CircularProgress,
  Tooltip,
} from '@mui/material'
import { useRouter } from 'next/navigation'
import ZoomOutMapIcon from '@mui/icons-material/ZoomOutMap'

// Loading component for suspense
function LoadingResults() {
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '50vh',
      }}
    >
      <CircularProgress />
    </Box>
  )
}

// Component that uses search params - needs to be wrapped in Suspense
function ResultsContent() {
  const router = useRouter()

  // We'll handle search params safely without using the hook that causes the error
  const [queryParams, setQueryParams] = useState({})
  const [apiData, setApiData] = useState(null)
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    // Safely get URL params on the client side
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search)
      const params = {}

      // Get all params
      urlParams.forEach((value, key) => {
        params[key] = value
      })

      setQueryParams(params)
    }
  }, [])

  // API call effect - runs when queryParams changes
  useEffect(() => {
    const callStudiesAPI = async () => {
      // Check if we have the sessionId parameter
      if (queryParams.sessionId) {
        try {
          setLoading(true)
          const apiUrl = `http://localhost:3001/api/studies?sessionId=${queryParams.sessionId}&selectedSection=1`
          logger.app.info('Calling API:', apiUrl)
          
          const response = await fetch(apiUrl)
          
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
          }
          
          const data = await response.json()
          logger.app.info('API Response:', data)
          logger.app.info('API Response Type:', typeof data)
          logger.app.info('API Response Keys:', Object.keys(data))
          logger.app.info('Checking for responses property:', data.responses)
          setApiData(data)
        } catch (error) {
          logger.app.error('Error calling studies API:', error)
        } finally {
          setLoading(false)
        }
      } else {
        logger.app.info('No sessionId found in URL parameters')
      }
    }

    // Only call API if we have query params
    if (Object.keys(queryParams).length > 0) {
      callStudiesAPI()
    }
  }, [queryParams])

  // State for the selected study tab
  const [activeStudy, setActiveStudy] = useState(0)

  // Mock data for explanations (fallback)
  const defaultExplanations = [
    { id: 1, text: 'EXPLANATION 1', color: '#f3e5ab' }, // Yellow
    { id: 2, text: 'EXPLANATION 2', color: '#a8e4a0' }, // Green
    { id: 3, text: 'EXPLANATION 3', color: '#a0d2e4' }, // Blue
    { id: 4, text: 'EXPLANATION 4', color: '#f8c8b0' }, // Orange/Peach
    { id: 5, text: 'EXPLANATION 5', color: '#e4b0e4' }, // Purple/Pink
    { id: 6, text: 'EXPLANATION 6', color: '#c0c0c0' }, // Gray
  ]

  // Category color mapping
  const categoryColors = {
    "Imprecise negative control": { bg: "#ffc802", opacity: 0.4, text: "#000000" },
    "Opportunity for bias": { bg: "#00c802", opacity: 0.4, text: "#000000" },
    "Covariates imbalanced": { bg: "#00a3ff", opacity: 0.4, text: "#000000" },
    "Missing positive control": { bg: "#ff5a00", opacity: 0.4, text: "#000000" },
    "Risk of underpowered study": { bg: "#f03add", opacity: 0.4, text: "#000000" },
    "Ungeneralizable sample": { bg: "#6f00ff", opacity: 0.4, text: "#000000" },
    "Other": { bg: "#a0ff00", opacity: 0.4, text: "#000000" },
    "adequate": { bg: "#a2a2a2", opacity: 1.0, text: "#f3f3f3" }
  }

  // Helper function to convert hex to rgba
  const hexToRgba = (hex, opacity) => {
    const r = parseInt(hex.slice(1, 3), 16)
    const g = parseInt(hex.slice(3, 5), 16)
    const b = parseInt(hex.slice(5, 7), 16)
    return `rgba(${r}, ${g}, ${b}, ${opacity})`
  }

  // Function to calculate percentage of users who chose "inadequate"
  const calculateInadequatePercentage = (apiData, targetRound) => {
    logger.app.info('=== DEBUG calculateInadequatePercentage ===')
    logger.app.info('apiData:', apiData)
    logger.app.info('targetRound:', targetRound)
    
    if (!apiData || !apiData.data || !apiData.data.students) {
      logger.app.info('No API data or students found')
      return { percentage: 0, inadequateCount: 0, totalCount: 0 }
    }
    
    let totalStudents = 0
    let inadequateCount = 0
    
    // Loop through each student
    apiData.data.students.forEach((student, studentIndex) => {
      logger.app.info(`Processing student ${studentIndex}:`, student)
      
      // Look for the specific round in the student's rounds
      const roundKey = `round${targetRound}`
      logger.app.info(`Looking for round key: ${roundKey}`)
      
      const round = student.rounds[roundKey]
      logger.app.info(`Found round data:`, round)
      
      if (round && (round.response || round.option)) {
        totalStudents++
        
        // Check if this student chose "inadequate" (opposite of "adequate")
        if (round.option && round.option !== "adequate") {
          inadequateCount++
          logger.app.info(`Student ${studentIndex} chose inadequate option: ${round.option}`)
        } else {
          logger.app.info(`Student ${studentIndex} chose adequate option`)
        }
      }
    })
    
    const percentage = totalStudents > 0 ? Math.round((inadequateCount / totalStudents) * 100) : 0
    
    logger.app.info(`Round ${targetRound} stats:`)
    logger.app.info(`- Total students: ${totalStudents}`)
    logger.app.info(`- Inadequate count: ${inadequateCount}`)
    logger.app.info(`- Percentage inadequate: ${percentage}%`)
    
    return { percentage, inadequateCount, totalCount: totalStudents }
  }

  // Generate dynamic study data with calculated percentages
  const getDynamicStudyData = (apiData) => {
    const study1Stats = calculateInadequatePercentage(apiData, 1)
    const study2Stats = calculateInadequatePercentage(apiData, 2)
    const study3Stats = calculateInadequatePercentage(apiData, 3)
    
    return [
      {
        id: 1,
        title: 'STUDY 1',
        experiment: {
          title: 'Experiment 1',
          text:
            'To study whether rhythmic sensory stimulation reduces fibromyalgia symptoms, patients self-administer using a stimulation device, and fill out a survey of symptoms before and after the intervention.',
        },
        concern: {
          title: 'Concern 1',
          text: 'Patients may expect that the treatment will reduce symptoms, thereby affecting how they respond to the treatment and report their symptoms after.',
        },
        control: {
          title: 'Proposed control 1',
          text:
            'Add a placebo control group, who are given a treatment of a different modality (e.g. light, sound).',
        },
        verdict:
          `${study1Stats.percentage}% of the submitters thought this control was inadequate.\nBelow you can review what others thought of this proposed solution. You can hover over submissions to see which category they belong to.`,
      },
      {
        id: 2,
        title: 'STUDY 2',
        experiment: {
          title: 'Experiment 2',
          text:
            'Do mice raised on mountain rareberries perform better on rotarod tests than mice raised on a control diet?',
        },
        concern: {
          title: 'Concern 2',
          text:
            'Any difference in performance between groups could be due to differences between rareberries and the regular diet, such as sugar or antioxidants, rather than a chemical component that is unique to the rareberries.',
        },
        control: {
          title: 'Proposed control 2',
          text:
            'Provide the control group with a closely-matched berry diet to the rareberries that the treatment group receive.',
        },
        verdict:
          `${study2Stats.percentage}% of the submitters thought this control was inadequate.\nBelow you can review what others thought of this proposed solution. You can hover over submissions to see which category they belong to.`,
      },
      {
        id: 3,
        title: 'STUDY 3',
        experiment: {
          title: 'Experiment 3',
          text:
            'To study the impacts of different treatments for neurodegeneration in C elegans, you plan to immobilize the worms in a microfluidic device. Before and after the treatment, the worms will be tested by measuring their neural responses to a chemical stimulus.',
        },
        concern: {
          title: 'Concern 3',
          text:
            'Your lab manager notes that the fabricated microfluidic devices could be causing your worms discomfort during the experiment, resulting in a stress response that obscures the neural dynamics you\'re hoping to observe.',
        },
        control: {
          title: 'Proposed control 3',
          text:
            'Use a mild anesthetic to restrain the worms instead of the microfluidic device, thereby eliminating the stress responses caused by mechanical discomfort.',
        },
        verdict:
          `${study3Stats.percentage}% of the submitters thought this control was inadequate.\nBelow you can review what others thought of this proposed solution. You can hover over submissions to see which category they belong to.`,
      },
    ]
  }

  // Updated function to extract responses from API data with round filtering
  const getResponsesFromApiData = (apiData, targetRound) => {
    logger.app.info('=== DEBUG getResponsesFromApiData ===')
    logger.app.info('apiData:', apiData)
    logger.app.info('targetRound:', targetRound)
    
    if (!apiData || !apiData.data || !apiData.data.students) {
      logger.app.info('No API data or students found')
      return []
    }
    
    logger.app.info('Students data:', apiData.data.students)
    
    const responses = []
    
    // Loop through each student
    apiData.data.students.forEach((student, studentIndex) => {
      logger.app.info(`Processing student ${studentIndex}:`, student)
      logger.app.info(`Student rounds:`, student.rounds)
      
      // Look for the specific round in the student's rounds
      const roundKey = `round${targetRound}`
      logger.app.info(`Looking for round key: ${roundKey}`)
      
      const round = student.rounds[roundKey]
      logger.app.info(`Found round data:`, round)
      
      if (round) {
        logger.app.info(`Round ${targetRound} exists for student ${studentIndex}`)
        logger.app.info(`Round response:`, round.response)
        logger.app.info(`Round option:`, round.option)
        logger.app.info(`Round category:`, round.category)
        
        if (round.response) {
          // Determine category for color coding
          let category = round.category
          
          // If option is "adequate" and no specific category, use "adequate"
          if (round.option === "adequate" && !category) {
            category = "adequate"
          }
          // If no category found, default to "Other"
          else if (!category) {
            category = "Other"
          }
          
          const colorInfo = categoryColors[category] || categoryColors["Other"]
          
          const responseObj = {
            text: round.response,
            category: category,
            backgroundColor: hexToRgba(colorInfo.bg, colorInfo.opacity),
            textColor: colorInfo.text,
            studentId: student.studentId || `student_${studentIndex}`,
            round: targetRound,
            option: round.option
          }
          
          logger.app.info('Adding response:', responseObj)
          responses.push(responseObj)
        } else {
          logger.app.info(`No response found for round ${targetRound} in student ${studentIndex}`)
        }
      } else {
        logger.app.info(`Round ${roundKey} not found for student ${studentIndex}`)
      }
    })
    
    logger.app.info(`Total responses found for round ${targetRound}:`, responses.length)
    logger.app.info('All responses:', responses)
    
    return responses
  }

  // Helper function to get all responses (fallback)
  const getAllResponsesFromApiData = (apiData) => {
    logger.app.info('=== FALLBACK: Getting all responses ===')
    if (!apiData || !apiData.data || !apiData.data.students) {
      return []
    }
    
    const responses = []
    
    apiData.data.students.forEach((student, studentIndex) => {
      if (student.rounds) {
        Object.entries(student.rounds).forEach(([roundKey, round]) => {
          if (round && round.response) {
            let category = round.category
            
            if (round.option === "adequate" && !category) {
              category = "adequate"
            } else if (!category) {
              category = "Other"
            }
            
            const colorInfo = categoryColors[category] || categoryColors["Other"]
            
            responses.push({
              text: round.response,
              category: category,
              backgroundColor: hexToRgba(colorInfo.bg, colorInfo.opacity),
              textColor: colorInfo.text,
              studentId: student.studentId || `student_${studentIndex}`,
              round: roundKey,
              option: round.option
            })
          }
        })
      }
    })
    
    logger.app.info('Fallback responses found:', responses.length)
    return responses
  }

  // Study data - now dynamic based on API data
  const studyData = apiData ? getDynamicStudyData(apiData) : [
    // Fallback static data when API data is not available
    {
      id: 1,
      title: 'STUDY 1',
      experiment: {
        title: 'Experiment 1',
        text: 'To study the impact of rhythmic sensory stimulation on fibromyalgia symptoms, the authors had patients fill out symptomatology surveys before and after an intervention, which consisted of self-administered sensory stimulation in the patients home.',
      },
      concern: {
        title: 'Concern 1',
        text: 'In order to determine the efficacy of rhythmic sensory stimulation, we need to be able to distinguish between the effects of the proposed treatment and a potential placebo effect.',
      },
      control: {
        title: 'Proposed control 1',
        text: 'Add a placebo control group that is told the treatment stimulation is of an alternative mode (e.g. light,melodic sound) and then undergoes a sham stimulation.',
      },
      verdict: 'Loading data...\nBelow, see what others thought:',
    },
    {
      id: 2,
      title: 'STUDY 2',
      experiment: {
        title: 'Experiment 2',
        text: 'Do mice raised on mountain rareberries perform better on rotarod tests than mice raised on a control diet?',
      },
      concern: {
        title: 'Concern 2',
        text: 'Any difference in performance could be due to nutritional content, such as sugar or antioxidants, rather than any property unique to the rareberries.',
      },
      control: {
        title: 'Proposed control 2',
        text: 'Supplement the control group\'s kibble with sugar water to match the rareberry group\'s sugar intake.',
      },
      verdict: 'Loading data...\nBelow, see what others thought:',
    },
    {
      id: 3,
      title: 'STUDY 3',
      experiment: {
        title: 'Experiment 3',
        text: 'To study the impact of a particular sensory stimulus on neuronal dynamics, you have grown Caenorhabditis Elegans cultures expressing geenetically encoded calcium indicators. You plan to record volumetric videos of worms being exposed to your stimulus and extract neuronal activity from the luminosity values of individual neurons. This requires your worms to be immobilized, so your experiment will involve flooding a microfluiding device featuring a funnel that will restrict their movement.',
      },
      concern: {
        title: 'Concern 3',
        text: 'Your lab manager notes that a flaw in your fabricated microfluidic devices would be causing your worms discomfort during the experiment, resulting in a stress response that may confound the neural dynamics you are hoping to observe.',
      },
      control: {
        title: 'Proposed control 3',
        text: 'Use a mild anesthetic to restrain the worms instead of the faulty device, aiming to eliminate stress responses caused by mechanical discomfort.',
      },
      verdict: 'Loading data...\nBelow, see what others thought:',
    },
  ]

  // Get responses for the current active study (round)
  const currentRound = activeStudy + 1 // Convert tab index to round number (0->1, 1->2, 2->3)
  const apiResponses = getResponsesFromApiData(apiData, currentRound)
  logger.app.info(`Extracted responses from API for round ${currentRound}:`, apiResponses)
  
  // If no responses found for specific round, try to get all responses as fallback
  const fallbackResponses = apiResponses.length === 0 && apiData ? 
    getAllResponsesFromApiData(apiData) : []
  
  const explanations = apiResponses.length > 0
    ? apiResponses
        .sort((a, b) => {
          // Sort by option: inadequate (not "adequate") first, then adequate
          if (a.option !== "adequate" && b.option === "adequate") return -1;
          if (a.option === "adequate" && b.option !== "adequate") return 1;
          return 0;
        })
        .map((responseObj, index) => ({
          id: index + 1,
          text: responseObj.text,
          backgroundColor: responseObj.backgroundColor,
          textColor: responseObj.textColor,
          category: responseObj.category,
          studentId: responseObj.studentId,
          round: responseObj.round,
          option: responseObj.option,
          hoverText: responseObj.option === "adequate" ? "Adequate Control" : responseObj.category
        }))
    : fallbackResponses.length > 0
    ? fallbackResponses
        .sort((a, b) => {
          // Sort by option: inadequate (not "adequate") first, then adequate
          if (a.option !== "adequate" && b.option === "adequate") return -1;
          if (a.option === "adequate" && b.option !== "adequate") return 1;
          return 0;
        })
        .map((responseObj, index) => ({
          id: index + 1,
          text: `[All Rounds] ${responseObj.text}`,
          backgroundColor: responseObj.backgroundColor,
          textColor: responseObj.textColor,
          category: responseObj.category,
          studentId: responseObj.studentId,
          round: responseObj.round,
          option: responseObj.option,
          hoverText: responseObj.option === "adequate" ? "Adequate Control" : responseObj.category
        }))
    : defaultExplanations.map(exp => ({
        ...exp,
        backgroundColor: exp.color,
        textColor: "#000000",
        category: "default",
        hoverText: "Default explanation"
      }))
    
  logger.app.info(`Final explanations for round ${currentRound}:`, explanations)

  // Study tab handling
  const handleStudyChange = (event, newValue) => {
    setActiveStudy(newValue)
  }

  // Current study data based on active tab
  const currentStudy = studyData[activeStudy]

  // Check if completed parameter exists (optional)
  useEffect(() => {
    if (queryParams.completed) {
      logger.app.info('Completed flag detected:', queryParams.completed)
      // You can do something with this information if needed
    }
  }, [queryParams])

  return (
    <Box sx={{ flexGrow: 1, mt: 2 }}>
      {/* Study Tabs */}
      <Tabs
        value={activeStudy}
        onChange={handleStudyChange}
        variant="fullWidth"
        sx={{ mb: 2 }}
      >
        <Tab
          label="STUDY 1"
          sx={{
            bgcolor: activeStudy === 0 ? '#000000' : '#888888',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 0,
            '&.Mui-selected': {
              color: 'white',
            },
          }}
        />
        <Tab
          label="STUDY 2"
          sx={{
            bgcolor: activeStudy === 1 ? '#000000' : '#888888',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 0,
            '&.Mui-selected': {
              color: 'white',
            },
          }}
        />
        <Tab
          label="STUDY 3"
          sx={{
            bgcolor: activeStudy === 2 ? '#000000' : '#888888',
            color: 'white',
            fontWeight: 'bold',
            borderRadius: 0,
            '&.Mui-selected': {
              color: 'white',
            },
          }}
        />
      </Tabs>

      {/* Main Content Area */}
      <Box sx={{ bgcolor: 'white', borderRadius: 1 }}>
        {/* Placeholder Banner */}

        {/* White space gap */}
        <Box sx={{ height: 8, bgcolor: 'white' }} />

        {/* Experiment Details */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#f0f0f0',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h2"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              mb: 1,
            }}
          >
            {currentStudy.experiment.title}
          </Typography>
          <Typography variant="body1">
            {currentStudy.experiment.text}
          </Typography>
        </Paper>

        {/* White space gap */}
        <Box sx={{ height: 8, bgcolor: 'white' }} />

        {/* Concern Section */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#ffe8d6',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              mb: 1,
              color: '#ff7043',
            }}
          >
            {currentStudy.concern.title}
          </Typography>
          <Typography variant="body1">{currentStudy.concern.text}</Typography>
        </Paper>

        {/* White space gap */}
        <Box sx={{ height: 8, bgcolor: 'white' }} />

        {/* Proposed Control Section */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#e8f5e9',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography
            variant="h5"
            component="h3"
            sx={{
              fontWeight: 'bold',
              fontSize: '1.25rem',
              mb: 1,
              color: '#4caf50',
            }}
          >
            {currentStudy.control.title}
          </Typography>
          <Typography variant="body1">
            {currentStudy.control.text}
          </Typography>
        </Paper>

        {/* White space gap */}
        <Box sx={{ height: 8, bgcolor: 'white' }} />

        {/* Verdict Section - New separate grey box */}
        <Paper
          elevation={0}
          sx={{
            bgcolor: '#e0e0e0',
            p: 2,
            borderRadius: 1,
          }}
        >
          <Typography   
            variant="h7"
            component="h3"
            sx={{ 
              fontWeight: 'bold',
              whiteSpace: 'pre-line' // This preserves line breaks
            }}
          >
            {currentStudy.verdict}
          </Typography>
        </Paper>

        {/* White space gap */}
        <Box sx={{ height: 8, bgcolor: 'white' }} />

        {/* Explanations List */}
        <Box sx={{ p: 2, bgcolor: '#f0f0f0', borderRadius: 1 }}>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading responses...</Typography>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              {explanations.length > 0 ? (
                explanations.map((explanation) => (
                  <Tooltip 
                    key={explanation.id}
                    title={explanation.hoverText || 'No category information'}
                    arrow
                    placement="top"
                    enterDelay={300}
                    leaveDelay={200}
                  >
                    <Box
                      sx={{
                        backgroundColor: explanation.backgroundColor,
                        color: explanation.textColor,
                        p: 1.5,
                        borderRadius: '2px',
                        fontWeight: 'medium',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8,
                          transform: 'scale(1.01)',
                          transition: 'all 0.2s ease-in-out'
                        }
                      }}
                    >
                      {explanation.text}
                    </Box>
                  </Tooltip>
                ))
              ) : (
                <Typography sx={{ textAlign: 'center', p: 2, color: '#666' }}>
                  No responses found for Round {currentRound}
                </Typography>
              )}
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  )
}

// Main component with Suspense
export default function ResultsScreen() {
  return (
    <Container maxWidth="md" sx={{ pt: 2, pb: 4 }}>
      <Suspense fallback={<LoadingResults />}>
        <ResultsContent />
      </Suspense>
    </Container>
  )
}