const logger = require('../../../../packages/logging/logger.js');
/*
    Confirmation Bias Activity

    This activity is emulate Peter Wason's confirmation bias experiment.
    The user is presented with three numbers that follow a certain rule, which they have to eventually determine.
    The user must then enter three numbers that they think follow the same rule.
    The user's entries are displayed in a table, along with the reason they think the numbers follow the rule.
    The point is for users to realize that they are biased towards confirming their own hypothesis, and that they should try to disprove it instead.

Components:

    Activity:
        Contains
            - InitialScreen
            - InputScreen
            - ...Other components TBD...
        - Controls the flow of the activity

    InitialScreen:
        - Left side: 
            - Several lines of instruction text
        - Right side: 
            - Image 
        - Footer:
            - Button: "Next"

    Input Screen:
        - Left side (displays items in vertical line) 
            - InstructionsPanel
            - IntegerInputPanel
            - HypothesisPanel
            - Button - "Test this sequence"
        - Right side (displays items in horizontal line)
            - TestTable
                - Grid with Title "Track your tests"
                - Grid of 3 
                - Black lines: #000000
                - Orange background: #DD8C3D
        - Horizontal Footer
            - Button - "Test this sequence"
            - Button - "Submit final hypothesis"

Flow:
    - InitialScreen

*/

import React, { useState, useRef, useEffect } from "react";
import magnifyingGlassRaven from "../magnifying-glass.svg";
import keyboardRaven from "../raven-white-bg-11.svg";
import { isIncreasing } from "../utils/sequenceChecks";
import { fetchDisprovalFeedback } from "../utils/fetchAIFeedback";
import thumbsUpRaven from "../thumbs-up-raven.png";

// import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// import { Doughnut } from 'react-chartjs-2';
// ChartJS.register(ArcElement, Tooltip, Legend);
import ComparisonChart from "./ComparisonChart";

const Activity = () => {
    const [showInitialScreen, setShowInitialScreen] = useState(true);
    const [showInputScreen, setShowInputScreen] = useState(false);
    const [showFeedbackScreen, setShowFeedbackScreen] = useState(false);
    const [showComparisonPanel, setShowComparisonPanel] = useState(false);
    const [entries, setEntries] = useState([]);
    const [feedbackEntries, setFeedbackEntries] = useState([]);
    const [walkthroughMode, setWalkthroughMode] = useState(true);
    const [walkthroughPhase, setWalkthroughPhase] = useState(1);
    const [hasSubmittedFirstHypothesis, setHasSubmittedFirstHypothesis] =
        useState(false);

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isFetchingFeedback, setIsFetchingFeedback] = useState(false);
    const [comparisonData, setComparisonData] = useState(null);
    const [percentDisprove, setPercentDisprove] = useState(0);
    const [numGuesses, setNumGuesses] = useState(0);

    const advanceToNextPhase = () => {
        setWalkthroughPhase(walkthroughPhase + 1);

        if (walkthroughPhase === 3) {
            // setShowInputScreen(true);
            // setShowWalkthroughNextButton(false);
            setWalkthroughMode(false);
            logger.app.info("walkthroughMode", walkthroughMode);
        }
    };

    // implement beginActivity
    const beginActivity = () => {
        setShowInitialScreen(false);
        setShowInputScreen(true);
    };

    const loadFeedbackScreen = () => {
        setShowFeedbackScreen(true);
    };

    useEffect(() => {
        if (feedbackEntries.length > 0) {
            loadFeedbackScreen();
            setShowInputScreen(false);
        }
        logger.app.info("feedbackEntries", feedbackEntries);
    }, [feedbackEntries]);

    const addEntry = (sequence, hypothesis) => {
        logger.app.info(`Adding entry: ${sequence}`);

        // set hasSubmittedFirstHypothesis to true
        setHasSubmittedFirstHypothesis(true);

        const sequenceArray = sequence.split(",").map(Number);
        logger.app.info(sequenceArray);
        const matchesRule = isIncreasing(
            sequenceArray[0],
            sequenceArray[1],
            sequenceArray[2]
        );
        const newEntry = {
            entryNumber: entries.length + 1,
            sequence,
            hypothesis,
            matchesRule,
        };
        setEntries([...entries, newEntry]);
    };

    const openComparisonPanel = () => {
        /*
        - Send entries and feedbackEntries to the database
        - Get the current database results
        - Calculate the percentage of correct answers
        - Display the percentage in the comparison panel
        - If successful, set showComparisonPanel to true
        - If not successful, set showComparisonPanel to false and show alrty
        */

        // Determine if final guess is correct or not
        // Find the number of guesses used
        // Calculate the percentage of

        handleSubmit();

        logger.app.info("openComparisonPanel");
        setShowFeedbackScreen(false);
        setShowComparisonPanel(true);
    };

    // Use effect for comparisonData
    useEffect(() => {
        if (feedbackEntries.length > 0) {
            logger.app.info("calculating percentDisprove");
            logger.app.info("entries", entries);
            logger.app.info("feedbackEntries", feedbackEntries);

            /*
            feedbackEntries = [
            false,
            true
            ]
            */

            // Find the number of guesses used
            const numGuesses = feedbackEntries.length;
            // Calculate the percentage of attempts : take feedbackEntries array and calculate the percent true values
            const percentDisprove =
                feedbackEntries.reduce((acc, entry) => {
                    return acc + (entry ? 1 : 0);
                }, 0) / feedbackEntries.length;

            logger.app.info("numGuesses", numGuesses);
            logger.app.info("percentDisprove", percentDisprove);
            setPercentDisprove(percentDisprove);
            setNumGuesses(numGuesses);
        }
    }, [feedbackEntries, entries]);

    const handleSubmit = async () => {
        let isFinalGuessCorrect = false;
        let finalGuess = "Final guess";
        let entriesString = JSON.stringify(entries);
        let feedbackEntriesString = JSON.stringify(feedbackEntries);
        // let feedbackEntriesArray = feedbackEntries;

        try {
            setIsSubmitting(true);
            const endpoint =
                "https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/wason246/table1";

            const submitBody = {
                table1: {
                    id: "1",
                    date: new Date().toLocaleString(),
                    finalGuess: finalGuess,
                    percentDisprove: percentDisprove,
                    numGuesses: numGuesses,
                    isFinalGuessCorrect: isFinalGuessCorrect,
                    entries: entriesString,
                    feedbackEntries: feedbackEntriesString,
                },
            };

            const response = await fetch(endpoint, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(submitBody),
            });

            logger.app.info("response:", response);

            if (response.ok) {
                setIsSubmitting(false);
                handleFetchFeedback();
            } else {
                setIsSubmitting(false);
                logger.app.info("Submission failed");
                throw new Error("Submission failed");
            }
        } catch (error) {
            // setSubmissionStatus('error');
            logger.app.info("Submission failed", error);
            setIsSubmitting(false);
        }
    };

    const handleFetchFeedback = async () => {
        setIsFetchingFeedback(true);

        try {
            const endpoint =
                "https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/wason246/table1";
            const response = await fetch(endpoint);
            const data = await response.json();
            logger.app.info("data", data);
            setIsFetchingFeedback(false);

            if (response.ok) {
                logger.app.info("Fetching user feedback successful");
                setComparisonData(data.table1);
            } else {
                logger.app.info("Fetching user feedback failed");
                throw new Error("Fetching feedback failed");
            }
        } catch (error) {
            logger.app.info("Fetching user feedback failed", error);
        }
    };

    return (
        <div>
            {showInitialScreen && (
                <InitialScreen beginActivity={beginActivity} />
            )}
            {showInputScreen && (
                <InputScreen
                    addEntry={addEntry}
                    entries={entries}
                    loadFeedbackScreen={loadFeedbackScreen}
                    setFeedbackEntries={setFeedbackEntries}
                    walkthroughMode={walkthroughMode}
                    walkthroughPhase={walkthroughPhase}
                    advanceToNextPhase={advanceToNextPhase}
                    hasSubmittedFirstHypothesis={hasSubmittedFirstHypothesis}
                />
            )}
            {showFeedbackScreen && (
                <FeedbackScreen
                    entries={entries}
                    feedbackEntries={feedbackEntries}
                    openComparisonPanel={openComparisonPanel}
                />
            )}
            {showComparisonPanel && (
                <ComparisonPanel
                    entries={entries}
                    feedbackEntries={feedbackEntries}
                    comparisonData={comparisonData}
                    percentDisprove={percentDisprove}
                    numGuesses={numGuesses}
                />
            )}
        </div>
    );
};

export default Activity;

const InitialScreen = ({ beginActivity }) => {
    return (
        <div className="initial-screen">
            <div className="initial-screen-body">
                <div className="instructions">
                    <h1>Deduce the number rule!</h1>
                    {/* <p>
                        I have a SECRET rule that matches SOME sequences of
                        three numbers.
                        <br />
                        <i>e.g. Each number is a multiple of 4.</i>
                    </p>
                    <p>
                        <i>Your goal is to deduce my number rule, by testing number sequences and seeing whether they match or do not match my rule.</i>
                    </p> */}

                    <h2>Instructions</h2>
                    {/* <ol>
                        <li>
                            Test sequences of three integers against the rule. I
                            will tell you if your sequence matches.
                        </li>
                        <li>
                            When you are confident that you know the rule,
                            submit your final hypothesis!
                        </li>
                    </ol> */}
                    <p>
                        1. Test sequences of three integers against the rule. I
                        will tell you if your sequence matches.
                    </p>
                    <p>
                        2. When you are confident that you know the rule, submit
                        your final hypothesis!
                    </p>

                    <p>
                        Rigorous Raven will guide you through the first guess.
                    </p>
                    <button className="next-button" onClick={beginActivity}>
                        Next
                    </button>
                </div>
                <div className="initial-image-container">
                    <img src={magnifyingGlassRaven} alt="Rigorous Raven" />
                </div>
            </div>
            {/* <div className="footer">
            </div> */}
        </div>
    );
};

const InputScreen = ({
    addEntry,
    entries,
    loadFeedbackScreen,
    setFeedbackEntries,
    walkthroughMode,
    walkthroughPhase,
    advanceToNextPhase,
    hasSubmittedFirstHypothesis,
}) => {
    const input1Ref = useRef(null);
    const input2Ref = useRef(null);
    const input3Ref = useRef(null);
    const hypothesisRef = useRef(null);
    const [isSubmittingFinalHypothesis, setIsSubmittingFinalHypothesis] =
        useState(false);

    const [isLoading, setIsLoading] = useState(false);

    // Various states to control visibility of components during walkthrough
    const [showIntegerInputPanel, setShowIntegerInputPanel] = useState(false);
    const [showHypothesisPanel, setShowHypothesisPanel] = useState(false);
    const [showTestTable, setShowTestTable] = useState(false);
    const [showWalkthroughNextButton, setShowWalkthroughNextButton] =
        useState(true);
    const [autoTypeActivated, setAutoTypeActivated] = useState(false);
    const [hypothesisAutoTyped, setHypothesisAutoTyped] = useState(false);

    const activateAutoType = () => {
        setAutoTypeActivated(true);
    };
    const hasAutoTypeActivated = () => {
        return autoTypeActivated;
    };

    // Show the components based on the walkthroughMode and walkthroughPhase
    useEffect(() => {
        if (!walkthroughMode) {
            setShowIntegerInputPanel(true);
            setShowHypothesisPanel(true);
            setShowTestTable(true);
            setShowWalkthroughNextButton(false);
        } else {
            setShowIntegerInputPanel(walkthroughPhase >= 1);
            setShowHypothesisPanel(walkthroughPhase >= 2);
            setShowTestTable(walkthroughPhase >= 4);
            // setShowWalkthroughNextButton(walkthroughPhase < 4);
        }
    }, [walkthroughMode, walkthroughPhase]);

    const advanceToFinalHypothesis = () => {
        setIsSubmittingFinalHypothesis(true);
    };
    const backToInputScreen = () => {
        setIsSubmittingFinalHypothesis(false);
    };

    const submitWalkthroughHypothesis = () => {
        advanceToNextPhase();
        // clear input fields
        input1Ref.current.value = "";
        input2Ref.current.value = "";
        input3Ref.current.value = "";
        // hypothesisRef.current.value = '';
    };

    const handleTestSequence = () => {
        const input1 = input1Ref.current.value;
        const input2 = input2Ref.current.value;
        const input3 = input3Ref.current.value;
        const hypothesis = hypothesisRef.current.value;

        if (!input1 || !input2 || !input3 || !hypothesis) {
            alert("All fields must be filled out.");
            return;
        }

        if (isNaN(input1) || isNaN(input2) || isNaN(input3)) {
            alert("Please enter valid numbers.");
            return;
        }

        const sequence = `${input1},${input2},${input3}`;
        addEntry(sequence, hypothesis);

        // Clear fields after successful submission
        input1Ref.current.value = "";
        input2Ref.current.value = "";
        input3Ref.current.value = "";
        hypothesisRef.current.value = "";
    };

    // Hardcoded for debugging entries
    const handleDebugSubmit = () => {


        const entries = [
            { sequence: "2,4,6", hypothesis: "Each number is a multiple of 2" },
            { sequence: "1,2,3", hypothesis: "" },
        ];

        logger.app.info("entries", entries);
        let sequence = entries[entries.length - 1].sequence;
        let hypothesis = entries[entries.length - 1].hypothesis;
        logger.app.info("sequence", sequence);
        logger.app.info("hypothesis", hypothesis);

    };


    const handleSubmitFinalHypothesis = () => {
        setIsLoading(true);
        fetchDisprovalFeedback(entries)
            .then((disproveFeedback) => {
                logger.app.info(
                    "disproveFeedback from input screen",
                    disproveFeedback
                );
                setFeedbackEntries(disproveFeedback);
                // loadFeedbackScreen();
                setIsLoading(false);
            })
            .catch((error) => {
                logger.app.error("Error fetching disproval feedback:", error);
                alert("Failed to fetch feedback. Please try again.");
                setIsLoading(false);
            });
    };

    const triggerHypothesisAutoType = () => {
        setHypothesisAutoTyped(true);
    };

    return (
        <div className="input-screen">
            {/* Spinner */}
            {/* <ComparisonChart /> */}

            {isLoading && (
                <div className="loader-container">
                    <div className="loader"></div>
                </div>
            )}

            <div className="input-screen-body">
                <div className="input-screen-left">
                    <InstructionsPanel />
                    {/* Show if submitting final hypothsis is false */}
                    {!isSubmittingFinalHypothesis && showIntegerInputPanel && (
                        <IntegerInputPanel
                            input1Ref={input1Ref}
                            input2Ref={input2Ref}
                            input3Ref={input3Ref}
                            walkthroughMode={walkthroughMode}
                            walkthroughPhase={walkthroughPhase}
                            autoTypeActivated={autoTypeActivated}
                        />
                    )}
                    {walkthroughPhase === 1 && (
                        <Tooltip
                            phase={1}
                            advanceToNextPhase={advanceToNextPhase}
                            activateAutoType={activateAutoType}
                            hasAutoTypeActivated={autoTypeActivated}
                            setAutoTypeActivated={setAutoTypeActivated}
                        />
                    )}
                    {showHypothesisPanel && (
                        <HypothesisPanel
                            hypothesisRef={hypothesisRef}
                            isSubmittingFinalHypothesis={
                                isSubmittingFinalHypothesis
                            }
                            walkthroughMode={walkthroughMode}
                            walkthroughPhase={walkthroughPhase}
                            hypothesisAutoTyped={hypothesisAutoTyped}
                            advanceToNextPhase={advanceToNextPhase}
                        />
                    )}
                    {walkthroughPhase === 2 && (
                        <Tooltip
                            phase={2}
                            triggerHypothesisAutoType={
                                triggerHypothesisAutoType
                            }
                            hypothesisAutoTyped={hypothesisAutoTyped}
                            advanceToNextPhase={advanceToNextPhase}
                        />
                    )}
                </div>
                <div className="input-screen-right">
                    {showTestTable && <TestTable entries={entries} />}
                    {walkthroughPhase === 4 && !hasSubmittedFirstHypothesis && (
                        <Tooltip phase={4} />
                    )}
                </div>
            </div>
            <div className="input-screen-footer">
                {/* Show different buttons if submitting final hypothsis is false */}
                {/* {showWalkthroughNextButton && walkthroughPhase < 3 && (
                    <button
                        className="next-button"
                        onClick={advanceToNextPhase}
                    >
                        Next
                    </button>
                )} */}
                {showWalkthroughNextButton && walkthroughPhase === 3 && (
                    <>
                        <button
                            className="next-button"
                            onClick={submitWalkthroughHypothesis}
                        >
                            Test this sequence
                        </button>
                        <Tooltip phase={3} />
                    </>
                )}
                {!isSubmittingFinalHypothesis && !showWalkthroughNextButton && (
                    <>
                        <button
                            className="test-this-sequence-button"
                            onClick={handleTestSequence}
                        >
                            Test this sequence
                            {/* <Tooltip phase={3} /> */}
                        </button>
                        <button
                            className="submit-final-hypothesis-button"
                            onClick={advanceToFinalHypothesis}
                            disabled={!hasSubmittedFirstHypothesis}
                        >
                            Submit final hypothesis
                        </button>
                        {hasSubmittedFirstHypothesis && <Tooltip phase={5} />}
                    </>
                )}
                {/* Show if submitting final hypothsis is true */}
                {isSubmittingFinalHypothesis && !showWalkthroughNextButton && (
                    <>
                        <button
                            className="back-to-testing-sequences-button"
                            onClick={backToInputScreen}
                        >
                            Back to testing sequences
                        </button>
                        <button
                            className="submit-final-hypothesis-button"
                            onClick={handleSubmitFinalHypothesis}
                        >
                            Submit final hypothesis
                        </button>
                    </>
                )}
            </div>
        </div>
    );
};

const InstructionsPanel = () => {
    return (
        <div className="instructions-panel">
            <div className="instructions-image-container">
                <img src={keyboardRaven} alt="Rigorous Raven" />
            </div>
            <div className="instructions-text-container">
                {/* V2.0 */}
                {/* <p>Deduce the rule by testing sequences of three numbers</p>
                <p>
                    When you are confident that you know the rule, submit your
                    final hypothesis!
                </p> */}
                {/* V2.1 */}
                <p>Deduce my number rule!</p>
            </div>
        </div>
    );
};

const IntegerInputPanel = ({
    input1Ref,
    input2Ref,
    input3Ref,
    walkthroughMode,
    walkthroughPhase,
    autoTypeActivated,
}) => {
    const handleInputChange = (e, nextInputRef) => {
        if (e.target.value.length >= 2) {
            if (nextInputRef) {
                nextInputRef.current.focus();
            }
        }
    };

    const handleKeyDown = (e, prevInputRef) => {
        if (e.key === "Backspace" && e.target.value === "") {
            if (prevInputRef) {
                prevInputRef.current.focus();
                prevInputRef.current.value = prevInputRef.current.value.slice(
                    0,
                    -1
                );
            }
        }
    };

    useEffect(() => {
        if (autoTypeActivated) {
            triggerTypingAnimation();
        }
    }, [autoTypeActivated]);

    // Function to trigger typing in the integer input panel
    //  The below function should trigger a sequence of events in which the focus is on the first input, the number 2 is typed, and then the focus moves to the second input.
    // Then the number 4 is typed and the focus moves to the third input. Then the number 6 is typed.
    //  This should happen so that the user can see the typing animation.
    const triggerTypingAnimation = () => {
        logger.app.info("triggerTypingAnimation");
        const input1 = document.getElementById("input1");
        const input2 = document.getElementById("input2");
        const input3 = document.getElementById("input3");

        // if (input1 && input2 && input3) {
        //     input1.focus();
        //     input1.value = '2';
        //     input2.focus();
        //     input2.value = '4';
        //     input3.focus();
        //     input3.value = '6';
        // }

        // Trigger sequence of typing events in which the characters ['0', '1', 'tab', '0', '2', 'tab', '0', '3'] are typed
        // This should be a stream of keyboard events, not assigning characters to the input directly
        if (input1 && input2 && input3) {
            // Clear the input fields
            input1.value = "";
            input2.value = "";
            input3.value = "";

            setTimeout(() => {
                input1.focus();
                const event1 = new KeyboardEvent("keydown", { key: "2" });
                input1.dispatchEvent(event1);
                const event1up = new KeyboardEvent("keyup", { key: "2" });
                input1.dispatchEvent(event1up);
                input1.value = "2";
            }, 400);

            setTimeout(() => {
                input2.focus();
                const event2 = new KeyboardEvent("keydown", { key: "4" });
                input2.dispatchEvent(event2);
                const event2up = new KeyboardEvent("keyup", { key: "4" });
                input2.dispatchEvent(event2up);
                input2.value = "4";
            }, 800);

            setTimeout(() => {
                input3.focus();
                const event3 = new KeyboardEvent("keydown", { key: "6" });
                input3.dispatchEvent(event3);
                const event3up = new KeyboardEvent("keyup", { key: "6" });
                input3.dispatchEvent(event3up);
                input3.value = "6";
                // Remove the focus from the input fields
                input1.blur();
                input2.blur();
                input3.blur();
            }, 1200);

            // Ensure the values are set to the input fields
            setTimeout(() => {
                input1.value = "2";
                input2.value = "4";
                input3.value = "6";
            }, 1600);
        }
    };

    // on mount, trigger the typing animation if the walkthroughMode is true and the walkthroughPhase is 1
    useEffect(() => {
        if (walkthroughMode && walkthroughPhase === 2) {
            // triggerTypingAnimation();
            logger.app.info("triggerTypingAnimation");
        }
    }, [walkthroughMode, walkthroughPhase]);

    // function handleTypingButtonPress() {
    //     triggerTypingAnimation();
    // }

    return (
        <div className="integer-input-panel">
            <h4>Test a sequence of three integers</h4>
            {/* <Tooltip phase={1} /> */}
            <div className="integer-input-container">
                <span>{"{"}</span>
                <input
                    type="text"
                    id="input1"
                    placeholder=" _ _ "
                    className="integer-input"
                    maxLength="2"
                    ref={input1Ref}
                    onChange={(e) => handleInputChange(e, input2Ref)}
                    onKeyDown={(e) => handleKeyDown(e, null)}
                />
                <span>,</span>
                <input
                    type="text"
                    placeholder=" _ _ "
                    id="input2"
                    className="integer-input"
                    maxLength="2"
                    ref={input2Ref}
                    onChange={(e) => handleInputChange(e, input3Ref)}
                    onKeyDown={(e) => handleKeyDown(e, input1Ref)}
                />
                <span>,</span>
                <input
                    type="text"
                    placeholder=" _ _ "
                    id="input3"
                    className="integer-input"
                    maxLength="2"
                    ref={input3Ref}
                    onChange={(e) => handleInputChange(e, null)}
                    onKeyDown={(e) => handleKeyDown(e, input2Ref)}
                />
                <span>{"}"}</span>
            </div>
        </div>
    );
};

const HypothesisPanel = ({
    hypothesisRef,
    isSubmittingFinalHypothesis,
    walkthroughMode,
    walkthroughPhase,
    hypothesisAutoTyped,
    advanceToNextPhase,
}) => {
    return (
        <div className="hypothesis-panel ">
            {/* Display text conditionally based on isSubmittingFinalHypothesis */}
            {!isSubmittingFinalHypothesis && (
                <h4>What is the hypothesis for your sequence?</h4>
            )}
            {isSubmittingFinalHypothesis && (
                <h4>What is your final hypothesis for the rule?</h4>
            )}

            {/* Use the hardcoded auto-type container when in walkthrough mode */}
            {walkthroughMode && !hypothesisAutoTyped && (
                <div className="hypothesis-autotype-container">
                    {/* <div className="css-typing">
                        <p>Numbers increase by 2</p>
                    </div> */}
                </div>
            )}
            {walkthroughMode && hypothesisAutoTyped && (
                <div className="hypothesis-autotype-container">
                    <div className="css-typing">
                        <p>Numbers increase by 2</p>
                    </div>
                </div>
            )}
            {!walkthroughMode && (
                <textarea
                    className="hypothesis-textarea css-typing"
                    placeholder="e.g. Each number is a multiple of 4"
                    ref={hypothesisRef}
                />
            )}
        </div>
    );
};

const TestTable = ({ entries }) => {
    const hintEntry = {
        entryNumber: "--",
        sequence: "2,4,6",
        hypothesis: "Numbers increase by 2",
        matchesRule: "TRUE ✅",
    };

    const interpretMatchesRule = (matchesRule) => {
        return matchesRule ? "TRUE ✅" : "FALSE ❌";
    };

    return (
        <div className="test-table">
            <h1>Track your tests</h1>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Sequence</th>
                        <th>Hypothesis</th>
                        <th>Matches the Rule?</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>{hintEntry.entryNumber}</td>
                        <td>{hintEntry.sequence}</td>
                        <td>{hintEntry.hypothesis}</td>
                        <td>{hintEntry.matchesRule}</td>
                    </tr>
                    {entries.map((entry) => (
                        <tr key={entry.entryNumber}>
                            <td>{entry.entryNumber}</td>
                            <td>{entry.sequence}</td>
                            <td>{entry.hypothesis}</td>
                            <td>{interpretMatchesRule(entry.matchesRule)}</td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const FeedbackScreen = ({ entries, feedbackEntries, openComparisonPanel }) => {
    const [currentEntryIndex, setCurrentEntryIndex] = useState(0);
    const [isLastEntry, setIsLastEntry] = useState(false);

    const viewNextTest = () => {
        if (currentEntryIndex === entries.length - 1) {
            setCurrentEntryIndex(currentEntryIndex + 1);
            setIsLastEntry(true);
            return;
        }
        setCurrentEntryIndex(currentEntryIndex + 1);
    };

    const viewPreviousTest = () => {
        if (currentEntryIndex === 0) {
            return;
        }
        setIsLastEntry(false);
        setCurrentEntryIndex(currentEntryIndex - 1);
    };

    return (
        <div className="feedback-screen">
            <div className="rule-header">
                <h2>The rule is:</h2>
                <h2>ANY INCREASING SEQUENCE OF NUMBERS</h2>
            </div>

            <div className="feedback-screen-body-header">
                <h2>Let’s explore your tests</h2>
            </div>

            <div className="feedback-screen-body">
                <h2>
                    Which of your tests were attempts to CONFIRM your hypothesis
                    and which ones were attempts to FALSIFY your hypothesis?
                </h2>
                <div className="feedback-area">
                    <FeedbackTable
                        entries={entries}
                        feedbackEntries={feedbackEntries}
                        currentEntryIndex={currentEntryIndex}
                    />
                    <FeedbackPanel
                        entries={entries}
                        feedbackEntries={feedbackEntries}
                        currentEntryIndex={currentEntryIndex}
                    />
                </div>
                <div className="feedback-screen-footer">
                    {currentEntryIndex > 0 && (
                        <button
                            className="previous-button"
                            onClick={viewPreviousTest}
                        >
                            Explore the previous test
                        </button>
                    )}
                    {!isLastEntry && (
                        <button className="next-button" onClick={viewNextTest}>
                            Explore the next test
                        </button>
                    )}
                    {isLastEntry && (
                        <button
                            className="next-button"
                            onClick={openComparisonPanel}
                        >
                            Compare my results
                        </button>
                    )}
                </div>
            </div>
        </div>
    );
};

const FeedbackPanel = ({ entries, feedbackEntries, currentEntryIndex }) => {

    const feedbackEntry = feedbackEntries[currentEntryIndex - 1];

    const getFeedbackText = () => {
        const attemptType = feedbackEntry ? "confirm" : "falsify";
        const fitType = feedbackEntry ? "fit" : "did not fit";

        // Handle offset of entries array
        const entry = entries[currentEntryIndex - 1];

        if (currentEntryIndex === 0) {
            return (
                <>
                    <p>
                        Rigorous Raven's hypothesis was Numbers increase by 2.
                    </p>
                    <p>Their first number test sequence was 2,4,6.</p>
                    <p>
                        This test sequence was an attempt to confirm their
                        hypothesis.
                    </p>
                    <p>
                        In other words, the number sequence they tested was one
                        that {fitType} their hypothesis.
                    </p>
                </>
            );
        } else {
            return (
                <>
                    <p>Your hypothesis was {entry.hypothesis}.</p>
                    <p>Your test sequence was {entry.sequence}.</p>
                    <p>
                        This test sequence was an attempt to {attemptType} your
                        hypothesis.
                    </p>
                    <p>
                        In other words, the number sequence you tested was one
                        that {fitType} your hypothesis.
                    </p>
                </>
            );
        }
    };

    return <div className="feedback-panel">{getFeedbackText()}</div>;
};

const FeedbackTable = ({ entries, feedbackEntries, currentEntryIndex }) => {
    logger.app.info("feedbackEntries", feedbackEntries);
    logger.app.info("entries", entries);
    logger.app.info("currentEntryIndex", currentEntryIndex);

    const hintEntry = {
        entryNumber: "--",
        sequence: "2,4,6",
        hypothesis: "Numbers increase by 2",
        matchesRule: "TRUE ✅",
        feedback: "CONFIRMS",
    };

    const interpretMatchesRule = (matchesRule) => {
        return matchesRule ? "TRUE ✅" : "FALSE ❌";
    };

    const interpretFeedback = (feedback) => {
        logger.app.info(feedback);
        return feedback ? "CONFIRMS" : "FALSIFIES";
    };

    logger.app.info("feedbackEntries", feedbackEntries);

    return (
        <div className="test-table">
            <h1>Track Your Tests</h1>
            <table>
                <thead>
                    <tr>
                        <th>#</th>
                        <th>Sequence</th>
                        <th>Hypothesis</th>
                        <th>Matches the Rule?</th>
                        <th>
                            Does this test CONFIRM or FALSIFY this hypothesis?
                        </th>
                    </tr>
                </thead>
                <tbody>
                    <tr
                        style={{
                            fontWeight:
                                currentEntryIndex === 0 ? "bold" : "normal",
                        }}
                    >
                        <td>{hintEntry.entryNumber}</td>
                        <td>{hintEntry.sequence}</td>
                        <td>{hintEntry.hypothesis}</td>
                        <td>{hintEntry.matchesRule}</td>
                        <td>{hintEntry.feedback}</td>
                    </tr>
                    {entries.map((entry, index) => (
                        <tr
                            key={entry.entryNumber}
                            style={{
                                fontWeight:
                                    currentEntryIndex === index + 1
                                        ? "bold"
                                        : "normal",
                            }}
                        >
                            {currentEntryIndex >= index + 1 ? (
                                <>
                                    <td>{entry.entryNumber}</td>
                                    <td>{entry.sequence}</td>
                                    <td>{entry.hypothesis}</td>
                                    <td>
                                        {interpretMatchesRule(
                                            entry.matchesRule
                                        )}
                                    </td>
                                    <td>
                                        {interpretFeedback(
                                            feedbackEntries[index]
                                        )}
                                    </td>
                                </>
                            ) : (
                                <>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                    <td></td>
                                </>
                            )}
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
    );
};

const AutotypeButton = ({
    isInitialState,
    activateAutoType,
    advanceToNextPhase,
    setAutoTypeActivated,
}) => {
    const [buttonText, setButtonText] = useState("");

    useEffect(() => {
        if (isInitialState) {
            setButtonText("Input sequence");
        }
    }, [isInitialState]);

    const triggerAutoType = () => {
        setButtonText("...");
        activateAutoType();
        setAutoTypeActivated(true);
        // Change button text to "Autotyping..."
        setButtonText("...");
        // Wait for 3 seconds
        setTimeout(() => {
            // Change button text back to "Input sequence"
            // setButtonText("Input sequence");
            setButtonText("Done");
        }, 3000);
        // Change button text back to "Input sequence"
        // setButtonText("Done");
        // Change button text back to "Autotyping..."
    };

    const handleButtonClick = () => {
        if (buttonText === "Input sequence") {
            setButtonText("...");
            triggerAutoType();
        } else if (buttonText === "Done") {
            advanceToNextPhase();
        }
    };

    return (
        <button className="next-button" onClick={handleButtonClick}>
            {buttonText}
        </button>
    );
};
const HypothesisAutotypeButton = ({
    isInitialState,
    triggerHypothesisAutoType,
    advanceToNextPhase,
}) => {
    const [buttonText, setButtonText] = useState("");

    useEffect(() => {
        if (isInitialState) {
            setButtonText("Input Hypothesis");
        }
    }, [isInitialState]);

    const triggerAutoType = () => {
        setButtonText("...");
        triggerHypothesisAutoType();
        // Change button text to "Autotyping..."
        setButtonText("...");
        // Wait for 3 seconds
        setTimeout(() => {
            // Change button text back to "Input sequence"
            // setButtonText("Input sequence");
            setButtonText("Done");
        }, 2500);
        // Change button text back to "Input sequence"
        // setButtonText("Done");
        // Change button text back to "Autotyping..."
    };

    const handleButtonClick = () => {
        if (buttonText === "Input Hypothesis") {
            setButtonText("...");
            triggerAutoType();
        } else if (buttonText === "Done") {
            // if (typeof advanceToNextPhase === 'function') {
            //     advanceToNextPhase();
            // } else {
            //     logger.app.error('advanceToNextPhase is not a function');
            // }
            advanceToNextPhase();
        }
    };

    return (
        <button
            className="hypothesis-autotype-button"
            onClick={handleButtonClick}
        >
            {buttonText}
        </button>
    );
};

// Tooltip component
const Tooltip = ({
    phase,
    advanceToNextPhase,
    activateAutoType,
    hasAutoTypeActivated,
    triggerHypothesisAutoType,
    hypothesisAutoTyped,
}) => {
    const [isVisible, setIsVisible] = useState(true);
    const [lines, setLines] = useState([]);

    const showTooltip = () => setIsVisible(true);
    const hideTooltip = () => setIsVisible(false);

    // For autotype phase
    const [autoTypeActivated, setAutoTypeActivated] = useState(false);

    // Set tooltip class name based on phase
    const getTooltipClassName = () => {
        return `tooltip-content-phase${phase}`;
    };

    // Set tooltip class name based on phase
    const getTooltipContainerClassName = () => {
        return `tooltip-container-phase${phase}`;
    };

    // Set lines based on phase
    // const initializeTooltip = () => {
    //     if (phase === 1) {
    //         setLines([
    //             <p>Test a sequence of three integers</p>,
    //             <p>When you are confident that you know the rule, submit your final hypothesis!</p>,
    //             <p>Rigorous Raven will guide you through the first guess.</p>
    //         ]);
    //     }
    // };
    useEffect(() => {
        if (phase === 1) {
            setLines([
                // <p>Rigorous Raven will make the first test!</p>,
                // <p>They think the rule might be “numbers increasing by 2”</p>,
                // <p>They will start by testing {"{2, 4, 6}"}</p>,
                <p>Rigorous Raven wants to try the sequence {"{2, 4, 6}"}</p>,
                // <button className="next-button" onClick={activateAutoType}>
                //     Input sequence
                // </button>,
                <AutotypeButton
                    activateAutoType={activateAutoType}
                    advanceToNextPhase={advanceToNextPhase}
                    isInitialState={!autoTypeActivated}
                    setAutoTypeActivated={setAutoTypeActivated}
                />,
            ]);
        }
        if (phase === 2) {
            setLines([
                // <p>{"{2, 4, 6}"} is the first test</p>,
                // <p>
                //     Rigorous Raven thinks the rule might be “numbers increasing
                //     by 2”
                // </p>,
                // <p>They write that as their hypothesis for this test</p>,
                <p>
                    Rigorous Raven's hypothesis for the rule is 'numbers
                    increasing by 2'
                </p>,
                <HypothesisAutotypeButton
                    isInitialState={!hypothesisAutoTyped}
                    triggerHypothesisAutoType={triggerHypothesisAutoType}
                    advanceToNextPhase={advanceToNextPhase}
                />,
            ]);
        }
        if (phase === 3) {
            setLines([
                // <p>
                //     Let’s see if Rigorous Raven’s first test matches the rule or
                //     not by clicking “Test the sequence”
                // </p>,
                // <p>Then you can make your own tests!</p>,
                <p>Let's see if the sequence matches my rule</p>,
            ]);
        }
        if (phase === 4) {
            setLines([
                <p>Rigorous Raven’s first test, {"{2, 4, 6}"}</p>,
                <p>matches the rule!</p>,
                // <p>This table will track your tests.</p>,
                <p>
                    Now make your own tests until you think you know the rule!
                </p>,
            ]);
        }
        if (phase === 5) {
            setLines([
                <p>Test as many sequences as you want!</p>,
                <p>When you think you know the rule,</p>,
                <p>you can “Submit final hypothesis”</p>,
            ]);
        }
    }, [phase]);

    const getTooltipArrowClassName = () => {

        if (phase === 5) {
            return "tooltip-arrow-left-phase5";
        }
        return "tooltip-arrow-left";
    };


    return (
        <div className={getTooltipContainerClassName()}>
            {isVisible && (
                <div className="tooltip-content-container">
                    {/* <div className="tooltip-arrow-left"></div> */}
                    <div className={getTooltipClassName()}>
                        <div className={getTooltipArrowClassName()}></div>
                        <div className="tooltip-text">
                            {lines.map((line, index) => (
                                <div key={index}>{line}</div>
                            ))}
                        </div>
                        <div className="tooltip-img-container">
                            <img
                                className="tooltip-img"
                                src={thumbsUpRaven}
                                alt="thumbs up raven"
                            />
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

// Comparison Panel
const ComparisonPanel = ({
    entries,
    feedbackEntries,
    comparisonData,
    percentDisprove,
    numGuesses,
}) => {
    const [isLoading, setIsLoading] = useState(true);
    const [correctGuesses, setCorrectGuesses] = useState([]);
    const [incorrectGuesses, setIncorrectGuesses] = useState([]);

    // Build two arrays, correctGuesses and incorrectGuesses. Each array will contain objects with the following keys: numGuesses, percentDisprove
    // Correct guesses are the ones where isFinalGuessCorrect is true
    // Incorrect guesses are the ones where isFinalGuessCorrect is false
    useEffect(() => {
        if (comparisonData) {
            setIsLoading(false);
            let tempCorrectGuesses = [];
            let tempIncorrectGuesses = [];
            logger.app.info("comparisonData loaded");
            logger.app.info("comparisonData", comparisonData);

            for (let i = 0; i < comparisonData.length; i++) {
                if (comparisonData[i].isFinalGuessCorrect) {
                    tempCorrectGuesses.push(comparisonData[i]);
                    logger.app.info(
                        "isFinalGuessCorrect",
                        comparisonData[i].isFinalGuessCorrect
                    );
                } else {
                    tempIncorrectGuesses.push(comparisonData[i]);
                    logger.app.info(
                        "isFinalGuessCorrect",
                        comparisonData[i].isFinalGuessCorrect
                    );
                }
            }
            setCorrectGuesses(tempCorrectGuesses);
            setIncorrectGuesses(tempIncorrectGuesses);

            logger.app.info("tempCorrectGuesses", tempCorrectGuesses);
            logger.app.info("tempIncorrectGuesses", tempIncorrectGuesses);
        } else {
            logger.app.info("comparisonData not loaded yet");
        }
    }, [comparisonData]);

    useEffect(() => {
        logger.app.info("correctGuesses", correctGuesses);
        logger.app.info("incorrectGuesses", incorrectGuesses);
    }, [correctGuesses, incorrectGuesses]);

    if (isLoading) {
        return (
            <div className="comparison-panel-loading">
                Loading Comparison Panel
            </div>
        );
    } else if (correctGuesses) {
        return (
            <div className="comparison-page">
                <div className="comparison-header">
                    <h2>Scientists love their hypotheses!</h2>
                </div>
                <div className="comparison-body">
                    <h3>Let’s compare your results with other students’</h3>
                    <div className="comparison-panel">
                        {/* <div> */}
                        <p>
                            You tried to falsify your hypothesis{" "}
                            {percentDisprove * 100}% of the time.
                        </p>
                        <p>
                            You did not successfully identify the rule - note
                            this feature is still under development.
                        </p>
                        {/* </div> */}

                        <div className="comparison-chart">
                            <ComparisonChart
                                correctGuesses={correctGuesses}
                                incorrectGuesses={incorrectGuesses}
                                percentDisprove={percentDisprove}
                                numGuesses={numGuesses}
                            />
                        </div>
                    </div>
                </div>
            </div>
        );

        // return <ComparisonChart correctGuesses={correctGuesses} incorrectGuesses={incorrectGuesses} percentDisprove={percentDisprove} numGuesses={numGuesses} />;
    } else {
        return <div className="comparison-panel-loading">Comparison Panel</div>;
    }
};
