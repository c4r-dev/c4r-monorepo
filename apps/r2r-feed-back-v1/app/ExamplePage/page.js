const logger = require('../../../../packages/logging/logger.js');
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import PartyRavens from "@/assets/party-ravens.svg";
import Raven1 from "@/assets/feedback-button-text-1.svg";
import Raven2 from "@/assets/feedback-button-text-2.svg";
import Raven3 from "@/assets/feedback-button-text-3.svg";

import localFont from "next/font/local";
const myFont = localFont({ src: "../GeneralSans-Semibold.ttf" });

import "./examplePage.css";

export default function FeedBack() {
    const router = useRouter();

    const [answerQ1, setAnswerq1] = useState("");
    const [fbtool, setFBTool] = useState("No Selection");

    const onValueChange = (event) => {
        setFBTool(event.target.value);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        if (!answerQ1 && !fbtool) {
            alert("Selection or Answer is required to Submit.");
            return;
        }

        try {
            const res = await fetch("/api/studentInput", {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify({ answerQ1, fbtool }),
            });

            if (res.ok) {
                // Clear the input fields
                setAnswerq1("");
                setFBTool("");
                logger.app.info("Answer submitted successfully");
                // router.push("/closeWindow");  
            } else {
                logger.app.info("Failed to create an answer.");
                alert("There was an error submitting your feedback. Please try again.");
                throw new Error("Failed to create an answer.");
            }
        } catch (error) {
            logger.app.info(error);
        }
    };

    return (
        <div>
            <form
                onSubmit={handleSubmit}
                className="outer-container flex flex-col gap-3"
                style={{ backgroundColor: "#FFFFFF" }}
            >
                <div className="page-header">
                    <h1 className={myFont.className}>Suplementary Materials</h1>
                </div>
                <div className="sub-header">
                    <h1 className={myFont.className}>Great job!</h1>
                    <h1 className={myFont.className}>
                        You have finished the Unit
                    </h1>
                    <div>
                        <Image
                            priority
                            src={PartyRavens}
                            alt="Follow us at c4r.io"
                        />
                    </div>
                </div>
                <div className="section">
                    <div className="section-title">
                        <p className={myFont.className}>Feedback</p>
                    </div>
                    <div className="section-content">
                            <p className={myFont.className} >Your feedback helps us to improve this and other
                            units. Please use the tool below to share your
                            thoughts.</p>
                        <div className="flex-container widget-container">
                            <p className={myFont.className + " widget-header"}>How was your experience?</p>
                        <div className="widget-input">
                        <input
                                type="radio"
                                name="fbtoolanswer"
                                id="fbtoolns"
                                value={"Not Sure"}
                                checked={fbtool === "Not Sure"}
                                onChange={onValueChange}
                            />
                            <label htmlFor="fbtoolns">
                                <Image
                                    priority
                                    src={Raven1}
                                    alt="Follow us at c4r.io"
                                />
                            </label>

                            <input
                                type="radio"
                                name="fbtoolanswer"
                                id="fbtoolgd"
                                value={"Good"}
                                checked={fbtool === "Good"}
                                onChange={onValueChange}
                            />
                            <label htmlFor="fbtoolgd">
                                <Image
                                    priority
                                    src={Raven2}
                                    alt="Follow us at c4r.io"
                                />
                            </label>

                            <input
                                type="radio"
                                name="fbtoolanswer"
                                id="fbtoolgr"
                                value={"Great"}
                                checked={fbtool === "Great"}
                                onChange={onValueChange}
                            />
                            <label htmlFor="fbtoolgr">
                                <Image
                                    priority
                                    src={Raven3}
                                    alt="Follow us at c4r.io"
                                />
                            </label>
                        </div>

                        </div>

                        <div>
                           <p className={myFont.className}>Tell us how this Unit could improve:</p>
                        </div>
                        <div className="flex-container2">
                            <textarea
                                onChange={(e) => setAnswerq1(e.target.value)}
                                value={answerQ1}
                                type="text"
                                placeholder="My experience was..."
                                className="widget-text-input"
                            />
                            <br></br>
                            <button type="submit">submit</button>
                        </div>
                    </div>
                </div>

                {/* Temporarily hidden until we have confirmation on lower content */}
                {/* <div>
                    <br></br>
                </div>

                <div>
                    <br></br>
                </div>

                <div>
                    <h2>Tool Repository</h2>
                </div>
                <div>
                    <p>
                        We have collected a list of all sorts of rigor and
                        reproducitibilty related tools along with links to
                        relevant landing pages, notes as to whether a given tool
                        is free and open source, and the specific part of the
                        research process for which they might prove most useful.
                        We even provide you with quick 10 minutes exercises
                        designed to give you an idea of how you make appropriate
                        use of each tool! Check them out and spread the word, or
                        submit tools we missed!
                    </p>
                </div>
                <div>
                    <h2>Community Index</h2>
                </div>
                <div>
                    <p>
                        This is an index of various communities that serve to
                        highlight tools, disseminate news, facilitate connection
                        and guidance, and nurture the next generation of rigor
                        champions - so be sure to join the discussion and do
                        your part for rigor!
                    </p>
                </div>
                <div>
                    <h2>Champions Directory</h2>
                </div>
                <div>
                    <p>
                        In order to ensure that the rigor community remains
                        connected, self identifying rigor champions are welcome
                        to register with us to be listed in this directory and
                        indicate their career stage, area of expertise, and
                        openness to contract.
                    </p>
                </div> */}
            </form>
        </div>
    );
}
