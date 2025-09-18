const logger = require('../../../../packages/logging/logger.js');
'use client'

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from 'next/image';
import DagUtility from '../components/DagUtility';
import { Dag } from '../components/DragAndDrop/Dag';
import DagGenerator from "../components/DagGenerator/DagGenerator";


// export default function ResQuesThree() {
export default function DrawPage() {


  // Initialize dagProps as a state variable
  const [dagProps, setDagProps] = useState({
    labelA: "Hello World",
    labelB: "Hello World Hello World",
    labelC: "Third Variable",
    lineA: "dott",
    lineB: "dottedLine",
    lineC: "none",
  });

  const changeDagProps = () => {
    logger.app.info("changeDagProps");
    // Update state to trigger a re-render
    setDagProps({
      labelA: "New Label",
      labelB: "New Label",
      labelC: "New Label",
      lineA: "New Line",
      lineB: "New Line",
      lineC: "New Line",
    });
  };

  useEffect(() => {
    logger.app.info("dagProps", dagProps);
  }, [dagProps]);

  const dagContainerStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    alignSelf: "center",
    margin: "auto",
    height: "150px",
    width: "300px",
    // border: "1px solid #000",
    borderRadius: "10px",
    padding: "10px",
    backgroundColor: "#F3F3F3",
};
const dagContainerStyle2 = {
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  alignSelf: "center",
  margin: "auto",
  height: "400px",
  width: "500px",
  // border: "1px solid #000",
  borderRadius: "10px",
  padding: "10px",
  backgroundColor: "#F3F3F3",
};
const dagContainerStyle3 = {
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

// let dagProps = {
//     labelA: "Hello World",
//     labelB: "Hello World Hello World",
//     labelC: "Third Variable",
//     lineA: "dott",
//     lineB: "dottedLine",
//     lineC: "none",
// };
const dagProps2 = {
  labelA: "First Variable",
  labelB: "Second Variable",
  labelC: "Third Variable",
  lineA: "dottedLine",
  lineB: "dottedLine",
  lineC: "dottedLine",
};
const dagProps3 = {
  labelA: "Age",
  labelB: "Gender",
  labelC: "Education",
  lineA: "line",
  lineB: "dottedLine",
  lineC: "line",
};




// const changeDagProps = () => {
//   // Change the labels and lines
//   dagProps.labelA = "New Label";
//   dagProps.labelB = "New Label";
//   dagProps.labelC = "New Label";
//   dagProps.lineA = "New Line";
//   dagProps.lineB = "New Line";
//   dagProps.lineC = "New Line";
// };


  return (
    <div className="App">

        <h1>DAG Generator</h1>
        <button onClick={changeDagProps}>Change  DAG</button>
        <div className="dag-container" style={dagContainerStyle}>
            <DagGenerator {...dagProps} />
        </div>
        <div className="dag-container" style={dagContainerStyle2}>
            {/* <DagGenerator {...dagProps2} /> */}
        </div>
        <div className="dag-container" style={dagContainerStyle3}>
            {/* <DagGenerator {...dagProps3} /> */}
        </div>
    </div>
);
}

export const dynamic = 'force-dynamic';
