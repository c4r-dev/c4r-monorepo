// 'use client'

// import * as React from 'react'
// import Box from '@mui/material/Box'
// import Grid from '@mui/material/Grid'
// import { useRouter } from 'next/navigation'
// import useMediaQuery from '@mui/material/useMediaQuery'
// import { useTheme } from '@mui/material/styles'

// export default function Home() {
//   const router = useRouter()
//   const theme = useTheme()
//   const isMobile = useMediaQuery(theme.breakpoints.down('sm')) // Detect if screen is small (like iPhone 12)

//   const handleActivity = (e) => {
//     e.preventDefault()
//     router.push('/showQRCode')
//   }

//   return (
//     <Box
//       sx={{
//         width: isMobile ? '100%' : '1200px',  // Ensure full width on mobile
//         maxWidth: '100%',  // Prevent exceeding the viewport width
//         height: isMobile ? 'auto' : '500px',  // Adjust height based on device
//         backgroundColor: 'lightgrey',
//         boxShadow: 3,
//         borderRadius: 2,
//         margin: isMobile ? '10px auto' : '30px auto',  // Center the box and reduce margins on mobile
//         padding: isMobile ? '10px' : '20px', // Add padding for mobile
//         overflowX: 'hidden',  // Prevent horizontal overflow
//       }}
//     >
//       <Grid
//         container
//         direction="column"
//         sx={{ display: 'flex' }}
//         margin={isMobile ? 0 : 2}  // Adjust margin for mobile
//       >
//         <Grid item xs={12}>
//           <h1 style={{ fontSize: isMobile ? '1.5rem' : '2rem', margin: 0 }}>
//             How do we know it is real?
//           </h1>
//         </Grid>
//         <Grid item xs={12}>
//           <h2 style={{ fontSize: isMobile ? '1.2rem' : '1.5rem', margin: 0 }}>
//             A treatment effect is exciting! But how do we know it is real?
//           </h2>
//         </Grid>
//       </Grid>
//       <Grid
//         container
//         sx={{
//           flexDirection: 'row-reverse',
//           display: 'flex',
//           alignItems: 'flex-end',
//         }}
//         margin={isMobile ? 0 : 2}  // Adjust margin for mobile
//       >
//         <Grid item xs={12} sm={4}>
//           <button
//             onClick={handleActivity}
//             style={{
//               width: isMobile ? '100%' : 'auto',  // Make button responsive
//               padding: isMobile ? '10px' : '15px',
//               marginTop: isMobile ? '20px' : '0px',  // Adjust margin for spacing on mobile
//             }}
//           >
//             Start Activity
//           </button>
//         </Grid>
//       </Grid>
//     </Box>
//   )
// }


'use client'

import React, { useState } from 'react'
import { useQRCode } from 'next-qrcode'
import Link from 'next/link'

export default function ShowQRCode() {
  const [groupId, setGroupId] = useState(
    Math.random().toString(36).substr(2, 9)
  )

  const [uniqueLink, setUniqueLink] = useState(generateUniqueLink())
  const [uniqueInstructorLink, setUniqueInstructorLink] = useState(generateUniqueInstructorLink)

  function generateUniqueLink() {
    return `https://smi-ran-why-ran-v2.vercel.app/RandomizeActivityVariables?selectedGroup=${groupId}`
  }
  function generateUniqueInstructorLink() {
    return `https://smi-ran-why-ran-v2.vercel.app/discussion?selectedGroup=${groupId}`
  }

  const copyLink1 = () => {
    const newLink = generateUniqueLink()
    setUniqueLink(newLink)
    navigator.clipboard.writeText(newLink)
    alert('Copied to clipboard: ' + newLink)
  }

  const copyLink2 = () => {
    const newLink = generateUniqueInstructorLink()
    setUniqueInstructorLink(newLink)
    navigator.clipboard.writeText(newLink)
    alert('Copied to clipboard: ' + newLink)
  }

  function UseQRCode() {
    const { SVG } = useQRCode()
    return (
      <SVG
        text={`https://smi-ran-why-ran-v2.vercel.app/RandomizeActivityVariables?selectedGroup=${groupId}`}
        options={{
          margin: 2,
          width: 200,
          color: {
            dark: '#000000FF',
            light: '#FFFFFFFF',
          },
        }}
      />
    )
  }

  const handleContinue = async (e) => {
    fetch('https://smi-ran-why-ran-v2.vercel.app/api/groups', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        grp_id: groupId,
      }),
    })
      .then((response) => {
        // console.log(response)
        response.json()
      })
      .then((data) => console.log(data))
      .catch((error) => console.error('Error:', error))
  }

  return (
    <div className="outer-container">
      <div className="container qr-code-page">
        <div className="header-container">
          <h1>Join the group exploring the data</h1>
          <h3 className="qr-code-text-heading">A) As an Instructor</h3>
        </div>
        <div></div>
        <br />
        <div className="link-container">
          <div className="qr-code-container">{UseQRCode()}</div>
          <div className="or-container">
            <h1>OR</h1>
          </div>
          <div className="copy-link-container">
            <div className="copy-link-box">
              <a target="_blank" href={uniqueInstructorLink}>
                {uniqueInstructorLink}
              </a>
            </div>
            <button className="copy-link-button" onClick={copyLink2}>
              Copy Link
            </button>
          </div>
        </div>
        <br />
        <div className="discussion-lead-container"><b>Instructor</b></div>

        <div className="button-row">
          <Link href="/">
            <button className="cancel-button">Cancel</button>
          </Link>
          <Link href={`/discussion?selectedGroup=${groupId}`}>
            <button onClick={handleContinue}>Continue</button>
          </Link>
        </div>
      </div>
      <h3 style={{ margin: '8px' }}>OR</h3>

      <div className="container qr-code-page">
        <div className="header-container">
          {/* <h1>Join the group exploring the data</h1> */}
          <h3 className='qr-code-text-heading'>B) As a Participant</h3>
        </div>
        <div></div>
        <br />
        <div className="link-container">
          <div className="qr-code-container">{UseQRCode()}</div>
          <div className="or-container">
            <h1>OR</h1>
          </div>
          <div className="copy-link-container">
            <div className="copy-link-box">
              <a target="_blank" href={uniqueLink}>
                {uniqueLink}
              </a>
            </div>
            <button className="copy-link-button" onClick={copyLink1}>
              Copy Link
            </button>
          </div>
        </div>
        <br />
        <div className="discussion-lead-container"><b>Participant</b></div>
        <div className="button-row">
        {/* <div>Participant</div> */}
          <Link href="/">
            <button className="cancel-button">Cancel</button>
          </Link>
          <Link href={`RandomizeActivityVariables/?selectedGroup=${groupId}`}>
            <button onClick={handleContinue}>Continue</button>
          </Link>
        </div>
      </div>
    </div>
  )
}