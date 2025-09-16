import React, { useState } from 'react'
import Image from 'next/image'
import Box from '@mui/material/Box'
import Header from './Header'
import logo from '../assets/logo-sideways.svg'
import CustomModal from './CustomModal'

function ChartGameBox({
  children,
  isControlVariables = false,
  isRelationship= false,
  oneLineText = '',
  isHeader = true,
  isActivityVariables = false,
  isActivityUsers = false,
  isMobile = false,
}) {
  const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)

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
    <Box
    sx={{
      position: 'relative', // Make the white box a positioning context
      width: isMobile ? 400 : 1300,
      height: isMobile ? 'auto' : 1000,
      backgroundColor: 'white',
      boxShadow: 3,
      borderRadius: 2,
      margin: '10px',
      marginLeft: isMobile? '20px' : '0px',
    }}
  >
    {/* Logo always in the top-left corner */}
    <Box
      sx={{
        position: 'absolute', // Position relative to the white box
        top: '0px', // Distance from the top of the white box
        left: '10px', // Distance from the left of the white box
        zIndex: 100, // Ensure it stays above other elements
        cursor: 'pointer', // Indicate it's clickable
      }}
      onClick={handleGuideBtn} // Handle click
    >
      <Image
        src={logo} // Logo file
        alt="Logo"
        width={isMobile ? 30 : 40} // Adjust size for mobile and desktop
        height={isMobile ? 30 : 50}
      />
    </Box>
  
    {/* Modal for Guide */}
    <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />
  
    {/* Optional Header */}
    {isHeader ? <Header oneLineText={oneLineText} isMobile={isMobile}/> : null}
  
    {/* Child content */}
    {children}
  </Box>
  
  )
}

export default ChartGameBox
