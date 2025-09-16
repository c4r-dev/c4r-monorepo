'use client'

/*
This React component is a tool for drawing DAGs (Directed Acyclic Graphs)

The DAG functionality will be assisted by the React Flow library

*/
import { useState, useCallback } from 'react';
import {
  ReactFlow,
  Controls,
  Background,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

const initialNodes = [
  {
    id: '1',
    data: { label: 'Hello' },
    position: { x: 0, y: 0 },
    type: 'input',
  },
  {
    id: '2',
    data: { label: 'World' },
    position: { x: 100, y: 100 },
  },
];

const initialEdges = [];

function DagUtility() {
  const [nodes, setNodes] = useState(initialNodes);
  const [edges, setEdges] = useState(initialEdges);
  const [availableNodes, setAvailableNodes] = useState([]);
  const [selectedNode, setSelectedNode] = useState(null);

  const onNodesChange = useCallback(
    (changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
    [],
  );
  const onEdgesChange = useCallback(
    (changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
    [],
  );

  const onConnect = useCallback(
    (params) => setEdges((eds) => addEdge(params, eds)),
    [],
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
    let newNodeId = 'node_' + availableNodes.length + 1;
    let newNodeLabel = 'Node ' + availableNodes.length + 1;
    setAvailableNodes([...availableNodes, {id: newNodeId, label: newNodeLabel}]);
}

// Update to handle node selection
function handleNodeSelection(nodeId) {
    setSelectedNode(prevSelectedNode => prevSelectedNode === nodeId ? null : nodeId);
}

  return (
    <div className='dag-utility-container'>
        <div>
            <h1>DAG Utility</h1>
        </div>
        <div style={{ height: '60vh', width: '80vw', position: 'relative', border: '1px solid black' }}>
        <ReactFlow
            nodes={nodes}
            onNodesChange={onNodesChange}
            edges={edges}
            onEdgesChange={onEdgesChange}
            onConnect={onConnect}
            fitView
        >
            <Background />
            <Controls />
        </ReactFlow>
        <button
            // style={{ position: 'absolute', left: 20, bottom: 20 }}
            onClick={addNodeToNodeHolder}
        >
            Add Node
        </button>
        <div className='available-nodes-pane'>
            <p>Available Nodes</p>
            {/* Nodes ready to be selected and added to the DAG below */}
            <div className='available-nodes-holder'>
                {availableNodes.map((node) => (
                    <div key={node.id} className={`available-node ${selectedNode === node.id ? 'selected' : ''}`}
                         onClick={() => handleNodeSelection(node.id)}>
                        {node.label}
                    </div>
                ))}
            </div>
        </div>
        
        </div>        
    </div>

  );
}

export default DagUtility;
