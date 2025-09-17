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

import CustomButton from "@/app/components/CustomButton/CustomButton";
import { useSearchParams } from "next/navigation";

// import DeleteForeverIcon from '@mui/icons-material/DeleteForever';
// import DeleteForeverIcon from '@mui/icons-material/DeleteOutline';
import { createCursorFromIcon } from '@/app/utils/iconUtils';

import VariableModal from "../VariableModal/VariableModal";
import CustomNode from "./CustomNode";

import "./style.css";


const flowKey = "example-flow";

const getNodeId = () => `randomnode_${+new Date()}`;

const handleStyle = {
    // width: 32,
    // height: 32,
    background: '#000000', // Black handles
    border: '2px solid #FFFFFF', // White border
};

const nodeStyle = {
    background: "#FF7EF2", // Pink background
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
        position: { x: 180, y: 120 },
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
        setDeleteMode(false);
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
        (params) => {
            // Prevent self-connections
            if (params.source === params.target) {
                return;
            }
            
            setEdges((eds) =>
                addEdge(
                    {
                        ...params,
                        type: "smoothstep",
                        markerEnd: {
                            ...arrowMarkerEndStyle,
                            color: deleteMode ? "#FF0000" : "#000000",
                        },
                        style: {
                            ...edgeStyle,
                            stroke: deleteMode ? "#FF0000" : "#000000",
                        },
                    },
                    eds
                )
            );
        },
        [deleteMode]
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
        // const textAreaText = document.querySelector(
        //     ".dag-designer-submit-area-text-area"
        // ).value;

        // if (textAreaText === "") {
        //     alert("Please enter a description");
        //     return;
        // }

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
        // const textArea = document.querySelector(
        //     ".dag-designer-submit-area-text-area"
        // );
        // const description = textArea.value;
        const description = "default";

        // Prepare payload
        const payload = {
            flow: flowString,
            description: description,
            groupId: labGroupId,
            userName: "John Doe",
            userId: "456",
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
                    x: (Math.random() - 0.5) * 100,
                    y: (Math.random() - 0.5) * 100,
                },
                style: nodeStyle,
                sourceHandle: handleStyle,
                targetHandle: handleStyle,
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

    // Get the SVG string from the MUI icon
    const [deleteIconCursor, setDeleteIconCursor] = useState('');

    useEffect(() => {
        // Create SVG string manually for the DeleteForever icon
        const iconSvg = `<svg xmlns="http://www.w3.org/2000/svg" height="24" viewBox="0 0 24 24" width="24">
            <path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z" fill="black"/>
        </svg>`;

        const cursorUrl = createCursorFromIcon(iconSvg);
        setDeleteIconCursor(`url('${cursorUrl}') 12 12, auto`);
    }, []);

    // Update node styles based on delete mode
    useEffect(() => {
        const deleteStyle = {
            cursor: deleteIconCursor,
        };

        setNodes((nds) =>
            nds.map((node) => ({
                ...node,
                className: deleteMode ? "node-delete-mode" : "",
                style: {
                    ...nodeStyle,
                    ...(deleteMode ? deleteStyle : {}),
                },
            }))
        );
        
        setEdges((eds) =>
            eds.map((edge) => ({
                ...edge,
                className: deleteMode ? "edge-delete-mode" : "",
                style: {
                    ...edgeStyle,
                    ...(deleteMode ? { ...deleteStyle, stroke: "#FF0000" } : {}),
                },
                markerEnd: {
                    ...arrowMarkerEndStyle,
                    color: deleteMode ? "#FF0000" : "#000000",
                },
            }))
        );
    }, [deleteMode, deleteIconCursor, setNodes, setEdges]);

    // Add edge click handler
    const handleEdgeClick = useCallback(
        (event, edge) => {
            if (deleteMode) {
                setEdges((eds) => eds.filter((e) => e.id !== edge.id));
            }
        },
        [deleteMode]
    );

    return (
        <div className="dag-designer-container">
            {showVariableModal && (
                <VariableModal
                    onClose={closeVariableModal}
                    addVariableFromModal={addVariableFromModal}
                />
            )}

            {/* For some reason, keeps the DAG designer rendering at full width */}
            <div className="dag-designer-submit-area-instructions">
            </div>

            <div
                className={`react-flow-draw-container ${deleteMode ? "delete-mode-border" : ""}`}
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
                    fitViewOptions={{ padding: 0.2 }}
                    proOptions={proOptions}
                    onNodeClick={handleNodeClick}
                    onEdgeClick={handleEdgeClick}
                    selectNodesOnDrag={false}
                >
                    <Panel position="bottom-left">
                        <div className="add-variables-container">
                            <button
                                onClick={toggleDeleteMode}
                                className={deleteMode ? "exit-delete-mode" : ""}
                            >
                                {deleteMode
                                    ? "Exit Delete Mode"
                                    : "X Delete Variable"}
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

                <div className="dag-designer-submit-button-container">
                    <CustomButton variant="primary" onClick={onSubmit}>Submit DAG</CustomButton>
                </div>
                <br />
                <br />
            </div>
        </div>
    );
};

export default function DagDesigner(props) {
    const searchParams = useSearchParams();
    const labGroupId = searchParams.get("sessionID");
    const plausibility = searchParams.get("plausibility");
    console.log("labGroupId", labGroupId);
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
