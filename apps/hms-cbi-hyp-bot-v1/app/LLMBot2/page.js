const logger = require('../../../../packages/logging/logger.js');
'use client'

import { Textarea } from '../components/ui/textarea'
import { useRouter } from 'next/navigation' // Import the router for navigation

import { useChat } from 'ai/react'
import Image from 'next/image'

import { Button } from '../components/ui/button'
import { Send } from 'lucide-react'
import Message from '../components/Messages'
import { useRef, useState, useEffect } from 'react'
import { Box, Grid, Typography } from '@mui/material'
import { styled } from '@mui/material/styles'
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import hints from '../../questions.json'
import CustomModal from '../components/CustomModal'

const StyledTextarea = styled('textarea')(({ theme }) => ({
  width: '200px',
  height: '100px',
  backgroundColor: '#dbeafe',
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


// function LLMPage() {
//   const [messages, setMessages] = useState([]) // Store messages
//   const [input, setInput] = useState('') // Track user input
//   const formRef = useRef(null)
//   const [questionIndex, setQuestionIndex] = useState(0) // Track the current question index

//   // List of probing questions
//   const probingQuestions = [
//     `Is there another plausible reason for the outcome other than your hypothesized cause? What is it? Can you design your study to test for this other cause?`,
//     `If your current hypothesis turns out to be incorrect, what might be another plausible explanation, and what evidence would support it?`,
//     `What factors could contribute to the observed effect, and how would you design experiments to test each factor?`,
//     `What are some hypotheses that directly contradict your initial assumptions, and why might they still be worth exploring?`,
//     `What specific evidence would disprove your hypothesis; could you design a study to collect that evidence?`,
//     `Which results or observations have you been inclined to dismiss or downplay, and why?`,
//     `How would you design an experiment that directly challenges your favored hypothesis rather than supports it?`,
//     `If someone with an opposite perspective reviewed your hypothesis, what kinds of criticisms or alternative explanations might they suggest, and how would you address them?`,
//     `What tools, methods, and resources do you currently have to test this hypothesis, and what additional ones might you need?`,
//     `What specific technical or ethical limitations could you encounter when testing your hypothesis, and how might you address them?`,
//     `If parts of your hypothesis are untestable, what alternative approaches or adjustments could you make to ensure progress?`,
//     `What specific predictions does your hypothesis make, and how will you test these predictions?`,
//     `Are these predictions measurable? What methods will you use to ensure accurate measurement?`,
//     `What steps would someone else need to independently replicate your test for this hypothesis?`,
//     `How could you rephrase your hypothesis to remove any ambiguity and make it as clear and concise as possible?`,
//     `What is your null hypothesis, and how does it differ from your primary hypothesis in terms of predictions?`,
//     `What would it mean for your research and future experiments if the null hypothesis were true?`,
//     `How would you interpret results that seem to support the null hypothesis, and what follow-up experiments might you design?`,
//     `In what ways does your hypothesis align with, challenge, or expand existing theories in neuroscience?`,
//     `What prior studies or models provide support for your hypothesis, and what findings challenge it?`,
//     `If your hypothesis is supported, what broader implications might it have for the field of neuroscience or related areas?`,
//     `Was this hypothesis generated before you collected data, or was it shaped by patterns you observed in your results? How might that influence its validity?`,
//     `If this hypothesis was based on data patterns, how will you ensure it is not overly tailored or biased by those specific observations?`,
//     `What theory or mechanism underpins this hypothesis, and how does it guide your experimental approach?`,
//     `Besides the outcome you expect, what other potential outcomes might arise from your experiment, and how would you interpret each one?`,
//     `What would each possible outcome suggest about your hypothesis, the null hypothesis, or alternative explanations?`,
//     `If the results are ambiguous or fall between supporting and rejecting your hypothesis, how would you approach interpreting and addressing them?`,
//     `How has your initial idea influenced the way you've developed this hypothesis, and what steps could you take to ensure greater objectivity?`,
//     `If you had to completely start over without any preconceptions, how might you reformulate your hypothesis?`,
//     `Can you describe a scenario in which your initial hypothesis could lead to misleading conclusions, and how would you guard against this?`,
//     `What do you consider to be the weakest points of your hypothesis, and what steps could you take to address them?`,
//     `If you presented this hypothesis at a conference, what specific questions or criticisms would you anticipate, and how would you respond?`,
//     `How would you respond to someone who doubts the validity or feasibility of your hypothesis, and what evidence or reasoning would you use to persuade them?`,
//     `What key factors or evidence should be explored for this hypothesis?`,
//     `Are there alternative explanations worth considering?`,
//   ]

//   useEffect(() => {
//     const reminderInterval = setInterval(() => {
//       if (!input.trim()) {
//         setMessages((prevMessages) => [
//           ...prevMessages,
//           {
//             id: Date.now(),
//             type: 'bot',
//             content: 'Waiting for your hypothesis....',
//           },
//         ])
//       }
//     }, 60000) // Reminder every 1 minute

//     return () => clearInterval(reminderInterval) // Cleanup interval on unmount
//   }, [input])

//   // Handle input change
//   const handleInputChange = (e) => {
//     setInput(e.target.value)
//   }

//   // Handle form submission
//   const handleSubmit = (e) => {
//     e.preventDefault()

//     if (!input.trim()) return // Prevent empty submissions

//     const userMessage = input.trim()

//     // Add user message to the chat
//     const newMessages = [
//       ...messages,
//       { id: Date.now(), type: 'user', content: userMessage },
//     ]

//     // Get the next probing question from the list
//     const nextQuestion = `Use this question to generate an alternative hypothesis - "${probingQuestions[questionIndex]}"`

//     // Add the bot's response to the chat
//     if (nextQuestion) {
//       newMessages.push({
//         id: Date.now() + 1,
//         type: 'bot',
//         content: nextQuestion,
//       })
//     }

//     // Increment the question index (loop back to the start if at the end)
//     setQuestionIndex((prevIndex) => (prevIndex + 1) % probingQuestions.length)

//     setMessages(newMessages)
//     setInput('') // Clear input
//   }

//   function handleKeyDown(e) {
//     if (e.key === 'Enter' && !e.shiftKey) {
//       e.preventDefault()
//       formRef.current?.requestSubmit()
//     }
//   }

//   return (
//     <>
//       {/* <Box
//         className="big-box"
//         sx={{
//           width: '80%', // Adjust as needed for the overall width
//           maxWidth: '1200px', // Limit the maximum width
//           height: '500px', // Adjust the height as needed
//           margin: '0 auto', // Center horizontally
//           display: 'flex',
//           marginTop: '-60px',
//           gap: '-600px',
//           flexDirection: 'row', // Layout messages and form side-by-side
//           justifyContent: 'space-between', // Space between messages and form
//           alignItems: 'center', // Center vertically
//           backgroundColor: '#f0f4f8', // Background for the big box
//           borderRadius: '8px', // Rounded corners
//           padding: '16px', // Padding inside the big box
//           // alignItems: 'stretch',
//           boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)', // Optional: Add a shadow
//           overflow: 'hidden', // Ensure no overflow
//         //   marginTop:'-55px'
//         }}
//       >  */}

//       <Box
//         className="big-box"
//         sx={{
//           width: '80%', // Adjust as needed for the overall width
//           maxWidth: '1200px', // Limit the maximum width
//           height: '500px', // Adjust the height as needed
//         //   margin: '0 auto', // Center horizontally
//           display: 'flex',
//           flexDirection: 'column', // Stack heading and content vertically
//           justifyContent: 'flex-start', // Ensure heading stays at the top
//           alignItems: 'center', // Center align everything horizontally
//           backgroundColor: '#f0f4f8', // Background for the big box
//           borderRadius: '8px', // Rounded corners
//           padding: '16px', // Padding inside the big box
//           boxShadow: '0px 4px 16px rgba(0, 0, 0, 0.2)', // Optional: Add a shadow
//           overflow: 'hidden', // Ensure no overflow
//         marginTop:'-75px'

//         }}
//       >
//         {/* Centered Heading */}
//         <Box
//           className="big-box-heading"
//           sx={{
//             width: '100%', // Occupy full width of the big-box
//             textAlign: 'center', // Center-align text inside this box
//             marginBottom: '16px', // Add spacing below the heading
//           }}
//         >
//           <Typography
//             variant="h5"
//             sx={{
//               fontWeight: 'bold',
//               color: '#1e3a8a', // Dark blue color
//             }}
//           >
//             LLM Chat Section
//           </Typography>
//         </Box>

//         <Box sx={{ display: 'flex', flexDirection: 'row', maxWidth:'2000px', gap:'30px' }}>
//           {/* Messages Section */}
//           <Box
//             className="widget-messages"
//             sx={{
//               width: '600px', // Half of the big box
//               maxWidth: '850px',
//               height: '300%', // Constrain height relative to the big box
//               overflowY: 'auto', // Enable scrolling for overflow content
//               backgroundColor: '#f8fafc', // Background for messages
//               padding: '8px',
//               borderRadius: '4px',
//               display: 'flex',
//               flexDirection: 'column',
//             }}
//           >
//             {messages.map((message) => (
//               <Typography
//                 key={message.id}
//                 sx={{
//                   backgroundColor:
//                     message.type === 'user' ? '#dbeafe' : '#f1f5f9',
//                   padding: '8px',
//                   borderRadius: '4px',
//                   margin: '4px 0',
//                 }}
//               >
//                 {message.content}
//               </Typography>
//             ))}
//           </Box>

//           {/* Form Section */}
//           <Box
//             sx={{
//               width: '100%', // Half of the big box
//               maxWidth: '500px',
//               height: '80%', // Constrain height relative to the big box
//               display: 'flex',
//               flexDirection: 'column',
//               marginTop: '8%',
//               gap:"45px"
//             }}
//           >
//             <Box
//               className="widget-form-container"
//               sx={{
//                 width: '70%', // Half of the big box
//                 maxWidth: '400px',
//                 height: '50%', // Constrain height relative to the big box
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center', // Center form vertically
//                 alignItems: 'flex-start', // Align form content to the left
//                 // backgroundColor: '#ffffff', // Background for the form
//                 padding: '16px',
//                 // borderRadius: '4px',
//                 // boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for form
//               }}
//             >
//               <Box
//                 className="blue-static-heading"
//                 style={{ marginTop: '-35px' }}
//                 sx={{
//                   width: '100%',
//                   backgroundColor: '#dbeafe', // Blue background
//                   padding: '16px',
//                   borderRadius: '4px',
//                   boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Optional shadow
//                 }}
//               >
//                 <Typography
//                   variant="h6"
//                   sx={{
//                     color: 'black', // Dark blue text
//                     fontWeight: 'bold',
//                     textAlign: 'center',
//                   }}
//                 >
//                   <b> Hypothesis: Increased serotonin reduces depression</b>
//                 </Typography>
//               </Box>
//             </Box>
//             <Box
//               className="widget-form-container"
//               sx={{
//                 width: '70%', // Half of the big box
//                 maxWidth: '400px',
//                 height: '50%', // Constrain height relative to the big box
//                 display: 'flex',
//                 flexDirection: 'column',
//                 justifyContent: 'center', // Center form vertically
//                 alignItems: 'flex-start', // Align form content to the left
//                 backgroundColor: '#f0f4f8', // Background for the form
//                 padding: '16px',
//                 //   borderRadius: '4px',
//                 //   boxShadow: '0px 2px 8px rgba(0, 0, 0, 0.1)', // Optional shadow for form
//               }}
//             >
//               <form
//                 ref={formRef}
//                 onSubmit={handleSubmit}
//                 className="widget-form"
//                 style={{
//                   width: '100%',
//                   height: '100%',
//                   display: 'flex',
//                   flexDirection: 'column',
//                   marginLeft: '20px',
//                   gap: '8px',
//                 }}
//               >
//                 <Textarea
//                   className="widget-textarea"
//                   placeholder="Enter your hypothesis here to get probing questions..."
//                   value={input}
//                   onChange={handleInputChange}
//                   onKeyDown={handleKeyDown}
//                   style={{
//                     flexGrow: 1, // Allow the textarea to expand vertically
//                     width: '100%',
//                   }}
//                 />
//                 <Button disabled={!input} className="widget-button">
//                   Submit{' '}
//                 </Button>
//               </form>
//             </Box>
//           </Box>
//         </Box>
//       </Box>
//     </>
//   )
// }

function LLMPage() {
  const [messages, setMessages] = useState([]); // Store messages
  const [input, setInput] = useState(''); // Track user input
  const formRef = useRef(null);
  const [currentRound, setCurrentRound] = useState(1); // Track the current round
  const [isInputDisabled, setIsInputDisabled] = useState(false); // Disable input after round 3

  // Arrays of probing questions for each round
  const probingQuestionsRound1 = [
    `Is there another plausible reason for the outcome other than your hypothesized cause? What is it?`,
    `Can you design your study to test for this other cause?`,
    `What factors could contribute to the observed effect, and how would you test each factor?`,
  ];

  const probingQuestionsRound2 = [
    `What specific predictions does your hypothesis make, and how will you test these predictions?`,
    `How could you rephrase your hypothesis to remove any ambiguity and make it as clear and concise as possible?`,
    `What specific technical or ethical limitations could you encounter when testing your hypothesis, and how might you address them?`,
  ];

  const probingQuestionsRound3 = [
    `If you had to completely start over without any preconceptions, how might you reformulate your hypothesis?`,
    `What do you consider to be the weakest points of your hypothesis, and what steps could you take to address them?`,
    `If you presented this hypothesis at a conference, what specific questions or criticisms would you anticipate, and how would you respond?`,
  ];

  // Helper function to get a random question from the current round
  const getRandomQuestion = (round) => {
    const questions =
      round === 1
        ? probingQuestionsRound1
        : round === 2
        ? probingQuestionsRound2
        : probingQuestionsRound3;

    const randomIndex = Math.floor(Math.random() * questions.length);
    return questions[randomIndex];
  };

  // Handle input change
  const handleInputChange = (e) => {
    setInput(e.target.value);
  };

  // Handle form submission
  const handleSubmit = (e) => {
    e.preventDefault();

    if (!input.trim()) return; // Prevent empty submissions

    const userMessage = input.trim();

    // Add the user's hypothesis to the chat
    const newMessages = [
      ...messages,
      { id: Date.now(), type: 'user', content: userMessage },
    ];

    // Get a random probing question based on the current round
    const nextQuestion = getRandomQuestion(currentRound);

    // Add the chatbot's response to the chat
    newMessages.push({
      id: Date.now() + 1,
      type: 'bot',
      content: nextQuestion,
    });

    setMessages(newMessages); // Update the chat
    setInput(''); // Clear input

    // Handle round progression
    if (currentRound === 3) {
      setIsInputDisabled(true); // Disable the input box after round 3
    } else {
      setCurrentRound((prevRound) => prevRound + 1); // Move to the next round
    }
  };

  function handleKeyDown(e) {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      formRef.current?.requestSubmit();
    }
  }

  return (
    <Box
      className="widget-container"
      sx={{
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        marginTop: '-130px',
        width: '400px', // Fixed width
        height: '350px', // Fixed height
      }}
    >
      <Typography variant="h6" component="div" className="widget-header">
        LLM Chatbot
      </Typography>
      <Box className="widget-messages" sx={{ width: '100%', maxWidth: 400, overflowY: 'auto', height: '200px' }}>
        {messages.map((message) => (
          <Typography
            key={message.id}
            sx={{
              backgroundColor: message.type === 'user' ? '#dbeafe' : '#f1f5f9',
              padding: '8px',
              borderRadius: '4px',
              margin: '4px 0',
            }}
          >
            {message.content}
          </Typography>
        ))}
      </Box>
      <form
        ref={formRef}
        onSubmit={handleSubmit}
        className="widget-form"
        style={{ width: '100%', maxWidth: 400 }}
      >
        <Textarea
          className="widget-textarea"
          placeholder="Enter an alternative hypothesis..."
          value={input}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          disabled={isInputDisabled} // Disable the input box after round 3
        />
        <Button
          type="submit"
          size="icon"
          disabled={!input || isInputDisabled} // Disable the button after round 3 or if input is empty
          className="widget-button"
        >
          Submit
        </Button>
      </form>
    </Box>
  );
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
  


export default function Page() {
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)

  const router = useRouter() // Next.js router for navigation

  const [hintIndex, setHintIndex] = useState(0)
  const [currentHint, setCurrentHint] = useState('')

  const handleHintClick = () => {
    setCurrentHint(hints[hintIndex]) // Display the current hint
    setHintIndex((prevIndex) => (prevIndex + 1) % hints.length) // Move to the next hint, looping back to the start if at the end

    // Clear the hint after 5 seconds
    setTimeout(() => {
      setCurrentHint('')
    }, 2000)
  }

  const handleContinueClick = () => {
    router.push('/Results') // Navigate to the next page
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

  return (
    <Box>
      <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />
      <header className="flex flex-col items-center py-4 bg-gray-200 shadow">
        <Typography
          variant="h4"
          component="h1"
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: 1, // Add space between the logo and text
            marginBottom: 1,
          }}
        >
          <Image
            style={{ marginRight: '2%' }}
            src="/logo-sideways.svg"
            alt="Icon"
            width={24}
            height={24}
            onClick={handleGuideBtn}
          />
          <b>Alternative Hypothesis Bot</b>
        </Typography>

        <Typography
          variant="h6"
          component="h2"
          sx={{ textAlign: 'center', marginBottom: 1 }}
        >
          Hypothesis: Increased serotonin reduces depression
        </Typography>
        <Typography variant="body1" component="h3" sx={{ textAlign: 'center' }}>
          View the questions below to help you develop an alternative
          hypothesis! <br />
          You’re working toward building a plausible alternative hypothesis to
          discuss at the end of this activity. Hit ‘Enter’ to get more
          thoughtful questions. <br />
          As you draft in the “notes” box provided, you can copy-paste your
          updated hypothesis into the bot to receive yet more questions to guide
          your revisions. Move the question-and-development process at least 3
          times.
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
            marginTop: '-35px',
          }}
        >
          <LLMPage />
          <Button
            variant="contained"
            style={{ marginTop: '50px' }}
            onClick={saveToPDF}
          >
            Export to PDF
          </Button>

          {/* Add the hint box */}
          {/* Hint Box */}
          <Box
            sx={{
              position: 'fixed',
              top: '50%',
              right: 0,
              transform: 'translateY(-50%)',
              width: '200px',
              backgroundColor: '#dbeafe',
              border: '1px solid #d1d5db',
              borderRadius: '8px',
              padding: '16px',
              boxShadow: '0px 4px 6px rgba(0, 0, 0, 0.1)',
              textAlign: 'center',
            }}
          >
            {currentHint && (
              <Typography
                variant="body2"
                sx={{
                  marginBottom: 2,
                  fontSize: '14px',
                  color: '#333',
                }}
              >
                {currentHint}
              </Typography>
            )}
            <Button
              variant="contained"
              size="small"
              onClick={handleHintClick}
              sx={{
                width: '100%',
                fontSize: '14px',
                backgroundColor: '#2563eb',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#1d4ed8',
                },
              }}
            >
              Probing Questions (HINT)
            </Button>
          </Box>
          <Box
            sx={{
              display: 'flex',
              justifyContent: 'flex-end',
              gap: 2, // Add spacing between the buttons
              padding: '16px',
              width: '100%', // Ensures it spans the width of the page
            }}
          >
            {/* Guide Button */}
            <Button
              variant="outlined"
              color="secondary"
              sx={{
                paddingX: 4,
                paddingY: 0,
                borderRadius: 2,
                fontWeight: 'bold',
                backgroundColor: '#5801d0',
                color: 'white',
                //  width: isMobile ? '100%' : 'auto', // Full width for mobile
                textAlign: 'center', // Align button text to the left,
                marginTop:"-30px"
              }}
              onClick={handleGuideBtn}
            >
              Guide
            </Button>

            {/* Continue Button */}
            <Button
              variant="contained"
              sx={{
                backgroundColor: '#000',
                color: '#fff',
                '&:hover': {
                  backgroundColor: '#333',
                },
              }}
              onClick={handleContinueClick}
            >
              Continue
            </Button>
          </Box>
        </Box>
      </main>
    </Box>
  )
}
