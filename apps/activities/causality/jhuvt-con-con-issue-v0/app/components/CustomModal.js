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
  width: 350,
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

export default function CustomModal({ isOpen, closeModal, hypothesis }) {
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
          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Control Issues
          </Typography>

          <Typography
            id="modal-modal-title"
            variant="h6"
            component="h2"
            sx={{ mb: 2 }}
          >
            Consider the following experiment. 
            <br/>
            <br/>
            A research team is attempting to identify causes of neuronal growth and connectivity in the developing and adult nervous system. 
            <br/>
         
            They hypothesize that a brain-specific serine protease inhibitor called neuroserpin plays a key role in regulating neuronal development.
            <br/>
          
            The team obtains a uniform group of 18 day old rat embryos. 
            <br/>
         
            They dissociate hippocampal cultures from the embryos by treatment with papain and trituration with a fire-polished pasteur pipette.
            <br/> The control group is placed into an assumed-sterile neurobasal medium that is replaced every 7 days. 
            <br/>The intervention group is treated with filtered recombinant neuroserpin. Immunohistochemistry is used to stain axons, and algorithmic image analysis is used on randomly selected grids to measure axon length as a metric of neuronal growth.
          </Typography>
        </Box>
      </Modal>
    </div>
  )
}
