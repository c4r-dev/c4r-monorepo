"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";

// Custom instruction modal just for this activity
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";
import Header from "@/app/components/Header/Header";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./input.css";
import HintGenerator from "@/app/activityComponents/HintGenerator/HintGenerator";
import SessionConfigPopup from '@/app/activityComponents/SessionConfigPopup/SessionConfigPopup';

// Routing
import { useRouter } from "next/navigation";

// Yellow Header Row at the top of the page
const YellowHeaderRow = () => {
    return (
        <div className="yellow-header-row">
            <div className="yellow-column-header">
                <h2>Behavioral Study on Sleep Patterns</h2>
                <p>
                    A psychology research team is investigating the
                    impact of blue light exposure on sleep quality.
                    Participants are exposed to different light
                    conditions before bedtime.
                </p>
            </div>
            <div className="yellow-column-header">
                <h2>How might the mask fail?</h2>
                <p>
                    Given what you&apos;ve read, identify ways the
                    experiment could become unmasked in each area.
                </p>
            </div>
            <div className="yellow-column-header-placeholder">
            </div>
        </div>
    );
};


const InputRow = ({ infoElements, inputPlaceholder, hintContent, onChange }) => {
    return (
        <div className="input-row">
            <div className="info-area">
                {infoElements}
            </div>
            <div className="input-area">
                <textarea
                    className="input-area-input"
                    placeholder={inputPlaceholder}
                    onChange={(e) => onChange(e.target.value)}
                />
            </div>
            <div className="hint-area">
                {/* <p>Hint Placeholder</p> TODO: Implement hint functionality */}
                <HintGenerator />
            </div>
        </div>
    );
};


function InputPage() {
    const searchParams = useSearchParams();
    const [sessionID, setSessionID] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInput, setUserInput] = useState('');
    const [showConfigPopup, setShowConfigPopup] = useState(true);
    const router = useRouter();

    useEffect(() => {
        const urlSessionID = searchParams.get('sessionID');
        if (urlSessionID) {
            setSessionID(urlSessionID);
            setShowConfigPopup(false);
        } else {
            setShowConfigPopup(true);
        }
    }, [searchParams]);

    const closeModal = () => {
        setIsModalOpen(false);
    }

    const openModal = () => {
        setIsModalOpen(true);
    }

    const handleInputChange = (value) => {
        setUserInput(value);
    };

    const handleSubmit = async () => {
        try {
            const response = await fetch('/api/rigorFilesApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ 
                    sessionID, 
                    userInputs: {
                        topicName: "combined_input",
                        userInputtedString: userInput 
                    }
                })
            });

            if (response.ok) {
                router.push(`/pages/review?sessionID=${sessionID}`);
            }
        } catch (error) {
            console.error("Error submitting:", error);
        }
    };

    // SessionConfigPopup should only be closeable through buttons that set sessionID
    const handleConfigClose = () => {
        // Only allow closing if a sessionID exists
        if (sessionID) {
            setShowConfigPopup(false);
        }
    }

    return (
        <div className="full-page">
            <Header 
                title="How might the mask fail?" 
                onHelpClick={openModal}
            />
            <RigorFilesModal
                isOpen={isModalOpen}
                closeModal={closeModal}
            />
            <SessionConfigPopup 
                open={showConfigPopup}
                onClose={handleConfigClose}
            />
            <div className="input-page-content">
                <div className="column-container">
                    <div className="yellow-header">
                        <h2>BEHAVIORAL STUDY ON SLEEP PATTERNS</h2>
                        {/* <p>
                            A research team is investigating the impact of blue light exposure on sleep quality. 
                            Participants are exposed to different light conditions before bedtime.
                        </p> */}
                    </div>
                    <div className="info-column">
                        <section>
                            <h3>STUDY DESCRIPTION</h3>
                            <p>
                                A research team is investigating the impact of blue light exposure on sleep quality. 
                                Participants are exposed to different light conditions before bedtime.
                            </p>
                        </section>
                        <section>
                            <h3>STUDY TEAM</h3>
                            <ul>
                                <li>Lead Researcher: Dr. Alex Ramirez</li>
                                <li>Graduate Research Assistants: Maria Humboldt and James Chen</li>
                            </ul>
                        </section>
                        <section>
                            <h3>PARTICIPANTS</h3>
                            <ul>
                                <li>100 healthy adults (ages 18-35) recruited from the university community.</li>
                                <li>Randomly assigned to one of three groups: blue light exposure, red light exposure, or no light exposure (control).</li>
                            </ul>
                        </section>
                        <section>
                            <h3>DATA ACCUMULATION</h3>
                            <ul>
                                <li>Handwritten sleep logs (self-reported bedtime, sleeping location, quality of sleep, wake time, sleep duration).</li>
                                <li>Actigraphy (wrist-worn devices tracking movement during sleep).</li>
                                <li>Melatonin levels (saliva samples).</li>
                            </ul>
                        </section>
                        <section>
                            <h3>ENVIRONMENTAL CONDITIONS</h3>
                            <ul>
                                <li>Participants&apos; homes (naturalistic setting).</li>
                                <li>Controlled light exposure in a dark room.</li>
                                <li>Compliance with ethical guidelines for human research.</li>
                            </ul>
                        </section>
                    </div>
                </div>
                
                <div className="input-hint-container">
                    <div className="column-container input-column-container">
                        <div className="yellow-header">
                            <h2>YOUR OBSERVATIONS</h2>
                        </div>
                        <div className="input-column">
                            <textarea
                                className="input-area-main"
                                placeholder="Enter your observations about potential masking failures..."
                                onChange={(e) => handleInputChange(e.target.value)}
                                value={userInput}
                            />
                        </div>
                    </div>

                    <div className="column-container hint-column-container">
                        <div className="yellow-header invisible-header">
                            <h2>HINT GENERATOR</h2>
                        </div>
                        <div className="hint-column">
                            <HintGenerator />
                        </div>
                    </div>
                </div>

                <div className="submit-button-row">
                    <CustomButton variant="primary" onClick={handleSubmit}>Submit</CustomButton>
                </div>
            </div>
        </div>
    );
}

export default function InputPageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <InputPage />
        </Suspense>
    );
}

