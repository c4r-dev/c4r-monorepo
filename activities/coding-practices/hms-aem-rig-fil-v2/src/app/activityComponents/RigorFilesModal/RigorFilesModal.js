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

import CustomButton from '@/app/components/CustomButton/CustomButton';

const style = {
  position: 'absolute',
  top: '50%',
  left: '50%',
  transform: 'translate(-50%, -50%)',
  width: 800,
  minWidth: 'fit-content',
  maxWidth: '90%',
  bgcolor: '#F4F734', // Changed background color to purple
  // border: '2px solid #000',
  border: 'none',
  borderRadius: '4px',
  boxShadow: 24,
  p: 4,
  color: '#202020', // Changed text color to white for better contrast
  outline: 0,
};



export default function RigorFilesModal({ isOpen, closeModal }) {
  return (
    <div>
      <Modal
        open={isOpen}
        onClose={closeModal}
        aria-labelledby="modal-modal-title"
        aria-describedby="modal-modal-description"
      >
        <Box sx={style}>
            {/* X Button */}
            <Button
                onClick={closeModal}
                sx={{
                position: 'absolute',
                top: 8,
                right: 8,
                color: '#202020', // Changed button text color to purple
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

            <Typography id="modal-title" variant="h6" component="h2">
                CLINICAL TRIAL FOR A NEW DRUG
            </Typography>
            <Typography id="modal-description" sx={{ mt: 2 }}>
                A pharmaceutical company is conducting a phase III clinical trial to evaluate the safety and efficacy of a novel drug for treating hypertension. The drug aims to lower blood pressure without significant side effects.
            </Typography>
            <Box sx={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, mt: 2 }}>
                <Box>
                    <Typography variant="subtitle1">STUDY TEAM</Typography>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>Principal Investigator (PI): Dr. Emily Carter</li>
                        <li>Research Coordinator: Sarah Patel</li>
                        <li>Data Analyst: Dr. Mark Johnson</li>
                    </ul>
                </Box>
                <Box>
                    <Typography variant="subtitle1">PARTICIPANTS</Typography>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>500 adult participants (aged 40-65) with diagnosed hypertension.</li>
                        <li>Randomly assigned to either the experimental drug group or a placebo group.</li>
                    </ul>
                </Box>
                <Box>
                    <Typography variant="subtitle1">DATA ACCUMULATION</Typography>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>Blood pressure measurements (systolic and diastolic) at baseline, weekly intervals, and study endpoint</li>
                        <li>Adverse events reporting</li>
                        <li>Laboratory tests (e.g., kidney function, liver enzymes)</li>
                    </ul>
                </Box>
                <Box>
                    <Typography variant="subtitle1">ENVIRONMENTAL CONDITIONS</Typography>
                    <ul style={{ listStyleType: 'disc', paddingLeft: '20px' }}>
                        <li>Clinical research center with controlled temperature, humidity, and lighting.</li>
                        <li>Standardized examination rooms.</li>
                        <li>Compliance with Good Clinical Practice (GCP) guidelines.</li>
                    </ul>
                </Box>
            </Box>
            <Box sx={{ display: 'flex', justifyContent: 'center', mt: 0, mb: 0 }}>
                <CustomButton onClick={closeModal} variant="tertiary">
                    START ACTIVITY
                </CustomButton>
            </Box>
        </Box>
      </Modal>
    </div>
  );
}
