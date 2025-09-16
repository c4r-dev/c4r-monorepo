"use client";

import React, { useState } from "react";
import "./ongoingChat.css";

const OngoingChat = () => {
    const [model, setModel] = useState("gpt-3.5-turbo");
    const [userMessage, setUserMessage] = useState("");
    const [chatHistory, setChatHistory] = useState([]);
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const updatedChatHistory = [
            ...chatHistory,
            { role: "user", content: userMessage }
        ];

        try {
            const res = await fetch("/api/ongoingChat", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ model, messages: updatedChatHistory }),
            });

            const data = await res.json();
            setChatHistory([...updatedChatHistory, data]);
            setUserMessage("");
        } catch (error) {
            console.error("Error:", error);
            setChatHistory([
                ...updatedChatHistory,
                { role: "assistant", content: "An error occurred while fetching the response." }
            ]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chat-demo-container">
            {/* <h1 className="chat-demo-title">Ongoing Chat</h1> */}
            <div className="chat-history">
                {chatHistory.map((message, index) => (
                    <div key={index} className={`${message.role}-message`}>
                        <strong>{message.role === "user" ? "You:" : "Assistant:"}</strong>
                        <p>{message.content}</p>
                    </div>
                ))}
            </div>
            <form onSubmit={handleSubmit} className="chat-form">
                <label htmlFor="model-select" className="model-select-label">Select Model:</label>
                <select
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
        </div>
    );
};

export default OngoingChat;
