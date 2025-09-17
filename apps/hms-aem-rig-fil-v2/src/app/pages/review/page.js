"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";

// Custom instruction modal just for this activity
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";
import Header from "@/app/components/Header/Header";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./review.css";



const checklistData = [
    {
        section: "1. Introduction",
        items: [
            "Briefly describe your experiment and its purpose.",
            "Identify any sensitive information or variables that need to remain blinded."
        ]
    },
    {
        section: "2. Participant Recruitment and Consent",
        items: [
            "How will you ensure that participants are unaware of the experimental conditions?",
            "Describe your informed consent process and how it maintains blinding."
        ]
    },
    {
        section: "3. Randomization and Allocation",
        items: [
            "How will you randomize participants into different groups or conditions?",
            "How will you randomize participants into different groups or conditions?"
        ]
    },
    {
        section: "4. Data Collection and Measurement",
        items: [
            "Specify who collects data and how they remain blinded.",
            "Detail any precautions to prevent inadvertent unmasking during data collection."
        ]
    },
    {
        section: "5. Data Analysis and Interpretation",
        items: [
            "How will you analyze the data while maintaining blinding?",
            "Consider statistical methods or procedures that minimize unmasking."
        ]
    },
    {
        section: "6. Reporting and Communication",
        items: [
            "Describe how you’ll summarize and present results without revealing group assignments.",
            "Address any challenges related to unmasking during result dissemination."
        ]
    },
    {
        section: "7. Reflection and Self-Check",
        items: [
            "Regularly assess whether blinding procedures are being followed.",
            "Encourage team members to reflect on potential risks of unmasking."
        ]
    }
];

const NotesColumn = ({ userInputs }) => {
    const topics = ["STUDY TEAM", "PARTICIPANTS", "DATA ACCUMULATION", "ENVIRONMENTAL CONDITIONS"];

    const getUserInputForTopic = (topicName) => {
        const input = userInputs.find(input => input.topicName.toUpperCase() === topicName);
        return input ? input.userInputtedString : null;
    };

    return (
        <>
            <div className="yellow-notes-header">
                <h2>Your own notes</h2>
                <p> 
                    You reviewed a study investigating the impact of blue light exposure on sleep quality. 
                    Now, customize a downloadable handout with masking questions specific to your lab!
                </p>
            </div>
            {topics.map((topic, index) => (
                <div className="notes-item" key={index}>
                    <h2>{topic}</h2>
                    <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                        {getUserInputForTopic(topic) ? (
                            getUserInputForTopic(topic).split('\n').map((line, lineIndex) => (
                                <li key={lineIndex}>{line}</li>
                            ))
                        ) : (
                            <li></li>
                        )}
                    </ul>
                </div>
            ))}
        </>
    );
}

const Checklist = () => {
    const [customQuestions, setCustomQuestions] = useState([]);
    const [newQuestion, setNewQuestion] = useState("");
    const [checkedItems, setCheckedItems] = useState({});

    const handleCheckboxChange = (sectionIndex, itemIndex) => {
        setCheckedItems(prevState => ({
            ...prevState,
            [`${sectionIndex}-${itemIndex}`]: !prevState[`${sectionIndex}-${itemIndex}`]
        }));
    };

    const handleAddQuestion = () => {
        if (newQuestion.trim()) {
            setCustomQuestions([...customQuestions, newQuestion]);
            setNewQuestion("");
        }
    };

    const handleDeleteQuestion = (index) => {
        setCustomQuestions(customQuestions.filter((_, i) => i !== index));
    };

    const handleDownloadPDF = () => {
        const doc = new jsPDF();

        // Add title with reduced margin
        doc.setFontSize(16);
        doc.text("Research Checklist", 10, 10); // Reduced x and y offset

        // Add checklist items with reduced spacing
        let yOffset = 20; // Start a bit lower than the title
        checklistData.forEach((section, sectionIndex) => {
            doc.setFontSize(14);
            doc.text(`${section.section}`, 10, yOffset);
            yOffset += 8; // Reduced spacing between section title and items

            section.items.forEach((item, itemIndex) => {
                const isChecked = checkedItems[`${sectionIndex}-${itemIndex}`] ? "X" : " ";
                doc.setFontSize(12);
                doc.text(`- [${isChecked}] ${item}`, 15, yOffset);
                yOffset += 8; // Reduced spacing between items
            });

            yOffset += 4; // Reduced space between sections
        });

        // Add custom questions with reduced spacing
        doc.setFontSize(14);
        doc.text("8. My Questions", 10, yOffset);
        yOffset += 8;

        customQuestions.forEach((question, index) => {
            const isChecked = checkedItems[`custom-${index}`] ? "X" : " ";
            doc.setFontSize(12);
            doc.text(`- [${isChecked}] ${question}`, 15, yOffset);
            yOffset += 8;
        });

        // Save the PDF
        doc.save("research_checklist.pdf");
    };

    return (
        <>
            <h2>Here is a checklist to evaluate your own research.</h2>
            <p>
                These steps will help you check for masking vulnerabilities in your own work. Add more questions at the bottom!
            </p>
            <ol className="checklist-list-items">
                {checklistData.map((section, sectionIndex) => (
                    <li key={sectionIndex}>
                        <h3 className="checklist-section-header">{section.section}</h3>
                        {section.items.map((item, itemIndex) => (
                            <div key={itemIndex}>
                                <label>
                                    <input
                                        type="checkbox"
                                        checked={!!checkedItems[`${sectionIndex}-${itemIndex}`]}
                                        onChange={() => handleCheckboxChange(sectionIndex, itemIndex)}
                                    />
                                    {item}
                                </label>
                            </div>
                        ))}
                    </li>
                ))}
                <li>
                    <h3>8. My Questions</h3>
                    {customQuestions.map((question, index) => (
                        <div key={index} style={{ display: "flex", alignItems: "center" }}>
                            <label style={{ flex: 1 }}>
                                <input
                                    type="checkbox"
                                    checked={!!checkedItems[`custom-${index}`]}
                                    onChange={() => handleCheckboxChange('custom', index)}
                                />
                                {question}
                            </label>
                            <button onClick={() => handleDeleteQuestion(index)}>Delete</button>
                        </div>
                    ))}
                    <textarea
                        value={newQuestion}
                        onChange={(e) => setNewQuestion(e.target.value)}
                        placeholder="Add your question here"
                    />
                </li>
            </ol>
            <div className="checklist-buttons-row">
                <CustomButton variant="primary" onClick={handleDownloadPDF}>Download</CustomButton>
                <CustomButton variant="primary" onClick={handleAddQuestion}>Add Question</CustomButton>
            </div>
        </>
    );
}



const ReviewPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [userInputs, setUserInputs] = useState([]);
    const searchParams = useSearchParams();
    const sessionID = searchParams.get('sessionID');

    useEffect(() => {
        const fetchRigorFiles = async () => {
            try {
                const response = await fetch(`/api/rigorFilesApi?sessionID=${sessionID}`);
                const data = await response.json();
                setUserInputs(data.userInputs || []);
            } catch (error) {
                console.error("Failed to fetch Rigor Files:", error);
            }
        };

        if (sessionID) {
            fetchRigorFiles();
        }
    }, [sessionID]);

    return (
        <div className="full-page">
            <Header title="How might the mask fail?" />
            <RigorFilesModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
            />
            <div className="review-page-content">
                <div className="notes-container">
                    <NotesColumn userInputs={userInputs} />
                </div>
                <div className="checklist-container">
                    <Checklist />
                </div>
            </div>
        </div>
    );
}

export default function ReviewPageWrapper() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <ReviewPage />
        </Suspense>
    );
}

