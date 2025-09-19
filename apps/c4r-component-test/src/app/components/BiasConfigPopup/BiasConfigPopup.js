'use client';

const logger = require('../../../../../../packages/logging/logger.js');
/*
This is a popup that appears at the start of the activity. 

It will be split down the middle.

On the left side, there will be a count-selection-area.
- On top, there will be a sentence of instructions.
- Below that, there will be a number: N biases
- Below that, is a slider that allows the user to select the number of biases to map.

On the right side, there will a region with displaying a link to the same page, but with a the sessionID parameter and the biasNumber parameter.
- Below is a button to copy this link to the clipboard.
    - Upon successful copy, the MUI Snackbar will appear to indicate that the link has been copied to the clipboard.

- In the lower-middle of the popup, there will be a button to start the activity.


- The popup will have optional props for the current sessionID and biasNumber.
- It should also be able to modify the sessionID and biasNumber, which belong to the BiasMappingPage.

*/

import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  Grid,
  Slider,
  Typography,
  Button,
  TextField,
  Snackbar,
  Alert,
  Box
} from '@mui/material';

const BiasConfigPopup = ({ 
  open, 
  onClose,
  sessionID: initialSessionID,
  biasNumber: initialBiasNumber,
  onConfigSubmit
}) => {
  // State for bias number and session ID
  const [biasNumber, setBiasNumber] = useState(initialBiasNumber || 5);
  const [sessionID, setSessionID] = useState(initialSessionID || generateSessionID());
  const [showCopyAlert, setShowCopyAlert] = useState(false);

  // Generate the sharing URL
  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  const sharingURL = `${baseURL}/pages/biasMapping?sessionID=${sessionID}&biasNumber=${biasNumber}`;

  // Generate random session ID if not provided
  function generateSessionID() {
    return Math.random().toString(36).substring(2, 15);
  }

  // Handle slider change
  const handleBiasNumberChange = (event, newValue) => {
    setBiasNumber(newValue);
  };

  // Handle copy link
  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharingURL);
      setShowCopyAlert(true);
    } catch (err) {
      logger.app.error('Failed to copy:', err);
    }
  };

  // Combined handler for both start button and backdrop click
  const handleStart = () => {
    onConfigSubmit?.({ sessionID, biasNumber });
    onClose?.();
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleStart}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>Configure Bias Mapping Activity</DialogTitle>
        <DialogContent>
          <Grid container spacing={4}>
            {/* Left side - Bias Count Selection */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Select the number of biases you want to map
                </Typography>
                <Typography variant="h4" gutterBottom>
                  {biasNumber} biases
                </Typography>
                <Slider
                  value={biasNumber}
                  onChange={handleBiasNumberChange}
                  min={2}
                  max={15}
                  marks
                  step={1}
                  valueLabelDisplay="auto"
                  aria-label="Number of biases"
                />
              </Box>
            </Grid>

            {/* Right side - Sharing Link */}
            <Grid item xs={12} md={6}>
              <Box sx={{ p: 2 }}>
                <Typography gutterBottom>
                  Share this link with others to collaborate
                </Typography>
                <TextField
                  fullWidth
                  value={sharingURL}
                  variant="outlined"
                  size="small"
                  InputProps={{
                    readOnly: true,
                  }}
                  sx={{ mb: 2 }}
                />
                <Button 
                  variant="outlined" 
                  onClick={handleCopyLink}
                  fullWidth
                >
                  Copy Link
                </Button>
              </Box>
            </Grid>
          </Grid>

          {/* Bottom Button */}
          <Box sx={{ mt: 4, textAlign: 'center' }}>
            <Button
              variant="contained"
              color="primary"
              size="large"
              onClick={handleStart}
            >
              Start Activity
            </Button>
          </Box>
        </DialogContent>
      </Dialog>

      {/* Copy Success Alert */}
      <Snackbar
        open={showCopyAlert}
        autoHideDuration={3000}
        onClose={() => setShowCopyAlert(false)}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert 
          onClose={() => setShowCopyAlert(false)} 
          severity="success"
          variant="filled"
        >
          Link copied to clipboard!
        </Alert>
      </Snackbar>
    </>
  );
};

export default BiasConfigPopup;