import React, { useState } from "react";
import "./App.css";
import DagGenerator from "./DagGenerator/DagGenerator";

function App() {
    const dagContainerStyle = {
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        alignSelf: "center",
        margin: "auto",
        height: "300px",
        width: "400px",
        // border: "1px solid #000",
        borderRadius: "10px",
        padding: "10px",
        backgroundColor: "#F3F3F3",
    };

    const [dagProps, setDagProps] = useState({
        labelA: "First Variable",
        labelB: "Second Variable",
        labelC: "Third Variable",
        lineA: "line",
        lineB: "dottedLine",
        lineC: "none",
    });

    // Function demonstrating how to change the dagProps
    function changeDagProps() {
        let randomLabel1 = Math.random().toString(36).substring(7);
        let randomLabel2 = Math.random().toString(36).substring(7);
        let randomLabel3 = Math.random().toString(36).substring(7);

        setDagProps({
            labelA: randomLabel1,
            labelB: randomLabel2,
            labelC: randomLabel3,
            lineA: "dottedLine",
            lineB: "dottedLine",
            lineC: "dottedLine",
        });
    }

    // Generate a unique key based on dagProps to force re-render
    const dagKey = Object.values(dagProps).join("-");

    return (
        <div className="App">
            <h1>DAG Generator</h1>
            <div className="dag-container" style={dagContainerStyle}>
                {/* Use the key to force re-render when dagProps change */}
                <DagGenerator key={dagKey} {...dagProps} />
            </div>
            <button onClick={changeDagProps}>Change Props</button>
        </div>
    );
}

export default App;
