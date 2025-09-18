'use client'

;
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";

import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import "@/app/pages/input/input.css";

import {
    isIncreasing,
    isIncreasingByTwo,
    areAllNumbersPositive,
    any3Numbers,
    any3DifferentNumbers,
    isArithmeticSequence,
} from "@/app/utils/sequenceChecks";

/*
Intro Page:

- Users will enter sequences of three integers into the input panel's 3 'input boxes'
- The input panel will have a 'Test' button that will test the sequence against the current hypothesis
- The input panel will have a 'Clear' button that will clear the input panel's 3 input boxes and the hypothesis text box
- The input panel will have a 'Guide' button that will open the guide modal

Input Panel

Data Table
 - Displays the tests that have been run

UI Psuedo Code:
In horizontal order:
    "Number Sequence" Aligned left
    Row of 3 input boxes - aligned center

    Row containing three buttons
        Clear button
        Test button
        Guide button

    Table of tests - 3 columns
        "#" Column - displays the test number
        "Sequence" Column - displays the sequence of numbers, starting at "01"
        "Match" Column - displays the result of the test, True or False, as "TRUE" or "FALSE"
*/

export function InputContent() {
    const router = useRouter();

    // State to manage the current sequence in the input panel
    const [sequence, setSequence] = useState(["", "", ""]);

    // State for the deprecated hypothesis input
    const [hypothesis, setHypothesis] = useState("");

    // State to control the visibility of the guide modal
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(true);

    // State to store a random number used to determine the current rule
    const [initialRandomNumber, setInitialRandomNumber] = useState(
        Math.floor(Math.random() * 6) + 1
    );

    // State to manage the error snackbar visibility and message
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    // State to store all user-created tests
    const [tests, setTests] = useState([]); 

    // State for the initial guess details
    const [initialGuess, setInitialGuess] = useState({
        number: "00",
        sequence: "2, 4, 6",
        match: "TRUE",
        hypothesis: "default",
    });

    // State to track the current test number
    const [currentTestNumber, setCurrentTestNumber] = useState(1);

    // State for the final guess in the final guess input form
    const [finalGuess, setFinalGuess] = useState("");

    // State to control the activation of the final guess input form
    const [isFinalGuessActive, setIsFinalGuessActive] = useState(false);

    // State to store the sessionID
    const [sessionID, setSessionID] = useState("");

    const handleErrorSnackbarClose = () => {
        setIsErrorSnackbarOpen(false);
    };

    // Get the ruleID and sessionID from the URL
    const searchParams = useSearchParams();
    const ruleID = searchParams.get("ruleID");
    const sessionIdFromUrl = searchParams.get("sessionID");

    // Set sessionID state if not yet initialized
    if (!sessionID) {
        // Use the sessionID from the URL if it exists
        if (sessionIdFromUrl) {
            setSessionID(sessionIdFromUrl);
        } 
        // Otherwise, generate a new sessionID
        else {
            setSessionID(Math.random().toString(36).substring(2, 15));
        }
    }


    // URL REFRESH LOGIC BELOW!!!

    useEffect(() => {
        if (sessionID && !sessionIdFromUrl && !ruleID){
            logger.app.info("sessionID determined:", sessionID);
            router.push(`/?sessionID=${sessionID}`);
        }
        else if (sessionID && !sessionIdFromUrl && ruleID){
            logger.app.info("sessionID determined:", sessionID);
            router.push(`/?ruleID=${ruleID}&sessionID=${sessionID}`);
        }

    }, [sessionID]);

    // End of URL refresh logic

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

    // Determine the number rule to use based on the ruleID
    // If ruleID is 0, use a random rule between 1 and 6
    // If no ruleID is provided, use the default rule, also set to random
    const ruleNumber =
        ruleID === "0"
            ? initialRandomNumber
            : ruleID
            ? parseInt(ruleID)
            : initialRandomNumber; // Changed from 1 to initialRandomNumber, so default rule is random
    logger.app.info("ruleNumber:", ruleNumber);

    // Map the imports from sequenceChecks.js to a mapping, such that the key is the rule number and the value is the function
    const ruleFunctions = {
        1: isIncreasing,
        2: isIncreasingByTwo,
        3: areAllNumbersPositive,
        4: any3Numbers,
        5: any3DifferentNumbers,
        6: isArithmeticSequence,
    };
    const ruleFunction = ruleFunctions[ruleNumber];
    logger.app.info("ruleFunction:", ruleFunction);

    // Map each rule function to a string that describes the rule
    const ruleDescriptions = {
        1: "Any three numbers in increasing order",
        2: "Numbers increasing by 2",
        3: "All numbers are positive",
        4: "Any three numbers",
        5: "Any three different numbers",
        6: "Any arithmetic sequence",
    };
    const ruleDescription = ruleDescriptions[ruleNumber];

    const handleSequenceChange = (index, value) => {
        const newSequence = [...sequence];
        newSequence[index] = value;
        setSequence(newSequence);
    };

    const handleHypothesisChange = (e) => {
        setHypothesis(e.target.value);
    };

    const handleClear = () => {
        setSequence(["", "", ""]);
        setHypothesis("");
    };

    const handleTest = () => {
        if (sequence.some((num) => num.trim() === "")) {
            // alert("Please fill in all three numbers before submitting.");
            setErrorSnackbarMessage(
                "Please fill in all three numbers before submitting."
            );
            setIsErrorSnackbarOpen(true);
            return;
        }

        submitTest(sequence, hypothesis);
        handleClear(); // Clear inputs after manual submission

        // Force cursor focus to the first of the three input boxes
        document.getElementById("input-0").focus();
    };

    const submitTest = (testSequence, testHypothesis) => {
        // Convert all elements of testSequence to integers
        const testSequenceInt = testSequence.map(Number);
        logger.app.info("testSequenceInt:", testSequenceInt);

        // Sequence matching logic
        const isMatch = ruleFunction(
            testSequenceInt[0],
            testSequenceInt[1],
            testSequenceInt[2]
        );
        logger.app.info("isMatch", isMatch);

        const newTest = {
            number: currentTestNumber.toString().padStart(2, "0"),
            sequence: testSequence.join(", "),
            match: isMatch ? "TRUE" : "FALSE",
            hypothesis: testHypothesis,
        };

        setTests((prevTests) => [...prevTests, newTest]);
        setCurrentTestNumber((prevNumber) => prevNumber + 1);
    };

    const autoTest = (testSequence, testHypothesis) => {
        submitTest(testSequence, testHypothesis);
        // We don't clear inputs after auto tests to avoid clearing user input
    };

    // Automatically run a handful of tests
    useEffect(() => {
        setTimeout(() => {
            // autoTest(["1", "2", "3"], "Ascending order");
            // autoTest(["3", "2", "1"], "Descending order");
            // autoTest(["2", "4", "6"], "Even numbers");
            // autoTest(["1", "3", "5"], "Odd numbers");
            // autoTest(["1", "1", "1"], "All same number");
            // autoTest(["1", "2", "3"], "Ascending order");
            // autoTest(["3", "2", "1"], "Descending order");
            // autoTest(["2", "4", "6"], "Even numbers");
            // autoTest(["1", "3", "5"], "Odd numbers");
            // autoTest(["1", "1", "1"], "All same number");
        }, 1000); // Delay of 1 second before running auto tests
    }, []);

    // Scroll to the bottom of the data table after the tests state is updated
    useEffect(() => {
        scrollToBottomOfTable();
    }, [tests]);

    const handleCancelFinalGuess = () => {
        logger.app.info("Cancel final guess clicked");
        setFinalGuess("");
        setIsFinalGuessActive(false);
    };

    const handleActivateFinalGuess = () => {
        setIsFinalGuessActive(true);
    };

    const loadReviewPage = (guessID) => {
        if (ruleID) {
            router.push(`/pages/review?guessID=${guessID}&ruleID=${ruleID}&sessionID=${sessionID}`);
        } else {
            router.push(`/pages/review?guessID=${guessID}&sessionID=${sessionID}`);
        }
    };

    const handleSubmitToApi = async () => {
        // Generate a random ID string for the guess
        const guessID = Math.random().toString(36).substring(2, 15);

        // Construct the guessList from the tests state
        const guessList = tests.map((test) => {
            // Split the sequence into individual numbers
            const [value1, value2, value3] = test.sequence
                .split(", ")
                .map(Number);

            return {
                guessNumber: parseInt(test.number, 10),
                guessValue1: value1,
                guessValue2: value2,
                guessValue3: value3,
                matchesRule: test.match === "TRUE",
                guessHypothesis: test.hypothesis,
            };
        });

        // Determine the actual answer based on the rule description
        const actualAnswer = ruleDescription;

        // Check if the final guess matches the actual answer
        const isCorrect =
            finalGuess.trim().toLowerCase() ===
            actualAnswer.trim().toLowerCase();

        const payload = {
            guessID: guessID,
            guessList: guessList,
            finalGuess: finalGuess,
            actualAnswer: actualAnswer,
            isCorrect: isCorrect,
            sessionID: sessionID, 
        };

        // Submit the data to the API
        try {
            const res = await fetch("/api/numberRuleGuessApi", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                logger.app.info("Successfully submitted");
                loadReviewPage(guessID);
            } else {
                logger.app.info("Response not ok.");
                throw new Error("Response not ok.");
            }
        } catch (error) {
            logger.app.info("Error in fetch");
            logger.app.info(error);
        }
    };

    // Example function to determine the actual answer
    const determineActualAnswer = () => {
        // Implement your logic to determine the actual answer
        // For demonstration, returning a static value
        return "Any three numbers in increasing order.";
    };

    const handleSubmitFinalGuess = () => {
        setFinalGuess(finalGuess);

        // Check if at least one test has been created
        if (tests.length === 0) {
            logger.app.info("No tests created");
            setErrorSnackbarMessage(
                "Please create at least one test before submitting your final guess."
            );
            setIsErrorSnackbarOpen(true);
            return;
        }

        // Check if final guess is empty
        if (finalGuess === "") {
            // alert("Please enter a final guess before submitting.");
            setErrorSnackbarMessage(
                "Please enter a final guess before submitting."
            );
            setIsErrorSnackbarOpen(true);
            return;
        }
        handleSubmitToApi();
    };

    const handleFinalGuessChange = (e) => {
        setFinalGuess(e.target.value);
    };

    const buttonStyles = {
        flex: 1,
    };

    const handleSequenceFormEvent = (e) => {
        e.preventDefault();
        logger.app.info("sequence form submitted");
        handleTest();
    };

    const onFinalGuessFormEvent = (e) => {
        e.preventDefault();
        logger.app.info("Final guess submitted");
        handleSubmitFinalGuess();
    };

    // Function to scroll to the bottom of the data table, so the most recent test is visible
    const scrollToBottomOfTable = () => {
        const table = document.querySelector(".data-table");
        table.scrollTop = table.scrollHeight;
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

            <div className="input-top-container">
                <Header onLogoClick={openModal} />
            </div>
            <div className="input-bottom-container">
                {/* Input Panel */}
                <form
                    className="input-panel"
                    type="submit"
                    onSubmit={handleSequenceFormEvent}
                >
                    <h2>NUMBER SEQUENCE</h2>
                    <div className="sequence-inputs">
                        {sequence.map((num, index) => (
                            <input
                                key={index}
                                type="number"
                                value={num}
                                onChange={(e) => {
                                    const value = e.target.value;
                                    // Allow only valid numbers within the range
                                    if (
                                        /^-?\d{0,2}$/.test(value) &&
                                        value >= -99 &&
                                        value <= 99
                                    ) {
                                        handleSequenceChange(index, value);
                                    }
                                    // Check if the input is a valid two-digit number
                                    if (
                                        (value.length === 2 &&
                                            value[0] !== "-") ||
                                        (value.length === 3 && value[0] === "-")
                                    ) {
                                        // Move focus to the next input if it exists
                                        if (index < sequence.length - 1) {
                                            document
                                                .getElementById(
                                                    `input-${index + 1}`
                                                )
                                                .focus();
                                        }
                                    }
                                }}
                                onPaste={(e) => {
                                    const paste =
                                        e.clipboardData.getData("text");
                                    if (
                                        !/^-?\d{1,2}$/.test(paste) ||
                                        paste < -99 ||
                                        paste > 99
                                    ) {
                                        e.preventDefault();
                                    }
                                }}
                                className="number-input"
                                placeholder={`#${index + 1}`}
                                id={`input-${index}`}
                            />
                        ))}
                    </div>

                    <div className="button-group">
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
                            onClick={handleClear}
                            ariaLabel="Hello"
                            disabled={false}
                            variant="grey"
                            customStyles={buttonStyles}
                        >
                            CLEAR
                        </CustomButton>

                        <CustomButton
                            onClick={handleTest}
                            ariaLabel="Hello"
                            disabled={false}
                            variant="grey"
                            customStyles={buttonStyles}
                        >
                            TEST
                        </CustomButton>
                    </div>
                    {/* <!-- Add a hidden submit button so that the enter key can trigger the form submission --> */}
                    <button type="submit" style={{ display: "none" }}></button>
                </form>

                <div className="table-container">
                    {/* Data Table */}
                    <h2>TESTS</h2>
                    <div className="data-table-wrapper">
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>SEQUENCE</th>
                                        <th>MATCHES THE NUMBER RULE?</th>
                                        {/* <th>Hypothesis</th> */}
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* Initial guess */}
                                    <tr
                                        key={initialGuess.number}
                                        className="data-table-row"
                                    >
                                        <td>{initialGuess.number}</td>
                                        <td>{initialGuess.sequence}</td>
                                        <td>{initialGuess.match}</td>
                                    </tr>
                                    {/* User-created tests */}
                                    {tests.map((test) => (
                                        <tr
                                            key={test.number}
                                            className="data-table-row"
                                        >
                                            <td>{test.number}</td>
                                            <td>{test.sequence}</td>
                                            <td>{test.match}</td>
                                            {/* <td>{test.hypothesis}</td> */}
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!isFinalGuessActive && (
                        <div className="final-guess-btn-container">
                            <CustomButton
                                onClick={handleActivateFinalGuess}
                                ariaLabel="Hello"
                                disabled={false}
                                variant="grey"
                                customStyles={buttonStyles}
                            >
                                SUBMIT YOUR HYPOTHESIS
                            </CustomButton>
                        </div>
                    )}

                    {isFinalGuessActive && (
                        <form
                            className="final-guess-input-container"
                            type="submit"
                            onSubmit={onFinalGuessFormEvent}
                        >
                            <h2>FINAL GUESS FOR THE NUMBER RULE</h2>
                            <input
                                type="text"
                                // value={finalGuess}
                                onChange={handleFinalGuessChange}
                                placeholder="Write rule..."
                                className="final-guess-input"
                            />
                            <div className="final-guess-btn-container">
                                <CustomButton
                                    onClick={handleCancelFinalGuess}
                                    ariaLabel="Hello"
                                    disabled={false}
                                    variant="grey"
                                    customStyles={buttonStyles}
                                    // type="button"
                                >
                                    CANCEL
                                </CustomButton>

                                <CustomButton
                                    ariaLabel="Hello"
                                    disabled={false}
                                    variant="grey"
                                    customStyles={buttonStyles}
                                    onClick={handleSubmitFinalGuess}
                                >
                                    SUBMIT
                                </CustomButton>
                            </div>
                        </form>
                    )}
                </div>
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