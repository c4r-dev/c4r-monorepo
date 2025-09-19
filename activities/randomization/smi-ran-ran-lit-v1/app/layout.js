// app/layout.js
'use client';
import React, {useState} from 'react';
import { AppBar, Toolbar, Typography, Box, Container } from '@mui/material';
import { C4RThemeProvider, C4RActivityLayout } from '@c4r/ui/mui';
import Header from './components/Header/Header';
import CustomModal from './components/CustomModal';





export default function RootLayout({ children }) {
  const [isModalOpen, setIsModalOpen] = useState(false)

  const handleHelpClick = () => {
    setIsModalOpen(true)
  }

  const closeModal = () => {
    setIsModalOpen(false)
  }

  const helpContent = (
    <CustomModal isOpen={isModalOpen} closeModal={closeModal} />
  );
  
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <C4RThemeProvider>
          <C4RActivityLayout 
            title="Randomization in the Literature"
            helpContent={helpContent}
            showHome
            showRefresh
          >
            {children}
          </C4RActivityLayout>
        </C4RThemeProvider>
      </body>
    </html>
  );
}