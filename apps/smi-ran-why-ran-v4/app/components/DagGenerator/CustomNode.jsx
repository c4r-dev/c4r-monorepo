import { Handle, Position, useConnection } from '@xyflow/react'

export default function CustomNode({ data }) {
  const connection = useConnection()

  // const isTarget = false;
  // const id = data.id;
  // const isTarget = connection.inProgress && connection.fromNode.id !== id;

  return (
    <div className="customNode">
      <div
        className="customNodeBody"
        style={{
          borderStyle: 'none',
          // Using rgba to set transparency instead of opacity
           backgroundColor: "rgba(0, 163, 255, 0.4)",
          //    backgroundColor: "#C7EAFB",

          fontWeight: 'bold',
          margin: '10px',
          // width: "100px",
          // height: "100px"
        }}
        // style={{
        //     borderStyle: "none",
        //     backgroundColor: "#C7EAFB",
        //     margin: "10px",
        //     // width: "100px",
        //     // height: "100px"
        // }}
      >
        {/* If handles are conditionally rendered and not present initially, you need to update the node internals https://reactflow.dev/docs/api/hooks/use-update-node-internals/ */}
        {/* In this case we don't need to use useUpdateNodeInternals, since !isConnecting is true at the beginning and all handles are rendered initially. */}
        {!connection.inProgress && (
          <Handle
            className="customHandle"
            position={Position.Right}
            type="source"
          />
        )}
        {/* We want to disable the target handle, if the connection was started from this node */}
        {!connection.inProgress && (
          <Handle
            className="customHandle"
            position={Position.Left}
            type="target"
            isConnectableStart={false}
          />
        )}
        <p
          style={{
            fontWeight: 'bold',
            color: '#000000',
            // No opacity setting here - text will be fully opaque
          }}
        >
          {data.label}
        </p>
      </div>
    </div>
  )
}
