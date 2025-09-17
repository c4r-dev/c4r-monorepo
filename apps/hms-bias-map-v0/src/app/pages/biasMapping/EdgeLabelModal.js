import React, { useState } from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import TextField from '@mui/material/TextField';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  bgcolor: 'background.paper',
  borderRadius: 2,
  boxShadow: 24,
  p: 4,
};

/**
 * Modal component for editing edge labels.
 * Allows users to:
 * - Add/edit relationship descriptions
 * - Delete connections
 * - Save changes with keyboard shortcuts
 */
function EdgeLabelModal({ isOpen, onClose, onSave, onDelete, initialLabel }) {
  const [labelText, setLabelText] = useState('');

  const handleSave = () => {
    onSave(labelText);
    onClose();
  };

  const handleDelete = () => {
    onDelete();
    onClose();
  };

  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="edge-label-modal"
    >
      <Box sx={style}>
        <Stack spacing={3}>
          <TextField
            autoFocus
            fullWidth
            multiline
            rows={4}
            label="Relationship Description"
            placeholder="Enter a description here"
            variant="outlined"
            value={labelText}
            onChange={(e) => setLabelText(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && e.ctrlKey) {
                handleSave();
              }
            }}
          />
          <Stack direction="row" spacing={2} justifyContent="space-between">
            <Button
              variant="contained"
              color="primary"
              onClick={handleSave}
            >
              Save
            </Button>
            <Button
              variant="outlined"
              color="error"
              onClick={handleDelete}
            >
              Delete Edge
            </Button>
          </Stack>
          {/* <div style={{ fontSize: '12px', color: '#666' }}>
            Tip: Press Ctrl+Enter to save
          </div> */}
        </Stack>
      </Box>
    </Modal>
  );
}

export default EdgeLabelModal;
