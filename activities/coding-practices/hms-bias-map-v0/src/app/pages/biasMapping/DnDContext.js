"use client";

import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import biasData from './biasData.json';
import { PRE_POPULATED_BIASES } from './constants';

const DnDContext = createContext(null);

const initialBiases = [
  'Confirmation Bias',
  'Anchoring Bias',
  'Availability Bias',
  'Bandwagon Effect',
  'Dunning-Kruger Effect'
];

// Create biasDescriptions object from biasData
const biasDescriptions = biasData.reduce((acc, bias) => {
  acc[bias.BiasName] = bias.BiasDescription;
  return acc;
}, {});

/**
 * Context provider for managing drag and drop state.
 * Handles:
 * - Available biases tracking
 * - Bias selection state
 * - Bias shuffling functionality
 * - Integration with URL parameters
 */
export function DnDProvider({ children }) {
  const [availableBiases, setAvailableBiases] = useState([]);
  const searchParams = useSearchParams();

  const shuffleBiases = (currentCount, individualMode = false) => {
    const allBiasNames = biasData.map(bias => bias.BiasName);
    
    // For individual mode, return empty array since nodes are placed directly
    if (individualMode) {
      setAvailableBiases([]);
      return;
    }

    // For group mode, shuffle and select random biases
    const shuffledBiases = [...allBiasNames]
      .sort(() => Math.random() - 0.5)
      .slice(0, currentCount);

    setAvailableBiases(shuffledBiases);
  };

  useEffect(() => {
    const biasNumber = parseInt(searchParams.get('biasNumber')) || 0;
    const individualMode = searchParams.get('individualMode') === 'true';
    const prePopulate = searchParams.get('prePopulate') === 'true';

    if (individualMode || prePopulate) {
      // For individual or pre-populate mode, return empty array since nodes are placed directly
      setAvailableBiases([]);
    } else {
      // For group mode, shuffle and select random biases
      const allBiasNames = biasData.map(bias => bias.BiasName);
      const shuffledBiases = [...allBiasNames]
        .sort(() => Math.random() - 0.5)
        .slice(0, biasNumber);

      setAvailableBiases(shuffledBiases);
    }
  }, [searchParams]);

  return (
    <DnDContext.Provider value={{ 
      availableBiases, 
      setAvailableBiases,
      selectedBias: null,
      setSelectedBias: () => {},
      biasDescriptions,
      shuffleBiases 
    }}>
      {children}
    </DnDContext.Provider>
  );
}

export function useDnD() {
  const context = useContext(DnDContext);
  if (!context) {
    throw new Error('useDnD must be used within a DnDProvider');
  }
  return context;
}
