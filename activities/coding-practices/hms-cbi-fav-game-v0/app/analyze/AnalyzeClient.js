'use client'

import React, { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation'
import { Box, Tabs, Tab, TextField, Button, Typography, useMediaQuery } from '@mui/material'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { Bar } from 'react-chartjs-2'

// Register components with Chart.js
ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

const ExploreChoices = () => {
  const searchParams = useSearchParams()
  const sessionId = searchParams.get('sessionId') // Get sessionId from the URL
  const [sessionData, setSessionData] = useState(null)
  const [allData, setAllData] = useState([])
  const [activeTab, setActiveTab] = useState(0)
  const [choice1Votes, setChoice1Votes] = useState(0)
  const [choice2Votes, setChoice2Votes] = useState(0)
  const [userSelectedChoice, setUserSelectedChoice] = useState(null)
  const [choice1Inputs, setChoice1Inputs] = useState([]) // Store inputs under choice 1
  const [currentIndex, setCurrentIndex] = useState(0) // Track the current input index
  const [choice1Text, setChoice1Text] = useState('')
  const [choice2Text, setChoice2Text] = useState('')
  const [maxVotes, setMaxVotes] = useState(0)
  const isMobile = useMediaQuery('(max-width:600px)');


  // Fetch all session data from the API
  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch(`/api/selection?sessionId=${sessionId}`)
        if (!response.ok) {
          throw new Error('Failed to fetch session data')
        }
        const data = await response.json()
        setAllData(data ? [data] : []) // Store the dataset as an array
        setSessionData(data)
      } catch (error) {
        console.error('Error fetching session data:', error)
      }
    }

    fetchData()
  }, [sessionId])

  const choices = [
    {
      title: 'Analysis parameter: smoothing',
      choice:
        'Reduce noise by replacing each three-dimensional pixel (voxel) \u0027 s value with a weighted average of its neighbors within a radius of x pixels. Choose x so that the data most clearly shows a peak. ',
    },
    {
      title: 'Analyzing the most correlated voxel',
      choice:
        'To quantify effect size: define a region of interest based on the three-dimensional pixels (voxels) that show strongest activation. Then, calculate correlation of this region with the stimulus type.',
    },
    {
      title: 'Personality screen',
      choice:
        'Emotional people may have greater peaks in activity in response to emotional images. Have potential participants complete a personality inventory and recruit the more emotional ones.',
    },
    {
      title: 'Simulate subjects',
      choice:
        'Improve efficiency by recruiting only 12 subjects and simulating an additional 12 subjects after data has been collected.',
    },
    {
      title: 'A simple control',
      choice:
        'Compare responses to emotional pictures of humans and animals to a baseline of neutral landscapes.',
    },
    {
      title: 'Multiple comparison correction',
      choice:
        'Divide the threshold for statistical significance for the experiment by the number of tests, i.e. the number of three-dimensional pixels (voxels) examined.',
    },
  ]

  useEffect(() => {
    if (allData.length > 0) {
      const currentSession = allData.find(
        (session) => session.sessionId === sessionId,
      )
      if (!currentSession) return

      const selectedRound = currentSession.subsessions
        .flatMap((subsession) => subsession.rounds)
        .find((round) => round.round === activeTab + 1)

      if (selectedRound) {
        setChoice1Text(selectedRound.choice1)
        setChoice2Text(selectedRound.choice2)

        if (selectedRound.isChoice1Selected) {
          setUserSelectedChoice('choice1')
        } else if (selectedRound.isChoice2Selected) {
          setUserSelectedChoice('choice2')
        } else {
          setUserSelectedChoice(null)
        }

        let totalChoice1Votes = 0
        let totalChoice2Votes = 0
        let choice1InputList = []

        // Count votes & collect inputs for choice 1
        currentSession.subsessions.forEach((subsession) => {
          subsession.rounds.forEach((round) => {
            if (
              round.choice1 === selectedRound.choice1 &&
              round.isChoice1Selected
            ) {
              totalChoice1Votes += 1
              if (round.input) choice1InputList.push(round.input)
            }
            if (
              round.choice2 === selectedRound.choice1 &&
              round.isChoice2Selected
            ) {
              totalChoice1Votes += 1
              if (round.input) choice1InputList.push(round.input)
            }
            if (
              round.choice1 === selectedRound.choice2 &&
              round.isChoice1Selected
            ) {
              totalChoice2Votes += 1
            }
            if (
              round.choice2 === selectedRound.choice2 &&
              round.isChoice2Selected
            ) {
              totalChoice2Votes += 1
            }
          })
        })

        setChoice1Votes(totalChoice1Votes)
        setChoice2Votes(totalChoice2Votes)
        setChoice1Inputs(choice1InputList)
      }
    }
  }, [allData, sessionId, activeTab])

  useEffect(() => {
    if (allData.length > 0) {
      const currentSession = allData.find(
        (session) => session.sessionId === sessionId,
      )
      if (!currentSession) return

      let highestVote = 0

      currentSession.subsessions.forEach((subsession) => {
        subsession.rounds.forEach((round) => {
          const roundMax = Math.max(
            round.isChoice1Selected ? 1 : 0,
            round.isChoice2Selected ? 1 : 0,
          )
          if (roundMax > highestVote) {
            highestVote = roundMax
          }
        })
      })

      setMaxVotes(highestVote)
    }
  }, [allData, sessionId])

  // Function to move to the next input
  const handleNext = () => {
    setCurrentIndex((prevIndex) =>
      prevIndex < choice1Inputs.length - 1 ? prevIndex + 1 : prevIndex,
    )
  }

  // Function to move to the previous input
  const handlePrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex > 0 ? prevIndex - 1 : prevIndex))
  }

  // Find the matching choice titles based on the descriptions
  const choice1Title =
    choices.find((c) => c.choice === choice1Text)?.title || 'Choice 1'
  const choice2Title =
    choices.find((c) => c.choice === choice2Text)?.title || 'Choice 2'

  // Chart Data
  const data = {
    labels: [choice1Title, choice2Title], // Use dynamic titles
    datasets: [
      {
        label: 'Votes',
        data: [choice1Votes, choice2Votes],
        backgroundColor: [
          userSelectedChoice === 'choice1'
            ? 'rgb(110, 50, 140)'
            : 'rgb(200, 165, 215)',
          userSelectedChoice === 'choice2'
            ? 'rgb(110, 50, 140)'
            : 'rgb(200, 165, 215)',
        ],
        borderColor: [
          userSelectedChoice === 'choice1' ? 'darkviolet' : 'transparent',
          userSelectedChoice === 'choice2' ? 'darkviolet' : 'transparent',
        ],
        borderWidth: [
          userSelectedChoice === 'choice1' ? 5 : 1,
          userSelectedChoice === 'choice2' ? 5 : 1,
        ],
      },
    ],
  }

  const options = {
    responsive: true,
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        displayColors: false, // Remove color box for a smaller tooltip
        callbacks: {
          label: function (tooltipItem) {
            const index = tooltipItem.dataIndex
            const choiceTitle = index === 0 ? choice1Title : choice2Title
            const choiceDescription =
              index === 0
                ? choices.find((c) => c.choice === choice1Text)?.choice
                : choices.find((c) => c.choice === choice2Text)?.choice

            const votes = tooltipItem.raw

            // Limit description length and break into 2 lines
            const descriptionLines = choiceDescription
              ? choiceDescription.match(/.{1,50}(\s|$)/g) // Wrap at ~50 characters
              : ['No description available']

            return [`${choiceTitle}: ${votes} votes`, ...descriptionLines]
          },
        },
        bodyFont: {
          size: 12, // Adjust font size for better readability
        },
        padding: 8, // Reduce padding to keep tooltip compact
        boxWidth: 0, // Hide the color box
      },
    },
    scales: {
      y: {
        beginAtZero: true,
      },
    },
  }

  if (!sessionData) {
    return <Box>Loading...</Box>
  }

  return (
    <Box
      sx={{
        width: '100%',
        padding: 2,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        margin: 'auto',
      }}
    >
   
      <Typography
        sx={{
          fontSize: 18,
          color: 'black',
          fontWeight: 600,
          textAlign: 'center',
          fontWeight: 'bold',
          marginBottom: 2,
        }}
        className='headings'
      >
        These charts show how you voted, with explanations provided below. Did
        you agree with the majority? Is there an explanation that could convince
        you to change your vote?
      </Typography>
      <Box sx={{ width: '100%', borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={activeTab}
          onChange={(event, newValue) => setActiveTab(newValue)}
          centered
        >
          <Tab label="Tab 1 - round 1" />
          <Tab label="Tab 2 - round 2" />
          <Tab label="Tab 3 - round 3" />
        </Tabs>
      </Box>

      <Box
      sx={{
        width: isMobile ?  '100%' : '50%',
        padding: 2,
        marginTop: 4,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
      }}
    >
      <Bar data={data} options={options}  />

      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          marginTop: 2,
          width: '90%',
          marginX: 'auto',
          gap: isMobile ? 2 : 0,
        }}
      >
        {/* Box for Choice 1 Inputs */}
        <Box sx={{ width: isMobile ? '100%' : '45%', textAlign: 'center' }}>
          <Typography variant="h7" sx={{ marginBottom: 10, color: 'black !important' }}>
            Comments from <br /> user for selected choice
          </Typography>
          <Box
            sx={{
              height: '150px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid black',
              padding: 2,
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              marginTop: 1,
              color: 'black !important',
            }}
          >
            {choice1Inputs.length > 0 ? choice1Inputs[currentIndex] : 'No inputs provided yet.'}
          </Box>

          {/* Navigation Buttons */}
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
            <Button
              onClick={handlePrevious}
              disabled={currentIndex === 0}
              style={{ color: currentIndex === 0 ? 'grey' : 'rgb(110, 50, 140)' }}
            >
              Previous
            </Button>
            <Button
              onClick={handleNext}
              disabled={currentIndex === choice1Inputs.length - 1}
              style={{ color: currentIndex === choice1Inputs.length - 1 ? 'grey' : 'rgb(110, 50, 140)' }}
            >
              Next
            </Button>
          </Box>
        </Box>

        {/* Box for Majority Vote Reasons */}
        <Box sx={{ width: isMobile ? '100%' : '45%', textAlign: 'center' }}>
          <Typography variant="h7" sx={{ marginBottom: 3, color: 'black !important' }}>
            Comments from user for a non selected choice
          </Typography>
          <Box
            sx={{
              height: '150px',
              backgroundColor: '#fff',
              borderRadius: '8px',
              border: '1px solid black',
              padding: 2,
              overflowY: 'auto',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '16px',
              marginTop: 1,
              color: 'black !important',
            }}
          >
            {'No inputs provided yet.'}
          </Box>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', marginTop: 1 }}>
            <Button onClick={handlePrevious} disabled={true}>
              Previous
            </Button>
            <Button onClick={handleNext} disabled={true}>
              Next
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
    </Box>
  )
}

export default ExploreChoices
