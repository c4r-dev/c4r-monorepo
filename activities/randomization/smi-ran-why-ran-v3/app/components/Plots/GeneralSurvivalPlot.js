import * as Plot from "@observablehq/plot";
import PlotFigure from "./PlotFigure.jsx";
// import "./styles.css";
import data from "../../Data/data.json";

export default function GeneralPlot({
  xLabel,
  xDomain,
  yRange,
  xValue,
  plotWidth,
  plotHeight,
  yValue = "survivalDays",
}) {
  // Calculate Y-axis range with padding
  // const yValues = data.map((d) => d.survivalDays);
  // const yMin = Math.min(...yValues);
  // const yMax = Math.max(...yValues);
  // const yPadding = (yMax - yMin) * 0.05; // 5% padding
  // const adjustedYRange = [yMin - yPadding, yMax + yPadding];

  // // Calculate X-axis range with padding
  // const xValues = data.map((d) => d[xValue]);
  // const xMin = Math.min(...xValues);
  // const xMax = Math.max(...xValues);
  // const xPadding = (xMax - xMin) * 0.05; // 5% padding
  // const adjustedXRange = [xMin - xPadding, xMax + xPadding];

 // Filter out the points with the minimum and maximum x-value and y-value for visibility
// const filteredData = data.map((d) =>
//   d[xValue] === xMin || d[xValue] === xMax || d[yValue] === yMin || d[yValue] === yMax
//     ? { ...d, invisible: true } // Add a flag for invisibility
//     : { ...d, invisible: false }
// );

    // Filter out the point with the maximum x-value for visibility


  return (
    <div className="App" style={{ display: "flex", marginRight: "24%" }}>
      <PlotFigure
        style= {{fontSize: "66px"}}
        options={{
          x: {
            domain: xDomain, // Set x-axis scale domain
           // grid: true, // Add grid lines
          },
          y: {
            domain: yRange, // Set y-axis scale domain
           // grid: true, // Add grid lines
          },
          marks: [
            // Linear Regression Line
            Plot.linearRegressionY(data, {
              stroke: "blue",
              strokeWidth: 3,
              x: xValue,
              y: "survivalDays",
            }),


            // Y-axis Configuration
            Plot.axisY({
              label: "Survival (in Days)",
              // domain: [110, 370],
              labelAnchor: "center",
              labelOffset: 36,
              labelStyle: { fontSize: "16px", fontWeight: "bold" },
              tickStyle: { fontSize: "14px" },
            }),

            // X-axis Configuration
            Plot.axisX({
              label: xLabel,
              // domain: [16000,150000],
              style: {
                fontFamily: "Georgia",
                fontSize: "16px",
                color: "#666",
              },
              labelAnchor: "center",
              labelOffset: 25,
              labelStyle: { fontSize: "16px", fontWeight: "bold" },
              tickStyle: { fontSize: "14px" },
            }),

            // Data Points (Dots) - Make the dot invisible for xMin
            Plot.dot(data, {
              x: xValue,
              y: "survivalDays",
              r: 4,
              stroke: (d) => (d.invisible ? "none" : "black"), // Hide the dot
              fill: (d) => (d.invisible ? "none" : "black"), // Hide the dot
              title: (d) =>
                d.invisible
                  ? null // No tooltip for invisible dots
                  : `Age: ${d.age}\nSex: ${d.sex} \nSurvival Days: ${d.survivalDays}\nTreatment Type: ${d.treatmentType}\nIncome: ${d.income}\nEducation Years: ${d.educationYears}\nBMI: ${d.bmi}\nSmoking Years: ${d.smokingYears}\nPhysical Activity: ${d.physicalActivity}`,
            }),
          ],
          width: plotWidth,
          height: plotHeight,
        }}
      />
    </div>
  );
}