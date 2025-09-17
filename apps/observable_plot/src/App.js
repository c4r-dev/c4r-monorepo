import * as Plot from "@observablehq/plot";
import PlotFigure from "./PlotFigure.jsx";
import "./styles.css";
import data from "./data.json";

export default function App() {

  const meanDays =
    data.reduce((sum, d) => sum + d.survivalDays, 0) / data.length;

  return (
    <div className="App">
      <h1>Observable Plot + React</h1>
      <h2>Why Randomize? Plot (age)</h2>
      <PlotFigure
        options={{
          marks: [

            Plot.frame({ stroke: "black" }),

            Plot.linearRegressionY(data, {
              stroke: "blue",
              strokeWidth: 3,
              x: "age",
              y: "survivalDays"
            }),

            Plot.ruleY([meanDays], {
              stroke: "orange",
              strokeWidth: 3,
              ariaLabel: "Mean Survival Days",
              label: "Mean",
              labelAnchor: "center",
              labelOffset: 5,
            }),

            Plot.axisX({
              label: "Age",
              labelAnchor: "center", // Change to 'start' or 'end' for alignment
              labelOffset: 27, // Adjust the spacing of labels from the axis
            }),

            Plot.axisY({
              label: "Survival (in Days)",
              labelAnchor: "center", // Change to 'start' or 'end' for alignment
              labelOffset: 41, // Adjust the spacing of labels from the axis
            }),

            Plot.dot(data, {
              x: "age",
              y: "survivalDays",
              stroke: "black",
              fill: "black",
              title: (d) => `Age: ${d.age}\nSurvival Days: ${d.survivalDays}`,
            }),

          ]
        }}
      />
    </div>
  );
}
