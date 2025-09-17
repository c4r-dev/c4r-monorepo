"use client";

/*
This is a demo page for the OpenAI API.

This page will show multiple examples of using the OpenAI API.

*/

import "./demo.css";
import { useState, useEffect, useRef } from "react";

import ChatDemo from "../components/chatDemo/ChatDemo";
import OngoingChat from "../components/ongoingChat/OngoingChat";
import AlliterationChat from "../components/alliterationChat/AlliterationChat";
import SentenceComplete from "../components/sentenceComplete/SentenceComplete";

export default function Demo() {


    return (
        <div className="demo-page">
            {/* Title area */}
    

            <h1>Open AI API Demo</h1>

            <div className="demo-page-content">
                <div className="demo-area">
                    <h2>Chat Demos</h2>
                    <p>This page serves as a workspace for testing various openAI api integrations.</p>
                    <div className="demo-area-item">
                        <h2>Single-Use Chat</h2>
                        <p>Basic chat demo that uses the OpenAI API to generate a response to a user&apos;s message. It does not retain any chat history.</p>
                        <ChatDemo />
                    </div>

                    <div className="demo-area-item">
                        <h2>Ongoing Chat</h2>
                        <p>This is a chat demo that maintains awareness of the chat history.</p>
                        <OngoingChat/>
                    </div>

                    <div className="demo-area-item">
                        <h2>Alliteration Bot</h2>
                        <p>This bot will rewrite any sentence with as much alliteration as possible.</p>
                        <AlliterationChat/>
                    </div> 

                    <div className="demo-area-item">
                        <h2>Sentence Complete</h2>
                        <p>This model will complete a sentence or phrase upon detection of &quot;...&quot;.</p>
                        <SentenceComplete/>
                    </div> 
                </div>                

            </div>


        </div>
    );
}
