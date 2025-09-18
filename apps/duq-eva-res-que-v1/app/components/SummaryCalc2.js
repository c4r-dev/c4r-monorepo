const logger = require('../../../../packages/logging/logger.js');
"use client";

import React, { useState, useEffect } from "react";

import { useSearchParams } from "next/navigation";
import { useRouter } from "next/navigation";

import Questions from "../questions/questions.json";

import Image from "next/image";

import Raven1 from "../assets/feedback-button-1.svg";

import SideRaven from "../assets/raven-1-angled.svg";

import ravenChatIcon1 from "../assets/raven-chat-icon-1.svg";
import ravenChatIcon2 from "../assets/raven-chat-icon-2.svg";
import ravenChatIcon3 from "../assets/raven-chat-icon-3.svg";
import ravenChatIcon4 from "../assets/raven-chat-icon-4.svg";

export default function SummaryCalc() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const selected = searchParams.get("selected");
    const userInput = searchParams.get("allResponses");
    const userInputArray = JSON.parse(userInput);

    const [hasUserInput, setHasUserInput] = useState(false);
    let q1UserInput, q2UserInput, q3UserInput;

    const prepareUserInput = () => {
        // const userInput = searchParams.get("allResponses");
        logger.app.info("userInput:", userInput);
        // const userInputArray = JSON.parse(userInput);
        logger.app.info("userInputArray:", userInputArray);

        userInputArray.forEach((input) => {
            if (input.number === 1) {
                q1UserInput = input;
            } else if (input.number === 2) {
                q2UserInput = input;
            } else if (input.number === 3) {
                q3UserInput = input;
            }
        });
    };
    // Try prep user input and if it doesnt fail, set hasUserInput to true
    try {
        prepareUserInput()
            .then(() => {
                setHasUserInput(true);
            })
            .catch((error) => {
                logger.app.info("Error preparing user input: ", error);
                setHasUserInput(false);
            });
        // setHasUserInput(true);
    } catch (error) {
        logger.app.info("Error preparing user input: ", error);
        // setHasUserInput(false);
    }

    const [outputs, setOutputs] = useState(null);
    const [is1Visible, setIs1Visible] = useState(false);
    const [is2Visible, setIs2Visible] = useState(false);
    const [is3Visible, setIs3Visible] = useState(false);

    let question1 = "";
    let question2 = "";
    let question3 = "";
    let number1 = "";
    let number2 = "";
    let number3 = "";

    Questions.forEach(function (elem) {
        if (elem.category === selected) {
            if (elem.number === "1") {
                number1 = elem.number;
                question1 = elem.question;
            } else if (elem.number === "2") {
                number2 = elem.number;
                question2 = elem.question;
            } else {
                number3 = elem.number;
                question3 = elem.question;
            }
        }
    });

    useEffect(() => {
        const fetchData = async () => {
            try {
                const response = await fetch("/api/studentInput");
                logger.app.info("response:", response);
                const result = await response.json();
                logger.app.info("result:", result);
                setOutputs(result);
            } catch (error) {
                logger.app.info("Error loading student answers: ", error);
            }
        };

        fetchData();
    }, []);

    if (!outputs) return <div>Loading...</div>;

    let Q = {
        goodcnt: 0,
        bettercnt: 0,
        greatcnt: 0,
        goodpct: 0,
        betterpct: 0,
        greatpct: 0,
        totalcnt: 0,
    };
    let q1 = Object.create(Q);
    let q2 = Object.create(Q);
    let q3 = Object.create(Q);
    let q1Answers = [];
    let q2Answers = [];
    let q3Answers = [];
    let q1a = [];
    let q2a = [];
    let q3a = [];

    const isToday = (date) => {
        const today = new Date();
        return (
            date.getDate() === today.getDate() &&
            date.getMonth() === today.getMonth() &&
            date.getFullYear() === today.getFullYear()
        );
    };

    // Prepare answers for each question
    outputs.forEach((item) => {
        if (item.category === selected && isToday(new Date(item.createdAt))) {
            if (item.number === "1") {
                if (item.fbtool === "good") {
                    q1.goodcnt++;
                } else if (item.fbtool === "better") {
                    q1.bettercnt++;
                } else {
                    q1.greatcnt++;
                }
                q1.totalcnt++;
                if (q1.totalcnt <= 10) {
                    q1a = item.questionAnswer;
                    let qFeedback = item.fbtool;
                    let answerInstance = {
                        answer: q1a,
                        feedback: qFeedback,
                    };
                    q1Answers.push(answerInstance);
                }
            } else if (item.number === "2") {
                if (item.fbtool === "good") {
                    q2.goodcnt++;
                } else if (item.fbtool === "better") {
                    q2.bettercnt++;
                } else {
                    q2.greatcnt++;
                }
                q2.totalcnt++;
                if (q2.totalcnt <= 10) {
                    q2a = item.questionAnswer;
                    let qFeedback = item.fbtool;
                    let answerInstance = {
                        answer: q2a,
                        feedback: qFeedback,
                    };
                    q2Answers.push(answerInstance);
                }
            } else {
                if (item.fbtool === "good") {
                    q3.goodcnt++;
                } else if (item.fbtool === "better") {
                    q3.bettercnt++;
                } else {
                    q3.greatcnt++;
                }
                q3.totalcnt++;
                if (q3.totalcnt <= 10) {
                    q3a = item.questionAnswer;
                    let qFeedback = item.fbtool;
                    let answerInstance = {
                        answer: q3a,
                        feedback: qFeedback,
                    };
                    q3Answers.push(answerInstance);
                }
            }
        }
    });

    // Remove the current user's answer from the answer's list:
    // For each of q1Answers, q2Answers, q3Answers, remove the answer if it matches q1UserInput, q2UserInput, q3UserInput
    q1Answers = q1Answers.filter(
        (answer) => answer.answer !== q1UserInput.comment
    );
    q2Answers = q2Answers.filter(
        (answer) => answer.answer !== q2UserInput.comment
    );
    q3Answers = q3Answers.filter(
        (answer) => answer.answer !== q3UserInput.comment
    );

    // logger.app.info("q1UserInput:", q1UserInput);
    // logger.app.info("q2UserInput:", q2UserInput);
    // logger.app.info("q3UserInput:", q3UserInput);

    q1.goodpct = Math.round((q1.goodcnt / q1.totalcnt) * 100);
    q1.betterpct = Math.round((q1.bettercnt / q1.totalcnt) * 100);
    q1.greatpct = Math.round((q1.greatcnt / q1.totalcnt) * 100);

    q2.goodpct = Math.round((q2.goodcnt / q2.totalcnt) * 100);
    q2.betterpct = Math.round((q2.bettercnt / q2.totalcnt) * 100);
    q2.greatpct = Math.round((q2.greatcnt / q2.totalcnt) * 100);

    q3.goodpct = Math.round((q3.goodcnt / q3.totalcnt) * 100);
    q3.betterpct = Math.round((q3.bettercnt / q3.totalcnt) * 100);
    q3.greatpct = Math.round((q3.greatcnt / q3.totalcnt) * 100);

    // Log the counts
    logger.app.info("q1.goodcnt:", q1.goodcnt);
    logger.app.info("q1.bettercnt:", q1.bettercnt);
    logger.app.info("q1.greatcnt:", q1.greatcnt);

    // Log q1 goodpct, betterpct, greatpct
    logger.app.info("q1.goodpct:", q1.goodpct);
    logger.app.info("q1.betterpct:", q1.betterpct);
    logger.app.info("q1.greatpct:", q1.greatpct);

    function getWinner(goodPct, betterPct, greatPct) {
        // return "q1";

        if (goodPct > betterPct && goodPct > greatPct) {
            return "q1";
        } else if (betterPct > goodPct && betterPct > greatPct) {
            return "q2";
        } else {
            return "q3";
        }
    }

    const q1Winner = getWinner(q1.goodpct, q1.betterpct, q1.greatpct);
    const q2Winner = getWinner(q2.goodpct, q2.betterpct, q2.greatpct);
    const q3Winner = getWinner(q3.goodpct, q3.betterpct, q3.greatpct);

    const toggle1Visibility = () => {
        setIs1Visible(!is1Visible);
    };

    const toggle2Visibility = () => {
        setIs2Visible(!is2Visible);
    };

    const toggle3Visibility = () => {
        setIs3Visible(!is3Visible);
    };

    const openFinalScreen = () => {
        router.push(`/congratulations`);
    };

    const SummryInstance = ({
        title,
        question,
        questionData,
        answers,
        winner,
        userInput,
    }) => {
        // Map answers good better great to an array
        const colorMap = {
            good: "#FFA800",
            better: "#F4F734",
            great: "#A0FF00",
        };
        const colorClassMap = {
            good: "good-color",
            better: "better-color",
            great: "great-color",
        };
        const getColorClass = (feedback) => {
            // logger.app.info(feedback);
            // logger.app.info(colorClassMap[feedback]);
            return colorClassMap[feedback];
        };
        const getColor = (feedback) => {
            // logger.app.info(feedback);
            // logger.app.info(colorMap[feedback]);
            return colorMap[feedback];
        };

        // Render 3 elements in column with "YOUR VOTE" positioned based on userInput.rating
        const renderVoteIndicator = (userInput) => {
            // Render 3 p elements, where 1 contains "YOUR VOTE" and the other are blank
            const voteIndicators = ["", "", ""];
            const voteIndex =
                userInput.rating === "good"
                    ? 0
                    : userInput.rating === "better"
                    ? 1
                    : 2;
            voteIndicators[voteIndex] = "YOUR VOTE";
            // Based on VoteIndex, render with appropriate class
            return (
                <>
                    <p className={voteIndex === 0 ? "your-vote" : ""}>
                        {voteIndicators[0]}
                    </p>
                    <p className={voteIndex === 1 ? "your-vote" : ""}>
                        {voteIndicators[1]}
                    </p>
                    <p className={voteIndex === 2 ? "your-vote" : ""}>
                        {voteIndicators[2]}
                    </p>
                </>
            );
        };

        const [showAnswers, setShowAnswers] = useState(false);

        const toggleAnswersVisibility = () => {
            // Calculate pixle height of answers
            const answersHeight = answers.length * 100;
            // logger.app.info(answersHeight);

            setShowAnswers(!showAnswers);

            // Assign css property collapse
            // const container = document.querySelector('.summary-instance-answer-bubble-container')
            // container.classList.toggle('collapsed')
        };
        return (
            <div className="summary-instance-container">
                <h2>{title}</h2>
                <h3>{question}</h3>
                <div className="summary-instance-stats-area">
                    <div className="stats-column your-vote-column">
                        {renderVoteIndicator(userInput)}
                    </div>
                    <div className="stats-column">
                        <p
                            className={
                                userInput.rating === "good" ? "winner" : ""
                            }
                        >
                            GOOD
                        </p>
                        <p
                            className={
                                userInput.rating === "better" ? "winner" : ""
                            }
                        >
                            BETTER
                        </p>
                        <p
                            className={
                                userInput.rating === "great" ? "winner" : ""
                            }
                        >
                            GREAT
                        </p>
                    </div>
                    <div className="stats-column pct-column">
                        <p>{questionData.goodpct}%</p>
                        <p>{questionData.betterpct}%</p>
                        <p>{questionData.greatpct}%</p>
                    </div>
                    <div className="stats-column stats-bar-container">
                        <div
                            className="stats-bar good-bar"
                            style={{ width: `${questionData.goodpct}%` }}
                        ></div>
                        <div
                            className="stats-bar better-bar"
                            style={{ width: `${questionData.betterpct}%` }}
                        ></div>
                        <div
                            className="stats-bar great-bar"
                            style={{ width: `${questionData.greatpct}%` }}
                        ></div>
                    </div>
                </div>

                <div className="summary-instance-footer">
                    <h3>What would improve this research question?</h3>
                    <button onClick={toggleAnswersVisibility}>
                        {showAnswers ? "HIDE ANSWERS" : "SHOW ANSWERS"}
                    </button>
                </div>

                <div
                    className={`summary-instance-answer-bubble-container ${
                        showAnswers ? "" : "collapsed"
                    }`}
                >
                    <div className={`summary-instance-answer-bubble right`}>
                        <div className={`answer-bubble right`}>
                            <div
                                className={`answer-bubble-body right your-color`}
                            >
                                <h1>{userInput.comment}</h1>
                            </div>
                            <div
                                className={`answer-bubble-triangle right your-color`}
                            ></div>
                            <div className={`answer-bubble-icon right`}>
                                <Image
                                    src={ravenChatIcon1}
                                    alt="Raven Chat Icon 1"
                                />
                            </div>
                        </div>
                    </div>
                    <p>Other answers</p>
                    {/*  Render alternating speech bubbles */}
                    {answers.map((item, index) => (
                        <div
                            key={index}
                            className={`summary-instance-answer-bubble ${
                                index % 2 === 0 ? "left" : "right"
                            }`}
                        >
                            <div
                                className={`answer-bubble ${
                                    index % 2 === 0 ? "left" : "right"
                                }`}
                            >
                                <div
                                    className={`answer-bubble-body ${
                                        index % 2 === 0 ? "left" : "right"
                                    }`}
                                    style={{
                                        backgroundColor: getColor(
                                            item.feedback
                                        ),
                                    }}
                                >
                                    <h1>{item.answer}</h1>
                                    {/* <h1>{item.feedback}</h1> */}
                                </div>
                                <div
                                    className={`answer-bubble-triangle ${
                                        index % 2 === 0 ? "left" : "right"
                                    } ${getColorClass(item.feedback)}`}
                                ></div>
                                <div
                                    className={`answer-bubble-icon ${
                                        index % 2 === 0 ? "left" : "right"
                                    }`}
                                >
                                    {index % 2 === 0 && (
                                        <Image
                                            src={ravenChatIcon1}
                                            alt="Raven Chat Icon 1"
                                        />
                                    )}
                                    {index % 2 === 1 && (
                                        <Image
                                            src={ravenChatIcon2}
                                            alt="Raven Chat Icon 2"
                                        />
                                    )}
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        );
    };

    return (
        <>
            <div className="summary-screen-container">
                <header className="summary-screen-header">
                    <h1>Formulating a Valid Research Question</h1>
                </header>

                <div className="summary-area-container">
                    <h2>What did other students think:</h2>

                    <SummryInstance
                        title="Research Question 1"
                        question={question1}
                        questionData={q1}
                        answers={q1Answers}
                        winner={q1Winner}
                        userInput={q1UserInput}
                    />
                    <SummryInstance
                        title="Research Question 2"
                        question={question2}
                        questionData={q2}
                        answers={q2Answers}
                        winner={q2Winner}
                        userInput={q2UserInput}
                    />
                    <SummryInstance
                        title="Research Question 3"
                        question={question3}
                        questionData={q3}
                        answers={q3Answers}
                        winner={q3Winner}
                        userInput={q3UserInput}
                    />

                    <div className="summary-area-footer">
                        <button
                            className="summary-continue-button"
                            onClick={openFinalScreen}
                        >
                            CONTINUE
                        </button>
                    </div>
                </div>
            </div>

            <div>
                <Image
                    priority
                    src={SideRaven}
                    alt="Follow us at c4r.io"
                    className="raven-footer-1"
                />
            </div>
        </>
    );
}
