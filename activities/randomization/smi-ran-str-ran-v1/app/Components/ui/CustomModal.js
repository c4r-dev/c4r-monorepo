'use client'

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

import * as React from 'react'
import { useEffect } from 'react'
import Box from '@mui/material/Box'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Modal from '@mui/material/Modal'

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
}

export default function CustomModal({ isOpen, closeModal }) {
  // const [open, setOpen] = React.useState(visible);
  // const handleOpen = () => setOpen(true);
  // const handleClose = () => setOpen(false);

  // useEffect(() => {
  //   setOpen(visible);
  //   console.log("visible changed", visible);
  // }, [visible]);

  // useEffect(() => {
  //   console.log("open changed", open);
  // }, [open]);

  // const handleClose = () => {
  //   setOpen(false);
  //   console.log("closed");
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
              fontFamily: 'var(--font-general-sans-semi-bold)',
              '&:hover': {
                backgroundColor: 'lightgray', // Optional: change hover color for better visibility
                color: 'black',
              },
            }}
          >
            X
          </Button>
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            An experiment on zebrafish has a total of 20 experimental subjects in two different treatment groups:
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2, pl: 2 }}
          >
            • Environmental enrichment with stones, plants, plastic tubing, and driftwood in the tank (&quot;Enrichment&quot;)
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 3, pl: 2 }}
          >
            • Tank with no environmental enrichment (&quot;Control&quot;)
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Other factors that differ between individual subjects:
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 1, pl: 2 }}
          >
            • Sex
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 1, pl: 2 }}
          >
            • What family they belong to (&quot;FamilyID&quot;)
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 1, pl: 2 }}
          >
            • Size
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 3, pl: 2 }}
          >
            • Swimming speed
          </Typography>
          <Typography
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            If you are interested in testing the effects of environmental enrichment on aggression, how might you randomly assign subjects to treatment?
          </Typography>
        </Box>
      </Modal>
    </div>
  )
}