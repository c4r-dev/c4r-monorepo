const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// import Image from "next/image";
// import DagUtility from "../components/DagUtility";
// import DagDesigner from "../DagDesigner/DagDesigner";
import DagLoader from "@/app/activityComponents/DagLoader/DagLoader";
import DagLoaderModal from "@/app/activityComponents/DagLoaderModal/DagLoaderModal";

import "./review.css";

// import Raven1 from '../assets/feedback-button-1.svg';

// export default function ResQuesThree() {

const DagModal = ({ closeDagModal, flowObject, flowDescription }) => {
    const [flowObjectLoaded, setFlowObjectLoaded] = useState(false);
    useEffect(() => {
        setFlowObjectLoaded(true);
    }, [flowObject]);

    logger.app.info("DagModal open:");
    return (
        <div className="dag-modal-screen">
            <div className="dag-modal-container">
                <div className="dag-modal-close-button-container">
                    <button
                        onClick={closeDagModal}
                        className="dag-modal-close-button"
                    >
                        Collapse
                    </button>
                </div>

                <DagLoaderModal
                    className="dag-loader"
                    flowObject={flowObject}
                    flowObjectLoaded={flowObjectLoaded}
                    closeDagModal={closeDagModal}
                />
            </div>
        </div>
    );
};

export default function LoadDagGroup() {
    const [dagResults, setDagResults] = useState([]);
    const [resultsLoaded, setResultsLoaded] = useState(false);
    const [dagExpanded, setDagExpanded] = useState(false);
    const [dagModalOpen, setDagModalOpen] = useState(false);
    const [dagModalFlowObject, setDagModalFlowObject] = useState(null);
    const [dagModalFlowDescription, setDagModalFlowDescription] =
        useState(null);


    const searchParams = useSearchParams()
    const labGroupId = searchParams.get('sessionID')
    logger.app.info('sessionId from LoadDagGroup', labGroupId);

    // const labGroupId = searchParams.get('labGroupId')
    // logger.app.info('labGroupId from LoadDagGroup', labGroupId);



    // const [flowData, setFlowData] = useState([]);
    const [flowData, setFlowData] = useState([]);
    // const [flowString, setFlowString] = useState(null);
    const [flowObject, setFlowObject] = useState(null);
    const [flowObject2, setFlowObject2] = useState(null);
    const [flowObject3, setFlowObject3] = useState(null);
    const [flowObject4, setFlowObject4] = useState(null);

    const [flowDescription1, setFlowDescription1] = useState("");
    const [flowDescription2, setFlowDescription2] = useState("");
    const [flowDescription3, setFlowDescription3] = useState("");
    const [flowDescription4, setFlowDescription4] = useState("");

    const [numResultsRendered, setNumResultsRendered] = useState(0);


    const [showMore, setShowMore] = useState(false);


    const [dagResultsForLabGroup, setDagResultsForLabGroup] = useState([]);
    const [labGroupFlowObjects, setLabGroupFlowObjects] = useState([]);
    const [labGroupFlowDescriptions, setLabGroupFlowDescriptions] = useState([]);

    const openDagModal = (flowObject, flowDescription) => {
        logger.app.info("openDagModal called with flowObject:", flowObject);
        setDagModalFlowObject(flowObject);
        setDagModalFlowDescription(flowDescription);
        setDagModalOpen(true);
    };
    const closeDagModal = () => {
        setDagModalOpen(false);
        setDagModalFlowObject(null);
        setDagModalFlowDescription(null);
    };

    const showMoreDags = () => {
        setShowMore(true);
    }

    const router = useRouter();
    const openCongratulationsScreen = () => {
        router.push("/pages/congrats");
    }

    useEffect(() => {
        logger.app.info("dagResults from useEffect:", dagResults);

        if (dagResults.length > 0) {
            // Sort the contents of dagResults by the "createdAt" field in descending order
            const sortedDagResults = dagResults.sort(
                (a, b) => new Date(b.createdAt) - new Date(a.createdAt)
            );

            const dagResultsForLabGroup = sortedDagResults.filter(dag => dag.groupId === labGroupId);
            logger.app.info("dagResultsForLabGroup:", dagResultsForLabGroup);

            setDagResultsForLabGroup(dagResultsForLabGroup);

            const labGroupFlows= dagResultsForLabGroup.map(dag => JSON.parse(dag.flow));
            logger.app.info("labGroupFlows:", labGroupFlows);
            setLabGroupFlowObjects(labGroupFlows);

            const labGroupDescriptions = dagResultsForLabGroup.map(dag => dag.description);
            logger.app.info("labGroupDescriptions:", labGroupDescriptions);
            setLabGroupFlowDescriptions(labGroupDescriptions);


            logger.app.info("sortedDagResults:", sortedDagResults);
            logger.app.info(
                "dagResults has non-zero length, setting flowString and resultsLoaded to true"
            );

            // Render the first 4 results, if they exist
            for (let i = 0; i < 4; i++) {

                if (dagResultsForLabGroup[i]) {

                    switch (i) {
                        case 0:
                            setFlowObject(JSON.parse(dagResultsForLabGroup[i].flow));
                            setFlowDescription1(dagResultsForLabGroup[i].description);
                            break;
                        case 1:
                            setFlowObject2(JSON.parse(dagResultsForLabGroup[i].flow));
                            setFlowDescription2(dagResultsForLabGroup[i].description);
                            break;
                        case 2:
                            setFlowObject3(JSON.parse(dagResultsForLabGroup[i].flow));
                            setFlowDescription3(dagResultsForLabGroup[i].description);
                            break;
                        case 3:
                            setFlowObject4(JSON.parse(dagResultsForLabGroup[i].flow));
                            setFlowDescription4(dagResultsForLabGroup[i].description);
                            break;
                        default:
                            break;
                    }
                    setNumResultsRendered(i + 1);
                }
            }

            // setFlowString(dagResults[0].flow);
            setResultsLoaded(true);
        }
    }, [dagResults]);





    useEffect(() => {
        if (!resultsLoaded) {
            const fetchAllDags = async () => {
                try {
                    const response = await fetch("/api/fluDagApi");
                    logger.app.info("response:", response);
                    const result = await response.json();
                    logger.app.info("result:", result);
                    setDagResults(result);
                } catch (error) {
                    logger.app.info("Error loading results: ", error);
                }
            };

            fetchAllDags();
        }
    }, [resultsLoaded]);

    return (
        <div className="dag-results-page">
            {/* {dagModalOpen && dagModalFlowObject && dagModalFlowDescription && <DagModal closeDagModal={closeDagModal} flowObject={dagModalFlowObject} flowDescription={dagModalFlowDescription}/>} */}
            {dagModalOpen && (
                <DagModal
                    closeDagModal={closeDagModal}
                    flowObject={dagModalFlowObject}
                    flowDescription={dagModalFlowDescription}
                />
            )}
            <h1 className="dag-results-page-header">What explains the correlation?</h1>
            <h2 className="dag-results-page-subheader">
                Examine the diagrams you and others created. Could some of the relationships be tested through experiments? 
            </h2>            
            <div className="dag-results-page-container">

                {/* If resultsLoaded is true, render a DagLoader instance */}
                <div className="dag-loader-container">
                    {resultsLoaded && flowObject && (
                        <DagLoader
                            className="dag-loader"
                            flowObject={flowObject}
                            flowDescription={flowDescription1}
                            openDagModal={openDagModal}
                        />
                    )}
                    {resultsLoaded && flowObject2 && (
                        <DagLoader
                            className="dag-loader"
                            flowObject={flowObject2}
                            flowDescription={flowDescription2}
                            openDagModal={openDagModal}
                        />
                    )}
                    {resultsLoaded && flowObject3 && (
                        <DagLoader
                            className="dag-loader"
                            flowObject={flowObject3}
                            flowDescription={flowDescription3}
                            openDagModal={openDagModal}
                        />
                    )}
                    {resultsLoaded && flowObject4 && (
                        <DagLoader
                            className="dag-loader"
                            flowObject={flowObject4}
                            flowDescription={flowDescription4}
                            openDagModal={openDagModal}
                        />
                    )}
                </div>
                {showMore && (
                    <div className="dag-loader-container">
                        {labGroupFlowObjects.slice(4).map((flowObject, index) => (
                            <DagLoader
                                key={index + 4}
                                className="dag-loader"
                                flowObject={flowObject}
                                flowDescription={labGroupFlowDescriptions[index + 4]}
                                openDagModal={openDagModal}
                            />
                        ))}
                    </div>
                )}

                {/* <h2> Results here </h2> */}
                <div className="dag-results-page-footer">
                    <button className="dark-button" onClick={showMoreDags}>Show More DAGs</button>

                    {/* <button className="dark-button" onClick={openCongratulationsScreen}>Finish Activity</button> */}
                </div>
            </div>
            {/* <DagLoader /> */}
        </div>
    );
}

// export const dynamic = 'force-dynamic';
