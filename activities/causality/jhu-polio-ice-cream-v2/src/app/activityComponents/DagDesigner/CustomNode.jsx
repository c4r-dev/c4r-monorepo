import { Handle, Position, useConnection } from "@xyflow/react";
import "./style.css";

export default function CustomNode({ data, selected }) {
    const connection = useConnection();

    return (
        <div className={`customNode ${selected ? 'selected' : ''}`}>
            <div
                className="customNodeBody"
                style={{
                    borderStyle: "none",
                    backgroundColor: "#C7EAFB",
                    margin: "10px",
                    boxShadow: selected ? '0 0 0 2px #ff00ff' : 'none', // Add this line
                }}
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
                <p>{data.label}</p>
            </div>
        </div>
    );
}
