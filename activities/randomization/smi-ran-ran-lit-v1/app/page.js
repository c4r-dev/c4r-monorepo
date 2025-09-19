// StudySelectionScreen.jsx
'use client';

import React, { useState, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Card, 
  CardContent, 
  Container, 
  Grid,
  useTheme,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import { Button } from '@mui/material';

import SessionConfigPopup from './components/SessionPopup/SessionConfigPopup';
import { C4RButton } from '@c4r/ui/mui';

// Define papers outside of components
const papers = [
  {
    id: 1,
    title: 'Interimpaper 1',
    citation: 'This is a placeholder paper that is interim before a paper is selected.'
  },
  {
    id: 2,
    title: 'Placepaperholder 2',
    citation: 'This is a placeholder paper that is both a paper and a placeholder.'
  },
  {
    id: 3,
    title: 'Fakepaper 3',
    citation: 'This is a fake paper that we will replace'
  }
];

// Loading component
function LoadingFallback() {
  return (
    <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={40} />
    </Container>
  );
}

// This is the inner component that will use useSearchParams
function StudySelectionContent() {
  // All the imports and state here
  const { useSearchParams } = require('next/navigation');
const logger = require('../../../../packages/logging/logger.js');
  const searchParams = useSearchParams();
  const [sessionID, setSessionID] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const theme = useTheme();
  const router = useRouter();
  const [showConfigPopup, setShowConfigPopup] = useState(true);

  // Get the sessionID from URL params
  React.useEffect(() => {
    const urlSessionID = searchParams.get('sessionID');
    if (urlSessionID) {
      setSessionID(urlSessionID);
      setShowConfigPopup(false);
    } else {
      setShowConfigPopup(true);
    }
  }, [searchParams]);

  const handlePaperSelect = (paperId) => {
    setSelectedPaper(paperId);
  };

  const handleConfigClose = () => {
    // Only allow closing if a sessionID exists
    if (sessionID) {
      setShowConfigPopup(false);
    }
  };

  const handleContinue = () => {
    if (selectedPaper) {
      logger.app.info(`Proceeding with paper ${selectedPaper}`);
      
      // Include sessionID in the URL if it exists
      const queryParams = new URLSearchParams();
      queryParams.append('selectedSection', selectedPaper);
      
      if (sessionID) {
        queryParams.append('sessionID', sessionID);
      }
      
      // Now router is properly defined
      router.push(`/StudyQuestion?${queryParams.toString()}`);
    }
  };

  return (
    <Container maxWidth="md" sx={{ py: 8 }}>
      <Box textAlign="center" mb={4}>
        <Typography variant="h5" component="h2">
          Select a study to explore
        </Typography>
      </Box>
     
      <Box sx={{ my: 4 }}>
        {/* <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
          selection-section
        </Typography> */}
        <SessionConfigPopup 
          open={showConfigPopup}
          onClose={handleConfigClose}
        />
        
        {/* Modified Grid container with nowrap and equal spacing */}
        <Grid 
          container 
          spacing={2} 
          justifyContent="center" 
          wrap="nowrap" 
          sx={{ overflowX: 'auto' }}
        >
          {papers.map((paper) => (
            <Grid item key={paper.id} sx={{ flexGrow: 1, width: '33%' }}>
              <Card 
                onClick={() => handlePaperSelect(paper.id)}
                sx={{
                  height: 200,
                  backgroundColor: 'secondary.main', // C4R Orange color
                  cursor: 'pointer',
                  border: selectedPaper === paper.id ? `4px solid ${theme.palette.primary.main}` : 'none',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    transform: 'scale(1.03)',
                    boxShadow: theme.shadows[8],
                  }
                }}
              >
                <CardContent>
                  <Typography variant="h6" component="div" fontWeight="bold">
                    {paper.title}
                  </Typography>
                  <Typography variant="body2">
                    {paper.citation}
                  </Typography>
                </CardContent>
              </Card>
            </Grid>
          ))}
        </Grid>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
        <C4RButton 
          variant="c4rPrimary"
          disabled={!selectedPaper}
          onClick={handleContinue}
          aria-label="Continue to selected study"
          sx={{ 
            px: 4,
            py: 1,
            textTransform: 'uppercase',
            fontWeight: 'bold',
          }}
        >
          CONTINUE
        </C4RButton>
      </Box>
    </Container>
  );
}

// The main component export - only renders the Suspense wrapped content
export default function StudySelectionScreen() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <StudySelectionContent />
    </Suspense>
  );
}