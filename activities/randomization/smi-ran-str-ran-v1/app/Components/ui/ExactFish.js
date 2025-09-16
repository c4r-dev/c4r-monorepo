import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';

// ExactFish Component
export const ExactFish = ({ color }) => {
    // Colors based on the fish type
    const isPink = color === '#FF69B4';
    const primaryColor = isPink ? '#FF69B4' : '#9AFF9A'; // Pink or light green
    const secondaryColor = isPink ? '#FF1493' : '#32CD32'; // Darker accent color
    const finColor = isPink ? '#FFC0CB' : '#CCFFCC'; // Lighter fin color
    
    return (
      <div style={{ 
        position: 'relative',
        width: '120px', 
        height: '60px',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center'
      }}>
        <svg 
          width="120" 
          height="60" 
          viewBox="0 0 120 60" 
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main fish body - oval shape */}
          <ellipse 
            cx="60" 
            cy="30" 
            rx="35" 
            ry="20" 
            fill={primaryColor} 
          />
          
          {/* Fish head */}
          <path 
            d="M25 30 C25 20, 35 10, 40 20 C45 10, 55 15, 55 30 C55 45, 45 50, 40 40 C35 50, 25 40, 25 30 Z" 
            fill={primaryColor} 
            stroke={secondaryColor}
            strokeWidth="1"
          />
          
          {/* Fish eye */}
          <circle 
            cx="35" 
            cy="25" 
            r="3" 
            fill="white" 
          />
          <circle 
            cx="35" 
            cy="25" 
            r="1.5" 
            fill="black" 
          />
          
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
      </div>
    );
  };
  

  export default ExactFish;