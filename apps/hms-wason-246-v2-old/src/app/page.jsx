const logger = require('../../../../packages/logging/logger.js');
"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/header";

import "@/app/pages/input/input.css";

// import Box from '@mui/material/Box';
// import Button from '@mui/material/Button';
// import Typography from '@mui/material/Typography';
// import Modal from '@mui/material/Modal';

import CustomModal2 from "@/app/components/CustomModal2/CustomModal2";
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

Input Panel

Data Table
 - Displays the tests that have been run
 - For now, simply enter the test number, sequence, and re

UI Psuedo Code:
In horizontal order:
    "Number Sequence" Aligned left
    Row of 3 input boxes - aligned center

    "Hypothesis" Aligned left
    Text input box aligned center - placeholder "Write a rule..."
    Row containing two buttons - aligned left
        Clear button
        Test button

    "Tests" Aligned left
    Table of tests - 4 columns
        "#" Column - displays the test number
        "Sequence" Column - displays the sequence of numbers, starting at "01"
        "Match" Column - displays the result of the test, True or False, as "TRUE" or "FALSE"
        "Hypothesis" Column - displays the feedback on the test
*/

// const style = {
//     position: 'absolute',
//     top: '50%',
//     left: '50%',
//     transform: 'translate(-50%, -50%)',
//     width: 400,
//     bgcolor: 'rgb(18, 18, 18);',
//     border: '2px solid #000',
//     boxShadow: 24,
//     p: 4,
//   };


export function InputContent() {
    const router = useRouter();

    const [sequence, setSequence] = useState(["", "", ""]);
    const [hypothesis, setHypothesis] = useState("");

    const searchParams = useSearchParams();
    const ruleID = searchParams.get("ruleID");
    logger.app.info("ruleID:", ruleID);

    // const [open, setOpen] = React.useState(true);
    // const handleOpen = () => setOpen(true);
    // const handleClose = () => setOpen(false);


    // Determine the number rule to use based on the ruleID
    // If ruleID is 0, use a random rule between 1 and 6
    // If no ruleID is provided, use the default rule, rule 1
    const ruleNumber = ruleID === "0" 
        ? Math.floor(Math.random() * 6) + 1 
        : ruleID ? parseInt(ruleID) : 1;
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

    
    // Initialize tests with a default entry
    const [tests, setTests] = useState([
        {
            number: "1",
            sequence: "2, 4, 6",
            match: ruleFunction(2, 4, 6) ? "TRUE" : "FALSE",
            hypothesis: "default",
        }
    ]); // Initial entry: {2,4,6}, TRUE, and "default" hypothesis

    const [currentTestNumber, setCurrentTestNumber] = useState(2);
    const [finalGuess, setFinalGuess] = useState("");
    const [isFinalGuessActive, setIsFinalGuessActive] = useState(false);

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
        if (
            sequence.some((num) => num.trim() === "") ||
            hypothesis.trim() === ""
        ) {
            alert(
                "Please fill in all three numbers and the hypothesis before submitting."
            );
            return;
        }

        submitTest(sequence, hypothesis);
        handleClear(); // Clear inputs after manual submission
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

    const handleCancelFinalGuess = () => {
        setFinalGuess("");
        setIsFinalGuessActive(false);
    };

    const handleActivateFinalGuess = () => {
        setIsFinalGuessActive(true);
    };

    const loadReviewPage = (guessID) => {
        if (ruleID) {
            router.push(`/pages/review?guessID=${guessID}&ruleID=${ruleID}`);
        } else {
            router.push(`/pages/review?guessID=${guessID}`);
        }
    };

    const handleSubmitToApi = async () => {
        // Generate a random ID string for the guess
        const guessID = Math.random().toString(36).substring(2, 15);
        
        // Construct the guessList from the tests state
        const guessList = tests.map((test) => {
            // Split the sequence into individual numbers
            const [value1, value2, value3] = test.sequence.split(", ").map(Number);
            
            return {
                guessNumber: parseInt(test.number, 10),
                guessValue1: value1,
                guessValue2: value2,
                guessValue3: value3,
                matchesRule: test.match === "TRUE",
                guessHypothesis: test.hypothesis,
            };
        });

        // Determine the actual answer based on your application logic
        // For example, you might have a function that determines this
        const actualAnswer = ruleDescription;

        // Check if the final guess matches the actual answer
        const isCorrect = finalGuess.trim().toLowerCase() === actualAnswer.trim().toLowerCase();

        const payload = {
            guessID: guessID,
            guessList: guessList,
            finalGuess: finalGuess,
            actualAnswer: actualAnswer,
            isCorrect: isCorrect,
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
        // setIsFinalGuessActive(false);

        // Check if final guess is empty
        if (finalGuess === "") {
            alert("Please enter a final guess before submitting.");
            return;
        }
        handleSubmitToApi();

        // Route to the review page
        // router.push("/review");
    };

    const handleFinalGuessChange = (e) => {
        setFinalGuess(e.target.value);
    };

    return (
        <div className="full-page">
            <CustomModal2 />
            {/* <Modal
                open={open}
                onClose={handleClose}
                aria-labelledby="modal-modal-title"
                aria-describedby="modal-modal-description"
            >
                <Box sx={style}>
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Your goal is to try and guess a secret rule that matches a sequence of 3 numbers.
                </Typography>
                <br />
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    But there is a catch—you can’t guess the rule directly!
                </Typography>
                <br />
                <Typography id="modal-modal-title" variant="h6" component="h2">
                    Form a hypothesis by interpreting results from your guesses, then submit your final hypothesis to see if you were correct!
                </Typography>
                <br />
                </Box>
            </Modal> */}
            <div className="input-top-container">
                <Header />
            </div>
            <div className="input-bottom-container">
                {/* Input Panel */}
                <div className="input-panel">
                    <h2>Number Sequence</h2>
                    <div className="sequence-inputs">
                        {sequence.map((num, index) => (
                            <input
                                key={index}
                                type="number"
                                value={num}
                                onChange={(e) =>
                                    handleSequenceChange(index, e.target.value)
                                }
                                className="number-input"
                                placeholder={`#${index + 1}`}
                            />
                        ))}
                    </div>

                    <h2>Hypothesis</h2>
                    <input
                        type="text"
                        value={hypothesis}
                        onChange={handleHypothesisChange}
                        placeholder="Write a rule..."
                        className="hypothesis-input"
                    />

                    <div className="button-group">
                        <button onClick={handleClear} className="clear-button">
                            CLEAR
                        </button>
                        <button onClick={handleTest} className="test-button">
                            TEST
                        </button>
                    </div>
                </div>

                <div className="table-container">
                    {/* Data Table */}
                    <h2>Tests</h2>
                    <div className="data-table-wrapper">
                        <div className="data-table">
                            <table>
                                <thead>
                                    <tr>
                                        <th>#</th>
                                        <th>Sequence</th>
                                        <th>Match</th>
                                        <th>Hypothesis</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {tests.map((test) => (
                                        <tr key={test.number} className="data-table-row">
                                            <td>{test.number}</td>
                                            <td>{test.sequence}</td>
                                            <td>{test.match}</td>
                                            <td>{test.hypothesis}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </div>

                    {!isFinalGuessActive && (
                        <div className="final-guess-btn-container">
                            <button
                                className="test-button final-guess-btn"
                                onClick={handleActivateFinalGuess}
                            >
                                SUBMIT THE FINAL HYPOTHESIS
                            </button>
                        </div>
                    )}

                    {isFinalGuessActive && (
                        <div className="final-guess-input-container">
                            <h2>FINAL GUESS FOR THE NUMBER RULE</h2>
                            <input
                                type="text"
                                // value={finalGuess}
                                onChange={handleFinalGuessChange}
                                placeholder="Write rule..."
                                className="final-guess-input"
                            />
                            <div className="final-guess-btn-container">
                                <button
                                    className="test-button final-guess-btn dark-mode-btn"
                                    onClick={handleCancelFinalGuess}
                                >
                                    CANCEL
                                </button>
                                <button
                                    className="test-button final-guess-btn"
                                    onClick={handleSubmitFinalGuess}
                                >
                                    SUBMIT
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

export default function Input() {
    return (
        <Suspense fallback={
            <div className="full-page">
                <h2>
                    Loading...
                </h2>
            </div>
        }>
            {/* Actual content */}
            <InputContent />
        </Suspense>
    );
}
