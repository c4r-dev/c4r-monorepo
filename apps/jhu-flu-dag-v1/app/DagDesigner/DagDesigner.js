const logger = require('../../../../packages/logging/logger.js');
import React, { useState, useCallback, Suspense } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    Panel,
    Background,
    MarkerType,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";


import { useSearchParams } from "next/navigation";

// import "@xyflow/react/dist/style.css";
import "./style.css";

import VariableModal from "../components/VariableModal";

import CustomNode from "./CustomNode";


const flowKey = "example-flow";

const getNodeId = () => `randomnode_${+new Date()}`;

// const initialNodes = [
//     { id: "1", data: { label: "Flu virus exposure" }, position: { x: 0, y: 0 }, type: "custom" },
//     { id: "2", data: { label: "Sick with flu" }, position: { x: 250, y: 0 }, type: "custom" },
// ];

const nodeStyle = {
    background: '#A0FF00', // Light green background
    padding: 10,
    borderRadius: 5,
    border: 'none',
    fontSize: 16,
    // fontWeight: 'bold',
    fontFamily: 'GeneralSans-Semibold',
    fontWeight: 'bold',
};

const edgeStyle = {
    stroke: '#000000',
    strokeWidth: 3,
};

const initialNodes = [
    { id: "1", data: { label: "Flu virus exposure" }, position: { x: 0, y: 0 }, style: nodeStyle },
    { id: "2", data: { label: "Sick with flu" }, position: { x: 250, y: 0 }, style: nodeStyle },
];

// const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];
const initialEdges = [];


// const nodeTypes = {
//     default: DefaultNode,
// };

// Smoothstep edge
// const smoothstepEdge = {
//     type: 'smoothstep',
//     markerEnd: arrowMarkerEndStyle,
//     style: { stroke: '#000000', strokeWidth: 2 }  // Black, 2px wide line
// };
// const edgeTypes = {
//     smoothstep: smoothstepEdge,
// };

const SaveRestore = ({loadReviewPage, labGroupId}) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState(null);
    const { setViewport } = useReactFlow();
    const [firstNodeAdded, setFirstNodeAdded] = useState(false);

    logger.app.info("labGroupId from DagDesigner", labGroupId);

    // Variable Modal logic
    const [showVariableModal, setShowVariableModal] = useState(false);

    const openVariableModal = () => {
        setShowVariableModal(true);
    }
    const closeVariableModal = () => {
        setShowVariableModal(false);
    }
    const addVariableFromModal = ( variableName ) => {
        addNodeToCanvas(variableName);
        closeVariableModal();
    }


    const arrowMarkerEndStyle = {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#000000",
    };


    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge({
                    ...params,
                    type: 'smoothstep',  // Use default straight line edge
                    markerEnd: arrowMarkerEndStyle,
                    style: edgeStyle
                }, eds)
            ),
        []
    );
    
    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem(flowKey, JSON.stringify(flow));
        }
        logger.app.info("rfInstance", rfInstance);
        logger.app.info("rfInstance type", typeof rfInstance);
        // convert to array
        const flowArray = Object.values(rfInstance);
        logger.app.info("flowArray", flowArray);
        logger.app.info("flowArray type", typeof flowArray);

        // Flow object
        const flowObject = rfInstance.toObject();
        logger.app.info("flowObject", flowObject);
        logger.app.info("flowObject type", typeof flowObject);

    }, [rfInstance]);


    const onSubmit = useCallback(() => {
        logger.app.info('onSubmit');

        // if (!firstNodeAdded) {
        //     alert("Please add at least one variable to the DAG");
        //     return;
        // }
        // If description is empty, alert the user
        const textAreaText = document.querySelector('.dag-designer-submit-area-text-area').value;
        if (textAreaText === "") {
            alert("Please enter a description");
            return;
        }

        logger.app.info("rfInstance", rfInstance);
        if (rfInstance) {
            const flow = rfInstance.toObject();
            if (flow.nodes.length === 0) {
                alert("Please add at least one variable to the DAG");
                return;
            }

            const flowString = JSON.stringify(flow);
            handleSubmitToApi(flowString);
        }     
        else {
            // TODO: Add error handling
            logger.app.info("No flow instance found");
            alert("No flow instance found");
        }  
    }, [rfInstance]);   


    const handleSubmitToApi = async (flowString) => {
        logger.app.info(flowString);
        const textArea = document.querySelector('.dag-designer-submit-area-text-area');
        const description = textArea.value;
        
        // Prepare payload
        const payload = {
            flow: flowString,
            description: description,
            groupId: labGroupId,
            userName: "John Doe",
            userId: "456",
            // labGroupId: labGroupId,
        }

        // Submit the data to the API
        try {
            const res = await fetch("/api/fluDagApi", {
            method: "POST",
            headers: {
                "Content-type": "application/json",
            },
            body: JSON.stringify(payload),
            });
    
            if (res.ok) {
                logger.app.info("Successfully submitted");
                loadReviewPage(labGroupId);

            } else {
                throw new Error("Response not ok.");
            }
        } catch (error) {
            logger.app.info(error);
        }

        // Handle after submit
    };

 


    const onRestore = useCallback(() => {
        const restoreFlow = async () => {
            const flow = JSON.parse(localStorage.getItem(flowKey));

            if (flow) {
                const { x = 0, y = 0, zoom = 1 } = flow.viewport;
                setNodes(flow.nodes || []);
                setEdges(flow.edges || []);
                setViewport({ x, y, zoom });
            }
        };

        restoreFlow();
    }, [setNodes, setViewport]);

    // TODO: Refactor to place at specific location / in a holding panel first
    // Add node to canvas
    const addNodeToCanvas = useCallback((variableName) => {
        const newNode = {
            id: getNodeId(),
            data: { label: variableName },
            position: {
                x: (Math.random() - 0.5) * 200,
                y: (Math.random() - 0.5) * 200,
            },
            style: nodeStyle,
        };
        setNodes((nds) => nds.concat(newNode));
        // setFirstNodeAdded(true);
    }, [setNodes]);


    const proOptions = { hideAttribution: true };

    return (
        <div className="dag-designer-container">
            {showVariableModal && <VariableModal onClose={closeVariableModal} addVariableFromModal={addVariableFromModal} />}
            <div
                className="react-flow-container"
                style={{
                    width: "600px",
                    height: "400px",
                }}
            >
                <ReactFlow
                    //   style={{
                    //     width: '400px',
                    //     height: '400px',
                    //   }}
                    nodes={nodes}
                    edges={edges}
                    // nodeTypes={nodeTypes}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setRfInstance}
                    fitView
                    fitViewOptions={{ padding: 0.5 }}
                    proOptions={proOptions}
                    // edgeTypes={edgeTypes}
                >
                    <Panel position="bottom-left">
                        <div className="add-variables-container">
                            {/* <p>Add variables to your DAG</p> */}
                            <button onClick={openVariableModal}>+ Add Variable</button>
                        </div>
                        {/* <button onClick={onSave}>save</button> */}
                        {/* <button onClick={onRestore}>restore</button> */}
                    </Panel>
                    <Background color="#FFFFF"/>
                </ReactFlow>
            </div>
            <div className="dag-designer-submit-area">

            <div className="dag-designer-submit-area-instructions">
                    <h2>DAG Drawing Instructions</h2>
                    <p>Drawing instructions:</p>
                    <ul>
                        <li>Add variables: Click &quot;Add Variable&quot; to create a new variable</li>
                        <li>Connect variables: Click and drag between a variable&apos;s outgoing point (bottom) and an incoming point (top) to create a directed line.</li>
                        <li>Remove variables / arrows: You may delete variables or arrows by clicking on them and then pressing the delete or backspace key.</li>
                    </ul>
                    <p>Navigation: </p>
                    <ul>
                        <li>Zoom - You may scroll the mouse (While over the DAG designer) to zoom in and out</li>
                        <li>Pan - Click and drag with you mouse in order to move your view</li>
                    </ul>
                </div>


                <div className="dag-designer-submit-area-instructions">
                    <h2>What does your Dag  show?</h2>
                    <p>What does your Dag show? Describe the variables you added to the DAG. What relationships did you discern? Did you uncover any spurious relationships or confounders?</p>
                </div>

                {/* text area */}
                <textarea className="dag-designer-submit-area-text-area" placeholder="Tell us here...">
                    
                </textarea>

                <div className="dag-designer-submit-button-container">
                    <button className="dag-designer-submit-area-submit-button" onClick={onSubmit}>Submit Response</button>
                </div>
            </div>
        </div>
    );
};

export default function DagDesigner(props) {

    const searchParams = useSearchParams()
    const labGroupId = searchParams.get('labGroupId')
    logger.app.info('labGroupId', labGroupId);
    // props.labGroupId = labGroupId;
    // Add labGroupId to props, despite object not being mutable
    const updatedProps = { ...props, labGroupId: labGroupId };

    return (
        <ReactFlowProvider>
            <SaveRestore {...updatedProps} />
        </ReactFlowProvider>
    );
}
