'use client'
import { useEffect, useState, Suspense } from 'react'

import { Container, CssBaseline, Typography, Box } from '@mui/material'
import Image from 'next/image'
import Head from 'next/head'
import CustomModal from '../app/components/CustomModal'
import { useRouter, useSearchParams } from 'next/navigation'
import Script from 'next/script';


export default function RootLayout({ children }) {
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(true)
  const [sessionID, setSessionID] = useState(null)
  const [hypothesisNumber, setHypothesisNumber] = useState(null)
  const hypotheses = [
    'DAILY ACTIVITIES INFLUENCE STUDENT OUTCOMES',
    'DAILY ACTIVITIES DO NOT INFLUENCE STUDENT OUTCOMES',
  ]
  const router = useRouter()

  function UseValues() {
    const searchParams = useSearchParams()

    useEffect(() => {
      // Check if sessionID exists in the query parameters
      const sessionIDFromQuery = searchParams.get('sessionID')
      const hypothesisNumberFromQuery = searchParams.get('hypothesisNumber')

      // Only set sessionID and hypothesis if they exist in URL (don't generate new ones)
      if (sessionIDFromQuery && hypothesisNumberFromQuery) {
        setSessionID(sessionIDFromQuery)
        setHypothesisNumber(hypothesisNumberFromQuery)
      }
    }, [searchParams])

    return null
  }

  // function UseValues() {
  //   const searchParams = useSearchParams();

  //   // Use useEffect to update state once after the initial render
  //   useEffect(() => {
  //     setHypothesisNumber(searchParams.get('hypothesisNumber'));
  //     setSessionID(searchParams.get('sessionID'));
  //   }, [searchParams]); // Dependency array to re-run if searchParams changes

  //   return null; // Return null since this component is only used for setting values
  // }

  useEffect(() => {
    document.title = 'Garden'
  }, [])

  const closeModal = () => {
    setIsGuideModalVisible(false)
  }

  const openModal = () => {
    setIsGuideModalVisible(true)
  }

  const handleGuideBtn = () => {
    console.log('Guide button clicked')
    openModal(true)
  }
  return (
    <html lang="en">
      <body>
        <Suspense>
          <UseValues />
        </Suspense>
        {/* <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} hypothesis={hypothesisNumber === "1" ? "Hypothesis : Tornadoes are more destructive over time because of climate change" : "Hypothesis : Tornadoes are less destructive over time because of better warning systems and building codes"} /> */}
        <CssBaseline />
        <Container maxWidth="md">
          <Box my={4} textAlign="center">
            <Box position="absolute" top={40} left={260}>
              {/* <IconButton size="small">
                <StarIcon fontSize="small" />
              </IconButton> */}
              {/* <Image src="/logo-sideways.svg" alt="Icon" width={24} height={24} onClick={handleGuideBtn} /> */}
              <Image
                src="/01_RR_Large.png"
                alt="Icon"
                width={24}
                height={24}
                onClick={handleGuideBtn}
              />

              {/* <img src="/icon.svg" alt="Icon" width="24" height="24" /> */}
            </Box>
            <Typography variant="h4" component="h1" gutterBottom>
              {/* Garden of Forking Paths */}
              Do daily activities affect student outcomes?
            </Typography>
            <Typography>
              <b>Test the hypothesis</b>
            </Typography>
            <Typography
              variant="body2"
              color="textSecondary"
              mb={2}
              style={{ width: '100%', fontSize: '1.17rem' }}
            >
              {/* <Box
                component="span" // Ensures semantic correctness
                sx={{
                  display: 'inline-block',
                  backgroundColor: '#f57c00', // Matches the orange background
                  color: 'black', // Text color
                  padding: '8px 12px', // Padding inside the box
                  borderRadius: '8px', // Rounded corners
                  fontWeight: 'bold', // Bold text
                }}
              >
                {hypotheses[hypothesisNumber - 1]}
              </Box> */}

              <Box
                component="span" // Ensures semantic correctness
                sx={{
                  display: 'inline-block',
                  backgroundColor:
                    hypothesisNumber - 1 === 0 ? "rgba(255, 90, 0, 0.4)" :  "rgba(24, 89, 215, 0.4)", // Dynamically set background color
                  color: 'black', // Text color
                  padding: '8px 12px', // Padding inside the box
                  borderRadius: '8px', // Rounded corners
                  fontWeight: 'bold', // Bold text
                }}
              >
                {hypotheses[hypothesisNumber - 1]}
              </Box>
              <br />
            </Typography>
            {/* <Typography variant="body2">
              <br />
              {hypothesisNumber === "1" ? (
                <>
                  <b>Hypothesis :</b> Tornadoes are more destructive over time because of climate change
                </>
              ) : (
                <>
                  <b>Hypothesis :</b> Tornadoes are less destructive over time because of better warning systems and building codes
                </>
              )}
            </Typography> */}
          </Box>
          {/* Google Analytics Script */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-JZ9K16T016"
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-JZ9K16T016');
              `,
            }}
          />
          {children}
        </Container>
      </body>
    </html>
  )
}
