'use client';

import React, { useState, useEffect } from 'react';
import Header from './Header';

// This is a wrapper component that only renders the Header on the client side
// to prevent hydration mismatch errors
const ClientOnlyHeader = (props) => {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) {
    // Return a placeholder with similar dimensions to avoid layout shift
    return (
      <div style={{ 
        width: '100%', 
        height: '80px', 
        backgroundColor: '#f8f8f8',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}>
        <div style={{ 
          fontSize: '1.5rem', 
          fontWeight: 'bold',
          textAlign: 'center',
          padding: '0 20px'
        }}>
          {props.text || "NMDA Study Task Assignment"}
        </div>
      </div>
    );
  }

  // Once component is mounted (client-side only), render the actual Header
  return <Header {...props} />;
};

export default ClientOnlyHeader;