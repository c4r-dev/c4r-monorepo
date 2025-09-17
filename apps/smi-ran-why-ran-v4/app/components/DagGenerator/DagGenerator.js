import React, { useCallback } from "react";

import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "@xyflow/react";

import CustomNode from "./CustomNode";
import FloatingEdge from "./FloatingEdge";
import CustomBoxEdge from "./CustomBoxEdge";
import CustomConnectionLine from "./CustomConnectionLine";

/*
Dag Generator Description

This component will generate a graph comprised of 3 nodes (A, B ,C) oriented in a triangle, such that A and B are at the top, and C is on the bottom. 

This tool may be used by entering props for configuring the labels for the nodes and the type of edge.

Edge types include:
- line
- dottedLine
- none
*/

import "@xyflow/react/dist/style.css";
import "./style.css";
import { ClassNames } from "@emotion/react";

const connectionLineStyle = {
    strokeWidth: 3,
    stroke: "black",
    position: "absolute",
  //  border: "2px dashed black", // Dotted box style         
};

const edgeTypes = {
    floating: FloatingEdge,
    CustomBoxEdge: CustomBoxEdge,
};

const defaultEdgeOptions = {
    style: { strokeWidth: 3, stroke: "black" },
    type: "floating",
    markerEnd: {
        type: MarkerType.ArrowClosed,
        color: "black",
    },
};
export default function DagGenerator({
    labelA,
    labelB,
    labelC,
    lineA,
    lineB,
    lineC,
}) {
    const nodeTypes = {
        custom: CustomNode,
    };

    // const initialNodes = [
    //     {
    //         id: "A",
    //         type: "custom",
    //         position: { x: 0, y: 0 },
    //         label: labelA,
    //         data: {
    //             label: labelA,
    //         },
    //     },
    //     {
    //         id: "B",
    //         type: "custom",
    //         position: { x: 300, y: 0 },
    //         label: labelB,
    //         data: {
    //             label: labelB,
    //         },
    //     },
    //     {
    //         id: "C",
    //         type: "custom",
    //         position: { x: 150, y: 180 },
    //         label: labelC,
    //         data: {
    //             label: labelC,
    //         },
    //     },
    // ];

    const initialNodes = [
        {
            id: "A",
            type: "custom",
            position: { x: 0, y: 180 }, // Moving A to the bottom
            label: labelA,
            data: {
                label: labelA,
            },
        },
        {
            id: "B",
            type: "custom",
            position: { x: 300, y: 180 }, // Moving B to the bottom
            label: labelB,
            data: {
                label: labelB,
            },
        },
        {
            id: "C",
            type: "custom",
            position: { x: 150, y: 0 }, // Moving C to the top
            label: labelC,
            data: {
                label: labelC,
            },
        },
    ];

    // Different props for each type of edge
    const dottedEdgeProps = {
        style: {
            strokeWidth: 4,
            stroke: "black",
            strokeDasharray: "5,5",
        },
        type: "floating",
        markerEnd: {
            type: "arrowclosed",
            color: "transparent",
        },
        label: {
            text: "",
        },
        animated: false,
    };

    const solidEdgeProps = {
        style: {
            strokeWidth: 4,
            stroke: "black", //change color
        },
        type: "floating",
        markerEnd: {
            type: "arrowclosed",
            color: "transparent",
        },
        label: {
            text: "",
        },
        animated: false,
    };
    
    const solidEdgeWithArrowProps = {
        style: {
            strokeWidth: 3,
            stroke: "black",
        },
        type: "floating",
        markerEnd: {
            type: "arrowclosed",
            color: "black",
        },
        label: {
            text: "?",
        },
        animated: false,
    };

    const blankEdgeProps = {
        style: {
            strokeWidth: 0,
            stroke: "transparent",
        },
        type: "floating",
        markerEnd: {
            type: "arrowclosed",
            color: "black",
        },
        label: {
            text: "",
        },
        animated: false,
    };
    

    const lineWithBoxEdgeProps = {
        style: {
            strokeWidth: 4,
            stroke: "black", //change color
        },
        type: "CustomBoxEdge",
        markerEnd: {
            type: "arrowclosed",
            color: "transparent",
        },
        label: {
            text: "",
        },
        animated: false,
    };

    const dottedLineWithBoxEdgeProps = {
        style: {
            strokeWidth: 4,
            stroke: "black",
            strokeDasharray: "5,5",
        },
        type: "CustomBoxEdge",
        markerEnd: {
            type: "arrowclosed",
            color: "transparent",
        },
        label: {
            text: "",
        },
        animated: false,
    };
    const noneWithBoxEdgeProps = {
        style: {
            strokeWidth: 0,
            stroke: "transparent",
        },
        type: "CustomBoxEdge",
        markerEnd: {
            type: "arrowclosed",
            color: "black",
        },
        label: {
            text: "",
        },
        animated: false,
    };


    // Map const values edgeA, edgeB, edgeC to the appropriate edge props
    const lineMap = {
        line: solidEdgeProps,
        dottedLine: dottedEdgeProps,
        none: blankEdgeProps,

        lineWithBox: lineWithBoxEdgeProps,
        dottedLineWithBox: dottedLineWithBoxEdgeProps,
        noneWithBox: noneWithBoxEdgeProps,
    };

    let lineAProps = lineMap[lineA];
    let lineBProps = lineMap[lineB];
    let lineCProps = lineMap[lineC];


    // Handle case where labelA is "treatment assignment" and labelB is "Survival in Days" - Use solid line with arrowhead
    // TODO: Replace hardcoding with a more general solution for edge styling
    if (labelA === "treatment assignment" && labelB === "Survival in Days") {
        lineAProps = solidEdgeWithArrowProps;
    }

    // Create initial edges
    const initialEdges = [
        {
            id: "A-B",
            source: "A",
            target: "B",
            ...lineAProps,
        },
        {
            id: "C-B",
            source: "C",
            target: "B",
            ...lineBProps,
        },
        {
            id: "C-A",
            source: "C",
            target: "A",
            ...lineCProps,
        },
    ];

    // Create state for nodes and edges
    const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
    const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

    const onConnect = useCallback(
        (params) => setEdges((eds) => addEdge(params, eds)),
        [setEdges]
    );

    const proOptions = { hideAttribution: true };

    return (
        <ReactFlow
            nodes={nodes}
            edges={edges}
            onNodesChange={onNodesChange}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
            fitView={true}
            autoPanOnConnect={false}
            autoPanOnNodeDrag={false}
            // onPaneMouseMove={false}
            defaultEdgeOptions={defaultEdgeOptions}
            connectionLineComponent={CustomConnectionLine}
            connectionLineStyle={connectionLineStyle}
            proOptions={proOptions}
            // Removing interactivity
            nodesConnectable={false}
            panOnDrag={false}
            panOnScroll={false}
            zoomOnScroll={false}
            zoomOnPinch={false}
            zoomOnDoubleClick={false}
            nodesDraggable={false}
            edgesFocusable={false}
            elementsSelectable={false}
            panOnScrollMode={false}
        />
    );
}