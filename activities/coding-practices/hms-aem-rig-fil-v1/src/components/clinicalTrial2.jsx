const logger = require('../../../../../packages/logging/logger.js');
import React, { useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import html2canvas from 'html2canvas';
import { jsPDF } from 'jspdf';

import HintsScrollingBox from "./hintsScrollingBox";

export default function ClinicalTrial2() {

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
        navigate("/clinicalTrial3")
    }

    return (

        <>
            <div className="ctbackground">
                <div ref={printRef} style={{ padding: '10px', border: '1px solid #000' }}>
                    <div className="boxes">
                        <div className="slim-box yellow">
                            <div>
                                <h1 className="textLeft">RIGOR FILES</h1>
                            </div>
                            <div>
                                <h3>CLINICAL TRIAL FOR A NEW DRUG</h3>
                            </div>
                            <h4>A pharmaceutical company is conducting
                                a phase II clinical trial to evaluate the safety
                                and efficiacy of a novel drug for treating
                                hypertension The drug aims to lower blood
                                pressure without significant side effects.</h4>
                            <div><h3>STUDY TEAM</h3></div>
                            <div>Principal Investigator (PI): Dr. Emily Carter</div>
                            <div>Research Coordinator: Sarah Patel</div>
                            <div>Data Analyst: Dr. Mark Johnson</div>
                            <div><h3>DATA ACCUMULATION</h3></div>
                            <div>Blood pressure measurements (systolic and diastolic) at baselline, weekly intervals, and study endpoint</div>
                            <div>Adverse events reporting</div>
                            <div>Laboratory tests (e.g., kidney function, liver enzymes)</div>
                            <div><h3>PARTICIPANTS</h3></div>
                            <div>500 adult participants (aged 40-65) with diagnosed hypertension.</div>
                            <div>Randomly assigned to either the experimental drug group or a placebo group.</div>
                            <div><h3>ENVIRONMENTAL CONDITIONS</h3></div>
                            <div>Clinical research center with controlled temperature, humidity, and lighting.</div>
                            <div>Standardized examination rooms.</div>
                            <div>Compliance with Good Clinical Practice (GCP) guidelines.</div>
                        </div>
                        <div className="big-box yellow">
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