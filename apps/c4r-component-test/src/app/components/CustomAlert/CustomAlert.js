import React, { useState, useEffect } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

// CustomAlert component definition
const CustomAlert = ({ triggerOpen, message, onClose }) => {
    // State to manage the error snackbar visibility
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);

    // Effect to open the snackbar when triggerOpen changes
    useEffect(() => {
        if (triggerOpen) {
            setIsErrorSnackbarOpen(true);
        }
    }, [triggerOpen]);

    // Function to handle closing the snackbar
    const handleErrorSnackbarClose = () => {
        setIsErrorSnackbarOpen(false);
        if (onClose) onClose(); // Notify parent component
    };

    return (
        <Snackbar
            open={isErrorSnackbarOpen}
            autoHideDuration={6000}
            onClose={handleErrorSnackbarClose}
            anchorOrigin={{ vertical: "top", horizontal: "center" }}
        >
            <Alert
                severity="error"
                variant="outlined"
                sx={{
                    marginBottom: "10px",
                    color: "white",
                    backgroundColor: "#000000",
                    padding: "10px",
                }}
            >
                {message}
            </Alert>
        </Snackbar>
    );
};

export default CustomAlert;