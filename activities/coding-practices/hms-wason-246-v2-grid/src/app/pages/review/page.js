"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import HeaderWithModal from "@/app/components/HeaderWithModal/HeaderWithModal";
import "@/app/pages/review/review.css";
import CustomButton from "@/app/components/CustomButton/CustomButton";

export function ReviewContent() {
    const [reviewData, setReviewData] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const guessID = searchParams.get("guessID");
    const sessionID = searchParams.get("sessionID");

    const [initialGuess, setInitialGuess] = useState(
        {
            number: "00",
            sequence: "2, 4, 6",
            match: "TRUE",
            hypothesis: "default",
        },
    );


    // Takes in a guessNumber and returns a string with a leading zero if the guessNumber is less than 10
    // const formatGuessNumber = (guessNumber) => {
    //     return guessNumber < 10 ? "0" + guessNumber : guessNumber;
    // }

    function formatGuessNumber(num) {
        const adjustedNumber = num - 1;
        return adjustedNumber < 10 ? `0${adjustedNumber}` : `${adjustedNumber}`;
    }

    let guessList = [];
    // let actualAnswer = "";
    if (reviewData) {
        guessList = reviewData.guessList;
        // actualAnswer = reviewData.actualAnswer;
    }

    /*
    guessList: array of objects with the following properties:
    - guessNumber: integer
    - guessValue1: integer
    - guessValue2: integer
    - guessValue3: integer
    - matchesRule: boolean
    - guessHypothesis: string
    */

    const handleContinue = () => {
        if (guessID) {
            if (sessionID) {
                router.push(`/pages/compare?guessID=${guessID}&sessionID=${sessionID}`);
            } else {
                router.push(`/pages/compare?guessID=${guessID}`);
            }
        } else {
            if (sessionID) {
                router.push(`/pages/compare?sessionID=${sessionID}`);
            } else {
                router.push("/pages/compare");
            }
        }
    };

    useEffect(() => {
        if (!guessID) return;

        const fetchReviewData = async () => {
            try {
                const response = await fetch(
                    `/api/numberRuleGuessApi?guessID=${guessID}`
                );
                console.log("response:", response);
                const result = await response.json();
                console.log("result:", result);
                // setDagResults(result);

                // Filter the result to get the guess with the guessID
                const guess = result.find((guess) => guess.guessID === guessID);
                console.log("guess:", guess);
                setReviewData(guess);
            } catch (error) {
                console.log("Error loading results: ", error);
            }
        };

        fetchReviewData();
    }, [guessID]);

    if (!reviewData) return (
        <div className="review-loading">
            <h2>
                Loading...
            </h2>
            <h3>
                If no results are shown, please refresh the page.
            </h3>
        </div>
    );

    return (
        <div className="review-page">
            <HeaderWithModal openModalMode={true} />

            <div className="review-content">
                {/* <h2 className="final-guess-title">FINAL GUESS FOR THE NUMBER RULE</h2>

                <div className="final-guess-container">
                    <p>{reviewData.finalGuess}</p>
                </div> */}

                <h2 className="final-guess-title">EXPERIMENTAL TRIALS</h2>

                <div className="data-table-wrapper">
                    <div className="data-table">
                        <table>
                            <thead>
                                <tr>
                                    <th>#</th>
                                    <th>SEQUENCE</th>
                                    <th>MATCHES THE NUMBER RULE</th>
                                </tr>
                            </thead>
                            <tbody>
                                {/* Initial guess */}
                                <tr key={initialGuess.number} className="data-table-row">
                                    <td>{(initialGuess.number)}</td>
                                    <td>{initialGuess.sequence}</td>
                                    <td>{initialGuess.match}</td>
                                </tr>
                                {reviewData.guessList.map((guess, index) => (
                                    <tr key={index} className="data-table-row">
                                        <td>{formatGuessNumber(guess.guessNumber)}</td>
                                        <td>{`${guess.guessValue1}, ${guess.guessValue2}, ${guess.guessValue3}`}</td>
                                        <td>{guess.matchesRule ? "TRUE" : "FALSE"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                <h2 className="final-guess-title">YOUR FINAL HYPOTHESIS FOR THE NUMBER RULE</h2>

                <div className="final-guess-container">
                    <p>{reviewData.finalGuess}</p>
                </div>

                {/* <div className="actual-answer-container">
                    <p>The secret number rule was:</p>
                    <p>{reviewData.actualAnswer}</p>
                </div>

                <button className="continue-button" onClick={() => router.push('/pages/compare')}>
                    Continue
                </button> */}

                <div className="bottom-container">
                    <div className="speech-bubble-container">
                        <div className="speech-bubble-body">
                            {/* Conditional rendering for main text */}
                            <p className="main-text">
                                The secret number rule was:
                            </p>
                            <p className="sub-text">
                                {reviewData.actualAnswer}
                            </p>
                        </div>
                        {/* <div className="speech-bubble-tail"></div> */}
                    </div>

                    <div className="board-raven-outer-container">
                        {/* <div className="board-raven-inner-container">
                            <Image
                                src={boardRaven}
                                alt="Board Raven"
                                className="board-raven"
                            />
                        </div> */}
                    </div>

                    <br />
                    {/* <button
                        className="responsive-button continue-button"
                        onClick={handleContinue}
                    >
                        Continue
                    </button> */}

                    <CustomButton
                        onClick={handleContinue}
                        ariaLabel="Hello"
                        disabled={false}
                        variant="tertiary"
                        className="continue-button"
                        // customStyles={buttonStyles}
                    >
                        Continue
                    </CustomButton>
                    <br />
                </div>
            </div>
        </div>
    );
}

export default function Review() {
    return (
        // Suspense fallback for loading state
        (<Suspense fallback={
            <div>
                <h2>
                    Loading...
                </h2>
            </div>
        }>
            {/* Actual content */}
            <ReviewContent />
        </Suspense>)
    );
}
