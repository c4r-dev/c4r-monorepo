"use client";

import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "@/app/components/header";
import "@/app/pages/review/review.css";

export function ReviewContent() {
    const [reviewData, setReviewData] = useState(null);
    const router = useRouter();
    const searchParams = useSearchParams();
    const guessID = searchParams.get("guessID");

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
            router.push("/pages/compare?guessID=" + guessID);
        } else {
            router.push("/pages/compare");
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
            <Header />

            <div className="review-content">
                <h2 className="final-guess-title">FINAL GUESS FOR THE NUMBER RULE</h2>

                <div className="final-guess-container">
                    <p>{reviewData.finalGuess}</p>
                </div>

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
                                {reviewData.guessList.map((guess, index) => (
                                    <tr key={index} className="data-table-row">
                                        <td>{guess.guessNumber}</td>
                                        <td>{`${guess.guessValue1}, ${guess.guessValue2}, ${guess.guessValue3}`}</td>
                                        <td>{guess.matchesRule ? "TRUE" : "FALSE"}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
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
                        <div className="speech-bubble-tail"></div>
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
                    <button
                        className="responsive-button continue-button"
                        onClick={handleContinue}
                    >
                        Continue
                    </button>
                    <br />
                </div>
            </div>
        </div>
    );
}

export default function Review() {
    return (
        // Suspense fallback for loading state
        <Suspense fallback={
            <div>
                <h2>
                    Loading...
                </h2>
            </div>
        }>
            {/* Actual content */}
            <ReviewContent />
        </Suspense>
    );
}
