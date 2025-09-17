"use client";

import { useState } from "react";
import { Slide } from "@mui/material";
import CloseIcon from "@mui/icons-material/Close";
import IconButton from "@mui/material/IconButton";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";

// Activity Page

// Import the popup modal
import RigorFilesModal from "@/app/activityComponents/RigorFilesModal/RigorFilesModal";

import Header from "@/app/components/Header/Header";

import CustomButton from "@/app/components/CustomButton/CustomButton";
import "./activity.css";

// New Component below called inputRow
/*
InputRow component
    - 
*/

const InputRow = () => {
    return (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 0, mb: 0 }}>
            <CustomButton
                onClick={() => {
                    setIsModalOpen(true);
                }}
                variant="tertiary"
            >
                Re-open Modal
            </CustomButton>
        </Box>
    );
};

// Hint content component
const HintContent = ({ category }) => {
    const hintContent = {
        "Study team...":
            "Consider how researchers might inadvertently reveal treatment assignments during interactions.",
        "Participants...":
            "Think about ways participants could determine their group assignment.",
        "Data accumulation...":
            "Consider how data collection procedures might reveal treatment status.",
        "Environmental conditions...":
            "Think about physical cues in the environment that could indicate group assignment.",
    };

    return (
        <Box sx={{ p: 2 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
                Hint for {category}
            </Typography>
            <Typography>{hintContent[category]}</Typography>
        </Box>
    );
};

// Modified TwoColumnGrid to accommodate the hint panel
const TwoColumnGrid = ({ children, showHint }) => (
    <Box
        className="grid-container"
        sx={{
            display: "grid",
            gridTemplateColumns: showHint ? "1fr 1fr 300px" : "1fr 1fr",
            gap: "2rem",
            padding: "2rem",
            maxWidth: showHint ? "1500px" : "1200px",
            margin: "0 auto",
            transition: "max-width 0.3s ease-in-out",
        }}
    >
        {children}
    </Box>
);

// Modified InputSection component
const InputSection = ({ label, onHintClick, isActive }) => (
    <Box
        sx={{
            display: "flex",
            alignItems: "flex-start",
            gap: "1rem",
            marginBottom: "2rem",
        }}
    >
        <Box sx={{ flex: 1 }}>
            <label className="input-label">{label}</label>
            <textarea
                className="input-field"
                rows={4}
                placeholder={`Enter ${label.toLowerCase()}...`}
            />
        </Box>
        <CustomButton
            variant="primary"
            className={`hint-button ${isActive ? "active" : ""}`}
            onClick={() => onHintClick(label)}
        >
            HINT
        </CustomButton>
    </Box>
);

export default function Activity() {
    const [isModalOpen, setIsModalOpen] = useState(true);
    const [showHint, setShowHint] = useState(false);
    const [activeHint, setActiveHint] = useState(null);

    const handleHintClick = (category) => {
        if (activeHint === category) {
            setShowHint(false);
            setActiveHint(null);
        } else {
            setShowHint(true);
            setActiveHint(category);
        }
    };

    return (
        <div className="full-page">
            <Header title="How might the mask fail?" />
            <RigorFilesModal
                isOpen={isModalOpen}
                closeModal={() => setIsModalOpen(false)}
            />

            <TwoColumnGrid showHint={showHint}>
                {/* Left Column - Study Details */}
                <Box className="study-details">
                    <div className="yellow-column-header">
                        <h2>Behavioral Study on Sleep Patterns</h2>
                        <p>
                            A psychology research team is investigating the
                            impact of blue light exposure on sleep quality.
                            Participants are exposed to different light
                            conditions before bedtime.
                        </p>
                    </div>
                    <section>
                        <h2>STUDY TEAM</h2>
                        <ul
                            style={{
                                listStyleType: "disc",
                                paddingLeft: "20px",
                            }}
                        >
                            <li>Lead Researcher: Dr. Alex Ramirez</li>
                            <li>
                                Graduate Research Assistants: Maria Humboldt and
                                James Chen
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h2>PARTICIPANTS</h2>
                        <ul
                            style={{
                                listStyleType: "disc",
                                paddingLeft: "20px",
                            }}
                        >
                            <li>
                                100 healthy adults (ages 18-35) recruited from
                                the university community.
                            </li>
                            <li>
                                Randomly assigned to one of three groups: blue
                                light exposure, red light exposure, or no light
                                exposure (control).
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h2>DATA ACCUMULATION</h2>
                        <ul
                            style={{
                                listStyleType: "disc",
                                paddingLeft: "20px",
                            }}
                        >
                            <li>
                                Blood pressure measurements (systolic and
                                diastolic) at baseline, weekly intervals, and
                                study endpoint
                            </li>
                            <li>Adverse events reporting</li>
                            <li>
                                Laboratory tests (e.g., kidney function, liver
                                enzymes)
                            </li>
                        </ul>
                    </section>
                    <section>
                        <h2>ENVIRONMENTAL CONDITIONS</h2>
                        <ul
                            style={{
                                listStyleType: "disc",
                                paddingLeft: "20px",
                            }}
                        >
                            <li>
                                Clinical research center with controlled
                                temperature, humidity, and lighting.
                            </li>
                            <li>Standardized examination rooms.</li>
                            <li>
                                Compliance with Good Clinical Practice (GCP)
                                guidelines.
                            </li>
                        </ul>
                    </section>
                </Box>

                {/* Middle Column - Input Fields */}
                <Box className="input-sections">
                    <div className="yellow-column-header">
                        <h2>How might the mask fail?</h2>
                        <p>
                            Given what you&apos;ve read, identify ways the
                            experiment could become unmasked in each area.
                        </p>
                    </div>
                    <InputSection
                        label="Study team..."
                        onHintClick={handleHintClick}
                        isActive={activeHint === "Study team..."}
                    />
                    <InputSection
                        label="Participants..."
                        onHintClick={handleHintClick}
                        isActive={activeHint === "Participants..."}
                    />
                    <InputSection
                        label="Data accumulation..."
                        onHintClick={handleHintClick}
                        isActive={activeHint === "Data accumulation..."}
                    />
                    <InputSection
                        label="Environmental conditions..."
                        onHintClick={handleHintClick}
                        isActive={activeHint === "Environmental conditions..."}
                    />

                    <Box
                        sx={{
                            display: "flex",
                            justifyContent: "center",
                            mt: 4,
                        }}
                    >
                        <CustomButton
                            variant="contained"
                            className="submit-button"
                        >
                            SUBMIT
                        </CustomButton>
                    </Box>
                </Box>

                {/* Hint Panel */}
                <Slide
                    direction="left"
                    in={showHint}
                    mountOnEnter
                    unmountOnExit
                >
                    <Box
                        sx={{
                            backgroundColor: "#f5f5f5",
                            borderRadius: "8px",
                            boxShadow: "-2px 0 4px rgba(0,0,0,0.1)",
                            position: "relative",
                            height: "fit-content",
                        }}
                    >
                        <IconButton
                            onClick={() => {
                                setShowHint(false);
                                setActiveHint(null);
                            }}
                            sx={{
                                position: "absolute",
                                right: 8,
                                top: 8,
                            }}
                        >
                            <CloseIcon />
                        </IconButton>
                        {activeHint && <HintContent category={activeHint} />}
                    </Box>
                </Slide>
            </TwoColumnGrid>
        </div>
    );
}
