// components/FeedbackForm.js
'use client'

import React, { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";


import Image from 'next/image';

// import './FeedbackForm.css';

import FeedbackImage1 from "../assets/feedback-button-1.svg";
import FeedbackImage2 from "../assets/feedback-button-2.svg";
import FeedbackImage3 from "../assets/feedback-button-3.svg";


// import Raven1 from '../assets/feedback-button-1.svg';
import Raven1 from '../assets/raven-1-angled.svg';
import IconGroup2 from '../assets/icon-group-3.svg';

import Questions from "../questions/questions.json"



function loadQuestionFromCategory(category) {
    let currentQuestions = [];
    Questions.forEach(question => {
        console.log("Question", question);
        if (question.category === category) {
            currentQuestions.push(question.question);
        }
    }); 
    return currentQuestions;
}


// const questions = [
//     "Evaluate the prevalence of medically resistant focal epilepsy in children at King Fahd University Hospital between January 2017 and December 2018.",
//     "Evaluate the effectiveness of the new teaching method implemented in the school between 2020 and 2021.",
//     "Assess the impact of the new health policy introduced in 2019 on the local population."
// ];

// let currentQuestions = [];
// let feedback = [];

const FeedbackForm = () => {
    const [currentQuestion, setCurrentQuestion] = useState(0);
    // const [feedback, setFeedback] = useState(questions.map(() => ({ rating: '', comment: '' })));
    // const [feedback, setFeedback] = useState([{rating: '', comment: ''}]);
    // console.log("feedback", feedback);
    const [feedback, setFeedback] = useState( [   
        {
        "rating": "",
        "comment": ""
    },
    {
        "rating": "",
        "comment": ""
    },
    {
        "rating": "",
        "comment": ""
    }
    ]);

    const [allResponses, setAllResponses] = useState([]);

    const searchParams = useSearchParams()
    const selected = searchParams.get("selected")
    const category = selected;
    const router = useRouter();
    let currentQuestions = [];

    currentQuestions = loadQuestionFromCategory(category);
    console.log("currentQuestions", currentQuestions);

    // useEffect(() => {
    //     console.log("feedback", feedback);
    // }, [feedback]);

    useEffect(() => {
        console.log("allResponses", allResponses);
        if (allResponses.length === currentQuestions.length) {
            handleReview();
        }
    }, [allResponses]);

    const handleRatingChange = (index, rating) => {
        // setCurrentFeedback(feedback[index].rating)
        const newFeedback = [...feedback];
        newFeedback[index].rating = rating;
        setFeedback(newFeedback);
    };

    const handleCommentChange = (index, comment) => {
        const newFeedback = [...feedback];
        newFeedback[index].comment = comment;
        setFeedback(newFeedback);
    };

    // 
    useEffect(() => {
        console.log("allResponses", allResponses);
        if (allResponses.length === currentQuestions.length) {
            handleReview();
        }
    }, [allResponses]);

    const handleSubmit = async () => {
        console.log(feedback);
        
        // Get the current feedback instance
        const currentFeedback = feedback[currentQuestion]
        console.log(currentFeedback);

        const fbtool = currentFeedback.rating;
        const questionAnswer = currentFeedback.comment;
        const number = currentQuestion+1;


        // Check if current feedback is has rating and comment
        if (currentFeedback.rating === '' || currentFeedback.comment === '') {
            alert("Please fill in all fields to submit.");
            return;
        }

        // Submit the data to the API
        try {
            const res = await fetch("/api/studentInput", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify({ category, number, fbtool, questionAnswer }),
            });
    
            if (res.ok) {
                console.log("Successfully submitted");
                // Create an onbject with currentFeedback's data
                const newResponse = {
                    ...currentFeedback,
                    category,
                    number,
                    questionAnswer
                }
                // Append the current feedback to the allResponses array
                setAllResponses([...allResponses, newResponse]);

            } else {
            throw new Error("Failed to create an answer.");
            }
        } catch (error) {
            console.log(error);
        }

        // If there are more questions, navigate to the next question
        if (currentQuestion < currentQuestions.length - 1) {
            setCurrentQuestion(currentQuestion + 1);
        }
    };

    // Navigate to review screen
    const handleReview = () => {
        // Also push the allResponses to the URL
        router.push(`/summary?selected=${selected}&allResponses=${JSON.stringify(allResponses)}`);
    }


    return (
        <div className="feedback-form">
            <div className="question-navigation">
                {currentQuestions.map((_, index) => (
                    <button
                        key={index}
                        className={(index === currentQuestion ? ' active' : '') }
                        onClick={() => setCurrentQuestion(index)}
                    >
                        Research Question {index + 1}
                    </button>
                ))}
            </div>
            <div className="question-content">
                <h2>{currentQuestions[currentQuestion]}</h2>
                <h2>How would you rate this question?</h2>
                <div className="feedback-options">
                    <label>
                        <input
                            type="radio"
                            name={`rating-${currentQuestion}`}
                            value="good"
                            checked={feedback[currentQuestion].rating === 'good'}
                            onChange={() => handleRatingChange(currentQuestion, 'good')}
                        />
                        <span className="choice">
                            <div className="choice-image-text">
                                Good
                            </div>
                            <Image
                                priority
                                src={FeedbackImage1}
                                alt="Follow us at c4r.io"
                                className="choice-image"
                                // width={100}
                                // height={100}
                            />
                        </span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name={`rating-${currentQuestion}`}
                            value="betterq"
                            checked={feedback[currentQuestion].rating === 'better'}
                            onChange={() => handleRatingChange(currentQuestion, 'better')}
                        />
                        <span className="choice">
                            <div className="choice-image-text">
                                Better
                            </div>
                            <Image
                                priority
                                src={FeedbackImage2}
                                alt="Follow us at c4r.io"
                                className="choice-image"
                            />
                        </span>
                    </label>
                    <label>
                        <input
                            type="radio"
                            name={`rating-${currentQuestion}`}
                            value="great"
                            checked={feedback[currentQuestion].rating === 'great'}
                            onChange={() => handleRatingChange(currentQuestion, 'great')}
                        />
                        <span className="choice">
                            <div className="choice-image-text">
                                Great
                            </div>
                            <Image
                                priority
                                src={FeedbackImage3}
                                alt="Follow us at c4r.io"
                                className="choice-image"
                            />
                        </span>
                    </label>
                </div>
                <h2>What would make this research question better?</h2>
                <textarea
                    placeholder="Tell us here..."
                    value={feedback[currentQuestion].comment}
                    onChange={(e) => handleCommentChange(currentQuestion, e.target.value)}
                />
                <button onClick={handleSubmit} className="submit-feedback-button">Submit Response</button>
            </div>


            <div>
                <Image
                    priority
                    src={Raven1}
                    alt="Follow us at c4r.io"
                    className="raven-footer-1"
                />
            </div>
            <div>
                <Image
                    priority
                    src={IconGroup2}
                    alt="Follow us at c4r.io"
                    className="microscope-footer-2"
                />                
            </div>
        </div>
    );
};

export default FeedbackForm;
