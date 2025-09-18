const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import React, { useState } from "react";
import "./alliterationChat.css";

const AlliterationChat = () => {
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [userMessage, setUserMessage] = useState("");
    const [response, setResponse] = useState(null);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const res = await fetch("/api/alliterationAi", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model, userMessage }),
            });

            const data = await res.json();
            setResponse(data.content);
        } catch (error) {
            logger.app.error("Error:", error);
            setResponse("An error occurred while fetching the response.");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-demo-container">
            {/* <h1 className="chat-demo-title">Chat Demo</h1> */}
            <form onSubmit={handleSubmit} className="chat-form">
                <label htmlFor="model-select" className="model-select-label">Select Model:</label>
                <select
                    id="model-select"
                    className="model-select"
                    value={model}
                    onChange={(e) => setModel(e.target.value)}
                >
                    <option value="gpt-3.5-turbo">GPT-3.5 Turbo</option>
                    <option value="gpt-4">GPT-4</option>
                </select>
                <textarea
                    className="message-textarea"
                    value={userMessage}
                    onChange={(e) => setUserMessage(e.target.value)}
                    placeholder="Type your message here..."
                    rows={4}
                />
                <button
                    className="submit-button"
                    type="submit"
                    disabled={loading}
                >
                    {loading ? "Sending..." : "Send"}
                </button>
            </form>
            {response && (
                <div className="response-container">
                    <h2 className="response-title">Response:</h2>
                    <p className="response-content">{response}</p>
                </div>
            )}
        </div>
    );
};

export default AlliterationChat;
