const logger = require('../../../../packages/logging/logger.js');
"use client";

import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import DagUtility from "../components/DagUtility";
import DagDesigner from "../DagDesigner/DagDesigner";

import "./phase1.css";

import DagImage from "../assets2/dag-image-1.png";
import ImplausibleIcon from "../assets2/implausible-btn.svg";
import PlausibleIcon from "../assets2/plausible-btn.svg";


import Logo from '../assets2/logo-sideways.svg';
import RavenIceCream from '../assets2/raven-ice-cream.svg';

// import Raven1 from '../assets/feedback-button-1.svg';

// export default function ResQuesThree() {


const PhaseOneComponent = () => {

    const [selectedPlausibility, setSelectedPlausibility] = useState(null);

    const handlePlausibilityChange = (plausibility) => {
        setSelectedPlausibility(plausibility);
    };

    const searchParams = useSearchParams();
    const labGroupId = searchParams.get("labGroupId");
    logger.app.info("labGroupId", labGroupId);

    const handleSubmit = () => {
        // Alert if no selection
        if (!selectedPlausibility) {
            alert("Please select a plausibility");
            return;
        } else if (selectedPlausibility === "plausible") {
            // TODO: Submit to server
            // router.push(`/drawDag1?plausibility=plausible`);
            if (labGroupId) {
                router.push(
                    `/drawDag1?plausibility=plausible&labGroupId=${labGroupId}`
                );
            } else {
                router.push(`/drawDag1?plausibility=plausible`);
            }
        } else if (selectedPlausibility === "implausible") {
            // TODO: Submit to server
            // router.push(`/drawDag1?plausibility=implausible`);
            if (labGroupId) {
                router.push(
                    `/drawDag1?plausibility=implausible&labGroupId=${labGroupId}`
                );
            } else {
                router.push(`/drawDag1?plausibility=implausible`);
            }
        }

        logger.app.info("selectedPlausibility", selectedPlausibility);
    };

    // const searchParams = useSearchParams()
    // const labGroupId = searchParams.get('labGroupId')
    // logger.app.info('labGroupId', labGroupId);

    const router = useRouter();

    const loadReviewPage = (labGroupId) => {
        // router.push('/review');

        if (labGroupId) {
            logger.app.info("with labGroupId", labGroupId);
            router.push(`/review?labGroupId=${labGroupId}`);
        } else {
            logger.app.info("without labGroupId", labGroupId);
            router.push("/review");
        }

        // router.push('/review');
    };

    return (
            <div className="draw-dag-container">
                <div className="activity-header">
                    <Image src={Logo} alt="Logo" className="logo-sideways" />
                    <h1>Did Ice Cream Cause Polio?</h1>
                 </div>
                {/* <h2>
                    The video conjectured a causal link from ice cream
                    consumption to polio
                </h2> */}

                <div className="page-body">
                <div className="draw-dag-instructions">
                    <h2>Now try your hand at solving this case study!</h2>

                <p>
                    Using the directed acyclic graph (DAG) method you just learned, try to draw a diagram of the situation in San Francisco, thereby:
                </p>
                    <ul>
                        <li>Showing the variables involved;</li>
                        <li>Direction and dependencies;</li>
                        <li>As well as potential confounders and maybe missing variables</li>
                    </ul>
                    {/* <h2>The video conjectured a causal link from ice cream consumption to polio</h2> */}
                    {/* <p>Remove text below DAG except for "The relationship between ice cream and polio could be real, or it could be a correlation. Do you think a direct relationship is plausible or implausible?"</p> */}
                </div>

                <div className="top-raven-image"></div>

                {/* Example DAG image */}
                <div className="dag-image-container">
                    <Image
                        src={DagImage}
                        className="dag-image"
                        alt="DAG Image"
                    />
                </div>

                {/* Raven instructions */}
                <div className="raven-instructions">
                    {/* <h2>Raven Instructions</h2> */}
                    {/* TODO: Add Raven instructions styling */}
                    <p>
                        {/* Polio cases and ice cream consumption both increased in the summertime. They could be directly related, or there might be other variables involved. */}
                    </p>
                </div>

                {/* Question container */}
                <div className="question-container">
                    <h2>What does the above DAG seem to show?</h2>
                    <p>
                        The relationship between ice cream and polio could be
                        real, or it could be a correlation. Do you think a
                        direct relationship is plausible or implausible?
                    </p>
                </div>

                {/* Selection form */}
                <div className="selection-form">
                    {/* Two selectable buttons. */}
                    <div className="btn-container">
                        <button
                            className={`selection-btn ${
                                selectedPlausibility === "plausible"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                handlePlausibilityChange("plausible")
                            }
                        >
                            <Image
                                src={PlausibleIcon}
                                className="selection-btn-icon"
                                alt="Plausible Icon"
                            />
                        </button>
                        <button
                            className={`selection-btn ${
                                selectedPlausibility === "implausible"
                                    ? "selected"
                                    : ""
                            }`}
                            onClick={() =>
                                handlePlausibilityChange("implausible")
                            }
                        >
                            <Image
                                src={ImplausibleIcon}
                                className="selection-btn-icon"
                                alt="Implausible Icon"
                            />
                        </button>
                    </div>
                    <div className="submit-btn-container">
                        <button
                            onClick={handleSubmit}
                            className="dark-button submit-btn"
                        >
                            Continue
                        </button>
                    </div>
                </div>

                {/* <div className="designer-container">
                <Suspense fallback={<div>Loading...</div>}>
                    <DagDesigner loadReviewPage={loadReviewPage} />
                </Suspense>
            </div>     */}
                {/* <div>
                <button>Submit Response</button>
            </div> */}
                </div>


            </div>
    );
}


export default function PhaseOne() {

    return (
        <Suspense fallback={<div>Loading...</div>}>
            <PhaseOneComponent />
        </Suspense>
    );
}

// export const dynamic = 'force-dynamic';
