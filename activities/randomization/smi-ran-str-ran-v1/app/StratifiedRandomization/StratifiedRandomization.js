'use client'

import React, { useState, useEffect } from 'react'
import { Card, CardContent } from '../Components/ui/Card'
import { Button } from '../Components/ui/Button'
import { useRouter } from 'next/navigation'
import { Box, Typography, Stack } from '@mui/material'
import { motion } from 'framer-motion'
import Header from '../Components/ui/Header/Header'
import CustomModal from '../Components/ui/CustomModal'
import CustomButton from '../Components/ui/CustomButton'

const zebraFishSummaryData = [
  {
    Method: 'Simple',
    Est_Effect: 3.19,
    Accuracy: -1.29,
    CI_Width: 3.5,
    Male_Effect: 3.37,
    Female_Effect: 1.2,
    Sex_Diff: 2.17,
    N_Strata: 1,
    Min_Fish_per_Stratum: 20,
  },
  {
    Method: 'Size',
    Est_Effect: 0.81,
    Accuracy: 1.09,
    CI_Width: 3.98,
    Male_Effect: 2.67,
    Female_Effect: -0.03,
    Sex_Diff: 2.7,
    N_Strata: 2,
    Min_Fish_per_Stratum: 10,
  },
  {
    Method: 'Sex',
    Est_Effect: 1.62,
    Accuracy: 0.28,
    CI_Width: 3.98,
    Male_Effect: 2.58,
    Female_Effect: 0.66,
    Sex_Diff: 1.92,
    N_Strata: 2,
    Min_Fish_per_Stratum: 10,
  },
  {
    Method: 'Family',
    Est_Effect: 1.09,
    Accuracy: 0.81,
    CI_Width: 4.04,
    Male_Effect: 2.05,
    Female_Effect: 1.74,
    Sex_Diff: 0.31,
    N_Strata: 4,
    Min_Fish_per_Stratum: 4,
  },
  {
    Method: 'Speed',
    Est_Effect: 1.96,
    Accuracy: -0.06,
    CI_Width: 3.98,
    Male_Effect: 2.77,
    Female_Effect: 0.66,
    Sex_Diff: 2.11,
    N_Strata: 2,
    Min_Fish_per_Stratum: 9,
  },
  {
    Method: 'Size+Sex',
    Est_Effect: 1.83,
    Accuracy: 0.07,
    CI_Width: 4.18,
    Male_Effect: 2.77,
    Female_Effect: 0.89,
    Sex_Diff: 1.88,
    N_Strata: 4,
    Min_Fish_per_Stratum: 5,
  },
  {
    Method: 'Size+Family',
    Est_Effect: 0.4,
    Accuracy: 1.5,
    CI_Width: 3.85,
    Male_Effect: 2.16,
    Female_Effect: -0.55,
    Sex_Diff: 2.71,
    N_Strata: 8,
    Min_Fish_per_Stratum: 2,
  },
  {
    Method: 'Size+Speed',
    Est_Effect: 0.42,
    Accuracy: 1.48,
    CI_Width: 3.8,
    Male_Effect: 2.67,
    Female_Effect: -0.55,
    Sex_Diff: 3.22,
    N_Strata: 4,
    Min_Fish_per_Stratum: 3,
  },
  {
    Method: 'Sex+Family',
    Est_Effect: 1.68,
    Accuracy: 0.22,
    CI_Width: 4.02,
    Male_Effect: 1.39,
    Female_Effect: 1.98,
    Sex_Diff: -0.59,
    N_Strata: 8,
    Min_Fish_per_Stratum: 2,
  },
  {
    Method: 'Sex+Speed',
    Est_Effect: 1.75,
    Accuracy: 0.15,
    CI_Width: 3.99,
    Male_Effect: 2.35,
    Female_Effect: 0.66,
    Sex_Diff: 1.69,
    N_Strata: 4,
    Min_Fish_per_Stratum: 4,
  },
  {
    Method: 'Family+Speed',
    Est_Effect: 1.36,
    Accuracy: 0.54,
    CI_Width: 3.74,
    Male_Effect: 2.78,
    Female_Effect: 0.39,
    Sex_Diff: 2.39,
    N_Strata: 8,
    Min_Fish_per_Stratum: 2,
  },
  {
    Method: 'Size+Sex+Family',
    Est_Effect: 3,
    Accuracy: -1.1,
    CI_Width: 3.86,
    Male_Effect: 1.21,
    Female_Effect: 3.2,
    Sex_Diff: -1.99,
    N_Strata: 16,
    Min_Fish_per_Stratum: 1,
  },
  {
    Method: 'Size+Sex+Speed',
    Est_Effect: 1.07,
    Accuracy: 0.83,
    CI_Width: 4.05,
    Male_Effect: 1.67,
    Female_Effect: -0.06,
    Sex_Diff: 1.73,
    N_Strata: 8,
    Min_Fish_per_Stratum: 1,
  },
  {
    Method: 'Size+Family+Speed',
    Est_Effect: 1.03,
    Accuracy: 0.87,
    CI_Width: 4.04,
    Male_Effect: 2.16,
    Female_Effect: 0.39,
    Sex_Diff: 1.77,
    N_Strata: 16,
    Min_Fish_per_Stratum: 0,
  },
  {
    Method: 'Sex+Family+Speed',
    Est_Effect: 2.84,
    Accuracy: -0.94,
    CI_Width: 3.72,
    Male_Effect: 1.21,
    Female_Effect: 2.44,
    Sex_Diff: -1.23,
    N_Strata: 16,
    Min_Fish_per_Stratum: 1,
  },
  {
    Method: 'Size+Sex+Family+Speed',
    Est_Effect: 1.09,
    Accuracy: 0.81,
    CI_Width: 3.88,
    Male_Effect: -0.6,
    Female_Effect: 1.68,
    Sex_Diff: -2.28,
    N_Strata: 32,
    Min_Fish_per_Stratum: 0,
  },
]

const filterToMethodMap = {
  // Single filters
  Size: 'Size',
  Sex: 'Sex',
  'Family ID': 'Family',
  'Swimming Speed': 'Speed',

  // Two filter combinations
  'Size+Sex': 'Size+Sex',
  'Size+Family ID': 'Size+Family',
  'Size+Swimming Speed': 'Size+Speed',
  'Sex+Family ID': 'Sex+Family',
  'Sex+Swimming Speed': 'Sex+Speed',
  'Family ID+Swimming Speed': 'Family+Speed',

  // Three filter combinations
  'Size+Sex+Family ID': 'Size+Sex+Family',
  'Size+Sex+Swimming Speed': 'Size+Sex+Speed',
  'Size+Family ID+Swimming Speed': 'Size+Family+Speed',
  'Sex+Family ID+Swimming Speed': 'Sex+Family+Speed',

  // Four filter combination
  'Size+Sex+Family ID+Swimming Speed': 'Size+Sex+Family+Speed',
}

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

// Base stratification data from the CSV
const stratificationData = {
  Sex: [
    { stratum: 'Male', count: 67 },
    { stratum: 'Female', count: 67 },
  ],
  Size: [
    { stratum: 'Small', count: 67 },
    { stratum: 'Large', count: 67 },
  ],
  'Family ID': [
    { stratum: 'A', count: 33 },
    { stratum: 'B', count: 36 },
    { stratum: 'C', count: 32 },
    { stratum: 'D', count: 33 },
  ],
  'Swimming Speed': [
    { stratum: 'Fast', count: 67 },
    { stratum: 'Slow', count: 67 },
  ],
}

// Combined stratification data
// This would typically come from the CSV, but here we're calculating it
const combinedStratificationData = {
  'Sex+Family ID': [
    { stratum: 'Male+A', count: 17 }, // Estimated as half of Family A count
    { stratum: 'Male+B', count: 18 }, // Estimated as half of Family B count
    { stratum: 'Male+C', count: 16 }, // Estimated as half of Family C count
    { stratum: 'Male+D', count: 16 }, // Estimated as half of Family D count
    { stratum: 'Female+A', count: 16 }, // Estimated as half of Family A count
    { stratum: 'Female+B', count: 18 }, // Estimated as half of Family B count
    { stratum: 'Female+C', count: 16 }, // Estimated as half of Family C count
    { stratum: 'Female+D', count: 17 }, // Estimated as half of Family D count
  ],
  'Sex+Size': [
    { stratum: 'Male+Small', count: 33 },
    { stratum: 'Male+Large', count: 34 },
    { stratum: 'Female+Small', count: 34 },
    { stratum: 'Female+Large', count: 33 },
  ],
  'Sex+Swimming Speed': [
    { stratum: 'Male+Fast', count: 33 },
    { stratum: 'Male+Slow', count: 34 },
    { stratum: 'Female+Fast', count: 34 },
    { stratum: 'Female+Slow', count: 33 },
  ],
  'Family ID+Size': [
    { stratum: 'A+Small', count: 16 },
    { stratum: 'A+Large', count: 17 },
    { stratum: 'B+Small', count: 18 },
    { stratum: 'B+Large', count: 18 },
    { stratum: 'C+Small', count: 16 },
    { stratum: 'C+Large', count: 16 },
    { stratum: 'D+Small', count: 17 },
    { stratum: 'D+Large', count: 16 },
  ],
  'Family ID+Swimming Speed': [
    { stratum: 'A+Fast', count: 16 },
    { stratum: 'A+Slow', count: 17 },
    { stratum: 'B+Fast', count: 18 },
    { stratum: 'B+Slow', count: 18 },
    { stratum: 'C+Fast', count: 16 },
    { stratum: 'C+Slow', count: 16 },
    { stratum: 'D+Fast', count: 17 },
    { stratum: 'D+Slow', count: 16 },
  ],
  'Size+Swimming Speed': [
    { stratum: 'Small+Fast', count: 33 },
    { stratum: 'Small+Slow', count: 34 },
    { stratum: 'Large+Fast', count: 34 },
    { stratum: 'Large+Slow', count: 33 },
  ],
  'Swimming Speed+Size': [
    // Added this alias for better matching
    { stratum: 'Fast+Small', count: 33 },
    { stratum: 'Fast+Large', count: 34 },
    { stratum: 'Slow+Small', count: 34 },
    { stratum: 'Slow+Large', count: 33 },
  ],
  'Sex+Family ID+Size': [
    { stratum: 'Female+A+Large', count: 1 },
    { stratum: 'Female+A+Small', count: 1 },
    { stratum: 'Female+B+Large', count: 2 },
    { stratum: 'Female+B+Small', count: 1 },
    { stratum: 'Female+C+Large', count: 1 },
    { stratum: 'Female+C+Small', count: 1 },
    { stratum: 'Female+D+Large', count: 1 },
    { stratum: 'Female+D+Small', count: 2 },
    { stratum: 'Male+A+Large', count: 1 },
    { stratum: 'Male+A+Small', count: 1 },
    { stratum: 'Male+B+Large', count: 1 },
    { stratum: 'Male+B+Small', count: 1 },
    { stratum: 'Male+C+Large', count: 1 },
    { stratum: 'Male+C+Small', count: 2 },
    { stratum: 'Male+D+Large', count: 2 },
    { stratum: 'Male+D+Small', count: 1 },
  ],
  'Sex+Family ID+Swimming Speed': [
    { stratum: 'Female+A+Fast', count: 1 },
    { stratum: 'Female+A+Slow', count: 1 },
    { stratum: 'Female+B+Fast', count: 1 },
    { stratum: 'Female+B+Slow', count: 2 },
    { stratum: 'Female+C+Fast', count: 1 },
    { stratum: 'Female+C+Slow', count: 1 },
    { stratum: 'Female+D+Fast', count: 1 },
    { stratum: 'Female+D+Slow', count: 2 },
    { stratum: 'Male+A+Fast', count: 1 },
    { stratum: 'Male+A+Slow', count: 1 },
    { stratum: 'Male+B+Fast', count: 1 },
    { stratum: 'Male+B+Slow', count: 1 },
    { stratum: 'Male+C+Fast', count: 2 },
    { stratum: 'Male+C+Slow', count: 1 },
    { stratum: 'Male+D+Fast', count: 1 },
    { stratum: 'Male+D+Slow', count: 2 },
  ],
  'Sex+Size+Swimming Speed': [
    { stratum: 'Female+Large+Fast', count: 3 },
    { stratum: 'Female+Large+Slow', count: 2 },
    { stratum: 'Female+Small+Fast', count: 1 },
    { stratum: 'Female+Small+Slow', count: 4 },
    { stratum: 'Male+Large+Fast', count: 3 },
    { stratum: 'Male+Large+Slow', count: 2 },
    { stratum: 'Male+Small+Fast', count: 2 },
    { stratum: 'Male+Small+Slow', count: 3 },
  ],
  'Family ID+Size+Swimming Speed': [
    { stratum: 'A+Large+Fast', count: 2 },
    { stratum: 'A+Large+Slow', count: 0 },
    { stratum: 'A+Small+Fast', count: 0 },
    { stratum: 'A+Small+Slow', count: 2 },
    { stratum: 'B+Large+Fast', count: 2 },
    { stratum: 'B+Large+Slow', count: 1 },
    { stratum: 'B+Small+Fast', count: 0 },
    { stratum: 'B+Small+Slow', count: 2 },
    { stratum: 'C+Large+Fast', count: 2 },
    { stratum: 'C+Large+Slow', count: 0 },
    { stratum: 'C+Small+Fast', count: 1 },
    { stratum: 'C+Small+Slow', count: 2 },
    { stratum: 'D+Large+Fast', count: 0 },
    { stratum: 'D+Large+Slow', count: 3 },
    { stratum: 'D+Small+Fast', count: 2 },
    { stratum: 'D+Small+Slow', count: 1 },
  ],
  'Sex+Family ID+Size+Swimming Speed': [
    { stratum: 'Female+A+Large+Fast', count: 1 },
    { stratum: 'Female+A+Large+Slow', count: 0 },
    { stratum: 'Female+A+Small+Fast', count: 0 },
    { stratum: 'Female+A+Small+Slow', count: 1 },
    { stratum: 'Female+B+Large+Fast', count: 1 },
    { stratum: 'Female+B+Large+Slow', count: 1 },
    { stratum: 'Female+B+Small+Fast', count: 0 },
    { stratum: 'Female+B+Small+Slow', count: 1 },
    { stratum: 'Female+C+Large+Fast', count: 1 },
    { stratum: 'Female+C+Large+Slow', count: 0 },
    { stratum: 'Female+C+Small+Fast', count: 0 },
    { stratum: 'Female+C+Small+Slow', count: 1 },
    { stratum: 'Female+D+Large+Fast', count: 0 },
    { stratum: 'Female+D+Large+Slow', count: 1 },
    { stratum: 'Female+D+Small+Fast', count: 1 },
    { stratum: 'Female+D+Small+Slow', count: 1 },
    { stratum: 'Male+A+Large+Fast', count: 1 },
    { stratum: 'Male+A+Large+Slow', count: 0 },
    { stratum: 'Male+A+Small+Fast', count: 0 },
    { stratum: 'Male+A+Small+Slow', count: 1 },
    { stratum: 'Male+B+Large+Fast', count: 1 },
    { stratum: 'Male+B+Large+Slow', count: 0 },
    { stratum: 'Male+B+Small+Fast', count: 0 },
    { stratum: 'Male+B+Small+Slow', count: 1 },
    { stratum: 'Male+C+Large+Fast', count: 1 },
    { stratum: 'Male+C+Large+Slow', count: 0 },
    { stratum: 'Male+C+Small+Fast', count: 1 },
    { stratum: 'Male+C+Small+Slow', count: 1 },
    { stratum: 'Male+D+Large+Fast', count: 0 },
    { stratum: 'Male+D+Large+Slow', count: 2 },
    { stratum: 'Male+D+Small+Fast', count: 1 },
    { stratum: 'Male+D+Small+Slow', count: 0 },
  ],
}

// All possible combination keys for better matching
const combinationAliases = {
  'Size+Swimming Speed': 'Size+Swimming Speed',
  'Swimming Speed+Size': 'Size+Swimming Speed',
  'Sex+Family ID': 'Sex+Family ID',
  'Family ID+Sex': 'Sex+Family ID',
  'Sex+Size': 'Sex+Size',
  'Size+Sex': 'Sex+Size',
  'Sex+Swimming Speed': 'Sex+Swimming Speed',
  'Swimming Speed+Sex': 'Sex+Swimming Speed',
  'Family ID+Size': 'Family ID+Size',
  'Size+Family ID': 'Family ID+Size',
  'Family ID+Swimming Speed': 'Family ID+Swimming Speed',
  'Swimming Speed+Family ID': 'Family ID+Swimming Speed',
  'Sex+Family ID+Size': 'Sex+Family ID+Size',
  'Sex+Size+Family ID': 'Sex+Family ID+Size',
  'Family ID+Sex+Size': 'Sex+Family ID+Size',
  'Family ID+Size+Sex': 'Sex+Family ID+Size',
  'Size+Sex+Family ID': 'Sex+Family ID+Size',
  'Size+Family ID+Sex': 'Sex+Family ID+Size',
  'Sex+Family ID+Swimming Speed': 'Sex+Family ID+Swimming Speed',
  'Sex+Swimming Speed+Family ID': 'Sex+Family ID+Swimming Speed',
  'Family ID+Sex+Swimming Speed': 'Sex+Family ID+Swimming Speed',
  'Family ID+Swimming Speed+Sex': 'Sex+Family ID+Swimming Speed',
  'Swimming Speed+Sex+Family ID': 'Sex+Family ID+Swimming Speed',
  'Swimming Speed+Family ID+Sex': 'Sex+Family ID+Swimming Speed',
  'Sex+Size+Swimming Speed': 'Sex+Size+Swimming Speed',
  'Sex+Swimming Speed+Size': 'Sex+Size+Swimming Speed',
  'Size+Sex+Swimming Speed': 'Sex+Size+Swimming Speed',
  'Size+Swimming Speed+Sex': 'Sex+Size+Swimming Speed',
  'Swimming Speed+Sex+Size': 'Sex+Size+Swimming Speed',
  'Swimming Speed+Size+Sex': 'Sex+Size+Swimming Speed',
  'Family ID+Size+Swimming Speed': 'Family ID+Size+Swimming Speed',
  'Family ID+Swimming Speed+Size': 'Family ID+Size+Swimming Speed',
  'Size+Family ID+Swimming Speed': 'Family ID+Size+Swimming Speed',
  'Size+Swimming Speed+Family ID': 'Family ID+Size+Swimming Speed',
  'Swimming Speed+Family ID+Size': 'Family ID+Size+Swimming Speed',
  'Swimming Speed+Size+Family ID': 'Family ID+Size+Swimming Speed',
  'Sex+Family ID+Size+Swimming Speed': 'Sex+Family ID+Size+Swimming Speed',
  'Family ID+Sex+Size+Swimming Speed': 'Sex+Family ID+Size+Swimming Speed',
  'Size+Sex+Family ID+Swimming Speed': 'Sex+Family ID+Size+Swimming Speed',
  'Swimming Speed+Sex+Family ID+Size': 'Sex+Family ID+Size+Swimming Speed',
}

// Fish Component
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

const ResultsTable = ({ data }) => {
  if (!data) return null

  return (
    <div
      style={{
        marginTop: '24px',
        backgroundColor: '#f5f9ff',
        borderRadius: '8px',
        padding: '16px',
        boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
      }}
    >
      <h3
        style={{
          textAlign: 'center',
          marginBottom: '16px',
          color: '#2c3e50',
        }}
      >
        Randomization Results Summary
      </h3>

      <div style={{ overflowX: 'auto' }}>
        <table
          style={{
            width: '100%',
            borderCollapse: 'collapse',
            marginBottom: '16px',
          }}
        >
          <thead>
            <tr
              style={{
                backgroundColor: '#00c802',
                color: '#020202',
              }}
            >
              <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>
                Est. Effect
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Accuracy</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>CI Width</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>
                Male Effect
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>
                Female Effect
              </th>
              <th style={{ padding: '12px', textAlign: 'center' }}>Sex Diff</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>N Strata</th>
              <th style={{ padding: '12px', textAlign: 'center' }}>
                Min Fish/Stratum
              </th>
            </tr>
          </thead>
          <tbody>
            <tr
              style={{
                backgroundColor: 'white',
                borderBottom: '1px solid #ddd',
                color: '#020202',
              }}
            >
              <td style={{ padding: '12px', fontWeight: 'bold' }}>
                {data.Method}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Est_Effect.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Accuracy.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.CI_Width.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Male_Effect.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Female_Effect.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Sex_Diff.toFixed(2)}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.N_Strata}
              </td>
              <td style={{ padding: '12px', textAlign: 'center' }}>
                {data.Min_Fish_per_Stratum}
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '12px',
          marginTop: '8px',
           color:"black !important",
        }}
      >
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
             color:"black !important",
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#4CAF50',
              color:"black !important",
              borderRadius: '50%',
            }}
          ></div>
          <span>High Accuracy: {data.Accuracy.toFixed(2)}</span>
        </div>

        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          <div
            style={{
              width: '16px',
              height: '16px',
              backgroundColor: '#FFA000',
              borderRadius: '50%',
            }}
          ></div>
          <span>Effect Size: {data.Est_Effect.toFixed(2)}</span>
        </div>
      </div>
    </div>
  )
}

// Tooltip component
const FishDetails = ({ fishData, position }) => {
  if (!position) return null

  return (
    <div
      style={{
        position: 'fixed',
        top: position.y - 50,
        left: position.x + 60,
        backgroundColor: '#F3F3F3',
        padding: '0',
        borderRadius: '4px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.2)',
        zIndex: 100,
        width: '300px',
        fontSize: '14px',
        border: '1px solid #eee',
        pointerEvents: 'none',
      }}
    >
      <table style={{ width: '100%', borderCollapse: 'collapse' }}>
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
            <td
              style={{
                padding: '8px 12px',
                fontWeight: 'bold',
                color: '#020202',
              }}
            >
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
            <td
              style={{
                padding: '8px 12px',
                fontWeight: 'bold',
                color: '#020202',
              }}
            >
              {fishData.fish_id}
            </td>
          </tr>
          {/* <tr style={{ borderBottom: '1px solid #eee' }}>
            <td
              style={{
                padding: '8px 12px',
                color: '#666',
                fontWeight: 'normal',
              }}
            >
              TREATMENT
            </td>
            <td style={{ padding: '8px 12px', fontWeight: 'bold' }}>
              {fishData.treatment === 'enrichment' ? 'Enrichment' : 'Control'}
            </td>
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
            <td
              style={{
                padding: '8px 12px',
                fontWeight: 'bold',
                color: '#020202',
              }}
            >
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
            <td
              style={{
                padding: '8px 12px',
                fontWeight: 'bold',
                color: '#020202',
              }}
            >
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
            <td
              style={{
                padding: '8px 12px',
                fontWeight: 'bold',
                color: '#020202',
              }}
            >
              {fishData.size === 'long' ? 'Large' : 'Small'}
            </td>
          </tr>
        </tbody>
      </table>
    </div>
  )
}

// Tank component for stratified randomization
const StratumTank = ({
  title,
  count,
  fishList,
  onMouseOver,
  onMouseOut,
  backgroundColor,
  tankColor,
  totalTanks,
}) => {
  // Calculate dynamic height based on total tanks
  // More tanks = smaller height
  const getTankHeight = () => {
    if (totalTanks <= 4) return '200px'
    if (totalTanks <= 9) return '180px'
    if (totalTanks <= 16) return '160px'
    if (totalTanks <= 24) return '140px'
    return '120px' // For very high number of tanks
  }

  return (
    <div
      style={{
        backgroundColor: backgroundColor,
        padding: '12px',
        borderRadius: '4px',
        width: '100%',
        marginBottom: '12px',
      }}
    >
      <div
        style={{
          marginBottom: '8px',
          color: 'white',
          fontWeight: 'bold',
          display: 'flex',
          justifyContent: 'space-between',
          fontSize: totalTanks > 9 ? '12px' : '14px',
        }}
      >
        <span>{title}</span>
        <span>{fishList.length} fish</span>
      </div>
      <div
        style={{
          backgroundColor: tankColor,
          height: getTankHeight(),
          width: '100%',
          borderRadius: '8px',
          padding: totalTanks > 9 ? '8px' : '16px',
          overflowY: 'auto',
          boxSizing: 'border-box',
          display: 'flex',
          flexWrap: 'wrap',
          gap: totalTanks > 9 ? '8px' : '16px',
          alignContent: 'flex-start',
        }}
      >
        {fishList.map((fish) => (
          <div
            key={fish.fish_id}
            onMouseOver={(e) => onMouseOver(fish, e)}
            onMouseOut={onMouseOut}
            style={{ cursor: 'pointer' }}
          >
            <ExactFish
              fishData={fish}
              scaleFactor={totalTanks > 9 ? 0.8 : 1} // Add scale factor for fish
            />
          </div>
        ))}
      </div>
    </div>
  )
}

const StratifiedRandomization = () => {
  const router = useRouter()
  const [isModalOpen, setIsModalOpen] = useState(false)

  const [hoveredFish, setHoveredFish] = useState(null)
  const [tooltipPosition, setTooltipPosition] = useState(null)

  const [showResults, setShowResults] = useState(false)
  const [resultData, setResultData] = useState(null)
  const [hasRandomizedOnce, setHasRandomizedOnce] = useState(false)
  const [allResults, setAllResults] = useState([])

  // Filter state
  const [sizeChecked, setSizeChecked] = useState(false)
  const [familyIdChecked, setFamilyIdChecked] = useState(false)
  const [swimmingSpeedChecked, setSwimmingSpeedChecked] = useState(false)
  const [sexChecked, setSexChecked] = useState(false)

  // Active filters
  const [activeFilters, setActiveFilters] = useState([])

  // Fish distribution
  const [remainingFish, setRemainingFish] = useState(fishData)
  const [stratifiedFish, setStratifiedFish] = useState({})

  const handleLogoClick = () => {
    router.push('/')
  }

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  useEffect(() => {
    // Hide the results table and clear result data whenever filters change
    setShowResults(false)
    setResultData(null)
  }, [activeFilters])

  // Handle checkbox changes
  useEffect(() => {
    const filters = []
    if (sizeChecked) filters.push('Size')
    if (familyIdChecked) filters.push('Family ID')
    if (swimmingSpeedChecked) filters.push('Swimming Speed')
    if (sexChecked) filters.push('Sex')

    setActiveFilters(filters)

    if (filters.length === 0) {
      setStratifiedFish({})
      setRemainingFish(fishData)
    }
  }, [sizeChecked, familyIdChecked, swimmingSpeedChecked, sexChecked])

  // Checkbox handlers
  const handleSizeChange = () => setSizeChecked(!sizeChecked)
  const handleFamilyIdChange = () => setFamilyIdChecked(!familyIdChecked)
  const handleSwimmingSpeedChange = () =>
    setSwimmingSpeedChecked(!swimmingSpeedChecked)
  const handleSexChange = () => setSexChecked(!sexChecked)

  // Apply stratification based on active filters
  useEffect(() => {
    if (activeFilters.length === 0) return

    let stratificationKey

    if (activeFilters.length === 1) {
      // Single filter
      stratificationKey = activeFilters[0]
      const strata = stratificationData[stratificationKey]

      if (!strata) return

      // Initialize stratified fish object
      const stratified = {}
      strata.forEach((stratumInfo) => {
        stratified[stratumInfo.stratum] = {
          filter: stratificationKey,
          stratum: stratumInfo.stratum,
          targetCount: stratumInfo.count,
          fish: [],
        }
      })

      // Property mapping for basic filters
      const propertyMap = {
        Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
        'Family ID': (fish) => fish.family_id,
        'Swimming Speed': (fish) =>
          fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
      }

      // Distribute fish according to the filter
      fishData.forEach((fish) => {
        const value = propertyMap[stratificationKey](fish)
        if (stratified[value]) {
          stratified[value].fish.push(fish)
        }
      })

      setStratifiedFish(stratified)
      setRemainingFish([])
    } else if (activeFilters.length === 2) {
      // Two filters - handle Size+Swimming Speed specifically
      const sortedFilters = [...activeFilters].sort()
      stratificationKey = sortedFilters.join('+')

      // Get canonical key from alias map if it exists
      const canonicalKey =
        combinationAliases[stratificationKey] || stratificationKey

      // Check for specific combinations
      if (canonicalKey === 'Size+Swimming Speed') {
        console.log('Handling Size+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata = combinedStratificationData['Size+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: canonicalKey,
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for combined filters
        const propertyMap = {
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sizeValue = propertyMap['Size'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${sizeValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else if (canonicalKey === 'Sex+Family ID') {
        console.log('Handling Sex+Family ID specifically')

        // Use the data from combinedStratificationData
        const strata = combinedStratificationData['Sex+Family ID']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: canonicalKey,
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for Sex+Family ID
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          'Family ID': (fish) => fish.family_id,
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const familyValue = propertyMap['Family ID'](fish)
          const combinedValue = `${sexValue}+${familyValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else {
        // For other combinations, use the existing logic
        const strata = combinedStratificationData[canonicalKey]

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: canonicalKey,
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for basic filters
        const propertyMap = {
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Family ID': (fish) => fish.family_id,
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const values = sortedFilters.map((filter) =>
            propertyMap[filter](fish),
          )
          const combinedValue = values.join('+')

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      }
    } else if (activeFilters.length === 3) {
      // Handle three-filter combinations
      const sortedFilters = [...activeFilters].sort()
      stratificationKey = sortedFilters.join('+')

      // Check for Sex+Family ID+Size combination
      if (
        sortedFilters.includes('Sex') &&
        sortedFilters.includes('Family ID') &&
        sortedFilters.includes('Size')
      ) {
        console.log('Handling Sex+Family ID+Size specifically')

        // Use the data from combinedStratificationData
        const strata = combinedStratificationData['Sex+Family ID+Size']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Sex+Family ID+Size',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for three filters
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          'Family ID': (fish) => fish.family_id,
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const familyValue = propertyMap['Family ID'](fish)
          const sizeValue = propertyMap['Size'](fish)
          const combinedValue = `${sexValue}+${familyValue}+${sizeValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      }
      // NEW: Check for Sex+Family ID+Swimming Speed combination
      else if (
        sortedFilters.includes('Sex') &&
        sortedFilters.includes('Family ID') &&
        sortedFilters.includes('Swimming Speed')
      ) {
        console.log('Handling Sex+Family ID+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata =
          combinedStratificationData['Sex+Family ID+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Sex+Family ID+Swimming Speed',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for three filters
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          'Family ID': (fish) => fish.family_id,
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const familyValue = propertyMap['Family ID'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${sexValue}+${familyValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else if (
        sortedFilters.includes('Sex') &&
        sortedFilters.includes('Size') &&
        sortedFilters.includes('Swimming Speed')
      ) {
        console.log('Handling Sex+Size+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata = combinedStratificationData['Sex+Size+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Sex+Size+Swimming Speed',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for three filters
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const sizeValue = propertyMap['Size'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${sexValue}+${sizeValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else if (
        sortedFilters.includes('Family ID') &&
        sortedFilters.includes('Size') &&
        sortedFilters.includes('Swimming Speed')
      ) {
        console.log('Handling Family ID+Size+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata =
          combinedStratificationData['Family ID+Size+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Family ID+Size+Swimming Speed',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for three filters
        const propertyMap = {
          'Family ID': (fish) => fish.family_id,
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const familyValue = propertyMap['Family ID'](fish)
          const sizeValue = propertyMap['Size'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${familyValue}+${sizeValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else {
        // For other three-filter combinations, show an error or fallback
        console.log('Other three-filter combinations not yet supported')
        setStratifiedFish({})
        setRemainingFish(fishData)
      }
    } else if (activeFilters.length === 4) {
      // Check if all four required filters are selected
      if (
        activeFilters.includes('Sex') &&
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Size') &&
        activeFilters.includes('Swimming Speed')
      ) {
        console.log('Handling Sex+Family ID+Size+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata =
          combinedStratificationData['Sex+Family ID+Size+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Sex+Family ID+Size+Swimming Speed',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for four filters
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          'Family ID': (fish) => fish.family_id,
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const familyValue = propertyMap['Family ID'](fish)
          const sizeValue = propertyMap['Size'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${sexValue}+${familyValue}+${sizeValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else {
        // For other four-filter combinations, show an error or fallback
        console.log('Other four-filter combinations not yet supported')
        setStratifiedFish({})
        setRemainingFish(fishData)
      }
    }
  }, [activeFilters])

  useEffect(() => {
    // Only hide results on filter change if the user has never randomized
    // if (!hasRandomizedOnce) {
    setShowResults(false)
    setResultData(null)
    // }
  }, [activeFilters])

  // useEffect(() => {
  //   // Only auto-update if the user has clicked randomize at least once
  //   if (hasRandomizedOnce && activeFilters.length > 0 && hasStratificationData()) {
  //     const data = getDataForFilters(activeFilters);

  //     // Add new data to results history if it doesn't already exist
  //     setAllResults(prevResults => {
  //       const methodExists = prevResults.some(r => r.Method === data.Method);
  //       if (!methodExists) {
  //         return [...prevResults, data];
  //       }
  //       return prevResults;
  //     });
  //     setResultData(data);
  //     setShowResults(true);
  //   }
  // }, [activeFilters, hasRandomizedOnce]);

  // useEffect(() => {
  //   // Only auto-update if the user has clicked randomize at least once
  //   if (hasRandomizedOnce && activeFilters.length > 0 && hasStratificationData()) {
  //     const data = getDataForFilters(activeFilters);
  //     setResultData(data);
  //     setShowResults(true);
  //   }
  // }, [activeFilters, hasRandomizedOnce]);

  const handleRandomize = () => {
    if (activeFilters.length === 0) return

    const data = getDataForFilters(activeFilters)

    // Add new data to results history if it doesn't already exist
    setAllResults((prevResults) => {
      const methodExists = prevResults.some((r) => r.Method === data.Method)
      if (!methodExists) {
        return [...prevResults, data]
      }
      return prevResults
    })

    setResultData(data)
    setShowResults(true)
    setHasRandomizedOnce(true)
  }

  // useEffect(() => {
  //   if (hasRandomizedOnce && activeFilters.length > 0 && hasStratificationData()) {
  //     const data = getDataForFilters(activeFilters);

  //     // Add new data to results history if it doesn't already exist
  //     setAllResults(prevResults => {
  //       const methodExists = prevResults.some(r => r.Method === data.Method);
  //       if (!methodExists) {
  //         return [...prevResults, data];
  //       }
  //       return prevResults;
  //     });

  //     setResultData(data);
  //     setShowResults(true);
  //   }
  // }, [activeFilters, hasRandomizedOnce]);

  const getDataForFilters = (activeFilters) => {
    // If no filters, return Simple randomization data
    if (activeFilters.length === 0) {
      return zebraFishSummaryData.find((row) => row.Method === 'Simple')
    }

    // Sort filter names to match the order in the mapping
    const sortedFilters = [...activeFilters].sort((a, b) => {
      // Custom sort order
      const order = {
        Size: 1,
        Sex: 2,
        'Family ID': 3,
        'Swimming Speed': 4,
      }
      return order[a] - order[b]
    })

    const filterKey = sortedFilters.join('+')
    const methodKey = filterToMethodMap[filterKey]

    return zebraFishSummaryData.find((row) => row.Method === methodKey)
  }

  const handleMouseOver = (fish, e) => {
    setHoveredFish(fish)
    setTooltipPosition({ x: e.clientX, y: e.clientY })
  }

  const handleMouseOut = () => {
    setHoveredFish(null)
    setTooltipPosition(null)
  }

  const handleContinue = () => {
    console.log('Continue clicked')
    // Navigation logic
    // router.push('/next-page');
  }

  // Generate tank colors for different strata
  const getTankColors = (index) => {
    const colors = [
      { bg: '#1E90FF', tank: '#ADD8E6' }, // Blue
      { bg: '#FF69B4', tank: '#FFC0CB' }, // Pink
      { bg: '#32CD32', tank: '#90EE90' }, // Green
      { bg: '#9370DB', tank: '#D8BFD8' }, // Purple
      { bg: '#FF8C00', tank: '#FFD700' }, // Orange
      { bg: '#20B2AA', tank: '#AFEEEE' }, // Teal
      { bg: '#8A2BE2', tank: '#CCBBFF' }, // BlueViolet
      { bg: '#CD5C5C', tank: '#FFA07A' }, // IndianRed
      { bg: '#4169E1', tank: '#B0C4DE' }, // RoyalBlue
      { bg: '#2E8B57', tank: '#8FBC8F' }, // SeaGreen
      { bg: '#800080', tank: '#DDA0DD' }, // Purple
      { bg: '#4B0082', tank: '#E6E6FA' }, // Indigo
      { bg: '#8B4513', tank: '#DEB887' }, // SaddleBrown
      { bg: '#708090', tank: '#B0C4DE' }, // SlateGray
      { bg: '#556B2F', tank: '#9ACD32' }, // DarkOliveGreen
      { bg: '#B8860B', tank: '#F0E68C' }, // DarkGoldenrod
    ]

    return colors[index % colors.length]
  }

  // Determine the grid columns based on number of tanks
  const getGridColumns = (numTanks) => {
    if (numTanks <= 2) return '1fr'
    if (numTanks <= 4) return '1fr 1fr'
    if (numTanks <= 6) return '1fr 1fr 1fr'
    if (numTanks <= 9) return '1fr 1fr 1fr'
    if (numTanks <= 16) return '1fr 1fr 1fr 1fr'
    if (numTanks <= 32) return '1fr 1fr 1fr 1fr'
    return '1fr 1fr 1fr 1fr'
  }

  // const getGridColumns = (numTanks) => {
  //     if (numTanks <= 2) return '1fr';
  //     if (numTanks <= 4) return 'repeat(2, 1fr)';
  //     if (numTanks <= 9) return 'repeat(3, 1fr)';
  //     if (numTanks <= 16) return 'repeat(4, 1fr)';
  //     if (numTanks <= 25) return 'repeat(5, 1fr)';
  //     return 'repeat(5, 1fr)'; // Maximum 5 columns
  //   };

  // Check if we have stratification data for the current filter combination
  const hasStratificationData = () => {
    if (activeFilters.length === 0) return false
    if (activeFilters.length === 1)
      return !!stratificationData[activeFilters[0]]

    // For two filters
    if (activeFilters.length === 2) {
      const sortedFilters = [...activeFilters].sort()
      const combinationKey = sortedFilters.join('+')
      const canonicalKey = combinationAliases[combinationKey] || combinationKey

      // Special case for Size+Swimming Speed
      if (canonicalKey === 'Size+Swimming Speed') {
        return !!combinedStratificationData['Size+Swimming Speed']
      }

      return !!combinedStratificationData[canonicalKey]
    }

    // For three filters - currently only supporting Sex+Family ID+Size
    // if (activeFilters.length === 3) {
    //   const hasRequiredFilters = activeFilters.includes("Sex") &&
    //                              activeFilters.includes("Family ID") &&
    //                              activeFilters.includes("Size");

    //   return hasRequiredFilters && !!combinedStratificationData["Sex+Family ID+Size"];
    // }

    if (activeFilters.length === 3) {
      const hasSexFamilySize =
        activeFilters.includes('Sex') &&
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Size')

      const hasSexFamilySpeed =
        activeFilters.includes('Sex') &&
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Swimming Speed')

      const hasSexSizeSpeed =
        activeFilters.includes('Sex') &&
        activeFilters.includes('Size') &&
        activeFilters.includes('Swimming Speed')

      const hasFamilySizeSpeed =
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Size') &&
        activeFilters.includes('Swimming Speed')

      return (
        (hasSexFamilySize &&
          !!combinedStratificationData['Sex+Family ID+Size']) ||
        (hasSexFamilySpeed &&
          !!combinedStratificationData['Sex+Family ID+Swimming Speed']) ||
        (hasSexSizeSpeed &&
          !!combinedStratificationData['Sex+Size+Swimming Speed']) ||
        (hasFamilySizeSpeed &&
          !!combinedStratificationData['Family ID+Size+Swimming Speed'])
      )
    }

    if (activeFilters.length === 4) {
      const hasFourFilterCombo =
        activeFilters.includes('Sex') &&
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Size') &&
        activeFilters.includes('Swimming Speed')

      return (
        hasFourFilterCombo &&
        !!combinedStratificationData['Sex+Family ID+Size+Swimming Speed']
      )
    }

    // 4. Add a new condition to handle four filters in the useEffect:
    // Add this as a new else-if branch after the three-filter handling code
    else if (activeFilters.length === 4) {
      // Check if all four required filters are selected
      if (
        activeFilters.includes('Sex') &&
        activeFilters.includes('Family ID') &&
        activeFilters.includes('Size') &&
        activeFilters.includes('Swimming Speed')
      ) {
        console.log('Handling Sex+Family ID+Size+Swimming Speed specifically')

        // Use the data from combinedStratificationData
        const strata =
          combinedStratificationData['Sex+Family ID+Size+Swimming Speed']

        if (!strata) return

        // Initialize stratified fish object
        const stratified = {}
        strata.forEach((stratumInfo) => {
          stratified[stratumInfo.stratum] = {
            filter: 'Sex+Family ID+Size+Swimming Speed',
            stratum: stratumInfo.stratum,
            targetCount: stratumInfo.count,
            fish: [],
          }
        })

        // Property mapping for four filters
        const propertyMap = {
          Sex: (fish) => (fish.sex === 'male' ? 'Male' : 'Female'),
          'Family ID': (fish) => fish.family_id,
          Size: (fish) => (fish.size === 'long' ? 'Large' : 'Small'),
          'Swimming Speed': (fish) =>
            fish.swimming_speed === 'fast' ? 'Fast' : 'Slow',
        }

        // Distribute fish according to the filter combination
        fishData.forEach((fish) => {
          const sexValue = propertyMap['Sex'](fish)
          const familyValue = propertyMap['Family ID'](fish)
          const sizeValue = propertyMap['Size'](fish)
          const speedValue = propertyMap['Swimming Speed'](fish)
          const combinedValue = `${sexValue}+${familyValue}+${sizeValue}+${speedValue}`

          if (stratified[combinedValue]) {
            stratified[combinedValue].fish.push(fish)
          }
        })

        setStratifiedFish(stratified)
        setRemainingFish([])
      } else {
        // For other four-filter combinations, show an error or fallback
        console.log('Other four-filter combinations not yet supported')
        setStratifiedFish({})
        setRemainingFish(fishData)
      }
    }
    return false
  }

  // Get the active filter combination name for display
  const getFilterCombinationName = () => {
    if (activeFilters.length === 0) return ''
    if (activeFilters.length === 1) return activeFilters[0]
    return activeFilters.join(' + ')
  }

  const ResultsTable = ({ data, allResults }) => {
    const [showSimpleComparison, setShowSimpleComparison] = useState(false)

    const simpleMethodData = {
      Method: 'Simple',
      Est_Effect: 3.19,
      Accuracy: -1.29,
      CI_Width: 3.5,
      Male_Effect: 3.37,
      Female_Effect: 1.2,
      Sex_Diff: 2.17,
      N_Strata: 1,
      Min_Fish_per_Stratum: 20,
    }

    if (!data) return null

    const scrollToTop = () => {
      window.scrollTo({
        top: 0,
        behavior: 'smooth',
      })
    }

    const toggleSimpleComparison = () => {
      setShowSimpleComparison(!showSimpleComparison)
    }

    // Determine which results to show
    const resultsToShow = allResults.length > 0 ? allResults : [data]

    // If simple comparison is enabled, add the simple method data
    const displayResults = showSimpleComparison
      ? [simpleMethodData, ...resultsToShow]
      : resultsToShow

    return (
      <div
        style={{
          marginTop: '24px',
          backgroundColor: '#f5f9ff',
          borderRadius: '8px',
          padding: '16px',
          boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
        }}
      >
        <h3
          style={{
            textAlign: 'center',
            marginBottom: '16px',
            color: '#2c3e50',
          }}
        >
          Randomization Results Summary
        </h3>

        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              marginBottom: '16px',
            }}
          >
            <thead>
              <tr
                style={{
                  backgroundColor: '#00c802',
                  color: '#020202',
                }}
              >
                <th style={{ padding: '12px', textAlign: 'left' }}>Method</th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Est. Effect
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Accuracy
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  CI Width
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Male Effect
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Female Effect
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Sex Diff
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  N Strata
                </th>
                <th style={{ padding: '12px', textAlign: 'center' }}>
                  Min Fish/Stratum
                </th>
              </tr>
            </thead>
            <tbody>
              {displayResults.map((result, index) => (
                <tr
                  key={result.Method}
                  style={{
                    backgroundColor:
                      result.Method === 'Simple' && showSimpleComparison
                        ? 'rgba(255, 200, 0, 0.4)'
                        : result.Method === data.Method
                        ? 'rgba(255, 90, 0, 0.4)' // Highlight current method
                        : 'white',
                    borderBottom: '1px solid #ddd',
                    color: '#020202',
                  }}
                >
                  <td style={{ padding: '12px', fontWeight: 'bold' }}>
                    {result.Method}
                    {result.Method === data.Method && (
                      <span style={{ marginLeft: '8px', color: '#2196F3' }}>
                        (current)
                      </span>
                    )}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Est_Effect.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Accuracy.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.CI_Width.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Male_Effect.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Female_Effect.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Sex_Diff.toFixed(2)}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.N_Strata}
                  </td>
                  <td style={{ padding: '12px', textAlign: 'center' }}>
                    {result.Min_Fish_per_Stratum}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Top indicators row for current method */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'center',
            gap: '12px',
            marginTop: '8px',
            marginBottom: '16px',
          }}
        >
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#4CAF50',
                borderRadius: '50%',
              }}
            ></div>
            <span>High Accuracy: {data.Accuracy.toFixed(2)}</span>
          </div>

          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <div
              style={{
                width: '16px',
                height: '16px',
                backgroundColor: '#FFA000',
                borderRadius: '50%',
              }}
            ></div>
            <span>Effect Size: {data.Est_Effect.toFixed(2)}</span>
          </div>
        </div>

        {/* Buttons at the bottom right */}
        <div
          style={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: '12px',
            marginTop: '16px',
          }}
        >
          <CustomButton variant="primary" onClick={scrollToTop}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '6px' }}
            >
              <path
                d="M7 14l5-5 5 5M7 19h10"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Try Other Variables
          </CustomButton>

          <CustomButton variant="primary" onClick={toggleSimpleComparison}>
            <svg
              width="16"
              height="16"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              style={{ marginRight: '6px' }}
            >
              <path
                d="M9 18l6-6-6-6"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            {showSimpleComparison ? 'Hide Simple' : 'Compare with Simple'}
          </CustomButton>
        </div>
      </div>
    )
  }

  return (
    <div
      style={{
        minHeight: '100vh',
        padding: '16px',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        backgroundColor: '#f0f0f0',
        position: 'relative',
        justifyContent: 'flex-start',
        paddingTop: '0',
      }}
    >
      <CustomModal isOpen={isModalOpen} closeModal={closeModal} />

      <Header
        onLogoClick={handleLogoClick}
        onHelpClick={handleHelpClick}
        text="Assign Zebrafish Using Stratified Randomization"
      />

      <div
        style={{
          width: '90%',
          padding: '32px',
          backgroundColor: 'white',
          borderRadius: '8px',
          boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
          position: 'relative',
          marginTop: '8px',
        }}
      >
        {hoveredFish && tooltipPosition && (
          <FishDetails fishData={hoveredFish} position={tooltipPosition} />
        )}

        <div>
          {/* Filter checkboxes - menu bar style */}
          <div
            style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginBottom: '16px',
              padding: '10px',
              backgroundColor: 'white !important',
              color: 'black !important',
              borderRadius: '8px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.1)',
            }}
          >
            <div
              style={{
                fontWeight: 'bold',
                fontSize: '16px',
                marginRight: '16px',
                backgroundColor: 'white !important',
                color: 'black !important',
              }}
            >
              Filter by:
            </div>
            <div
              style={{
                display: 'flex',
                gap: '24px',
                backgroundColor: 'white !important',
                color: 'black !important',
              }}
            >
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  //backgroundColor: sizeChecked ? '#e0e0e0' : 'transparent',
                  backgroundColor: 'white !important',
                  color: 'black !important',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={sizeChecked}
                  onChange={handleSizeChange}
                  style={{
                    marginRight: '8px',
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    border: sizeChecked ? 'none' : '1px solid #6f00ff',
                    backgroundColor: sizeChecked ? '#6f00ff' : 'white',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                {sizeChecked && (
                  <span style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}>✓</span>
                )}
                Size
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  //backgroundColor: familyIdChecked ? '#e0e0e0' : 'transparent',
                  backgroundColor: 'white !important',
                  color: 'black !important',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={familyIdChecked}
                  onChange={handleFamilyIdChange}
                  style={{
                    marginRight: '8px',
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    border: familyIdChecked ? 'none' : '1px solid #6f00ff',
                    backgroundColor: familyIdChecked ? '#6f00ff' : 'white',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                {familyIdChecked && (
                  <span style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}>✓</span>
                )}
                Family ID
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: swimmingSpeedChecked
                    ? '#e0e0e0'
                    : 'transparent',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={swimmingSpeedChecked}
                  onChange={handleSwimmingSpeedChange}
                  style={{
                    marginRight: '8px',
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    border: swimmingSpeedChecked ? 'none' : '1px solid #6f00ff',
                    backgroundColor: swimmingSpeedChecked ? '#6f00ff' : 'white',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                {swimmingSpeedChecked && (
                  <span style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}>✓</span>
                )}
                Swimming Speed
              </label>
              <label
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  cursor: 'pointer',
                  userSelect: 'none',
                  padding: '6px 12px',
                  borderRadius: '4px',
                  backgroundColor: sexChecked ? '#e0e0e0' : 'transparent',
                  position: 'relative'
                }}
              >
                <input
                  type="checkbox"
                  checked={sexChecked}
                  onChange={handleSexChange}
                  style={{
                    marginRight: '8px',
                    appearance: 'none',
                    width: '18px',
                    height: '18px',
                    border: sexChecked ? 'none' : '1px solid #6f00ff',
                    backgroundColor: sexChecked ? '#6f00ff' : 'white',
                    borderRadius: '3px',
                    cursor: 'pointer'
                  }}
                />
                {sexChecked && (
                  <span style={{
                    position: 'absolute',
                    left: '18px',
                    top: '50%',
                    transform: 'translate(-50%, -50%)',
                    color: 'white',
                    fontSize: '12px',
                    fontWeight: 'bold',
                    pointerEvents: 'none'
                  }}>✓</span>
                )}
                Sex
              </label>
            </div>
          </div>

          {activeFilters.length === 0 && (
            <>
              {/* Main fish tank when no filter is selected */}
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

              <div
                style={{
                  margin: '24px 0',
                  textAlign: 'center',
                  fontSize: '18px',
                  color: '#555',
                }}
              >
                Select one or more stratification methods to distribute the fish
              </div>
            </>
          )}

          {activeFilters.length > 0 && !hasStratificationData() && (
            <div
              style={{
                margin: '24px 0',
                padding: '16px',
                backgroundColor: '#fff3cd',
                color: '#856404',
                borderRadius: '8px',
                textAlign: 'center',
                fontSize: '18px',
                border: '1px solid #ffeeba',
              }}
            >
              No stratification data available for the combination:{' '}
              {getFilterCombinationName()}.
              <br />
              Please select a different combination.
            </div>
          )}

          {activeFilters.length > 0 && hasStratificationData() && (
            <>
              <div
                style={{
                  margin: '16px 0 24px',
                  padding: '12px',
                  backgroundColor: '#f8f8f8',
                  borderRadius: '8px',
                  textAlign: 'center',
                }}
              >
                <h3 style={{ margin: '0 0 8px', color: '#333' }}>
                  {activeFilters.length === 1
                    ? `Stratifying by: ${activeFilters[0]}`
                    : `Combined Stratification: ${getFilterCombinationName()}`}
                </h3>
                <p style={{ margin: '0', color: '#666' }}>
                  {activeFilters.length === 1
                    ? `Fish are distributed based on ${activeFilters[0].toLowerCase()}`
                    : `Fish are distributed based on combined ${activeFilters
                        .map((f) => f.toLowerCase())
                        .join(' and ')} characteristics`}
                </p>
              </div>

              {/* <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: getGridColumns(
                    Object.keys(stratifiedFish).length,
                  ),
                  gap: '16px',
                }}
              >
                {Object.entries(stratifiedFish).map(
                  ([stratum, data], index) => {
                    const { bg, tank } = getTankColors(index)

                    return (
                      <StratumTank
                        key={stratum}
                        title={`${stratum} (${data.fish.length}/${data.targetCount})`}
                        count={data.fish.length}
                        fishList={data.fish}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                        backgroundColor={bg}
                        tankColor={tank}
                      />
                    )
                  },
                )}
              </div> */}

              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: getGridColumns(
                    Object.keys(stratifiedFish).length,
                  ),
                  gap: Object.keys(stratifiedFish).length > 9 ? '8px' : '16px',
                }}
              >
                {Object.entries(stratifiedFish).map(
                  ([stratum, data], index) => {
                    const { bg, tank } = getTankColors(index)

                    return (
                      <StratumTank
                        key={stratum}
                        // title={`${stratum} (${data.fish.length}/${data.targetCount})`}
                        title={`${stratum}`}
                        count={data.fish.length}
                        fishList={data.fish}
                        onMouseOver={handleMouseOver}
                        onMouseOut={handleMouseOut}
                        backgroundColor={bg}
                        tankColor={tank}
                        totalTanks={Object.keys(stratifiedFish).length} // Pass the total number of tanks
                      />
                    )
                  },
                )}
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
                  Now that you have selected the strata you want to use, we need
                  to randomize by those strata and run the study. Click on the
                  Randomize button to view the study outcome of this combination
                  of stratified variables.{' '}
                </div>
              </div>

              <div style={{ textAlign: 'center', marginTop: '16px' }}>
                {/* <button
                  onClick={handleRandomize}
                  style={{
                    margin: '8px',
                    padding: '8px 16px',
                    backgroundColor: '#2196F3',
                    color: 'white',
                    border: 'none',
                    borderRadius: '4px',
                    cursor:
                      activeFilters.length > 0 ? 'pointer' : 'not-allowed',
                    opacity: activeFilters.length > 0 ? 1 : 0.6,
                  }}
                  disabled={activeFilters.length === 0}
                >
                  RANDOMIZE
                </button> */}
                <CustomButton
                  variant="primary"
                  onClick={handleRandomize}
                  disabled={activeFilters.length === 0}
                >
                  Randomize and run study with stratification
                </CustomButton>
              </div>
            </>
          )}

          {/* {showResults && <ResultsTable data={resultData} />} */}
          {showResults && (
            <ResultsTable data={resultData} allResults={allResults} />
          )}

          {/* Continue button */}
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
          </div>
        </div>
      </div>
    </div>
  )
}

export default StratifiedRandomization
