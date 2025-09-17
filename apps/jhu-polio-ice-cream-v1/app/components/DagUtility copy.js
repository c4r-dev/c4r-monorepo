'use client'

/*
This React component is a tool for drawing DAGs (Directed Acyclic Graphs)

The DAG functionality will be assisted by the React Flow library

*/
import React from 'react';
import { ReactFlow, Background, Controls, Node, Edge } from '@xyflow/react';
import '@xyflow/react/dist/style.css';


const DagUtility = () => {

    // const props = {
    //     nodes: [],
    //     edges: [],
    //     onNodesChange: () => {},
    //     onEdgesChange: () => {},
    //     width: 1000,
    //     height: 1000,
    // }


    // return (
    //     <ReactFlow {...props}></ReactFlow>
    // )

        return (
          <div style={{ height: '500px', width: '500px' }}>
            <ReactFlow>
              <Background />
              <Controls />
            </ReactFlow>
          </div>
        );
      
            
}

export default DagUtility;
