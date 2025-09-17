import React, { useState, useCallback, useEffect } from "react";
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
    Controls,
} from "@xyflow/react";
import "@xyflow/react/dist/style.css";
import Image from "next/image";

import Logo from "../assets2/logo-sideways.svg";
import RavenIceCream from "../assets2/raven-ice-cream.svg";

import { useSearchParams } from "next/navigation";

// import "@xyflow/react/dist/style.css";
import "./style.css";

import VariableModal from "../components/VariableModal";

import CustomNode from "./CustomNode";

import ImplausibleRaven from "../assets2/implausible-raven.svg";
import PlausibleRaven from "../assets2/plausible-raven.svg";

const flowKey = "example-flow";

const getNodeId = () => `randomnode_${+new Date()}`;

const nodeStyle = {
    background: "#FF7EF2", // Light green background
    padding: 10,
    borderRadius: 5,
    border: "none",
    fontSize: 16,
    fontFamily: "GeneralSans-Semibold",
    fontWeight: "bold",
};

const edgeStyle = {
    stroke: "#000000",
    strokeWidth: 3,
};

const initialNodes = [
    {
        id: "1",
        data: { label: "Ice cream consumption" },
        position: { x: 0, y: 0 },
        style: nodeStyle,
    },
    {
        id: "2",
        data: { label: "Polio cases" },
        position: { x: 250, y: 0 },
        style: nodeStyle,
    },
];

const initialEdges = [];

const SaveRestore = ({ loadReviewPage, labGroupId, plausibility }) => {
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);
    const [rfInstance, setRfInstance] = useState(null);
    const { setViewport } = useReactFlow();
    const [firstNodeAdded, setFirstNodeAdded] = useState(false);
    const [deleteMode, setDeleteMode] = useState(false);

    console.log("labGroupId from DagDesigner", labGroupId);
    console.log("plausibility from DagDesigner", plausibility);
    // Variable Modal logic
    const [showVariableModal, setShowVariableModal] = useState(false);

    const openVariableModal = () => {
        setShowVariableModal(true);
    };
    const closeVariableModal = () => {
        setShowVariableModal(false);
    };
    const addVariableFromModal = (variableName) => {
        addNodeToCanvas(variableName);
        closeVariableModal();
    };

    const arrowMarkerEndStyle = {
        type: MarkerType.ArrowClosed,
        width: 20,
        height: 20,
        color: "#000000",
    };

    const controlProps = {
        position: "bottom-right",
        showInteractive: false,
    };


    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: "smoothstep", // Use smoothstep edge
                        markerEnd: arrowMarkerEndStyle,
                        style: edgeStyle,
                    },
                    eds
                )
            ),
        []
    );

    const onSave = useCallback(() => {
        if (rfInstance) {
            const flow = rfInstance.toObject();
            localStorage.setItem(flowKey, JSON.stringify(flow));
        }
        console.log("rfInstance", rfInstance);
        console.log("rfInstance type", typeof rfInstance);
        // convert to array
        const flowArray = Object.values(rfInstance);
        console.log("flowArray", flowArray);
        console.log("flowArray type", typeof flowArray);

        // Flow object
        const flowObject = rfInstance.toObject();
        console.log("flowObject", flowObject);
        console.log("flowObject type", typeof flowObject);
    }, [rfInstance]);

    const onSubmit = useCallback(() => {
        console.log("onSubmit");

        // If description is empty, alert the user
        const textAreaText = document.querySelector(
            ".dag-designer-submit-area-text-area"
        ).value;
        if (textAreaText === "") {
            alert("Please enter a description");
            return;
        }

        console.log("rfInstance", rfInstance);
        if (rfInstance) {
            const flow = rfInstance.toObject();
            if (flow.nodes.length === 0) {
                alert("Please add at least one variable to the DAG");
                return;
            }

            const flowString = JSON.stringify(flow);
            handleSubmitToApi(flowString);
        } else {
            // TODO: Add error handling
            console.log("No flow instance found");
            alert("No flow instance found");
        }
    }, [rfInstance]);

    const handleSubmitToApi = async (flowString) => {
        console.log(flowString);
        const textArea = document.querySelector(
            ".dag-designer-submit-area-text-area"
        );
        const description = textArea.value;

        // Prepare payload
        const payload = {
            flow: flowString,
            description: description,
            groupId: labGroupId,
            userName: "John Doe",
            userId: "456",
            // labGroupId: labGroupId,
        };

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
                console.log("Successfully submitted");
                loadReviewPage(labGroupId);
            } else {
                throw new Error("Response not ok.");
            }
        } catch (error) {
            console.log(error);
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

    // Function to add node to canvas
    const addNodeToCanvas = useCallback(
        (variableName) => {
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
        },
        [setNodes]
    );

    const proOptions = { hideAttribution: true };

    const toggleDeleteMode = () => {
        setDeleteMode(!deleteMode);
    };

    // Handle node clicks for delete mode
    const handleNodeClick = useCallback(
        (event, node) => {
            if (deleteMode) {
                setNodes((nds) => nds.filter((n) => n.id !== node.id));
            }
        },
        [deleteMode]
    );

    // Update node styles based on deleteMode
    useEffect(() => {
        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                className: deleteMode ? "node-delete-mode" : "",
            }))
        );
    }, [deleteMode, setNodes]);

    return (
        <div className="dag-designer-container">
            {showVariableModal && (
                <VariableModal
                    onClose={closeVariableModal}
                    addVariableFromModal={addVariableFromModal}
                />
            )}

            <div className="activity-header">
                <Image src={Logo} alt="Logo" className="logo-sideways" />
                <h1>Did Ice Cream Cause Polio?</h1>
            </div>

            {/* Raven */}
            {/* <div className="plausible-raven-container">
                <Image src={ plausibility === "plausible" ? PlausibleRaven : ImplausibleRaven}  className="plausible-raven" alt="Plausible Raven" />
            </div> */}

            {/* Renders on desktop via CSS media query */}
            <div className="plausible-raven-container2">
                <Image
                    src={
                        plausibility === "plausible"
                            ? PlausibleRaven
                            : ImplausibleRaven
                    }
                    className="plausible-raven2"
                    alt="Plausible Raven"
                />
            </div>
            {/* Remders on mobile via CSS media query */}
            <div className="plausible-text-mobile">
                <div className="plausible-text-mobile-box">
                    <p>You have chosen &quot;Implausible&quot; so</p>
                    <p>Suggest lurking variables!</p>
                    {/* <br /> */}
                    <p>
                        Drag arrows between variables to show their
                        relationships
                    </p>
                </div>
            </div>

            <div
                className="react-flow-draw-container"
                // style={{
                //     width: "600px",
                //     height: "400px",
                // }}
            >
                <ReactFlow
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
                    onNodeClick={handleNodeClick}
                    selectNodesOnDrag={false} // Add this line
                >
                    <Panel position="bottom-left">
                        <div className="add-variables-container">
                            <button 
                                onClick={toggleDeleteMode}
                                className={deleteMode ? "exit-delete-mode" : ""}
                            >
                                {deleteMode ? "Exit Delete Mode" : "X Delete Variable"}
                            </button>
                            <button onClick={openVariableModal}>
                                + Add Variable
                            </button>
                        </div>
                        <div className="initial-node-container">
                            {/* Implement drag and drop for initial nodes */}

                        </div>
                    </Panel>
                    <Controls {...controlProps} />
                    <Background color="#FFFFF" />
                </ReactFlow>
            </div>
            <div className="dag-designer-submit-area">
                <div className="dag-designer-submit-area-instructions">
                    <h2>DAG Drawing Instructions</h2>
                    <p>Drawing instructions:</p>
                    <ul>
                        <li>
                            Add variables: Click &quot;Add Variable&quot; to
                            create a new variable
                        </li>
                        <li>
                            Connect variables: Click and drag between a
                            variable&apos;s outgoing point (bottom) and an
                            incoming point (top) to create a directed line.
                        </li>
                        <li>
                            Remove variables / arrows: You may delete variables
                            or arrows by clicking on them and then pressing the
                            delete or backspace key.
                        </li>
                    </ul>
                    <p>Navigation: </p>
                    <ul>
                        <li>
                            Zoom - You may scroll the mouse (While over the DAG
                            designer) to zoom in and out
                        </li>
                        <li>
                            Pan - Click and drag with you mouse in order to move
                            your view
                        </li>
                    </ul>
                </div>

                <div className="dag-designer-submit-area-instructions">
                    <h2>What does your Dag show?</h2>
                    <p>
                        What does your Dag show? Describe the variables you
                        added to the DAG. What relationships did you discern?
                        Did you uncover any spurious relationships or
                        confounders?
                    </p>
                </div>

                {/* text area */}
                <textarea
                    className="dag-designer-submit-area-text-area"
                    placeholder="Tell us here..."
                ></textarea>

                <div className="dag-designer-submit-button-container">
                    <button
                        className="dag-designer-submit-area-submit-button"
                        onClick={onSubmit}
                    >
                        Submit Response
                    </button>
                </div>
                {/* BRs */}
                <br />
                <br />
            </div>
        </div>
    );
};

export default function DagDesigner(props) {
    const searchParams = useSearchParams();
    const labGroupId = searchParams.get("labGroupId");
    const plausibility = searchParams.get("plausibility");
    console.log("labGroupId", labGroupId);
    // props.labGroupId = labGroupId;
    // Add labGroupId to props, despite object not being mutable
    const updatedProps = {
        ...props,
        labGroupId: labGroupId,
        plausibility: plausibility,
    };

    return (
        <ReactFlowProvider>
            <SaveRestore {...updatedProps} />
        </ReactFlowProvider>
    );
}
