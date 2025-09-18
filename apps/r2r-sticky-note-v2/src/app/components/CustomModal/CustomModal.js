const logger = require('../../../../../../packages/logging/logger.js');
"use client";

/*

CustomModal.js

- This component is a wrapper for the Modal component from MUI
- It is used to display a modal dialog

Props:
- isOpen: boolean (Required to control the visibility of the modal)
- closeModal: function (Required for the modal's close button to work. Should be a function in the parent component that sets the isOpen state to false)

Recommened usage:
  - In parent component, declare a state variable to control the visibility of the modal
  - Create a function that sets the isOpen state to false
  - Pass in the state variable and the function to close the modal
*/

import * as React from 'react';
import { useEffect } from 'react';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Typography from '@mui/material/Typography';
import Modal from '@mui/material/Modal';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 400,
  minWidth: 'fit-content',
  bgcolor: '#6e00ff', // Changed background color to purple
  // border: '2px solid #000',
  border: 'none',
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
  color: 'white', // Changed text color to white for better contrast
  outline: 0,
};



export default function CustomModal({ isOpen, closeModal }) {
  // const [open, setOpen] = React.useState(visible);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  // useEffect(() => {
  //   setOpen(visible);
  //   logger.app.info("visible changed", visible);
  // }, [visible]);

  // useEffect(() => {
  //   logger.app.info("open changed", open);
  // }, [open]);

  // const handleClose = () => {
  //   setOpen(false);
  //   logger.app.info("closed");
  // };

  return (
    <div>
      {/* <Button onClick={handleOpen}>Open modal</Button> */}
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
          <Button
            onClick={closeModal}
            sx={{
              position: 'absolute',
              top: 8,
              right: 8,
              color: 'white', // Changed button text color to purple
              // backgroundColor: 'white', // Changed button background to white
              minWidth: 'auto',
              // width: 'fit-content',
              padding: '4px 12px',
              borderRadius: '50%',
              '&:hover': {
                backgroundColor: 'lightgray', // Optional: change hover color for better visibility
                color: 'black',
              },
            }}
          >
            X
          </Button>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.
          </Typography>
          <Typography id="modal-modal-title" variant="h6" component="h2" sx={{ mb: 2 }}>
          Lorem ipsum dolor sit amet, consectetur adipiscing elit.
          </Typography>
          {/* <Typography id="modal-modal-title" variant="h6" component="h2">
            Text in a modal
          </Typography>          */}
          {/* <Typography id="modal-modal-description" sx={{ mt: 2 }}>
            Duis mollis, est non commodo luctus, nisi erat porttitor ligula.
          </Typography> */}
        </Box>
      </Modal>
    </div>
  );
}
