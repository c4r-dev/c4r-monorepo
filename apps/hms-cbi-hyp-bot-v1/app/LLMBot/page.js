'use client';

const logger = require('../../../../packages/logging/logger.js');

import { Textarea } from '../components/ui/textarea'
import { useChat } from 'ai'
import Image from 'next/image'
import { useRouter, useSearchParams } from 'next/navigation'
import { Button } from '../components/ui/button'
import { Send } from 'lucide-react'
import Message from '../components/Messages'
import { useRef, useState, useEffect, Suspense } from 'react'
import { Box, Grid, Typography, useMediaQuery } from '@mui/material'
import { styled } from '@mui/material/styles'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import hints from '../../questions.json'
import CustomModal from '../components/CustomModal'
import Header from '../components/Header/Header'
import CustomButton from '../components/Button/Button'

const StyledTextarea = styled('textarea')(({ theme }) => ({
  width: '200px',
  height: '100px',
  backgroundColor: '#00a3ff',
  opacity: 0.4,
  borderColor: '#d1d5db',
  borderRadius: '8px',
  padding: '16px',
  resize: 'both', // Allows both horizontal and vertical resizing
  overflow: 'auto',
  fontSize: '16px',
  fontFamily: 'inherit',
  outline: 'none',
  border: '1px solid #d1d5db',
  '&:focus': {
    borderColor: theme.palette.primary.main, // Highlight border on focus
  },
}))

const probingQuestionsWithHints = {
  round1: [
    {
      question: `Is there a subject population, timescale, or spatial scale that is the most direct test of your hypothesis?`,
      hint: `add temporal / spatial / population dimensions to hypothesis`,
    },
    {
      question: `What pathway or mechanism might be linking the cause and effect in your hypothesis?`,
      hint: `consider pathway / mechanism`,
    },
    {
      question: `What is the opposite of your hypothesis? What are the conditions in which it might be plausible?`,
      hint: `consider opposite effects`,
    },
    {
      question: `If your hypothesis were false, what would be an observed pattern or phenomena?`,
      hint: `consider counter-predictions`,
    },
    {
      question: `If your hypothesis were true, what specific pattern or phenomena would you fail to see?`,
      hint: `consider counter-predictions`,
    },
    {
      question: `Is there a simpler or more obvious manifestation of the effect in your hypothesis?`,
      hint: `simplify the hypothesis`,
    },
    {
      question: `Could noise or random variability be responsible for similar effects as your hypothesis?`,
      hint: `robustness of effect`,
    },
  ],
  round2: [
    {
      question: `Are there environmental or contextual factors could influence the effect in your hypothesis?`,
      hint: `context`,
    },
    {
      question: `What would you observe if you excluded or altered one of the conditions or variables?`,
      hint: `bias / moderators`,
    },
    {
      question: `Are there other variables that could influence your hypothesized effect; can you test for or quantify their influence?`,
      hint: `bias / moderators`,
    },
    {
      question: `In what testing scenario would the hypothesized effect be the strongest / weakest?`,
      hint: `context`,
    },
    {
      question: `Could there be a confounder that influences both the cause and effect in your hypothesis?`,
      hint: `confounder`,
    },
    {
      question: `Is there a way in which cause and effect could be reversed; that is the the hypothesized cause actually results from the hypothesized effect?`,
      hint: `reverse causality`,
    },
    {
      question: `Are there theories or hypotheses from other fields or disciplines that present an alternative explanation?`,
      hint: `Encourages interdisciplinary thinking and broader perspectives.`,
    },
  ],
  round3: [
    {
      question: `What hypothesis could you write that demonstrates H1 is only valid in specific cases?`,
      hint: `Identifies limitations and potential alternative scenarios.`,
    },
    {
      question: `What hypothesis could you write that explores whether the casual mechanisms from H1 is reversed?`,
      hint: `Encourages questioning causality and exploring alternative directions.`,
    },
    {
      question: `What hypothesis could you write that demonstrates H1 is an effect of bias from your experimental setup or tools?`,
      hint: `Examines technical biases that could shape the hypothesis.`,
    },
    {
      question: `What would a hybrid of your original and a previous alternative hypothesis look like?`,
      hint: `Synthesizes elements of multiple hypotheses for richer insights.`,
    },
    {
      question: `What hypothesis would you write to try and find results that would definitively disprove your hypothesis?`,
      hint: `Clarifies the boundaries and falsifiability of the hypothesi`,
    },
    {
      question: `What hypothesis would you write to prove effects from H1 are due to feedback loops or interactions among variables?`,
      hint: `Explores dynamic systems and potential nonlinear effects.`,
    },
    {
      question: `What findings from other fields or disciplines could challenge your hypothesis? What is a hypothesis from those fields that could challenge H1?`,
      hint: `Encourages interdisciplinary thinking and broader perspectives.`,
    },
    {
      question: `What hypothesis could you write that demonstrates H1 is an effect of your biases?`,
      hint: `Expands exploration into new methodologies or data sources.`,
    },
    {
      question: `Write a hypothesis as if a core assumption of H1 is completely wrong.`,
      hint: `Promotes self-reflection to reduce confirmation bias.`,
    },
  ],
}

const getRandomQuestionWithHint = (round) => {
  const roundQuestions = probingQuestionsWithHints[`round${round}`]
  const randomIndex = Math.floor(Math.random() * roundQuestions.length)
  return roundQuestions[randomIndex]
}

function LLMPage({
  onHintChange,
  hypothesisDesc,
  sessionID,
  selectedGroup,
  userID,
}) {
  const [messages, setMessages] = useState([]) // Store messages
  const [input, setInput] = useState('') // Track user input
  const formRef = useRef(null)
  const [currentRound, setCurrentRound] = useState(1) // Start with round 1
  const [submitCount, setSubmitCount] = useState(0) // Track number of submits
  const [isInputDisabled, setIsInputDisabled] = useState(false) // Disable input after 2 rounds
  const [currentHint, setCurrentHint] = useState('') // Track the current hint
  const [q1, setQ1] = useState('') // Track question 1
  const [q2, setQ2] = useState('') // Track question 2
  const [q3, setQ3] = useState('') // Track question 3
  const [hyp1, setHyp1] = useState('') // Track hypothesis 1
  const [hyp2, setHyp2] = useState('') // Track hypothesis 2
  const [hyp3, setHyp3] = useState('') // Track hypothesis 3
  const isMobile = useMediaQuery('(max-width:600px)')


  const router = useRouter() // Next.js router for navigation

  useEffect(() => {
    if (submitCount === 2) {
      setTimeout(() => {
        router.push(
          `/Results?sessionID=${sessionID}&selectedGroup=${selectedGroup}`,
        )
      }, 1000) // 1-second delay before navigating
    }
  }, [submitCount, router, sessionID, selectedGroup])


  useEffect(() => {
    if (messages.length === 0) {
      setMessages([{ id: Date.now(), type: 'bot', content: 'Welcome! Please enter your hypothesis.' }])
    }
  }, [])

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      formRef.current?.requestSubmit()
    }
  }

  const probingQuestions = {
    1: [
      {
        question: `Is there a subject population, timescale, or spatial scale that is the most direct test of your hypothesis?`,
        hint: `add temporal / spatial / population dimensions to hypothesis`,
      },
      {
        question: `What pathway or mechanism might be linking the cause and effect in your hypothesis?`,
        hint: `consider pathway / mechanism`,
      },
      {
        question: `What is the opposite of your hypothesis? What are the conditions in which it might be plausible?`,
        hint: `consider opposite effects`,
      },
      {
        question: `If your hypothesis were false, what would be an observed pattern or phenomena?`,
        hint: `consider counter-predictions`,
      },
      {
        question: `If your hypothesis were true, what specific pattern or phenomena would you fail to see?`,
        hint: `consider counter-predictions`,
      },
      {
        question: `Is there a simpler or more obvious manifestation of the effect in your hypothesis?`,
        hint: `simplify the hypothesis`,
      },
      {
        question: `Could noise or random variability be responsible for similar effects as your hypothesis?`,
        hint: `robustness of effect`,
      },
    ],
    2: [
      {
        question: `Are there environmental or contextual factors could influence the effect in your hypothesis?`,
        hint: `context`,
      },
      {
        question: `What would you observe if you excluded or altered one of the conditions or variables?`,
        hint: `bias / moderators`,
      },
      {
        question: `Are there other variables that could influence your hypothesized effect; can you test for or quantify their influence?`,
        hint: `bias / moderators`,
      },
      {
        question: `In what testing scenario would the hypothesized effect be the strongest / weakest?`,
        hint: `context`,
      },
      {
        question: `Could there be a confounder that influences both the cause and effect in your hypothesis?`,
        hint: `confounder`,
      },
      {
        question: `Is there a way in which cause and effect could be reversed; that is the the hypothesized cause actually results from the hypothesized effect?`,
        hint: `reverse causality`,
      },
      {
        question: `Are there theories or hypotheses from other fields or disciplines that present an alternative explanation?`,
        hint: `Encourages interdisciplinary thinking and broader perspectives.`,
      },
    ],
    3: [
      {
        question: `What hypothesis could you write that demonstrates H1 is only valid in specific cases?`,
        hint: `Identifies limitations and potential alternative scenarios.`,
      },
      {
        question: `What hypothesis could you write that explores whether the casual mechanisms from H1 is reversed?`,
        hint: `Encourages questioning causality and exploring alternative directions.`,
      },
      {
        question: `What hypothesis could you write that demonstrates H1 is an effect of bias from your experimental setup or tools?`,
        hint: `Examines technical biases that could shape the hypothesis.`,
      },
      {
        question: `What would a hybrid of your original and a previous alternative hypothesis look like?`,
        hint: `Synthesizes elements of multiple hypotheses for richer insights.`,
      },
      {
        question: `What hypothesis would you write to try and find results that would definitively disprove your hypothesis?`,
        hint: `Clarifies the boundaries and falsifiability of the hypothesi`,
      },
      {
        question: `What hypothesis would you write to prove effects from H1 are due to feedback loops or interactions among variables?`,
        hint: `Explores dynamic systems and potential nonlinear effects.`,
      },
      {
        question: `What findings from other fields or disciplines could challenge your hypothesis? What is a hypothesis from those fields that could challenge H1?`,
        hint: `Encourages interdisciplinary thinking and broader perspectives.`,
      },
      {
        question: `What hypothesis could you write that demonstrates H1 is an effect of your biases?`,
        hint: `Expands exploration into new methodologies or data sources.`,
      },
      {
        question: `Write a hypothesis as if a core assumption of H1 is completely wrong.`,
        hint: `Promotes self-reflection to reduce confirmation bias.`,
      },
    ],
  }

  const getRandomQuestion = (round) => {
    const questions = probingQuestions[round] || []
    const randomIndex = Math.floor(Math.random() * questions.length)
    return questions[randomIndex]
  }

  useEffect(() => {
    if (messages.length === 0) {
      const firstQuestion = getRandomQuestion(currentRound)
      setMessages([
        {
          id: Date.now(),
          type: 'bot',
          content: firstQuestion.question,
        },
      ])
      setCurrentHint(firstQuestion.hint)
      onHintChange(firstQuestion.hint)
    }
  }, [])

  const handleInputChange = (e) => {
    setInput(e.target.value)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!input.trim()) return

    const userMessage = input.trim()
    const lastBotMessage = messages[messages.length - 1]?.content || ''

    // Store current values for API request
    let updatedQ1 = q1
    let updatedHyp1 = hyp1
    let updatedQ2 = q2
    let updatedHyp2 = hyp2

    // Update questions and hypotheses based on the current round
    if (currentRound === 1) {
      updatedQ1 = lastBotMessage
      updatedHyp1 = userMessage
      setQ1(lastBotMessage)
      setHyp1(userMessage)
    } else if (currentRound === 2) {
      updatedQ2 = lastBotMessage
      updatedHyp2 = userMessage
      setQ2(lastBotMessage)
      setHyp2(userMessage)
      setQ3('')
      setHyp3('')
    }

    const newMessages = [
      ...messages,
      { id: Date.now(), type: 'user', content: userMessage },
    ]

    if (currentRound < 2) {
      const nextQuestion = getRandomQuestion(currentRound + 1)
      newMessages.push({
        id: Date.now() + 1,
        type: 'bot',
        content: nextQuestion.question,
      })
      setCurrentHint(nextQuestion.hint)
      onHintChange(nextQuestion.hint)
    }

    setMessages(newMessages)
    setInput('')
    setSubmitCount((prev) => prev + 1)

    if (submitCount + 1 >= 2) {
      setIsInputDisabled(true)
    } else {
      setCurrentRound((prevRound) => prevRound + 1)
    }

    // Prepare the request body using the updated values
    const requestBody = {
      sessionID: sessionID,
      grpID: selectedGroup,
      userID: userID,
      q1: currentRound === 1 ? lastBotMessage : updatedQ1,
      hyp1: currentRound === 1 ? userMessage : updatedHyp1,
      q2: currentRound === 2 ? lastBotMessage : updatedQ2,
      hyp2: currentRound === 2 ? userMessage : updatedHyp2,
      q3: '',
      hyp3: '',
    }

    // Call the POST API
    try {
      logger.app.info('Sending request with body:', requestBody) // Add logging to debug
      const response = await fetch('/api/hypothesis', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(requestBody),
      })

      if (!response.ok) {
        throw new Error(`API error: ${response.statusText}`)
      }

      const data = await response.json()
      logger.app.info('API Response: after each submit', data)
    } catch (error) {
      logger.app.error('Error calling API:', error)
    }
  }

  const saveToPDF = () => {
    const content = document.querySelector('main')
    if (content) {
      html2canvas(content, { useCORS: true, scale: 2 }).then((canvas) => {
        const imgData = canvas.toDataURL('image/png')
        const pdf = new jsPDF()
        pdf.addImage(imgData, 'PNG', 0, 0, 210, 297)
        pdf.save('output.pdf')
      })
    }
  }

  const handleContinueClick = () => {
    router.push(
      `/Results?sessionID=${sessionID}&selectedGroup=${selectedGroup}`,
    ) // Navigate to the next page
  }

  return (
    <>
   <Box
        className="big-box"
        sx={{
          width: '80%',
          maxWidth: '1200px',
          height:isMobile? '1000px' : '500px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-start',
          alignItems: 'center',
          backgroundColor: '#f0f4f8',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
          overflow: 'hidden',
          marginTop:isMobile? '0px' : '-150px',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: isMobile ? 'column' : 'row',
            maxWidth: '2000px',
            gap: '30px',
          }}
        >
          <Box
            className="widget-messages"
            sx={{
              width: isMobile? '300px' : '600px',
              maxWidth: '850px',
              height: '300%',
              overflowY: 'auto',
              backgroundColor: '#f4eafc',
              padding: '8px',
              borderRadius: '4px',
              display: 'flex',
              flexDirection: 'column',
              borderRadius: '18px',
            }}
          >
            {messages.map((message) => (
              <Typography
                key={message.id}
                sx={{
                  backgroundColor:
                    message.type === 'user'
                      ? 'rgba(0, 163, 255, 0.4)'
                      : '#f1f5f9', // 40% opacity only for #00a3ff
                  padding: '8px',
                  borderRadius: '4px',
                  margin: '4px 0',
                }}
              >
                {message.content}
              </Typography>
            ))}
          </Box>

          <Box
            sx={{
              width: '100%',
              maxWidth: '500px',
              height: '80%',
              display: 'flex',
              flexDirection: 'column',
              marginTop: '8%',
              gap: '45px',
            }}
          >
            <Box
              className="widget-form-container"
              sx={{
                width: '70%',
                maxWidth: '400px',
                height: '50%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                padding: '16px',
              }}
            >
              <Box
                // className="blue-static-heading"
                style={{ marginTop: '-35px' }}
                className="styled-textarea"
                sx={{
                  width: '100%',
                  backgroundColor: '#f4eafc',
                  padding: '16px',
                  borderRadius: '4px',
                  border: '1px solid black',
                  boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)',
                }}
              >
                {/* <div className="textarea-container"> */}
                {/* <textarea
                        className="styled-textarea"
                        placeholder="Enter text"
                        onChange={(e) => logger.app.info(e.target.value)}
                    /> */}
                {/* </div> */}
                <Typography
                  variant="h6"
                  sx={{
                    color: 'black',
                    fontWeight: 'bold',
                    textAlign: 'center',
                  }}
                >
                  <b>Hypothesis: {hypothesisDesc}</b>
                </Typography>
              </Box>
            </Box>
            <Box
              className="widget-form-container"
              sx={{
                width: '70%',
                maxWidth: '400px',
                height: '50%',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-start',
                backgroundColor: '#f0f4f8',
                padding: '16px',
              }}
            >
              <form
                ref={formRef}
                onSubmit={handleSubmit}
                className="widget-form"
                style={{
                  width: '100%',
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  marginLeft: '20px',
                  gap: '8px',
                }}
              >
                <Textarea
                  // className="widget-textarea"
                  className="styled-textarea"
                  placeholder="Enter an alternative hypothesis..."
                  value={input}
                  onChange={handleInputChange}
                  onKeyDown={handleKeyDown}
                  disabled={isInputDisabled}
                  style={{
                    backgroundColor: '#f4eafc',
                    flexGrow: 1,
                    width: '100%',
                  }}
                />

                {/* <div className="textarea-container"> 
                    <textarea
                        className="styled-textarea"
                       style={{backgroundColor: '#f4eafc',
                        flexGrow: 1,
                        width: '100%',}} 
                        placeholder="Enter text"
                        onChange={(e) => logger.app.info(e.target.value)}
                    /> 
                    </div> */}
                {submitCount < 2 ? (
                  <>
                    {/* <Button
                      disabled={!input}
                      style={{
                        backgroundColor: input ? '#6e00ff' : '#4a4a4a',
                        textAlign: 'center',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        fontWeight: '600',
                        border: 'none',
                        color: '#fff',
                        cursor: input ? 'pointer' : 'not-allowed',
                        '&:hover': {
                          backgroundColor: input ? '#5700CA' : '#4a4a4a', // Change color only if enabled
                        },
                      }}
                    >
                      Submit
                    </Button>  */}

                    <Button
                      disabled={!input}
                      style={{
                        backgroundColor: input ? '#6F00FF' : '#AD9FFF',
                        textAlign: 'center',
                        padding: '10px 20px',
                        borderRadius: '5px',
                        fontWeight: '600',
                        border: 'none',
                        color: '#fff',
                        cursor: input ? 'pointer' : 'not-allowed',
                        transition: 'background-color 0.3s ease',
                      }}
                      onMouseOver={(e) => {
                        if (input)
                          e.currentTarget.style.backgroundColor = '#5700CA'
                      }}
                      onMouseOut={(e) => {
                        if (input)
                          e.currentTarget.style.backgroundColor = '#6F00FF'
                      }}
                    >
                      Submit
                    </Button>
                  </>
                ) : (
                  <Box sx={{ display: 'flex', gap: '10px' }}>
                    <Typography sx={{ textAlign: 'center', color: '#7d3c98' }}>
                      Redirecting to results...
                    </Typography>
                  </Box>
                )}
              </form>
            </Box>
          </Box>
        </Box>
        {/* <div className="textarea-container">
                    <textarea
                        className="styled-textarea"
                        placeholder="Enter text"
                        onChange={(e) => logger.app.info(e.target.value)}
                    />
                </div> */}
      </Box>
    </>
  )
}

function saveToPDF() {
  const content = document.querySelector('main') // Select the main container
  if (content) {
    // Temporarily expand the content to capture overflow
    const originalHeight = content.style.height
    const originalOverflow = content.style.overflow

    content.style.height = `${content.scrollHeight}px` // Set height to full scroll height
    content.style.overflow = 'visible' // Make overflow content visible

    html2canvas(content, {
      useCORS: true, // Allow cross-origin resources if needed
      scale: 2, // Increase resolution for better PDF quality
    }).then((canvas) => {
      const imgData = canvas.toDataURL('image/png')
      const pdf = new jsPDF('p', 'mm', 'a4')

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()

      const imgWidth = canvas.width
      const imgHeight = canvas.height
      const ratio = Math.min(pageWidth / imgWidth, pageHeight / imgHeight)
      const width = imgWidth * ratio
      const height = imgHeight * ratio

      let remainingHeight = imgHeight
      let yPosition = 0

      while (remainingHeight > 0) {
        pdf.addImage(
          imgData,
          'PNG',
          0,
          yPosition === 0 ? 0 : -yPosition,
          width,
          Math.min(height, pageHeight),
        )
        remainingHeight -= pageHeight
        yPosition += pageHeight
        if (remainingHeight > 0) {
          pdf.addPage()
        }
      }

      // Restore original styles
      content.style.height = originalHeight
      content.style.overflow = originalOverflow

      pdf.save('output.pdf')
    })
  }
}

function FetchSearchParams({
  setSessionID,
  setSelectedGroup,
  setUserId,
  setHypothesisDesc,
  setApiData,
}) {
  const searchParams = useSearchParams()

  useEffect(() => {
    const session = searchParams.get('sessionID')
    const group = searchParams.get('selectedGroup')
    const user = searchParams.get('userId')

    setSessionID(session)
    setSelectedGroup(group)
    setUserId(user)

    if (session && group && user) {
      const fetchData = async () => {
        try {
          const response = await fetch(
            `/api/hypothesis?sessionID=${session}&grpID=${group}&userID=${user}`,
          )
          if (!response.ok) {
            throw new Error(`API error: ${response.statusText}`)
          }
          const data = await response.json()
          setApiData(data)
          setHypothesisDesc(data.hypDesc)
        } catch (error) {
          logger.app.error('Error fetching data:', error)
        }
      }
      fetchData()
    }
  }, [
    searchParams,
    setApiData,
    setHypothesisDesc,
    setSelectedGroup,
    setSessionID,
    setUserId,
  ])

  return null
}

export default function Page() {
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
  const [hint, setHint] = useState('') // State to store the current hint
  const [hintVisible, setHintVisible] = useState(false) // State to track hint visibility
  const [currentHint, setCurrentHint] = useState('') // Track the current hint

  // these varaibles are received from the previous page
  const [sessionID, setSessionID] = useState('') // State to store the session ID
  const [selectedGroup, setSelectedGroup] = useState('') // State to store the selected group
  const [userId, setUserId] = useState('') // State to store the user ID
  const [hypothesisNumber, setHypothesisNumber] = useState(1) // State to store the hypothesis number
  const [hypothesisDesc, setHypothesisDesc] = useState('') // State to store the hypothesis description
  const [apiData, setApiData] = useState(null) // State to store the API data

  const router = useRouter() // Next.js router for navigation

  const handleHintChange = (newHint) => {
    setHint(newHint) // Update the hint when LLMPage provides it
  }

  const handleContinueClick = () => {
    router.push(
      `/Results?sessionID=${sessionID}&selectedGroup=${selectedGroup}`,
    ) // Navigate to the next page
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

  const handleHintClick = () => {
    if (hint) {
      setHintVisible(true) // Show the hint when the button is clicked

      // Hide the hint after 5 seconds
      setTimeout(() => {
        setHintVisible(false)
      }, 5000) // Adjust the time (5000ms = 5 seconds) as needed
    }
  }

  return (
    <>
      <Suspense>
        <FetchSearchParams
          setSessionID={setSessionID}
          setSelectedGroup={setSelectedGroup}
          setUserId={setUserId}
          setHypothesisDesc={setHypothesisDesc}
          setApiData={setApiData}
        />
      </Suspense>
      {/* {logger.app.info(hypothesisDesc, 'hypothesisDesc')} */}
      <Box>
        <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />

        <header
          className="flex flex-col items-center py-4 bg-gray-200 shadow"
          style={{ marginBottom: '1%' }}
        >
          <Header />
          <Typography
            variant="body1"
            component="h3"
            sx={{
              textWrap: 'balance',
              textAlign: 'center',
              padding: '5px',
              fontWeight: 600,
            }}
          >
            Work with our bot to build plausible alternative hypotheses.
            <br />
            After two rounds, submit your final alternative hypothesis to see
            what others wrote.
          </Typography>
        </header>
        <main>
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              minHeight: '100vh',
              backgroundColor: '#f9f9f9',
              padding: 2,
            }}
          >
            <LLMPage
              onHintChange={handleHintChange}
              hypothesisDesc={hypothesisDesc}
              sessionID={sessionID}
              selectedGroup={selectedGroup}
              userID={userId}
            />
            {/* <Box
              sx={{
                position: 'fixed',
                top: '50%',
                right: 0,
                transform: 'translateY(-50%)',
                width: '200px',
                backgroundColor: '#00a3ff',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                padding: '16px',
                boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
                textAlign: 'center',
              }}
            >
              <Button
                variant="contained"
                size="small"
                onClick={handleHintClick}
                style={{
                  width: '100%',
                  fontSize: '14px',
                  backgroundColor: '#f4eafc',
                  color: 'black',
                  '&:hover': {
                    backgroundColor: '#1d4ed8',
                  },
                  textAlign: 'center',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  fontWeight: '600',
                  border: 'none',
                }}
              >
                {hintVisible && hint ? hint : 'Probing Questions (HINT)'}
              </Button>
            </Box> */}
            <Box
              sx={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: 2, // Add spacing between the buttons
                padding: '16px',
                width: '100%', // Ensures it spans the width of the page
              }}
            >
              {/* Continue Button */}
              {/* <Button
                variant="contained"
                style={{
                  backgroundColor: 'black',
                  textAlign: 'center',
                  padding: '10px 20px',
                  borderRadius: '5px',
                  fontWeight: '600',
                  border: 'none',
                  color: '#fff',
                  '&:hover': {
                    backgroundColor: '#333',
                  },
                }}
                onClick={handleContinueClick}
              >
                Continue
              </Button>  */}
            </Box>
          </Box>
        </main>
      </Box>
    </>
  )
}

// 'use client'

// import { Textarea } from '../components/ui/textarea'
// import { useChat } from 'ai'
// import Image from 'next/image'
// import { useRouter, useSearchParams } from 'next/navigation'
// import { Button } from '../components/ui/button'
// import { Send } from 'lucide-react'
// import Message from '../components/Messages'
// import { useRef, useState, useEffect, Suspense } from 'react'
// import { Box, Grid, Typography } from '@mui/material'
// import { styled } from '@mui/material/styles'
// import html2canvas from 'html2canvas'
// import jsPDF from 'jspdf'
// import hints from '../../questions.json'
// import CustomModal from '../components/CustomModal'
// import Header from '../components/Header/Header'
// import CustomButton from '../components/Button/Button'

// const StyledTextarea = styled('textarea')(({ theme }) => ({
//   width: '100%',
//   height: '100px',
//   backgroundColor: '#00a3ff',
//   opacity: 0.4,
//   borderColor: '#d1d5db',
//   borderRadius: '8px',
//   padding: '16px',
//   resize: 'both',
//   overflow: 'auto',
//   fontSize: '16px',
//   fontFamily: 'inherit',
//   outline: 'none',
//   border: '1px solid #d1d5db',
//   '&:focus': {
//     borderColor: theme.palette.primary.main,
//   },
// }))

// const LLMPage = ({ onHintChange, hypothesisDesc, sessionID, selectedGroup, userID }) => {
//   const [messages, setMessages] = useState([])
//   const [input, setInput] = useState('')
//   const formRef = useRef(null)
//   const [isInputDisabled, setIsInputDisabled] = useState(false)
//   const router = useRouter()

//   useEffect(() => {
//     if (messages.length === 0) {
//       setMessages([{ id: Date.now(), type: 'bot', content: 'Welcome! Please enter your hypothesis.' }])
//     }
//   }, [])

//   return (
//     <Box
//       sx={{
//         width: '100%',
//         maxWidth: '600px',
//         padding: '16px',
//         borderRadius: '8px',
//         boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)',
//         display: 'flex',
//         flexDirection: 'column',
//         backgroundColor: '#f0f4f8',
//       }}
//     >
//       <Box sx={{ overflowY: 'auto', maxHeight: '300px', padding: '8px', backgroundColor: '#f4eafc' }}>
//         {messages.map((message) => (
//           <Typography
//             key={message.id}
//             sx={{
//               backgroundColor: message.type === 'user' ? 'rgba(0, 163, 255, 0.4)' : '#f1f5f9',
//               padding: '8px',
//               borderRadius: '4px',
//               margin: '4px 0',
//             }}
//           >
//             {message.content}
//           </Typography>
//         ))}
//       </Box>
//       <Box sx={{ display: 'flex', flexDirection: 'column', gap: '8px', mt: 2 }}>
//         <Textarea
//           placeholder='Enter an alternative hypothesis...'
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           disabled={isInputDisabled}
//           style={{ backgroundColor: '#f4eafc' }}
//         />
//         <Button disabled={!input} style={{ backgroundColor: '#6F00FF', color: '#fff' }}>Submit</Button>
//       </Box>
//     </Box>
//   )
// }

// export default function Page() {
//   return (
//     <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '100vh', backgroundColor: '#f9f9f9', padding: 2 }}>
//       <Header />
//       <LLMPage />
//     </Box>
//   )
// }
