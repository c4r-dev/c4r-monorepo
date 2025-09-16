"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import Raven1 from "../assets/feedback-button-1.svg";
import Raven2 from "../assets/feedback-button-2.svg";
import Raven3 from "../assets/feedback-button-3.svg";

export default function TopicSelection() {
    const router = useRouter();

    const [rqtool, setRQTool] = useState("");

    const onValueChange = (event) => {
        setRQTool(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!rqtool) {
            alert("Selection is required to Continue.");
            return;
        }

        router.push(`/startRaven?rqtool=${rqtool}`);
        // router.push(`/topicSelection?rqtool=${rqtool}`);

    };

    return (
        <div className="topic-selection-container">
            <div className="activity-header">
                <h1>Formulating a Valid Research Question</h1>
            </div>

            <form onSubmit={handleSubmit} className="flex flex-col gap-3">


            <div className="flex-container">
                <input
                    type="radio"
                    name="rqtoolanswer"
                    id="rqtoolbs"
                    value={"bs"}
                    checked={rqtool === "bs"}
                    onChange={onValueChange}
                    className="topic-radio-input"
                />
                <label htmlFor="rqtoolbs">
                    <div
                        className={`topic-square basic-science-square ${
                            rqtool === "bs" ? "selected-style" : ""
                        }`}
                    >
                        Basic Science
                    </div>
                </label>

                <input
                    type="radio"
                    name="rqtoolanswer"
                    id="rqtoolcs"
                    value={"cs"}
                    checked={rqtool === "cs"}
                    onChange={onValueChange}
                    className="topic-radio-input"
                />
                <label htmlFor="rqtoolcs">
                    <div
                        className={`topic-square clinical-science-square ${
                            rqtool === "cs" ? "selected-style" : ""
                        }`}
                    >
                        Clinical Science
                    </div>
                </label>

                <input
                    type="radio"
                    name="rqtoolanswer"
                    id="rqtoolph"
                    value={"ph"}
                    checked={rqtool === "ph"}
                    onChange={onValueChange}
                    className="topic-radio-input"
                />
                <label htmlFor="rqtoolph">
                    <div
                        className={`topic-square public-health-square ${
                            rqtool === "ph" ? "selected-style" : ""
                        }`}
                    >
                        Public Health
                    </div>
                </label>
            </div>

            <div className="select-topic-button">
                <button type="submit">CONTINUE</button>
            </div>
        </form>
        </div>
        
    );
}
