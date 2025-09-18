const logger = require('../../../../../../packages/logging/logger.js');
import React, { useState, useCallback } from "react";
import {
    ReactFlow,
    ReactFlowProvider,
    useNodesState,
    useEdgesState,
    addEdge,
    useReactFlow,
    Panel,
    Background,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";

import VariableModal from "@/app/activityComponents/VariableModal/VariableModal";

const flowKey = "example-flow";

const getNodeId = () => `randomnode_${+new Date()}`;

// const initialNodes = [
//     { id: "1", data: { label: "Node 1" }, position: { x: 0, y: -50 } },
//     { id: "2", data: { label: "Node 2" }, position: { x: 0, y: 50 } },
// ];

// const initialEdges = [{ id: "e1-2", source: "1", target: "2" }];

const SaveRestore = ({flowObject}) => {

    logger.app.info("flowObject", flowObject);

    // get the width and height of the parent container
    // const containerWidth = document.querySelector('.dag-designer-container');
    // const containerHeight = document.querySelector('.dag-designer-container');

    // const getContainerWidth = () => {
    //     const containerWidth = document.querySelector('.dag-designer-container');
    //     return containerWidth.clientWidth;
    //     }
    //  const getContainerHeight = () => {
    //     const containerHeight = document.querySelector('.dag-designer-container');
    //     return containerHeight.clientHeight;
    // }



    // logger.app.info("parentWidth", parentWidth);
    // logger.app.info("parentHeight", parentHeight);

    logger.app.info("flowDescription", flowObject.flowDescription);

    const inputFlow = flowObject.flowObject;

    const openDagModal = flowObject.openDagModal;

    const onExpand = () => {
        openDagModal(flowObject);
    }


    const initialNodes = inputFlow.nodes;
    const initialEdges = inputFlow.edges;
    const { x = 0, y = 0, zoom = 1 } = inputFlow.viewport;
    // logger.app.info("inputFlow", inputFlow);
    // logger.app.info("inputFlow type", typeof inputFlow);
    // logger.app.info("inputFlow.edges", inputFlow.edges);
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes || []);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges || []);
    const [rfInstance, setRfInstance] = useState(null);
    const { setViewport } = useReactFlow();

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

    // const onLoad = useCallback(() => {
    //     const restoreFlow = async () => {
    //         const flow = flowObject.flow;
    //         logger.app.info("flow", flow);

    //         if (flow) {
    //             const { x = 0, y = 0, zoom = 1 } = flow.viewport;
    //             setNodes(flow.nodes || []);
    //             setEdges(flow.edges || []);
    //             setViewport({ x, y, zoom });
    //         }
    //     };

    //     restoreFlow();
    // }, [setNodes, setViewport, flowObject]);

    // onLoad();




    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
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
        if (rfInstance) {
            const flow = rfInstance.toObject();
            // logger.app.info("flow", flow);

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
        
        // Prepare payload
        const payload = {
            flow: flowString,
            description: "This is a test description",
            groupId: "123",
            userName: "John Doe",
            userId: "456",
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
        };
        setNodes((nds) => nds.concat(newNode));
    }, [setNodes]);


    const proOptions = { hideAttribution: true };

    return (
        <div className="dag-designer-container">
            {showVariableModal && <VariableModal onClose={closeVariableModal} addVariableFromModal={addVariableFromModal} />}
            <div
                className="react-flow-loader-container"
                style={{
                    // width: getContainerWidth(),
                    // height: getContainerWidth(),
                    // width: "400px",
                    // height: "250px",

                }}
            >
                <ReactFlow
                      style={{
                        // width: '100%',
                        // height: '100%',
                      }}
                    nodes={nodes}
                    edges={edges}
                    onNodesChange={onNodesChange}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    onInit={setRfInstance}
                    fitView
                    // fitViewOptions={{ padding: 0.2 }}
                    proOptions={proOptions}

                    // edgesUpdatable={false}
                    edgesFocusable={false}
                    nodesDraggable={false}
                    nodesConnectable={false}
                    nodesFocusable={false}
                    draggable={false}
                    panOnDrag={false}
                    // panOnDrag={false}
                    elementsSelectable={false}
                    zoomOnDoubleClick={false}
                    zoomOnPinch={false}
                    zoomOnScroll={false}
                >
                    <Panel position="top-right">
                        <div>
                            <button className="expand-dag-button" onClick={onExpand}>Expand</button>
                        </div>
                    </Panel>
                    <Background color="#FFFFF"/>
                </ReactFlow>
            </div>
            {/* <div className="dag-designer-submit-area">
                <button onClick={onSubmit}>Submit Response</button>
            </div> */}
            <div className="dag-loader-description">
                {/* {flowObject.flowDescription && <p>{flowObject.flowDescription}</p>} */}

            </div>
        </div>
    );
};

export default function DagLoader(flowObject, flowDescription, openDagModal ) {
    return (
        <ReactFlowProvider style={{width: "100%", height: "100%"}}>
            <SaveRestore flowObject={flowObject} flowDescription={flowDescription} openDagModal={openDagModal} />
        </ReactFlowProvider>
    );
}
