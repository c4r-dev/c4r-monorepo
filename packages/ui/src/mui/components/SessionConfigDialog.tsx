const logger = require('../../../../logging/logger.js');
'use client';

import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Box,
  Typography,
  TextField,
} from '@mui/material';
import C4RButton from './C4RButton';

interface SessionConfigDialogProps {
  /** Whether dialog is open */
  open: boolean;
  /** Callback when dialog should close */
  onClose: () => void;
  /** Callback when individual mode is selected */
  onIndividualSelect: (sessionId: string) => void;
  /** Callback when group mode is selected */
  onGroupSelect: (sessionId: string) => void;
  /** Initial session ID */
  initialSessionId?: string;
}

/**
 * Session Configuration Dialog
 * 
 * Standardized dialog for session setup across activities.
 * Replaces the 20+ different session popup implementations.
 * 
 * Features:
 * - C4R branded styling
 * - Individual vs Group mode selection
 * - QR code generation for group sharing
 * - Consistent UX patterns
 * 
 * @example
 * ```tsx
 * const [sessionDialogOpen, setSessionDialogOpen] = useState(true);
 * 
 * <SessionConfigDialog
 *   open={sessionDialogOpen}
 *   onClose={() => setSessionDialogOpen(false)}
 *   onIndividualSelect={(id) => handleIndividual(id)}
 *   onGroupSelect={(id) => handleGroup(id)}
 * />
 * ```
 */
export default function SessionConfigDialog({
  open,
  onClose,
  onIndividualSelect,
  onGroupSelect,
  initialSessionId
}: SessionConfigDialogProps) {
  const [mode, setMode] = useState<'selection' | 'group' | null>('selection');
  const [sessionId] = useState(() => 
    initialSessionId || Math.random().toString(36).substring(2, 15)
  );
  const [qrCodeUrl, setQrCodeUrl] = useState('');

  const handleIndividual = () => {
    onIndividualSelect('individual1');
    onClose();
  };

  const handleGroup = () => {
    setMode('group');
    const sharingURL = `${window.location.origin}/?sessionID=${sessionId}`;
    const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(sharingURL)}`;
    setQrCodeUrl(qrUrl);
  };

  const handleStart = () => {
    onGroupSelect(sessionId);
    onClose();
  };

  const handleBack = () => {
    setMode('selection');
    setQrCodeUrl('');
  };

  const handleCopyLink = async () => {
    const sharingURL = `${window.location.origin}/?sessionID=${sessionId}`;
    try {
      await navigator.clipboard.writeText(sharingURL);
      // Could add a toast notification here
    } catch (err) {
      logger.app.error('Failed to copy:', err);
    }
  };

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="md"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      {mode === 'selection' && (
        <>
          <DialogTitle sx={{ textAlign: 'center', pb: 1 }}>
            <Typography variant="h2" component="h1">
              How are you completing this activity?
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 3,
              alignItems: 'center',
              py: 4
            }}>
              <C4RButton
                variant="c4rPrimary"
                size="large"
                onClick={handleIndividual}
                sx={{ width: 200 }}
              >
                As an Individual
              </C4RButton>
              
              <C4RButton
                variant="c4rPrimary"
                size="large"
                onClick={handleGroup}
                sx={{ width: 200 }}
              >
                As a Group
              </C4RButton>
            </Box>
          </DialogContent>
        </>
      )}

      {mode === 'group' && (
        <>
          <DialogTitle>
            <Typography variant="h2" component="h1">
              Configure Group Activity
            </Typography>
          </DialogTitle>
          <DialogContent>
            <Button 
              onClick={handleBack}
              sx={{ mb: 2 }}
            >
              ← Back
            </Button>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', md: 'row' },
              gap: 3,
              alignItems: 'center'
            }}>
              {/* Link Section */}
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography variant="h4" gutterBottom>
                  Share this link with your group:
                </Typography>
                
                <TextField
                  fullWidth
                  value={`${window.location.origin}/?sessionID=${sessionId}`}
                  InputProps={{
                    readOnly: true,
                    sx: { 
                      fontSize: '0.875rem',
                      backgroundColor: 'grey.50'
                    }
                  }}
                  sx={{ mb: 2 }}
                />
                
                <C4RButton
                  variant="contained"
                  onClick={handleCopyLink}
                  fullWidth
                  sx={{ mb: 3 }}
                >
                  Copy Link
                </C4RButton>
              </Box>

              {/* QR Code Section */}
              {qrCodeUrl && (
                <Box sx={{ 
                  textAlign: 'center',
                  p: 2,
                  border: '1px solid',
                  borderColor: 'grey.200',
                  borderRadius: 1
                }}>
                  <Typography variant="body2" gutterBottom>
                    Or scan QR code:
                  </Typography>
                  <img 
                    src={qrCodeUrl} 
                    alt="QR Code for group session" 
                    style={{ 
                      width: 180, 
                      height: 180,
                      border: '1px solid #e5e7eb',
                      borderRadius: 4
                    }}
                  />
                </Box>
              )}
            </Box>
          </DialogContent>
          
          <DialogActions sx={{ px: 3, pb: 3 }}>
            <C4RButton
              variant="c4rPrimary"
              onClick={handleStart}
              size="large"
            >
              Start Activity
            </C4RButton>
          </DialogActions>
        </>
      )}
    </Dialog>
  );
}