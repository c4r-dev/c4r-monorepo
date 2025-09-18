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
- NEW: QR code for easy mobile access in group mode
    - Upon successful copy, the MUI Snackbar will appear to indicate that the link has been copied to the clipboard.

- In the lower-middle of the popup, there will be a button to start the activity.

- The popup will have optional props for the current sessionID and biasNumber.
- It should also be able to modify the sessionID and biasNumber, which belong to the inputPage.

*/

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
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
  Box,
  FormControlLabel,
  Checkbox
} from '@mui/material';
// You'll need to install this: npm install qrcode.react
import { QRCodeSVG } from 'qrcode.react';

const SessionConfigPopup = ({ 
  open, 
  onClose,
  sessionID: initialSessionID,
  biasNumber: initialBiasNumber,
  onConfigSubmit,
  groupModeOnly = false
}) => {
  const [mode, setMode] = useState(groupModeOnly ? 'group' : null);
  const [biasNumber, setBiasNumber] = useState(initialBiasNumber || 5);
  const [sessionID, setSessionID] = useState(initialSessionID || generateSessionID());
  const [showCopyAlert, setShowCopyAlert] = useState(false);
  const [prePopulate, setPrePopulate] = useState(true);

  const baseURL = typeof window !== 'undefined' ? window.location.origin : '';
  const sharingURL = `${baseURL}/pages/input?sessionID=${sessionID}`;

  const router = useRouter();

  function generateSessionID() {
    return Math.random().toString(36).substring(2, 15);
  }

  const handleBiasNumberChange = (event, newValue) => {
    setBiasNumber(newValue);
  };

  const handleCopyLink = async () => {
    try {
      await navigator.clipboard.writeText(sharingURL);
      setShowCopyAlert(true);
    } catch (err) {
      logger.app.error('Failed to copy:', err);
    }
  };

  const handleStart = () => {
    const url = `${baseURL}/pages/input?sessionID=${sessionID}` + 
      (prePopulate ? '' : '');
    router.push(url);
    onConfigSubmit?.({ sessionID, biasNumber, prePopulate });
    onClose?.();
  };

  const handleModeSelect = (selectedMode) => {
    if (selectedMode === 'individual') {
      // Route to the individual mode page
      router.push(`${baseURL}/pages/input?sessionID=group1`);
      onClose?.();
    } else {
      // Reset values for group mode
      setSessionID(generateSessionID());
      setBiasNumber(6);
      setMode('group');
    }
  };

  const handleBack = () => {
    // Reset values when going back
    setSessionID(generateSessionID());
    setBiasNumber(5);
    setMode(null);
  };

  const handleClose = (event, reason) => {
    // Only close if the reason is not backdrop click
    if (reason && reason === 'backdropClick') {
      return;
    }
    onClose?.();
  };

  const handlePrePopulateChange = (event) => {
    setPrePopulate(event.target.checked);
    if (event.target.checked) {
      setBiasNumber(6); // Set to 6 biases when pre-populate is selected
    }
  };

  return (
    <>
      <Dialog 
        open={open} 
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        disableEscapeKeyDown
      >
        {mode === null ? (
          <>
            <DialogTitle sx={{ textAlign: 'center' }}>
              How are you completing this activity?
            </DialogTitle>
            <DialogContent>
              <Box sx={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: 2,
                alignItems: 'center',
                mt: 6,
                mb: 6,
              }}>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleModeSelect('individual')}
                  sx={{ width: '200px' }}
                >
                  As an Individual
                </Button>
                <Button
                  variant="contained"
                  size="large"
                  onClick={() => handleModeSelect('group')}
                  sx={{ width: '200px' }}
                >
                  As a Group
                </Button>
              </Box>
            </DialogContent>
          </>
        ) : (
          <>
            <DialogTitle>Configure Bias Mapping Activity</DialogTitle>
            <DialogContent>
              {!groupModeOnly && (
                <Button 
                  variant="text" 
                  onClick={handleBack}
                  sx={{ mb: 2 }}
                >
                  ← Back
                </Button>
              )}
              <Grid container spacing={4}>
                <Grid item xs={12} md={6}>
                  <Box sx={{ mt: 2 }}>
                    <FormControlLabel
                      control={
                        <Checkbox
                          checked={prePopulate}
                          onChange={handlePrePopulateChange}
                          color="primary"
                        />
                      }
                      label="Populate canvas with pre-selected biases"
                    />
                  </Box>
                  <Box sx={{ p: 2, opacity: prePopulate ? 0.5 : 1 }}>
                    <Typography gutterBottom sx={{ color: prePopulate ? 'text.disabled' : 'text.primary' }}>
                      Select the number of biases you want to map
                    </Typography>
                    <Typography variant="h4" gutterBottom sx={{ color: prePopulate ? 'text.disabled' : 'text.primary' }}>
                      {biasNumber} biases
                    </Typography>
                    <Box sx={{ position: 'relative', width: '100%', mt: 2, mb: 4 }}>
                      <Box sx={{ 
                        display: 'flex', 
                        justifyContent: 'space-between',
                        position: 'absolute',
                        width: '100%',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        zIndex: 1,
                        color: prePopulate ? 'text.disabled' : '#6f00ff',
                        fontWeight: 'bold'
                      }}>
                        <Typography>{biasNumber}</Typography>
                        <Typography>15</Typography>
                      </Box>
                      <Slider
                        value={biasNumber}
                        onChange={handleBiasNumberChange}
                        min={2}
                        max={15}
                        marks
                        step={1}
                        valueLabelDisplay="auto"
                        aria-label="Number of biases"
                        disabled={prePopulate}
                        sx={{
                          '& .MuiSlider-rail': {
                            background: prePopulate 
                              ? 'linear-gradient(90deg, #cccccc, #dddddd)' 
                              : 'linear-gradient(90deg, #000000, #6f00ff)',
                            borderRadius: '5px',
                            height: '8px',
                            opacity: 1,
                          },
                          '& .MuiSlider-track': {
                            display: 'none',
                          },
                          '& .MuiSlider-thumb': {
                            backgroundColor: prePopulate ? '#cccccc' : '#6f00ff',
                            width: '16px',
                            height: '16px',
                            '&:hover, &.Mui-focusVisible': {
                              boxShadow: prePopulate 
                                ? '0 0 0 8px rgba(204, 204, 204, 0.16)'
                                : '0 0 0 8px rgba(111, 0, 255, 0.16)',
                            },
                          },
                          '& .MuiSlider-mark': {
                            display: 'none',
                          },
                          mx: 3,
                          zIndex: 2,
                          width: 'calc(100% - 64px)',
                        }}
                      />
                    </Box>
                  </Box>
                </Grid>
                
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
                      sx={{ mb: 3 }}
                    >
                      Copy Link
                    </Button>
                    
                    {/* QR Code Section - Only show in group mode */}
                    {mode === 'group' && (
                      <Box sx={{ 
                        display: 'flex', 
                        flexDirection: 'column', 
                        alignItems: 'center',
                        mt: 2 
                      }}>
                        <Typography variant="body2" gutterBottom sx={{ mb: 1 }}>
                          Or scan QR code:
                        </Typography>
                        <Box sx={{ 
                          p: 2, 
                          border: '1px solid #e0e0e0', 
                          borderRadius: 1,
                          backgroundColor: '#ffffff'
                        }}>
                          <QRCodeSVG 
                            value={sharingURL}
                            size={120}
                            level="M"
                            includeMargin={false}
                          />
                        </Box>
                        <Typography variant="caption" color="text.secondary" sx={{ mt: 1, textAlign: 'center' }}>
                          Scan with your phone camera
                        </Typography>
                      </Box>
                    )}
                  </Box>
                </Grid>
              </Grid>
              
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
          </>
        )}
      </Dialog>

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

export default SessionConfigPopup;