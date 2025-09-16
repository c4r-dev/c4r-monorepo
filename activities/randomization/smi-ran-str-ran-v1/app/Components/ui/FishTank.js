'use client';

import React, { useState } from 'react';
import { Card, CardContent } from './Card';
import { Button } from './Button';
import { Box, Typography, Stack } from '@mui/material';
import { motion } from 'framer-motion';
import { ExactFish } from './ExactFish';

// FishTank Component
const FishTank = ({ fishList, backgroundColor, title, containerStyle }) => {
    return (
      <div style={{
        backgroundColor: backgroundColor,
        padding: '16px',
        borderRadius: '4px',
        width: '100%'
      }}>
        {title && (
          <div style={{ 
            marginBottom: '16px', 
            color: 'white', 
            fontWeight: 'bold' 
          }}>
            {title}
          </div>
        )}
        <div style={{
          ...containerStyle,
          overflowY: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          gap: '16px',
          alignContent: 'flex-start'
        }}>
          {fishList.map((fish) => (
            <ExactFish key={fish.id} color={fish.color} />
          ))}
        </div>
      </div>
    );
  };

export default FishTank;