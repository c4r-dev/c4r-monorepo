// StudySelectionScreen.jsx
'use client';

import React, { useState, Suspense } from 'react';
import { 
  Box, 
  Typography, 
  Button, 
  Card, 
  CardContent, 
  Container, 
  Grid,
  useTheme,
  CircularProgress
} from '@mui/material';
import { useRouter } from 'next/navigation';
import CustomButton from '../components/CustomButton';
import SessionConfigPopup from '../components/SessionPopup/SessionConfigPopup';

// Define papers outside of components
const papers = [
  {
    id: 1,
    title: 'Does exercise improve performance on cognitive inhibition tasks?',
    citation: 'This is a placeholder paper that is interim before a paper is selected.'
  },
  {
    id: 2,
    title: 'Does early administration of pharmaceuticals improve neurological outcomes following spinal cord injury?',
    citation: 'This is a placeholder paper that is both a paper and a placeholder.'
  },
  {
    id: 3,
    title: 'How is emotional processing of faces influenced by medication and expectations in patients with depression?',
    citation: 'This is a fake paper that we will replace'
  }
];

// Loading component
function Loading() {
  return (
    <Container maxWidth="md" sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
      <CircularProgress size={40} />
    </Container>
  );
}

// Client component that uses useSearchParams
function ClientContent() {
  // Import here to ensure it's only used in client component
  const { useSearchParams } = require('next/navigation');
const logger = require('../../../../../packages/logging/logger.js');
  const searchParams = useSearchParams();
  const [sessionID, setSessionID] = useState('');
  const [selectedPaper, setSelectedPaper] = useState(null);
  const theme = useTheme();
  const router = useRouter();
  const [showConfigPopup, setShowConfigPopup] = useState(true);

  // Process the search params
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
      logger.app.info(`Proceeding with paper ${selectedPaper} and session ${sessionID}`);
      
      // Include both sessionID and selectedSection in the URL
      const url = `/StudyQuestion?sessionID=${sessionID}&selectedSection=${selectedPaper}`;
      
      // For debugging - log the URL we're navigating to
      logger.app.info(`Navigating to: ${url}`);
      
      // Use router to navigate
      router.push(url);
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
        
        {/* Container with fixed width to prevent scrollbars on hover/selection */}
        <Box sx={{ overflow: 'hidden' }}>
          <Grid 
            container 
            spacing={2} 
            justifyContent="center" 
            wrap="nowrap"
          >
            {papers.map((paper) => (
              <Grid item key={paper.id} sx={{ flexGrow: 1, width: '33%', padding: 1 }}>
                <Card 
                  onClick={() => handlePaperSelect(paper.id)}
                  sx={{
                    height: 200,
                    backgroundColor: '#f47321', // Orange color
                    cursor: 'pointer',
                    border: selectedPaper === paper.id ? `4px solid ${theme.palette.primary.main}` : 'none',
                    transition: 'all 0.2s ease-in-out',
                    '&:hover': {
                      transform: 'scale(1.02)',
                      boxShadow: theme.shadows[8],
                    },
                    // Ensure transform doesn't create overflow
                    transformOrigin: 'center center'
                  }}
                >
                  <CardContent>
                    <Typography variant="h7" component="div" fontWeight="bold">
                      {paper.title}
                    </Typography>
                    {/* <Typography variant="body2">
                      {paper.citation}
                    </Typography> */}
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
      
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 6 }}>
       <Button 
        variant="contained"
        disabled={!selectedPaper}
        onClick={handleContinue}
        aria-label="Continue to selected study"
        sx={{ 
          px: 4,
          py: 1,
          borderRadius: 1,
          textTransform: 'uppercase',
          fontWeight: 'bold',
          backgroundColor: !selectedPaper ? undefined : '#000000', // Black when enabled, default disabled color when disabled
          '&.Mui-disabled': {
            // Keep the default disabled styling
          },
          '&:hover': {
            backgroundColor: '#6e00ff', // Purple hover color
          }
        }}
      >
        CONTINUE
      </Button>
      </Box>
    </Container>
  );
}

// Main component that wraps everything in Suspense
export default function StudySelectionScreen() {
  return (
    <Suspense fallback={<Loading />}>
      <ClientContent />
    </Suspense>
  );
}