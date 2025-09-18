const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import { useState, Suspense, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import jsPDF from "jspdf";

// Custom instruction modal just for this activity
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";
import Header from "@/app/components/Header/Header";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./review.css";

const NotesColumn = ({ userInputs, onInputChange }) => {
    const topics = ["STUDY TEAM", "PARTICIPANTS", "DATA ACCUMULATION", "ENVIRONMENTAL CONDITIONS"];

    return (
        <>
            <div className="yellow-notes-header">
                <h2>Advice for the Study Team</h2>
                <p>
                    For each area, provide specific recommendations to help ensure the mask won&apos;t fail.
                </p>
            </div>
            {topics.map((topic, index) => (
                <div className="notes-item" key={index}>
                    <h2>{topic}</h2>
                    <textarea
                        className="notes-textarea"
                        placeholder={`Enter your advice about ${topic.toLowerCase()}...`}
                        value={userInputs[topic] || ''}
                        onChange={(e) => onInputChange(topic, e.target.value)}
                        rows={4}
                    />
                </div>
            ))}
        </>
    );
}

const SubmissionsColumn = ({ submissions }) => {
    const formatSubmissionText = (text) => {
        // Split the text by newlines and filter out empty lines
        const lines = text.split('\n').filter(line => line.trim());
        
        if (lines.length === 0) return null;
        
        return lines.map((line, index) => (
            <div key={index} className="submission-line">
                <span className="bullet">•</span>
                <span>{line.trim()}</span>
            </div>
        ));
    };

    return (
        <div className="submissions-container">
            <div className="yellow-notes-header">
                <h2>Previous Submissions</h2>
                <p>Here are all the submissions from your session</p>
            </div>
            {[...submissions]
                .reverse() // Reverse the array to show most recent first
                .filter(submission => submission.userInputtedString && submission.userInputtedString.trim())
                .map((submission, index) => {
                    const formattedContent = formatSubmissionText(submission.userInputtedString);
                    return formattedContent ? (
                        <div key={index} className="submission-item">
                            {formattedContent}
                        </div>
                    ) : null;
                })}
        </div>
    );
};

const ReviewPage = () => {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [submissionHistory, setSubmissionHistory] = useState([]);
    const [notesInputs, setNotesInputs] = useState({});
    const router = useRouter();
    const searchParams = useSearchParams();
    const sessionID = searchParams.get('sessionID');

    useEffect(() => {
        const fetchRigorFiles = async () => {
            try {
                const response = await fetch(`/api/rigorFilesApi?sessionID=${sessionID}`);
                const data = await response.json();
                setSubmissionHistory(data.userInputs || []);
            } catch (error) {
                logger.app.error("Failed to fetch Rigor Files:", error);
            }
        };

        if (sessionID) {
            fetchRigorFiles();
        }
    }, [sessionID]);

    const handleNotesInputChange = (topic, value) => {
        setNotesInputs(prev => ({
            ...prev,
            [topic]: value
        }));
    };

    const handleSubmitAdvice = async () => {
        try {
            const response = await fetch('/api/rigorFilesAdviceApi', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    sessionID,
                    advice1: notesInputs['STUDY TEAM'] || '',
                    advice2: notesInputs['PARTICIPANTS'] || '',
                    advice3: notesInputs['DATA ACCUMULATION'] || '',
                    advice4: notesInputs['ENVIRONMENTAL CONDITIONS'] || ''
                })
            });

            if (response.ok) {
                router.push(`/pages/advice?sessionID=${sessionID}`);
            } else {
                logger.app.error("Failed to submit advice");
            }
        } catch (error) {
            logger.app.error("Error submitting advice:", error);
        }
    };

    return (
        <div className="full-page">
            <Header title="How might the mask fail?" />
            <RigorFilesModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
            />
            <div className="yellow-notes-header" style={{ margin: '1rem', padding: '0.8rem', width: 'max-content', fontWeight: 700 }}>
                <p>
                    Use your notes to give advice to the study team. How could they ensure their mask won&apos;t fail in each of the following areas?
                </p>
            </div>
            <div className="review-page-content">
                <div className="submissions-column">
                    <SubmissionsColumn submissions={submissionHistory} />
                </div>
                <div className="notes-container">
                    <NotesColumn 
                        userInputs={notesInputs} 
                        onInputChange={handleNotesInputChange}
                    />
                </div>
            </div>
            <div className="button-container">
                <CustomButton 
                    variant="primary"
                    onClick={handleSubmitAdvice}
                    customStyles={{
                        position: 'fixed',
                        bottom: '6rem',
                        right: '2.5rem',
                        zIndex: 1000,
                    }}
                >
                    Submit Advice
                </CustomButton>
                <CustomButton 
                    variant="primary"
                    onClick={() => router.push('/pages/checklist')}
                    customStyles={{
                        position: 'fixed',
                        bottom: '2rem',
                        right: '2rem',
                        zIndex: 1000,
                        marginLeft: 'auto',
                    }}
                >
                    Go to Checklist
                </CustomButton>
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

