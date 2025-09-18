const logger = require('../../../../../packages/logging/logger.js');
import React, { useCallback, useEffect } from "react";

import {
    ReactFlow,
    addEdge,
    useNodesState,
    useEdgesState,
    MarkerType,
} from "@xyflow/react";

import CustomNode from "./CustomNode";
import FloatingEdge from "./FloatingEdge";
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

const connectionLineStyle = {
    strokeWidth: 3,
    stroke: "black",
};

const edgeTypes = {
    floating: FloatingEdge,
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

    useEffect(() => {
        logger.app.info("Detected DagGenerator props change");
        logger.app.info("labelA", labelA);
        logger.app.info("labelB", labelB);
        logger.app.info("labelC", labelC);
        logger.app.info("lineA", lineA);
        logger.app.info("lineB", lineB);
        logger.app.info("lineC", lineC);
    }, [labelA, labelB, labelC, lineA, lineB, lineC]);

    const initialNodes = [
        {
            id: "A",
            type: "custom",
            position: { x: 0, y: 0 },
            label: labelA,
            data: {
                label: labelA,
            },
        },
        {
            id: "B",
            type: "custom",
            position: { x: 300, y: 0 },
            label: labelB,
            data: {
                label: labelB,
            },
        },
        {
            id: "C",
            type: "custom",
            position: { x: 150, y: 180 },
            label: labelC,
            data: {
                label: labelC,
            },
        },
    ];

    // Different props for each type of edge
    const dottedEdgeProps = {
        style: {
            strokeWidth: 3,
            stroke: "#7b7b7c",
            strokeDasharray: "5,5",
        },
        type: "floating",
        markerEnd: {
            type: "arrowclosed",
            color: "#7b7b7c",
        },
        label: {
            text: "?",
        },
        animated: true,
    };

    const solidEdgeProps = {
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
            text: "",
        },
        animated: true,
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
        animated: true,
    };

    // Map const values edgeA, edgeB, edgeC to the appropriate edge props
    const lineMap = {
        line: solidEdgeProps,
        dottedLine: dottedEdgeProps,
        none: blankEdgeProps,
    };
    const lineAProps = lineMap[lineA];
    const lineBProps = lineMap[lineB];
    const lineCProps = lineMap[lineC];

    // Create initial edges
    const initialEdges = [
        {
            id: "A-B",
            source: "A",
            target: "B",
            ...lineAProps,
        },
        {
            id: "B-C",
            source: "B",
            target: "C",
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
            fitView
            nodeTypes={nodeTypes}
            edgeTypes={edgeTypes}
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
