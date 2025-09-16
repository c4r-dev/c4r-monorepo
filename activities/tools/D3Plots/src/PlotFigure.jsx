import React, { useEffect, useRef } from "react";
import * as Plot from "@observablehq/plot";

const PlotFigure = ({ options }) => {
  const ref = useRef();

  useEffect(() => {
    const chart = Plot.plot(options); // Create the chart using Observable Plot
    ref.current.appendChild(chart);   // Append the chart to the div

    return () => chart.remove(); // Clean up the chart on unmount
  }, [options]);

  return <div ref={ref}></div>;  // The div where the chart will be rendered
};

export default PlotFigure;
