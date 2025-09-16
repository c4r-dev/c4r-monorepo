"use client";

/*
This React component is a tool for drawing DAGs (Directed Acyclic Graphs)

The DAG functionality will be assisted by the React Flow library
*/
import { useState, useCallback } from "react";
import {
    ReactFlow,
    Controls,
    Background,
    applyNodeChanges,
    applyEdgeChanges,
    addEdge,
    MarkerType,
} from "@xyflow/react";
// import CustomEdge from './CustomEdge';

import "@xyflow/react/dist/style.css";

const initialNodes = [
    {
        id: "1",
        data: { label: "Hello" },
        position: { x: 0, y: 0 },
        type: "input",
    },
    {
        id: "2",
        data: { label: "World" },
        position: { x: 100, y: 100 },
    },
];

const initialEdges = [];

function DagUtility() {
    const [nodes, setNodes] = useState(initialNodes);
    const [edges, setEdges] = useState(initialEdges);
    const [availableNodes, setAvailableNodes] = useState([]);
    const [selectedNode, setSelectedNode] = useState(null);
    const [nodeInCreation, setNodeInCreation] = useState(null);

    const onNodesChange = useCallback((changes) => {
        console.log("nodes changed", changes);
        setNodes((nds) => applyNodeChanges(changes, nds));
    }, []);
    const onEdgesChange = useCallback(
        (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
        []
    );
    /*
Ensure new edges have the following markerEnd:
markerEnd: {
      type: MarkerType.ArrowClosed,
    },

*/

    const arrowMarkerEndStyle = {
        type: MarkerType.ArrowClosed,
        width: 30,
        height: 30,
    };

    const onConnect = useCallback(
        (params) =>
            setEdges((eds) =>
                addEdge({ ...params, markerEnd: arrowMarkerEndStyle }, eds)
            ),
        []
    );

    // Function to add a new node
    //   const addNewNode = useCallback(() => {
    //     const newNode = {
    //       id: `node_${nodes.length + 1}`, // Unique ID for the new node
    //       data: { label: `Node ${nodes.length + 1}` },
    //       position: { x: Math.random() * 400, y: Math.random() * 400 }, // Random position
    //     };
    //     setNodes((nds) => [...nds, newNode]);
    //   }, [nodes]);

    //  Function to create a element to the node holder
    function addNodeToNodeHolder() {
        // Adds a node to the available-node
        let newNodeId = "node_" + availableNodes.length + 1;
        let newNodeLabel = "Node " + availableNodes.length + 1;
        setAvailableNodes([
            ...availableNodes,
            { id: newNodeId, label: newNodeLabel },
        ]);
    }

    // Update to handle node selection
    function handleNodeSelection(nodeId) {
        setSelectedNode((prevSelectedNode) =>
            prevSelectedNode === nodeId ? null : nodeId
        );
        // Set focus to react flow
        // document.getElementById('react-flow').focus();
    }

    // Function to handle mouse entering the React Flow area
    const handleMouseEnterReactFlow = () => {};

    // Function to handle mouse move within the React Flow area
    const handleMouseMoveReactFlow = (event) => {
        if (selectedNode) {
            const nodeTemplate = availableNodes.find(
                (node) => node.id === selectedNode
            );
            if (nodeTemplate) {
                let randomNodeId = `node_${
                    Math.random().toString(36).substring(2, 15) +
                    Math.random().toString(36).substring(2, 15)
                }`;

                setNodeInCreation({
                    id: randomNodeId,
                    data: { label: nodeTemplate.label },
                    position: { x: 0, y: 0 }, // Temporary position
                    type: "default", // Adjust type as needed
                });
            }
        }
        if (nodeInCreation) {
            setNodeInCreation({
                ...nodeInCreation,
                position: {
                    x: event.clientX - 150,
                    y: event.clientY - 150,
                },
            });
        }
    };

    // Function to handle mouse click to add the node to the flow
    const handleMouseClickReactFlow = () => {
        if (nodeInCreation) {
            setNodes((prevNodes) => [...prevNodes, nodeInCreation]);
            setAvailableNodes((prevAvailableNodes) =>
                prevAvailableNodes.filter((node) => node.id !== selectedNode)
            );
            setNodeInCreation(null);
            setSelectedNode(null); // Optionally deselect after adding
        }
    };

    // Default edge types
    const defaultEdges = [
        {
            id: "default-edge",
            type: "default",
        },
    ];

    return (
        <div className="dag-utility-container">
            <div>
                <h1>DAG Utility</h1>
            </div>
            <div
                style={{
                    height: "60vh",
                    width: "80vw",
                    position: "relative",
                    border: "1px solid black",
                }}
                //  onMouseEnter={handleMouseEnterReactFlow}
                onMouseMove={handleMouseMoveReactFlow}
                onClick={handleMouseClickReactFlow}
            >
                <ReactFlow
                    nodes={[...nodes, nodeInCreation].filter(Boolean)}
                    onNodesChange={onNodesChange}
                    edges={edges}
                    onEdgesChange={onEdgesChange}
                    onConnect={onConnect}
                    defaultEdges={defaultEdges}
                    fitView
                >
                    <Background />
                    <Controls />
                </ReactFlow>

                <div className="control-row-container">
                    <div className="add-variables-container">
                        <p>Add Variables to your DAG</p>
                        <button onClick={addNodeToNodeHolder}>Add Node</button>
                        <div className="available-nodes-holder">
                            {availableNodes.map((node) => (
                                <div
                                    key={node.id}
                                    className={`available-node ${
                                        selectedNode === node.id
                                            ? "selected"
                                            : ""
                                    }`}
                                    onClick={() => handleNodeSelection(node.id)}
                                >
                                    {node.label}
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="add-arrow-container">
                        <p>Add Arrows</p>
                        <div className="control-button-row">
                            <button>One Direction</button>
                            <button>Two Directions</button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default DagUtility;
