const logger = require('../../../../packages/logging/logger.js');
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import SessionConfigPopup from "@/app/components/SessionPopup/SessionConfigPopup";

import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import "@/app/pages/input/input.css";

import {
    isIncreasing,
    isIncreasingByTwo,
    isFirstDigit2,
    isSumDivisibleBy3,
    isLastNumberSumOfFirstTwo,
    isLastNumberGreaterOrEqualToSum,
    areAllNumbersEven,
    hasAtLeastOneEvenNumber,
} from "@/app/utils/sequenceChecks";

const numberOfRules = 8;

/*
Intro Page:

- Users will enter sequences of three integers into the input panel's 3 'input boxes'
- The input panel will have a 'Test' button that will test the sequence against the current hypothesis
- The input panel will have a 'Clear' button that will clear the input panel's 3 input boxes and the hypothesis text box
- The input panel will have a guide button marked with a '?' that will open the guide modal

Input Panel

Data Table
 - Displays the tests that have been run

UI Psuedo Code:
    Table of tests - 3 columns
        "#" Column - displays the test number
        "Sequence" Column - displays the sequence of numbers, starting at "01"
        "Match" Column - displays the result of the test, True or False, as "TRUE" or "FALSE"
*/

export function InputContent() {

    // Get the ruleID and sessionID from the URL
    const searchParams = useSearchParams();
    const ruleID = searchParams.get("ruleID");
    const sessionIdFromUrl = searchParams.get("sessionID");

    // Function to get the previous rule numbers from session storage
    const getPreviousRuleNumbers = () => {
        let previousRuleNumbers = [];
        try {
            // Check if sessionStorage is available
            if (typeof window !== 'undefined' && window.sessionStorage) {
                const storedRuleNumbers = sessionStorage.getItem('previousRuleNumbers');
                previousRuleNumbers = storedRuleNumbers ? JSON.parse(storedRuleNumbers) : [];
            }
        } catch (error) {
            logger.app.info("Error reading from session storage:", error);
            previousRuleNumbers = [];
        }
        return previousRuleNumbers;
    };
    // Function to select a random rule number from the between 1 and numberOfRules like Math.floor(Math.random() * numberOfRules) + 1
    // Except this function will ensure that the selected rule number is not in the previousRuleNumbers array
    // If the selected rule number is in the previousRuleNumbers array, the function will call itself recursively until a valid rule number is selected
    const selectRandomRuleNumber = () => {
        const previousRuleNumbers = getPreviousRuleNumbers();
        
        // If all rules have been used, clear the array to prevent infinite recursion
        if (previousRuleNumbers.length >= numberOfRules) {
            try {
                // Check if sessionStorage is available
                if (typeof window !== 'undefined' && window.sessionStorage) {
                    sessionStorage.removeItem('previousRuleNumbers');
                }
                return Math.floor(Math.random() * numberOfRules) + 1;
            } catch (error) {
                logger.app.info("Error clearing session storage:", error);
                return Math.floor(Math.random() * numberOfRules) + 1;
            }
        }
        
        const randomRuleNumber = Math.floor(Math.random() * numberOfRules) + 1;
        if (previousRuleNumbers.includes(randomRuleNumber)) {
            return selectRandomRuleNumber();
        }
        return randomRuleNumber;
    };


    const router = useRouter();

    // State to manage the current sequence in the input panel
    const [sequence, setSequence] = useState(["", "", ""]);

    // State for the deprecated hypothesis input
    const [hypothesis, setHypothesis] = useState("");

    // State to control the visibility of the guide modal
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);

    // State to store a random number used to determine the current rule
    const [initialRandomNumber, setInitialRandomNumber] = useState(
        selectRandomRuleNumber()
    );

    // State to manage the error snackbar visibility and message
    const [isErrorSnackbarOpen, setIsErrorSnackbarOpen] = useState(false);
    const [errorSnackbarMessage, setErrorSnackbarMessage] = useState("");

    // State to store all user-created tests
    const [tests, setTests] = useState([]);

    // State to track the current test number
    const [currentTestNumber, setCurrentTestNumber] = useState(1);

    // State for the final guess in the final guess input form
    const [finalGuess, setFinalGuess] = useState("");

    // State to control the activation of the final guess input form
    const [isFinalGuessActive, setIsFinalGuessActive] = useState(false);

    // State to store the sessionID
    const [sessionID, setSessionID] = useState("");

    // State to track if the first error message has been triggered
    const [firstErrorTriggered, setFirstErrorTriggered] = useState(false);

    // State to control SessionConfigPopup visibility
    const [showSessionConfigPopup, setShowSessionConfigPopup] = useState(!sessionIdFromUrl);

    const handleErrorSnackbarClose = () => {
        setIsErrorSnackbarOpen(false);
    };

    const handleSessionConfigClose = (selectedMode) => {
        setShowSessionConfigPopup(false);
        
        // Handle individual mode selection
        if (selectedMode === 'individual') {
            setSessionID('individual1');
            router.replace('/?sessionID=individual1');
        }
    };

    // Initialize sessionID based on URL parameter or generate new one
    useEffect(() => {
        logger.app.info('SessionID from URL:', sessionIdFromUrl);
        logger.app.info('Current sessionID:', sessionID);
        logger.app.info('Show popup:', showSessionConfigPopup);
        
        if (sessionIdFromUrl) {
            setSessionID(sessionIdFromUrl);
            setShowSessionConfigPopup(false);
        } else if (!sessionID) {
            setSessionID(Math.random().toString(36).substring(2, 15));
            setShowSessionConfigPopup(true);
        }
    }, [sessionIdFromUrl]);

    // URL REFRESH LOGIC BELOW!!!

    useEffect(() => {
        // Only update URL if popup is not showing (user has made a choice)
        // Don't override if sessionID is already "individual1" (individual mode)
        if (sessionID && !sessionIdFromUrl && !showSessionConfigPopup && sessionID !== 'individual1' && !ruleID) {
            logger.app.info("sessionID determined:", sessionID);
            router.push(`/?sessionID=${sessionID}`);
        } else if (sessionID && !sessionIdFromUrl && !showSessionConfigPopup && sessionID !== 'individual1' && ruleID) {
            logger.app.info("sessionID determined:", sessionID);
            router.push(`/?ruleID=${ruleID}&sessionID=${sessionID}`);
        }
    }, [sessionID, showSessionConfigPopup]);

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

    // Prepare the rule functions for mapping
    const ruleFunctions = {
        1: isIncreasing,
        2: isIncreasingByTwo,
        3: isFirstDigit2,
        4: isSumDivisibleBy3,
        5: isLastNumberSumOfFirstTwo,
        6: isLastNumberGreaterOrEqualToSum,
        7: areAllNumbersEven,
        8: hasAtLeastOneEvenNumber,
    };

    // Determine the number rule to use based on the ruleID
    // If ruleID is 0, use a random rule from the ruleFunctions object
    // If no ruleID is provided, use the default rule, also set to random
    let ruleNumber =
        ruleID === "0"
            ? initialRandomNumber
            : ruleID
            ? parseInt(ruleID)
            : initialRandomNumber; // Changed from 1 to initialRandomNumber, so default rule is random
    // logger.app.info("ruleNumber:", ruleNumber);

    // BUG FIX: If ruleID is greater than the number of rules, set ruleNumber to initialRandomNumber
    // logger.app.info("Number of rules:", Object.keys(ruleFunctions).length);
    if (ruleNumber > Object.keys(ruleFunctions).length) {
        ruleNumber = initialRandomNumber;
    }

    // Map the imports from sequenceChecks.js to a mapping, such that the key is the rule number and the value is the function
    const ruleFunction = ruleFunctions[ruleNumber];
    logger.app.info("ruleFunction:", ruleFunction);
    logger.app.info("ruleNumber:", ruleNumber);

    // Map each rule function to a string that describes the rule
    const ruleDescriptions = {
        1: "Any three numbers in increasing order",
        2: "Numbers increasing by 2",
        3: "The first digit is 2",
        4: "Total sum is divisible by 3",
        5: "Last number is equal to the sum of the first two",
        6: "Last number is greater than or equal to the sum of the first two",
        7: "All numbers are even",
        8: "At least one number is even",
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
        logger.app.info("Test button clicked!!!!1!");
        logger.app.info("sequence:", sequence);
        if (
            sequence.some((num) => num.trim() === "" && currentTestNumber > 1)
        ) {
            if (firstErrorTriggered) {
                setErrorSnackbarMessage(
                    "Please fill in all three numbers before submitting."
                );
                setIsErrorSnackbarOpen(true);
            }

            if (!firstErrorTriggered) {
                setFirstErrorTriggered(true);
                return;
            }

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
    // useEffect(() => {
    //     setTimeout(() => {
    //         autoTest(["1", "2", "3"], "Ascending order");
    //         autoTest(["3", "2", "1"], "Descending order");
    //         autoTest(["2", "4", "6"], "Even numbers");
    //         autoTest(["1", "3", "5"], "Odd numbers");
    //         autoTest(["1", "1", "1"], "All same number");
    //         autoTest(["1", "2", "3"], "Ascending order");
    //         autoTest(["3", "2", "1"], "Descending order");
    //         autoTest(["2", "4", "6"], "Even numbers");
    //         autoTest(["1", "3", "5"], "Odd numbers");
    //         autoTest(["1", "1", "1"], "All same number");
    //     }, 5000); // Delay of 1 second before running auto tests
    // }, []);

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
            router.push(
                `/pages/review?guessID=${guessID}&ruleID=${ruleID}&sessionID=${sessionID}`
            );
        } else {
            router.push(
                `/pages/review?guessID=${guessID}&sessionID=${sessionID}`
            );
        }
    };

    const handleSubmitToApi = async () => {
        // Generate a random ID string for the guess
        const guessID = Math.random().toString(36).substring(2, 15);

        // Construct the guessList from the tests state, excluding the first test
        const guessList = tests.slice(1).map((test) => {
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

                // Maintain an array of ruleNumbers in session storage from previous guesses
                // Dont save the ruleNumber of this round until the user has submitted the final guess
                // This will be utilized to prevent the random rule selection from repeating the same rule
                // Assume the array may or may not exist, so we'll check for that first
                // If it does not exist, create it and add the ruleNumber to it
                // If it does exist, add the ruleNumber to the array
                // Then save the array back to session storage

                // Get existing rule numbers from session storage or create a new array
                let previousRuleNumbers = [];
                try {
                    // Check if sessionStorage is available
                    if (typeof window !== 'undefined' && window.sessionStorage) {
                        const storedRuleNumbers = sessionStorage.getItem('previousRuleNumbers');
                        previousRuleNumbers = storedRuleNumbers ? JSON.parse(storedRuleNumbers) : [];
                    }
                } catch (error) {
                    logger.app.info("Error reading from session storage:", error);
                    previousRuleNumbers = [];
                }
                
                // Add the current rule number to the array
                if (!previousRuleNumbers.includes(ruleNumber)) {
                    previousRuleNumbers.push(ruleNumber);
                }
                
                // Limit the array size if it gets too large (optional)
                if (previousRuleNumbers.length > numberOfRules) {
                    previousRuleNumbers = previousRuleNumbers.slice(-numberOfRules);
                }
                
                // Save the updated array back to session storage
                try {
                    // Check if sessionStorage is available
                    if (typeof window !== 'undefined' && window.sessionStorage) {
                        sessionStorage.setItem('previousRuleNumbers', JSON.stringify(previousRuleNumbers));
                    }
                } catch (error) {
                    logger.app.info("Error writing to session storage:", error);
                }
                
                // Load the review page
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


    const handleSubmitFinalGuess = () => {
        setFinalGuess(finalGuess);

        // Check if at least one test has been created
        if (tests.length === 1) {
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

    // Function to simulate typing and testing the sequence 2, 4, 6 (Utilizes simulated keyboard input)
    const autoTypeGuide = () => {
        const sequenceValues = ["2", "4", "6"];
        const inputIds = ["input-0", "input-1", "input-2"];
        let currentSequence = ["", "", ""];

        const simulateTyping = (index) => {
            if (index < sequenceValues.length) {
                const inputElement = document.getElementById(inputIds[index]);
                if (inputElement) {
                    inputElement.focus(); // Focus on the input
                    inputElement.value = sequenceValues[index]; // Set the value
                    inputElement.dispatchEvent(
                        new Event("input", { bubbles: true })
                    ); // Dispatch input event

                    // Update the sequence state
                    currentSequence[index] = sequenceValues[index];
                    setSequence([...currentSequence]);

                    setTimeout(() => simulateTyping(index + 1), 500); // Delay before moving to the next input
                }
            } else {
                // Simulate pressing the enter key to submit the form
                setTimeout(() => {
                    const formElement = document.querySelector(".input-panel");
                    if (formElement) {
                        formElement.dispatchEvent(
                            new Event("submit", {
                                bubbles: true,
                                cancelable: true,
                            })
                        );
                    }
                }, 500); // Additional delay before submitting
            }
        };

        simulateTyping(0);
    };

    // Alternate function to simulate typing the sequence 2, 4, 6 using state modifiers
    const autoTypeGuide2 = () => {
        const sequenceValues = ["2", "4", "6"];
        let currentSequence = ["", "", ""];

        sequenceValues.forEach((value, index) => {
            setTimeout(() => {
                currentSequence[index] = value;
                setSequence([...currentSequence]); // Update the sequence state
                if (index === sequenceValues.length - 1) {
                    setTimeout(() => {
                        simulateEnterKey();
                        // simulateTestButton();
                    }, 600); // Delay before calling handleTest
                }
            }, index * 600); // Delay between updating each number
        });
    };

    // Call autoTypeGuide2 when the component mounts
    useEffect(() => {
        autoTypeGuide2();
    }, []); // Empty dependency array ensures it runs only once

    const simulateEnterKey = () => {
        const formElement = document.querySelector(".input-panel");
        if (formElement) {
            formElement.dispatchEvent(
                new Event("submit", { bubbles: true, cancelable: true })
            );
        }
    };

    // Instead of dispatching an event, attempt to simulate the Test button being clicked via the UI
    // const simulateTestButton = () => {
    //     const testButton = document.querySelector('.test-button');
    //     if (testButton) {
    //         testButton.click();
    //     }
    // };

    function formatNumber(num) {
        const adjustedNumber = num - 1;
        return adjustedNumber < 10 ? `0${adjustedNumber}` : `${adjustedNumber}`;
    }

    return (
        <div className="full-page">
            {/* Session Configuration Popup */}
            <SessionConfigPopup 
                open={showSessionConfigPopup}
                onClose={handleSessionConfigClose}
                sessionID={sessionID}
                selectedGroup={"group2"}
            />

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
                <div className="table-container">
                    {/* Data Table */}
                    {/* <h2>TESTS</h2> */}
                    <div className="data-table-wrapper">
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>SEQUENCE</th>
                                        <th>MATCHES THE NUMBER RULE?</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {/* User-created tests */}
                                    {tests.map((test) => (
                                        <tr
                                            key={test.number}
                                            className="data-table-row"
                                        >
                                            <td>{formatNumber(test.number)}</td>
                                            <td>{test.sequence}</td>
                                            <td>{test.match}</td>
                                        </tr>
                                    ))}
                                    {/* Input Panel as the final row */}
                                    <tr className="data-table-row">
                                        <td>
                                            <h2>
                                                {formatNumber(
                                                    currentTestNumber
                                                )}
                                            </h2>
                                        </td>
                                        <td>
                                            <form
                                                className="input-panel"
                                                type="submit"
                                                onSubmit={
                                                    handleSequenceFormEvent
                                                }
                                            >
                                                <div className="sequence-inputs">
                                                    {sequence.map((num, index) => (
                                                        <input
                                                            key={index}
                                                            type="number"
                                                            value={num}
                                                            onChange={(e) => {
                                                                const value = e.target.value;
                                                                if (
                                                                    /^-?\d{0,2}$/.test(value) &&
                                                                    value >= -99 &&
                                                                    value <= 99
                                                                ) {
                                                                    handleSequenceChange(index, value);
                                                                }
                                                                if (
                                                                    (value.length === 2 &&
                                                                        value[0] !== "-") ||
                                                                    (value.length === 3 &&
                                                                        value[0] === "-")
                                                                ) {
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
                                                <button type="submit" style={{ display: "none" }}></button>
                                            </form>
                                        </td>
                                        <td colSpan="2">
                                            <div className="button-group">
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
                                                    variant="blue"
                                                    customStyles={buttonStyles}
                                                    className="test-button"
                                                >
                                                    TEST
                                                </CustomButton>
                                            </div>
                                        </td>
                                    </tr>
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
                                >
                                    CANCEL
                                </CustomButton>

                                <CustomButton
                                    ariaLabel="Hello"
                                    disabled={false}
                                    variant="blue"
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
