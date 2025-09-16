'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../app/Components/ui/Card'
import { Button } from '../app/Components/ui/Button'
import { useRouter } from 'next/navigation' // for App Router
import { Box, Typography, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import Header from './Components/ui/Header/Header'
import CustomModal from './Components/ui/CustomModal'
import CustomButton from './Components/ui/CustomButton'

// Fish data from JSON file
const fishData = [
  {
    fish_id: 1,
    sex: 'female',
    family_id: 'D',
    size: 'long',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 2,
    aggression: 4.7,
  },
  {
    fish_id: 2,
    sex: 'female',
    family_id: 'C',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 3,
    aggression: 6.1,
  },
  {
    fish_id: 3,
    sex: 'male',
    family_id: 'C',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'enrichment',
    base_aggression: 4,
    aggression: 10.0,
  },
  {
    fish_id: 4,
    sex: 'female',
    family_id: 'B',
    size: 'long',
    swimming_speed: 'slow',
    treatment: 'control',
    base_aggression: 5,
    aggression: 5.8,
  },
  {
    fish_id: 5,
    sex: 'female',
    family_id: 'B',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 1,
    aggression: 1.8,
  },
  {
    fish_id: 6,
    sex: 'male',
    family_id: 'D',
    size: 'long',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 2,
    aggression: 7.9,
  },
  {
    fish_id: 7,
    sex: 'female',
    family_id: 'D',
    size: 'short',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 3,
    aggression: 3.0,
  },
  {
    fish_id: 8,
    sex: 'male',
    family_id: 'C',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 4,
    aggression: 10.0,
  },
  {
    fish_id: 9,
    sex: 'male',
    family_id: 'D',
    size: 'long',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 5,
    aggression: 10.0,
  },
  {
    fish_id: 10,
    sex: 'male',
    family_id: 'A',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 1,
    aggression: 8.9,
  },
  {
    fish_id: 11,
    sex: 'male',
    family_id: 'C',
    size: 'short',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 2,
    aggression: 7.5,
  },
  {
    fish_id: 12,
    sex: 'female',
    family_id: 'D',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 3,
    aggression: 4.9,
  },
  {
    fish_id: 13,
    sex: 'female',
    family_id: 'B',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'control',
    base_aggression: 4,
    aggression: 4.0,
  },
  {
    fish_id: 14,
    sex: 'female',
    family_id: 'A',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'control',
    base_aggression: 5,
    aggression: 7.8,
  },
  {
    fish_id: 15,
    sex: 'male',
    family_id: 'B',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'control',
    base_aggression: 1,
    aggression: 4.2,
  },
  {
    fish_id: 16,
    sex: 'male',
    family_id: 'B',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 2,
    aggression: 6.0,
  },
  {
    fish_id: 17,
    sex: 'male',
    family_id: 'D',
    size: 'short',
    swimming_speed: 'fast',
    treatment: 'enrichment',
    base_aggression: 3,
    aggression: 8.1,
  },
  {
    fish_id: 18,
    sex: 'female',
    family_id: 'C',
    size: 'short',
    swimming_speed: 'slow',
    treatment: 'enrichment',
    base_aggression: 4,
    aggression: 8.2,
  },
  {
    fish_id: 19,
    sex: 'male',
    family_id: 'A',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'enrichment',
    base_aggression: 5,
    aggression: 10.0,
  },
  {
    fish_id: 20,
    sex: 'female',
    family_id: 'A',
    size: 'long',
    swimming_speed: 'fast',
    treatment: 'control',
    base_aggression: 1,
    aggression: 4.6,
  },
]


// Exact Fish component with enhanced size differences
const ExactFish = ({ fishData }) => {
  // Determine color based on sex
  let primaryColor, secondaryColor, finColor

  if (fishData.sex === 'female') {
    // Pink colors for female fish
    primaryColor = 'rgba(255, 126, 242, 0.4)' // Pink with 40% opacity
    secondaryColor = '#ff7ef2' // Pink outline
    finColor = 'rgba(255, 126, 242, 0.4)' // Light pink with 40% opacity
  } else {
    // Green colors for male fish
    primaryColor = '#9AFF9A' // Light green
    secondaryColor = '#32CD32' // Medium green
    finColor = '#CCFFCC' // Very light green
  }

  // Set scale based only on size, not sex
  // All large fish will be the same size, and all small fish will be the same size
  let scale = fishData.size === 'long' ? 1.5 : 0.9

  return (
    <div
      style={{
        position: 'relative',
        width: '120px',
        height: '60px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
      }}
    >
      <svg
        width="120"
        height="60"
        viewBox="0 0 120 60"
        xmlns="http://www.w3.org/2000/svg"
        style={{ transform: `scale(${scale})` }}
      >
        {/* Main fish body - oval shape */}
        <ellipse cx="60" cy="30" rx="35" ry="20" fill={primaryColor} />

        {/* Fish head */}
        <path
          d="M25 30 C25 20, 35 10, 40 20 C45 10, 55 15, 55 30 C55 45, 45 50, 40 40 C35 50, 25 40, 25 30 Z"
          fill={primaryColor}
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Fish eye */}
        <circle cx="35" cy="25" r="3" fill="white" />
        <circle cx="35" cy="25" r="1.5" fill="black" />

        {/* Fish tail */}
        <path
          d="M95 30 L115 10 L115 50 Z"
          fill={finColor}
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Top fin */}
        <path
          d="M50 10 C60 0, 75 0, 85 10 Q85 30, 50 10"
          fill={finColor}
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Bottom fin */}
        <path
          d="M60 50 C70 60, 80 60, 85 50 Q85 30, 60 50"
          fill={finColor}
          stroke={secondaryColor}
          strokeWidth="1"
        />

        {/* Gill detail */}
        <path
          d="M45 20 C50 30, 50 30, 45 40"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1.5"
        />

        {/* Scale pattern */}
        <path
          d="M55 20 C60 15, 65 15, 70 20"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M55 30 C60 25, 65 25, 70 30"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M55 40 C60 35, 65 35, 70 40"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M65 20 C70 15, 75 15, 80 20"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M65 30 C70 25, 75 25, 80 30"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M65 40 C70 35, 75 35, 80 40"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M75 20 C80 15, 85 15, 90 20"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M75 30 C80 25, 85 25, 90 30"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
        <path
          d="M75 40 C80 35, 85 35, 90 40"
          fill="none"
          stroke={secondaryColor}
          strokeWidth="1"
        />
      </svg>

      {/* Display fish ID number */}
      <small
        style={{
          fontSize: '10px',
          marginTop: '8px',
          paddingTop: '4px',
          fontWeight: 'bold',
          color: '#000000',
        }}
      >
        {fishData.fish_id} ({fishData.sex === 'male' ? 'M' : 'F'})
      </small>
    </div>
  )
}

// Fish details tooltip component
const FishDetails = ({ fishData, position }) => {
  if (!position) return null

  return (
    <div
      style={{
        position: 'fixed', // Using fixed position to be relative to viewport
        top: position.y - 50, // Position vertically centered relative to fish
        left: position.x + 60, // Position to the right of the fish
        backgroundColor: '#F3F3F3',
        padding: '0',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        zIndex: 100,
        width: '300px',
        fontSize: '14px',
        border: '1px solid #eee',
        pointerEvents: 'none', // Prevents the tooltip from interfering with mouse events
        color: '#020202',
      }}
    >
      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
        }}
      >
        <tbody>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td
              style={{
                padding: '8px 12px',
                color: '#020202',
                fontWeight: 'normal',
              }}
            >
              SWIMMING SPEED
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>
              {fishData.swimming_speed === 'fast' ? 'Fast' : 'Slow'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td
              style={{
                padding: '8px 12px',
                color: '#020202',
                fontWeight: 'normal',
              }}
            >
              FISH ID
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>
              {fishData.fish_id}
            </td>
          </tr>
          {/* <tr style={{ borderBottom: '1px solid #eee' }}>
            <td style={{ padding: '8px 12px', color: '#666', fontWeight: 'normal' }}>TREATMENT</td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>{fishData.treatment === 'enrichment' ? 'Enrichment' : 'Control'}</td>
          </tr> */}
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td
              style={{
                padding: '8px 12px',
                color: '#020202',
                fontWeight: 'normal',
              }}
            >
              SEX
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>
              {fishData.sex === 'male' ? 'Male' : 'Female'}
            </td>
          </tr>
          <tr style={{ borderBottom: '1px solid #eee' }}>
            <td
              style={{
                padding: '8px 12px',
                color: '#020202',
                fontWeight: 'normal',
              }}
            >
              FAMILY ID
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>
              {fishData.family_id}
            </td>
          </tr>
          <tr>
            <td
              style={{
                padding: '8px 12px',
                color: '#020202',
                fontWeight: 'normal',
              }}
            >
              SIZE
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold', color: '#020202' }}>
              {fishData.size === 'long' ? 'Large' : 'Small'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// Gender legend banner component - positioned at left corner
const GenderLegend = () => {
  return (
    <div
      style={{
        position: 'absolute',
        bottom: '16px',
        left: '16px', // Changed from right to left
        display: 'flex',
        alignItems: 'center',
        backgroundColor: 'white',
        padding: '8px 12px',
        borderRadius: '20px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        zIndex: 10,
        color:'black !important',
      
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          marginRight: '12px',
          color:'black !important',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#FF69B4',
            marginRight: '6px',
            color:'black !important',
          }}
        ></div>
        <span style={{ fontSize: '14px', fontColor:'black !important' , color:'black !important'}}>Female</span>
      </div>
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
           color:'black !important',
        }}
      >
        <div
          style={{
            width: '16px',
            height: '16px',
            borderRadius: '50%',
            backgroundColor: '#9AFF9A',
            marginRight: '6px',
             color:'black !important',
          }}
        ></div>
        <span style={{ fontSize: '14px',  color:'black !important', }}>Male</span>
      </div>
    </div>
  )
}

const Home = () => {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [fishCount] = useState(20)
  const [controlFish, setControlFish] = useState([])
  const [treatmentFish, setTreatmentFish] = useState([])
  const [hoveredFish, setHoveredFish] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState(null)

  const [sizeChecked, setSizeChecked] = useState(false)
  const [familyIdChecked, setFamilyIdChecked] = useState(true) // Pre-selected
  const [swimmingSpeedChecked, setSwimmingSpeedChecked] = useState(false)
  const [sexChecked, setSexChecked] = useState(false)

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  // Generate fish with data from the JSON
  const generateInitialFish = () => {
    return fishData.map((fish) => ({
      ...fish,
      data: fish,
    }))
  }

  const [remainingFish, setRemainingFish] = useState(generateInitialFish())

  const flipCoin = () => Math.random() < 0.5

  const handleFlipOnce = () => {
    if (remainingFish.length > 0) {
      // Select a random fish from the remaining fish
      const randomIndex = Math.floor(Math.random() * remainingFish.length)
      const fishToMove = remainingFish[randomIndex]

      // Move fish based on its treatment property
      if (fishToMove.treatment === 'control') {
        setControlFish([...controlFish, fishToMove])
      } else if (fishToMove.treatment === 'enrichment') {
        setTreatmentFish([...treatmentFish, fishToMove])
      }

      // Remove the fish from the remaining fish
      setRemainingFish(
        remainingFish.filter((fish) => fish.fish_id !== fishToMove.fish_id),
      )

      // Clear any hovered fish state
      setHoveredFish(null)
      setTooltipPosition(null)
    }
  }

  const handleFlipAll = () => {
    let newControlFish = [...controlFish]
    let newTreatmentFish = [...treatmentFish]

    remainingFish.forEach((fish) => {
      // Assign based on the fish's treatment property
      if (fish.treatment === 'control') {
        newControlFish.push(fish)
      } else if (fish.treatment === 'enrichment') {
        newTreatmentFish.push(fish)
      }
    })

    setControlFish(newControlFish)
    setTreatmentFish(newTreatmentFish)
    setRemainingFish([])
    setHoveredFish(null)
    setTooltipPosition(null)
  }

  const handleMouseOver = (fish, e) => {
    setHoveredFish(fish)
    // Position the tooltip exactly at the cursor position
    setTooltipPosition({
      x: e.clientX,
      y: e.clientY,
    })
  }

  const handleMouseOut = () => {
    setHoveredFish(null)
    setTooltipPosition(null)
  }

  const handleContinue = () => {
    // Navigate to the next page or perform any action when continue is clicked
    console.log('Continue clicked')
    // You can add navigation logic here, such as:
    // router.push('/next-page');
    // window.location.href = '/StratifiedRandomization';
    router.push('/RandomizationPlot')
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
      }}
    >
      {/* <h2 style={{ 
        fontWeight: 'bold', 
        marginBottom: '32px', 
        textAlign: 'center'
      }}>
        Assign Zebrafish Using Simple Randomization
      </h2> */}
      <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

      <Header
        onLogoClick={handleLogoClick}
        onHelpClick={handleHelpClick}
        text="Assign Zebrafish Using Simple Randomization"
      />

      <div
        style={{
          width: '90%',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          position: 'relative',
        }}
      >
        {hoveredFish && tooltipPosition && (
          <FishDetails fishData={hoveredFish} position={tooltipPosition} />
        )}

        <div>
          {/* Main fish tank */}
          <div
            style={{
              backgroundColor: '#f3f3f3',
              height: '300px',
              borderRadius: '12px',
              border: '2px solid #a2a2a2',
              padding: '24px',
              display: 'flex',
              flexDirection: 'column',
              position: 'relative',
            }}
          >
            {/* Tank header with count */}
            <div
              style={{
                color: '#333',
                fontWeight: 'bold',
                marginBottom: '12px',
                display: 'flex',
                justifyContent: 'space-between',
                padding: '0 8px',
              }}
            >
              <span>MAIN TANK</span>
              <span>{remainingFish.length} fish</span>
            </div>

            {/* Fish container */}
            <div
              style={{
                flex: 1,
                display: 'flex',
                flexWrap: 'wrap',
                gap: '20px',
                justifyContent: 'center',
                alignItems: 'center',
                overflow: 'hidden',
              }}
            >
              {remainingFish.map((fish) => (
                <div
                  key={fish.fish_id}
                  onMouseOver={(e) => handleMouseOver(fish, e)}
                  onMouseOut={handleMouseOut}
                  style={{ cursor: 'pointer' }}
                >
                  <ExactFish fishData={fish} />
                </div>
              ))}
            </div>
          </div>

          {/* Coin and message section */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              margin: '32px 0 16px',
              gap: '24px',
            }}
          >
            {/* Coin image */}
            <div
              style={{
                width: '100px',
                height: '100px',
                borderRadius: '50%',
                backgroundColor: '#FFC107',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 8px rgba(0,0,0,0.2)',
                border: '6px solid #FFD54F',
              }}
            >
              <div
                style={{
                  width: '80%',
                  height: '80%',
                  borderRadius: '50%',
                  backgroundColor: '#FFA000',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: '#FFF7E5',
                  fontSize: '24px',
                  fontWeight: 'bold',
                }}
              >
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M20 10C14.5 10 10 14.5 10 20C10 25.5 14.5 30 20 30C25.5 30 30 25.5 30 20C30 14.5 25.5 10 20 10ZM20 28C15.6 28 12 24.4 12 20C12 15.6 15.6 12 20 12C24.4 12 28 15.6 28 20C28 24.4 24.4 28 20 28Z"
                    fill="#FFF7E5"
                  />
                  <path d="M19 15V21H25V19H21V15H19Z" fill="#FFF7E5" />
                </svg>
              </div>
            </div>

            {/* Message text */}
            <div
              style={{
                maxWidth: '500px',
                fontSize: '22px',
                color: '#555',
                fontWeight: '500',
                lineHeight: '1.3',
              }}
            >
              Flip the coin to randomize the zebrafish into treatment group or control group.
            </div>
          </div>

          <div style={{ textAlign: 'center', marginTop: '16px' }}>
            {/* <button 
              onClick={handleFlipOnce} 
              style={{ 
                margin: '8px',
                padding: '8px 16px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: remainingFish.length > 0 ? 'pointer' : 'not-allowed',
                opacity: remainingFish.length > 0 ? 1 : 0.6
              }}
              disabled={remainingFish.length === 0}
            >
              FLIP ONCE
            </button> */}
            <div
              style={{
                textAlign: 'center',
                marginTop: '16px',
                display: 'flex',
                justifyContent: 'center',
                gap: '24px',
              }}
            >
              {' '}
              <CustomButton
                variant="primary"
                onClick={handleFlipOnce}
                disabled={remainingFish.length === 0}
              >
                FLIP ONCE
              </CustomButton>
              <CustomButton
                variant="primary"
                onClick={handleFlipAll}
                disabled={remainingFish.length === 0}
              >
                FLIP FOR ALL
              </CustomButton>
            </div>
            {/* <button 
              onClick={handleFlipAll}
              style={{ 
                margin: '8px',
                padding: '8px 16px',
                backgroundColor: '#2196F3',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: remainingFish.length > 0 ? 'pointer' : 'not-allowed',
                opacity: remainingFish.length > 0 ? 1 : 0.6
              }}
              disabled={remainingFish.length === 0}
            >
              FLIP FOR ALL
            </button> */}
          </div>

          {/* Fixed-size grid for the control and treatment tanks */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: '1fr 1fr',
              gap: '16px',
              marginTop: '32px',
              width: '100%',
            }}
          >
            {/* Blue tank - Control Group */}
            <div
              style={{
                backgroundColor: '#1859d7',
                padding: '16px',
                borderRadius: '4px',
                width: '100%',
              }}
            >
              <div
                style={{
                  marginBottom: '16px',
                  color: 'white',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>CONTROL GROUP</span>
                <span>{controlFish.length} fish</span>
              </div>
              <div
                style={{
                  backgroundColor: '#f3f3f3',
                  height: '300px',
                  width: '100%',
                  borderRadius: '8px',
                  padding: '16px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignContent: 'flex-start',
                }}
              >
                {controlFish.map((fish) => (
                  <div
                    key={fish.fish_id}
                    onMouseOver={(e) => handleMouseOver(fish, e)}
                    onMouseOut={handleMouseOut}
                    style={{ cursor: 'pointer' }}
                  >
                    <ExactFish fishData={fish} />
                  </div>
                ))}
              </div>
            </div>

            {/* Pink tank - Treatment Group */}
            <div
              style={{
                backgroundColor: '#f031dd',
                padding: '16px',
                borderRadius: '4px',
                width: '100%',
              }}
            >
              <div
                style={{
                  marginBottom: '16px',
                  color: 'white',
                  fontWeight: 'bold',
                  display: 'flex',
                  justifyContent: 'space-between',
                }}
              >
                <span>TREATMENT GROUP</span>
                <span>{treatmentFish.length} fish</span>
              </div>
              <div
                style={{
                  backgroundColor: '#f3f3f3',
                  height: '300px',
                  width: '100%',
                  borderRadius: '8px',
                  padding: '16px',
                  overflowY: 'auto',
                  boxSizing: 'border-box',
                  display: 'flex',
                  flexWrap: 'wrap',
                  gap: '16px',
                  alignContent: 'flex-start',
                }}
              >
                {treatmentFish.map((fish) => (
                  <div
                    key={fish.fish_id}
                    onMouseOver={(e) => handleMouseOver(fish, e)}
                    onMouseOut={handleMouseOut}
                    style={{ cursor: 'pointer' }}
                  >
                    <ExactFish fishData={fish} />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Continue button at the bottom right */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'flex-end',
              marginTop: '24px',
            }}
          >
            {/* <button 
              onClick={handleContinue}
              style={{
                padding: '10px 24px',
                backgroundColor: '#4CAF50',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                fontSize: '16px',
                fontWeight: 'bold',
                cursor: 'pointer',
                boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
              }}
            >
              CONTINUE
            </button> */}
            <CustomButton variant="primary" onClick={handleContinue}>
              CONTINUE
            </CustomButton>
            <GenderLegend />
          </div>
          {/* <GenderLegend /> */}
        </div>
        {/* <GenderLegend /> */}
      </div>
    </div>
  )
}

export default Home