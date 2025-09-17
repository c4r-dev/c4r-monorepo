"use client";

import { useState } from "react";

// Custom instruction modal just for this activity
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";
import Header from "@/app/components/Header/Header";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./input.css";
import HintGenerator from "@/app/activityComponents/HintGenerator/HintGenerator";

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

// Input Rows containing info area, input area, and hint area
/*
    infoElements: html elements to be displayed in the info area
    inputPlaceholder: string, the placeholder text for the input area
    hintContent: string, the content of the hint area

    Info area:
        - White box with rounded corners
        - max width
        - Title: "How might the mask fail?"
        - Content: infoElements
    Input area:
        - Placeholder: inputPlaceholder
    Hint area:
        - Content: hintContent


    Notes: 
    - InputRows should display as a column of the 3 sections when in mobile view
    - InputRows should display as a row of the 3 sections when in desktop view
*/
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



export default function Activity() {
    const [sessionID, setSessionID] = useState(Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15));
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [userInputs, setUserInputs] = useState({
        input1: '',
        input2: '',
        input3: '',
        input4: ''
    });
    const router = useRouter();

    console.log(sessionID);

    const closeModal = () => {
        setIsModalOpen(false);
    }


    const handleInputChange = (index, value) => {
        setUserInputs(prevState => ({
            ...prevState,
            [`input${index}`]: value
        }));
    };

    function openReviewPage() {
        router.push(`/pages/review?sessionID=${sessionID}`);
    }

    const handleSubmit = async () => {
        const inputs = [
            { topicName: "study team", userInputtedString: userInputs.input1 },
            { topicName: "participants", userInputtedString: userInputs.input2 },
            { topicName: "data accumulation", userInputtedString: userInputs.input3 },
            { topicName: "environmental conditions", userInputtedString: userInputs.input4 }
        ];

        try {
            const response = await fetch('/api/rigorFilesApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ sessionID, userInputs: inputs })
            });

            if (response.ok) {
                console.log("Rigor Files Submitted");
                openReviewPage();
            } else {
                console.error("Failed to submit Rigor Files");
            }
        } catch (error) {
            console.error("Error submitting Rigor Files:", error);
        }
    };

    // Info elements for the input rows to be passed in as props
    const infoElements1 = [
        <h2 key="1">STUDY TEAM</h2>,
        <ul key="2" style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            <li>Lead Researcher: Dr. Alex Ramirez</li>
            <li>Graduate Research Assistants: Maria Humboldt and James Chen</li>
        </ul>,
    ];

    const infoElements2 = [
        <h2 key="1">PARTICIPANTS</h2>,
        <ul key="2" style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            <li>100 healthy adults (ages 18-35) recruited from the university community.</li>
            <li>Randomly assigned to one of three groups: blue light exposure, red light exposure, or no light exposure (control).</li>
        </ul>,
    ];

    const infoElements3 = [
        <h2 key="1">DATA ACCUMULATION</h2>,
        <ul key="2" style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            <li>Blood pressure measurements (systolic and diastolic) at baseline, weekly intervals, and study endpoint</li>
            <li>Adverse events reporting</li>
            <li>Laboratory tests (e.g., kidney function, liver function, etc.)</li>
        </ul>,
    ];

    const infoElements4 = [
        <h2 key="1">ENVIRONMENTAL CONDITIONS</h2>,
        <ul key="2" style={{ listStyleType: "disc", paddingLeft: "20px" }}>
            <li>
                Clinical research center with controlled temperature, humidity, and lighting.
            </li>
            <li>Standardized examination rooms.</li>
            <li>
                Compliance with Good Clinical Practice (GCP) guidelines.
            </li>
        </ul>,
    ];

    return (
        <div className="full-page">
            <Header title="How might the mask fail?" />
            <RigorFilesModal
                isOpen={isModalOpen}
                closeModal={closeModal}
            />
            <div className="input-page-content">
                <YellowHeaderRow />
                <InputRow
                    infoElements={infoElements1}
                    inputPlaceholder="Study team..."
                    hintContent="Default"
                    onChange={(value) => handleInputChange(1, value)}
                />
                <InputRow
                    infoElements={infoElements2}
                    inputPlaceholder="Participants..."
                    hintContent="Default"
                    onChange={(value) => handleInputChange(2, value)}
                />
                <InputRow
                    infoElements={infoElements3}
                    inputPlaceholder="Data accumulation..."
                    hintContent="Default"
                    onChange={(value) => handleInputChange(3, value)}
                />
                <InputRow
                    infoElements={infoElements4}
                    inputPlaceholder="Environmental conditions..."
                    hintContent="Default"
                    onChange={(value) => handleInputChange(4, value)}
                />
                <div className="submit-button-container">
                    <CustomButton variant="primary" onClick={handleSubmit}>Submit</CustomButton>
                </div>
            </div>
        </div>
    );
}
