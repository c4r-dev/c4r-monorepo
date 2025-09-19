'"use client"';

"use client";

/*
FINER page

values to store / fetch:
- Store criteria array: [FEASIBLE, INTERESTING, NOVEL, ETHICAL, RELEVANT]
- Store areaOptions: 
    - 1: "Time & Money, Skills", "Access & Limits", "Technical Practicality & Scope"
    - 2: "To the researcher", "To the funder", "To the Scientific Community"
    - 3: "Confirm, refute, or extend knowledge", "Need to Reproduce"
    - 4: " anticipates institutional approval"., "minimizes harm", "considers equity"
    - 5: "outcome achieves purpose", "approach ideal for outcome", "serves target population", "serves research community", "serves policy-makers / other",
- URL params - gets userID, gets sessionID, gets researchQuestion, questionNumber


FINER page visual description:

Top of page - gets userID, gets sessionID, gets researchQuestion, questionNumber

Text: "Research Questions" 

Text: {researchQuestion passed in via URL parameter}

Row of 5 links presented as text: FEASIBLE, INTERESTING, NOVEL, ETHICAL, RELEVANT
- Each calls a function which will route to the "finer" page with the same parameters but with (question number )
- Each link will appear with grey text, but one will have black text. The one with black text will be determined by the current questionNumber value

Row of selectable buttons.
- Only 1 button can be pressed at a time.
- Determine the button number and their text based on the areaOptions corresponding to the questionNumber value

Text: How does what you know about this area affect your evaluation of the “{current criteria}” criterion? 

Row of 4 buttons: Positive, Neutral, Negative, Uncertain
- Only one can be selected at a time
- Visually indicate if it is selected
Text area: Placeholder text: Elaborate on your rating here

Buttons: 
	Guide - opens the popup modal
	Submit - calls submit function, use a console.log placeholder for now

*/

import React, { useState, useEffect, Suspense, useRef } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import FeedbackButtons from "@/app/components/FeedbackButtons/FeedbackButtons";

import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import styles from "@/app/pages/finer1/finer1.module.css";

export function Finer1Content() {

    // State to manage the guide modal visibility
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);
    // State to manage the error snackbar visibility and message
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    // Hardcoded state to enable navigation using the criteria links
    const enableCriteriaNavigation = false;
    
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

    const router = useRouter();
    const buttonStyles = {
        flex: 1,
    };
    
    // Get the userID, sessionID, researchQuestion, and questionNumber from the URL parameters
    const searchParams = useSearchParams();
    const userID = searchParams.get("userID");
    const sessionID = searchParams.get("sessionID");
    const researchQuestion = searchParams.get("researchQuestion");
    const questionNumber = searchParams.get("questionNumber");
    // Repeat above with hardcoded values for testing
    // const userID = "123";
    // const sessionID = "456";
    // const researchQuestion = "What is the meaning of life?";
    // const questionNumber = "1";

    // Store criteria array: [FEASIBLE, INTERESTING, NOVEL, ETHICAL, RELEVANT]
    const criteriaArray = ["feasible", "interesting", "novel", "ethical", "relevant"];

    // Store areaOptions
    const areaOptions = [
        ["Time & Money", "Skills", "Access & Limits", "Technical Practicality & Scope"],
        ["To the researcher", "To the funder", "To the Scientific Community"],
        ["Confirm, refute, or extend knowledge", "Need to Reproduce"],
        [" anticipates institutional approval", "minimizes harm", "considers equity"],
        ["outcome achieves purpose", "approach ideal for outcome", "serves target population", "serves research community", "serves policy-makers / other"]
    ];

    // Derive the current criteria from the criteriaArray based on the questionNumber
    const currentCriteria = criteriaArray[questionNumber - 1];

    // Derive the current areaOptions from the areaOptions array based on the questionNumber
    const currentAreaOptions = areaOptions[questionNumber - 1];

    // State for selected area option and evaluation
    const [selectedAreaOption, setSelectedAreaOption] = useState(null);
    const [evaluation, setEvaluation] = useState(null);
    const [elaboration, setElaboration] = useState("");

    // Function to handle area option selection
    const handleAreaOptionClick = (index) => {
        setSelectedAreaOption(index);
    };

    // Function to handle feedback button selection
    const handleFeedbackSelection = (selection) => {
        setEvaluation(selection);
    };

    // Function to handle disabled button click
    const handleDisabledButtonClick = () => {
        setErrorSnackbarMessage("Please select an area option first.");
        setIsErrorSnackbarOpen(true);
    };

    useEffect(() => {
        logger.app.info("Evaluation:", evaluation);
    }, [evaluation]);

    const handleSubmitToApi = async () => {

        const areaOption = currentAreaOptions[selectedAreaOption];

        const payload = {
            userID: userID,
            sessionID: sessionID,
            questionNumber: questionNumber,
            areaOption: areaOption,
            evaluation: evaluation,
            elaboration: elaboration,
        };

        // Submit the data to the API
        try {
            const res = await fetch("/api/finerAnswerApi", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                logger.app.info("Successfully submitted");
                // loadReviewPage(guessID);
            } else {
                // TODO: Add error handling
                logger.app.info("Response not ok.");
                throw new Error("Response not ok.");
            }
        } catch (error) {
            // TODO: Add error handling
            logger.app.info("Error in fetch");
            logger.app.info(error);
        }
    }

    const feedbackButtonsRef = useRef();

    // Function to handle submit button click
    const handleSubmit = () => {
        logger.app.info("Submit clicked");
        logger.app.info("Selected Area Option:", selectedAreaOption);
        logger.app.info("Evaluation:", evaluation);
        logger.app.info("Elaboration:", elaboration);

        // TODO: Add error alerts

        // Validate that all fields are filled out except for the textarea
        if (selectedAreaOption === null) {
            setErrorSnackbarMessage("Please select an area option before submitting");
            setIsErrorSnackbarOpen(true);
            return;
        }
        else if (!evaluation) {
            setErrorSnackbarMessage("Please select an option from positive to uncertain");
            setIsErrorSnackbarOpen(true);
            return;
        }

        // Submit to backend
        handleSubmitToApi();

        // If the questionNumber is 5, route to the results page (adding this case before clearing state to avoid delay in showing results)
        if (questionNumber == 5) {
            router.push(`/pages/results?userID=${userID}&sessionID=${sessionID}&researchQuestion=${researchQuestion}`);
        }

        // TODO: Disable clear and continue until submit is successful

        // Clear the selected area option, evaluation, and elaboration
        setSelectedAreaOption(null);
        setEvaluation(null);
        setElaboration("");

        // Reset feedback buttons
        if (feedbackButtonsRef.current) {
            feedbackButtonsRef.current.reset();
        }

        // TODO: Route to next question or results page
        if (questionNumber < 5) {
            router.push(`/pages/finer1?userID=${userID}&sessionID=${sessionID}&researchQuestion=${researchQuestion}&questionNumber=${parseInt(questionNumber) + 1}`);
        } else {
            router.push(`/pages/results?userID=${userID}&sessionID=${sessionID}&researchQuestion=${researchQuestion}`);
        }
    };

    return (
        <div className={styles.fullPage}>
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
            <Header onLogoClick={openModal} />

            <div className={styles.contentContainer}>
                <h1 className={styles.researchQuestion}>Research Question</h1>
                <p className={styles.researchQuestion}>{researchQuestion}</p>        

                {/* Row of links for criteria */}
                <div className={styles.criteriaLinks}>
                    {criteriaArray.map((criteria, index) => (
                        <span
                            key={index}
                            className={index + 1 === parseInt(questionNumber) ? styles.selectedCriteria : styles.unselectedCriteria}
                            onClick={enableCriteriaNavigation ? () => router.push(`/pages/finer1?userID=${userID}&sessionID=${sessionID}&researchQuestion=${researchQuestion}&questionNumber=${index + 1}`) : null}
                            style={{ cursor: enableCriteriaNavigation ? 'pointer' : 'default' }}
                        >
                            {criteria.toUpperCase()}
                        </span>
                    ))}
                </div>

                {/* Row of selectable buttons for area options */}
                <div className={styles.areaOptions}>
                    {currentAreaOptions.map((option, index) => (
                        <button
                            className={selectedAreaOption === index ? styles.selectedAreaOption : styles.unselectedAreaOption}
                            key={index}
                            style={{ backgroundColor: selectedAreaOption === index ? 'black' : 'white', color: selectedAreaOption === index ? 'white' : 'black' }}
                            onClick={() => handleAreaOptionClick(index)}
                        >
                            {option}
                        </button>
                    ))}
                </div>

                <p>How does what you know about this area affect your evaluation of the “{currentCriteria}” criterion?</p>

                <div className={styles.feedbackButtonsContainer}>
                    <FeedbackButtons
                        ref={feedbackButtonsRef}
                        onSelectionChange={handleFeedbackSelection}
                        disabled={selectedAreaOption === null}
                        onDisabledButtonClick={handleDisabledButtonClick}
                    />
                </div>

                {/* Text area for elaboration */}
                <textarea
                    className={styles.elaborationTextarea}
                    placeholder="Elaborate on your rating here..."
                    value={elaboration}
                    onChange={(e) => setElaboration(e.target.value)}
                />

                {/* Guide and Submit buttons */}
                <div className={styles.actionButtons}>
                    <button onClick={handleGuideBtn}>Guide</button>
                    <button onClick={handleSubmit}>Submit</button>
                </div>
            </div>
        </div>
    );
}

export default function Finer1() {
    return (
        <Suspense
            fallback={
                <div className={styles.fullPage}>
                    <h2>Loading...</h2>
                </div>
            }
        >
            <Finer1Content />
        </Suspense>
    );
}