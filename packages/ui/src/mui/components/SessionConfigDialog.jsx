'use client';
const logger = require('../../../../logging/logger.js');

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

/**
 * @typedef {Object} SessionConfigDialogProps
 * @property {*} /** Whether dialog is open */
  open
 * @property {*} /** Callback when dialog should close */
  onClose
 * @property {*} /** Callback when individual mode is selected */
  onIndividualSelect
 * @property {*} /** Callback when group mode is selected */
  onGroupSelect
 * @property {*} /** Initial session ID */
  initialSessionId?
 */

/**
 * Session Configuration Dialog
 * 
 * Standardized dialog for session setup across activities.
 * Replaces the 20+ different session popup implementations.
 * 
 * Features, setSessionDialogOpen] = useState(true);
 * 
 *  setSessionDialogOpen(false)}
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
  const [mode, setMode] = useState('selection');
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
    const qrUrl = `https=200x200&data=${encodeURIComponent(sharingURL)}`;
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
      logger.app.error('Failed to copy, err);
    }
  };

  return (

              How are you completing this activity?

              Configure Group Activity

                  Share this link with your group={`${window.location.origin}/?sessionID=${sessionId}`}
                  InputProps={{
                    readOnly,
                    sx,
                      backgroundColor={{ mb="contained"
                  onClick={handleCopyLink}
                  fullWidth
                  sx={{ mb={{ 
                  textAlign,
                  p,
                  border,
                  borderColor,
                  borderRadius="body2" gutterBottom>
                    Or scan QR code={qrCodeUrl} 
                    alt="QR Code for group session" 
                    style={{ 
                      width, 
                      height,
                      border,
                      borderRadius)}

              Start Activity

      )}
    
  );
}