const logger = require('../../../../packages/logging/logger.js');
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";

import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import "./page.css";

/*
Intro Page:

*/

export function InputContent() {

    // State to manage the guide modal visibility
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(true);
    // State to manage the error snackbar visibility and message
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    const router = useRouter();

    // Functions to manage visibility of guide modal and error snackbar
    const closeModal = () => {
        setIsGuideModalVisible(false);
    };
    const openModal = () => {
        setIsGuideModalVisible(true);
    };
    const handleGuideBtn = () => {
        logger.app.info("Guide button clicked");
        openModal(true);
    };
    const handleErrorSnackbarClose = () => {
        setIsErrorSnackbarOpen(false);
    };

    const buttonStyles = {
        flex: 1,
    };

    const handleSubmit = () => {
        logger.app.info("Submit button clicked");

        // Check if response input is empty
        if (document.querySelector(".response-input").value === "") {
            setErrorSnackbarMessage("Please enter a response before submitting.");
            setIsErrorSnackbarOpen(true);
            return;
        }

        // TODO: Add logic to submit response to backend

        let researchQuestion = document.querySelector(".response-input").value;
        let userID = Math.random().toString(36).substring(2, 9);
        let sessionID = Math.random().toString(36).substring(2, 9);
        let questionNumber = 1;
        router.push(`/pages/newSession?userID=${userID}&sessionID=${sessionID}&researchQuestion=${researchQuestion}&questionNumber=${questionNumber}`);
    };

    return (
        <div className="full-page">
            {/* Instructions Modal */}
            <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />


            {/* Error Snackbar */}
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
                    {errorSnackbarMessage}
                </Alert>
            </Snackbar>

            {/* Header component */}
            <div className="input-top-container">
                <Header onLogoClick={openModal} />
            </div>

            <div className="input-bottom-container">
                {/* Input Panel */}
                <form className="input-panel" onSubmit={(e) => {
                    e.preventDefault();
                    logger.app.info("Form submitted"); // Placeholder submit handler
                }}>
                    <h2>What research question should we evaluate?</h2>
                    <textarea
                        className="response-input"
                        placeholder="Type your question here..."
                        rows={6}
                    />
                    <div className="button-container">
                    <CustomButton
                            onClick={handleGuideBtn}
                            ariaLabel="Hello"
                            disabled={false}
                            variant="blue"
                            customStyles={buttonStyles}
                        >
                            GUIDE
                        </CustomButton>
                        <CustomButton
                                onClick={handleSubmit}
                                ariaLabel="Hello"
                                disabled={false}
                                variant="grey"
                                customStyles={buttonStyles}
                        >
                            SUBMIT
                        </CustomButton>
                    </div>
                </form>



            </div>
        </div>
    );
}

export default function Input() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <InputContent />
        </Suspense>
    );
}
