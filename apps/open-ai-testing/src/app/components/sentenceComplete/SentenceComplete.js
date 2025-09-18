const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import React, { useState, useEffect } from "react";
import "./sentenceComplete.css";

/*
This component is used to test the sentenceComplete api endpoint.
The user will use the text area to write some text. 
Functionality-wise, upon the typing of "..." the component will replace the "..." with the response from the api endpoint, an auto-complete function.

On each keystroke, the component will check for "..." and if found, it will
- disable the text area
- send the current text to the api endpoint
- wait for the response
- upon getting the response, it will replace the "..." in the text area with the response
- enable the text area again
*/

const SentenceComplete = () => {
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [userMessage, setUserMessage] = useState("");
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const checkForEllipsis = async () => {
            if (userMessage.includes("...") && !loading) {
                setLoading(true);
                try {
                    const res = await fetch("/api/sentenceComplete", {
                        method: "POST",
                        headers: {
                            "Content-Type": "application/json",
                        },
                        body: JSON.stringify({ model, userMessage }),
                    });

                    const data = await res.json();
                    const newMessage = userMessage.replace("...", data.content);
                    setUserMessage(newMessage);
                } catch (error) {
                    logger.app.error("Error:", error);
                } finally {
                    setLoading(false);
                }
            }
        };

        checkForEllipsis();
    }, [userMessage, model, loading]);

    return (
        <div className="chat-demo-container">
            <form className="chat-form">
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
                    disabled={loading}
                />
            </form>
        </div>
    );
};

export default SentenceComplete;
