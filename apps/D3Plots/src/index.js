import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

// import New from "./New";
import App from "./App";
import ScatterPlot from "./ScatterPlot";
import data from "./data.json";
import CustomSVGPlot from "./CustomSVGPlot";
import ActivityPlot from "./ActicityPlot";

const rootElement = document.getElementById("root");
const root = createRoot(rootElement);

root.render(
  <StrictMode>
    {/* <New /> */}
    <App/>
    <ScatterPlot data={data} yLabel={"age"}/>
    <CustomSVGPlot/>
    <ActivityPlot data={data}/>
  </StrictMode>
);