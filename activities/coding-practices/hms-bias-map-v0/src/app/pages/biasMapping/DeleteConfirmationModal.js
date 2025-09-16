import React from 'react';
import Box from '@mui/material/Box';
import Modal from '@mui/material/Modal';
import Button from '@mui/material/Button';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';

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
 * Modal component for confirming node deletion.
 * Provides a safety check before removing nodes
 * from the diagram and returning them to the
 * available biases pool.
 */
function DeleteConfirmationModal({ isOpen, onClose, onConfirm, biasName }) {
  return (
    <Modal
      open={isOpen}
      onClose={onClose}
      aria-labelledby="delete-confirmation-modal"
    >
      <Box sx={style}>
        <Stack spacing={3}>
          <Typography variant="h6" component="h2">
            Delete Bias Node
          </Typography>
          <Typography>
            Are you sure you want to delete this bias? Upon deletion, the node will return to the starting position.
          </Typography>
          <Stack direction="row" spacing={2} justifyContent="flex-end">
            <Button
              variant="outlined"
              onClick={onClose}
            >
              Cancel
            </Button>
            <Button
              variant="contained"
              color="error"
              onClick={onConfirm}
            >
              Delete
            </Button>
          </Stack>
        </Stack>
      </Box>
    </Modal>
  );
}

export default DeleteConfirmationModal;
