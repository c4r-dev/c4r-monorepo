const logger = require('../../../../../packages/logging/logger.js');
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import HintsScrollingBox from "./hintsScrollingBox";

export default function ClinicalTrialB() {

    const [isVisible, setIsVisible] = useState(false);

    const toggleVisibility = () => {
        setIsVisible(!isVisible)
    };

    const printRef = useRef();
    const handlePrint = () => {
        const input = printRef.current;
        html2canvas(input)
            .then(canvas => {
                const imgData = canvas.toDataURL('image/png');
                const pdf = new jsPDF();
                pdf.addImage(imgData, 'PNG', 0, 0);
                pdf.save('download.pdf');
            })
            .catch(error => {
                logger.app.error('Error generating PDF:', error);
            });
    };

    const navigate = useNavigate();
    const submitContinueClick = () => {
        navigate("/clinicalTrialC")
    }

    return (

        <>
            <div className="ctbackground">
                <div ref={printRef} style={{ padding: '10px', border: '1px solid #000' }}>
                    <div className="boxes">
                        <div className="slim-box blue">
                            <div>
                                <h1 className="textLeft">RIGOR FILES</h1>
                            </div>
                            <div>
                                <h2>BEHAVIORAL STUDY ON SLEEP PATTERNS (DISCUSSION)</h2>
                            </div>
                            <h3>A psychology research team is investigating the impact of blue light exposure on sleep quality. Participants are exposed to different light conditions before bedtime.</h3>
                            <div><h3>STUDY TEAM</h3></div>
                            <div>Lead Researcher: Dr. Alex Ramirez</div>
                            <div>Graduate Research Assistants: Maria Humboldt and James Chen</div>
                            <div><h3>DATA ACCUMULATION</h3></div>
                            <div>Sleep logs (bedtime, wake time, sleep duration).</div>
                            <div>Actigraphy (wrist-worn devices tracking movement).</div>
                            <div>Melatonin levels (saliva samples).</div>
                            <div><h3>PARTICIPANTS</h3></div>
                            <div>100 healthy adults (ages 18-35) recruited from the university community.</div>
                            <div>Randomly assigned to one of three exposure groups: blue light, red light, or no light (control).</div>
                            <div><h3>ENVIRONMENTAL CONDITIONS</h3></div>
                            <div>Participants’ homes (naturalistic setting).</div>
                            <div>Controlled light exposure in a dark room.</div>
                            <div>Compliance with ethical guidelines for human research.</div>
                        </div>
                        <div className="big-box blue">
                            <div>
                                <h2>CAPTURE IDEAS AND QUESTIONS</h2>
                            </div>
                            <h3>Interrogate the experiment: In this activity, identify all the ways the experiment could become unmasked.</h3>
                            <h3>Note your thoughts and any targeted questions you might ask about the study to help discover risk points in
                                the space provided for your group.
                            </h3>
                            <div className="text-box-container">
                                <textarea className="text-box" placeholder="Note your thoughts and any targeted questions."></textarea>
                            </div>
                            <h3>Here are some hints available if you prefer to see models of types of
                                questions that are useful when thinking about pitfalls in studies that
                                might lead to accidental unmasking of experiments.
                                <br></br>
                            </h3>
                            <button onClick={toggleVisibility}>
                                {isVisible ? 'HIDE ' : 'SHOW '} HINTS
                            </button>
                            {isVisible && (
                                <div>
                                    <HintsScrollingBox />
                                </div>
                            )}
                            <br></br><br></br>
                            <div> <button onClick={handlePrint}>Print to PDF</button></div>
                            <br></br>
                            <div> <button onClick={submitContinueClick}>REFERENCE TOOL</button></div>
                        </div>
                    </div>
                </div>
            </div>
        </>
    )
}