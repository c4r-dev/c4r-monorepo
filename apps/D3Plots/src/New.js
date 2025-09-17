import React from "react";
import * as d3 from "d3";

function TreatmentPlot({ data }) {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);
    const width = 500;
    const height = 300;
    const margin = { top: 20, right: 20, bottom: 50, left: 50 };

    const xScale = d3.scaleBand()
      .domain(["In-person treatment", "Virtual treatment"])
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3.scaleLinear()
      .domain([80, 400]) // Adjusted to fit the survivalDays range
      .range([height - margin.bottom, margin.top]);

    // Clear previous content
    svg.selectAll("*").remove();

    // Define tooltip
    const tooltip = d3.select("body").append("div")
      .attr("class", "tooltip")
      .style("position", "absolute")
      .style("background-color", "white")
      .style("border", "solid")
      .style("border-width", "1px")
      .style("border-radius", "5px")
      .style("padding", "10px")
      .style("display", "none");

    // X Axis
    svg.append("g")
      .attr("transform", `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Y Axis
    svg.append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

    // Y Axis Label
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${margin.left / 4}, ${height / 2}) rotate(-90)`)
      .attr("font-size", 14)
      .attr("fill", "black")
      .text("Survival in days");

    // Kernel Density Estimator function
    const kde = (kernel, xValues, data) => {
      return xValues.map(x => [
        x,
        d3.mean(data, d => kernel(x - d.survivalDays))
      ]);
    };

    const kernelEpanechnikov = bandwidth => {
      return x => Math.abs(x / bandwidth) <= 1 ? 0.75 * (1 - (x / bandwidth) ** 2) / bandwidth : 0;
    };

    // Calculate density for both treatment types
    const dataInPerson = data.filter(d => d.treatmentType === "In-person treatment");
    const densityInPerson = kde(kernelEpanechnikov(30), d3.range(100, 400, 10), dataInPerson);

    const dataVirtual = data.filter(d => d.treatmentType === "Virtual treatment");
    const densityVirtual = kde(kernelEpanechnikov(30), d3.range(100, 400, 10), dataVirtual);

    // Function to get jitter values based on density
    const getJitter = (d, densities) => {
      const closestDensity = densities.reduce((prev, curr) =>
        Math.abs(curr[0] - d.survivalDays) < Math.abs(prev[0] - d.survivalDays) ? curr : prev
      );
      const maxDensity = d3.max(densities, d => d[1]);
      return (closestDensity[1] / maxDensity) * (xScale.bandwidth() / 2);
    };

    // Plotting dots for In-person treatment (Green)
    svg.selectAll(".dot-inperson")
      .data(dataInPerson)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const jitter = getJitter(d, densityInPerson);
        return xScale("In-person treatment") + xScale.bandwidth() / 2 + jitter; // Spread symmetrically
      })
      .attr("cy", d => yScale(d.survivalDays))
      .attr("r", 5)
      .attr("fill", "#adf802") // Green color for In-person treatment
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-weight: normal;">Patient ID</div><div style="font-weight: bold;">${d.patientID}</div>
              <div style="font-weight: normal;">Age</div><div style="font-weight: bold;">${d.age}</div>
              <div style="font-weight: normal;">Sex</div><div style="font-weight: bold;">${d.sex}</div>
              <div style="font-weight: normal;">Treatment Type</div><div style="font-weight: bold;">${d.treatmentType}</div>
              <div style="font-weight: normal;">Survival Days</div><div style="font-weight: bold;">${d.survivalDays}</div>
            </div>
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

    // Plotting dots for Virtual treatment (Purple)
    svg.selectAll(".dot-virtual")
      .data(dataVirtual)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const jitter = getJitter(d, densityVirtual);
        return xScale("Virtual treatment") + xScale.bandwidth() / 2 - jitter; // Spread symmetrically
      })
      .attr("cy", d => yScale(d.survivalDays))
      .attr("r", 5)
      .attr("fill", "#e78bf5") // Purple color for Virtual treatment
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip
          .style("display", "block")
          .html(`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div style="font-weight: normal;">Patient ID</div><div style="font-weight: bold;">${d.patientID}</div>
              <div style="font-weight: normal;">Age</div><div style="font-weight: bold;">${d.age}</div>
              <div style="font-weight: normal;">Sex</div><div style="font-weight: bold;">${d.sex}</div>
              <div style="font-weight: normal;">Treatment Type</div><div style="font-weight: bold;">${d.treatmentType}</div>
              <div style="font-weight: normal;">Survival Days</div><div style="font-weight: bold;">${d.survivalDays}</div>
            </div>
          `);
      })
      .on("mousemove", (event) => {
        tooltip
          .style("left", event.pageX + 10 + "px")
          .style("top", event.pageY + 10 + "px");
      })
      .on("mouseout", () => {
        tooltip.style("display", "none");
      });

  }, [data]);

  return <svg ref={svgRef} width={500} height={300}></svg>;
}

export default function App() {
    const data = [
        { patientID: 1, age: 47, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 288, income: "$55,235.00", educationYears: 13, bmi: 27.5, smokingYears: 0, physicalActivity: 2 },
        { patientID: 2, age: 57, sex: "Female", treatmentType: "In-person treatment", survivalDays: 265, income: "$25,497.00", educationYears: 14, bmi: 25.2, smokingYears: 0, physicalActivity: 1 },
        { patientID: 3, age: 46, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 334, income: "$92,387.00", educationYears: 17, bmi: 21.1, smokingYears: 0, physicalActivity: 0 },
        { patientID: 4, age: 46, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 267, income: "$63,088.00", educationYears: 13, bmi: 21.1, smokingYears: 15, physicalActivity: 0 },
        { patientID: 5, age: 59, sex: "Male", treatmentType: "In-person treatment", survivalDays: 217, income: "$69,601.00", educationYears: 16, bmi: 24.0, smokingYears: 10, physicalActivity: 2 },
        { patientID: 6, age: 72, sex: "Female", treatmentType: "In-person treatment", survivalDays: 251, income: "$59,182.00", educationYears: 12, bmi: 30.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 7, age: 42, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 255, income: "$87,348.00", educationYears: 16, bmi: 24.2, smokingYears: 0, physicalActivity: 2 },
        { patientID: 8, age: 43, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 315, income: "$64,791.00", educationYears: 17, bmi: 20.5, smokingYears: 0, physicalActivity: 1 },
        { patientID: 9, age: 73, sex: "Male", treatmentType: "In-person treatment", survivalDays: 198, income: "$27,388.00", educationYears: 10, bmi: 24.3, smokingYears: 0, physicalActivity: 3 },
        { patientID: 10, age: 43, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 334, income: "$86,961.00", educationYears: 13, bmi: 24.2, smokingYears: 15, physicalActivity: 1 },
        { patientID: 11, age: 61, sex: "Female", treatmentType: "In-person treatment", survivalDays: 234, income: "$69,164.00", educationYears: 16, bmi: 18.0, smokingYears: 0, physicalActivity: 4 },
        { patientID: 12, age: 58, sex: "Female", treatmentType: "In-person treatment", survivalDays: 225, income: "$36,503.00", educationYears: 14, bmi: 24.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 13, age: 21, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 329, income: "$58,446.00", educationYears: 15, bmi: 24.3, smokingYears: 0, physicalActivity: 1 },
        { patientID: 14, age: 53, sex: "Female", treatmentType: "In-person treatment", survivalDays: 289, income: "$33,519.00", educationYears: 13, bmi: 27.1, smokingYears: 0, physicalActivity: 0 },
        { patientID: 15, age: 54, sex: "Male", treatmentType: "In-person treatment", survivalDays: 204, income: "$58,433.00", educationYears: 15, bmi: 30.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 16, age: 71, sex: "Female", treatmentType: "In-person treatment", survivalDays: 305, income: "$83,878.00", educationYears: 14, bmi: 28.4, smokingYears: 0, physicalActivity: 1 },
        { patientID: 17, age: 51, sex: "Male", treatmentType: "In-person treatment", survivalDays: 365, income: "$35,356.00", educationYears: 17, bmi: 24.2, smokingYears: 0, physicalActivity: 2 },
        { patientID: 18, age: 24, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 319, income: "$75,201.00", educationYears: 15, bmi: 21.7, smokingYears: 0, physicalActivity: 4 },
        { patientID: 19, age: 51, sex: "Male", treatmentType: "In-person treatment", survivalDays: 186, income: "$46,743.00", educationYears: 15, bmi: 30.0, smokingYears: 0, physicalActivity: 1 },
        { patientID: 20, age: 55, sex: "Female", treatmentType: "In-person treatment", survivalDays: 241, income: "$40,178.00", educationYears: 14, bmi: 25.2, smokingYears: 0, physicalActivity: 0 },
        { patientID: 21, age: 41, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 360, income: "$79,444.00", educationYears: 14, bmi: 25.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 22, age: 77, sex: "Female", treatmentType: "In-person treatment", survivalDays: 221, income: "$34,118.00", educationYears: 14, bmi: 24.9, smokingYears: 0, physicalActivity: 1 },
        { patientID: 23, age: 34, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 278, income: "$89,681.00", educationYears: 15, bmi: 25.6, smokingYears: 0, physicalActivity: 0 },
        { patientID: 24, age: 62, sex: "Male", treatmentType: "In-person treatment", survivalDays: 304, income: "$30,053.00", educationYears: 14, bmi: 24.6, smokingYears: 0, physicalActivity: 0 },
        { patientID: 25, age: 53, sex: "Female", treatmentType: "In-person treatment", survivalDays: 213, income: "$109,118.00", educationYears: 15, bmi: 23.3, smokingYears: 0, physicalActivity: 0 },
        { patientID: 26, age: 36, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 338, income: "$125,982.00", educationYears: 18, bmi: 23.4, smokingYears: 0, physicalActivity: 0 },
        { patientID: 27, age: 52, sex: "Male", treatmentType: "In-person treatment", survivalDays: 101, income: "$42,506.00", educationYears: 16, bmi: 24.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 28, age: 28, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 287, income: "$92,051.00", educationYears: 14, bmi: 23.4, smokingYears: 20, physicalActivity: 0 },
        { patientID: 29, age: 61, sex: "Male", treatmentType: "In-person treatment", survivalDays: 247, income: "$57,191.00", educationYears: 17, bmi: 22.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 30, age: 52, sex: "Female", treatmentType: "In-person treatment", survivalDays: 195, income: "$54,475.00", educationYears: 14, bmi: 25.3, smokingYears: 0, physicalActivity: 0 },
        { patientID: 31, age: 65, sex: "Male", treatmentType: "In-person treatment", survivalDays: 341, income: "$75,354.00", educationYears: 10, bmi: 24.2, smokingYears: 0, physicalActivity: 4 },
        { patientID: 32, age: 46, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 358, income: "$80,377.00", educationYears: 12, bmi: 29.5, smokingYears: 0, physicalActivity: 0 },
        { patientID: 33, age: 55, sex: "Male", treatmentType: "In-person treatment", survivalDays: 233, income: "$46,737.00", educationYears: 11, bmi: 18.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 34, age: 54, sex: "Female", treatmentType: "In-person treatment", survivalDays: 269, income: "$45,604.00", educationYears: 14, bmi: 28.3, smokingYears: 0, physicalActivity: 1 },
        { patientID: 35, age: 28, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 282, income: "$80,735.00", educationYears: 15, bmi: 28.7, smokingYears: 0, physicalActivity: 0 },
        { patientID: 36, age: 59, sex: "Female", treatmentType: "In-person treatment", survivalDays: 192, income: "$20,000.00", educationYears: 18, bmi: 18.8, smokingYears: 0, physicalActivity: 3 },
        { patientID: 37, age: 41, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 311, income: "$123,534.00", educationYears: 15, bmi: 24.0, smokingYears: 0, physicalActivity: 1 },
        { patientID: 38, age: 65, sex: "Male", treatmentType: "In-person treatment", survivalDays: 270, income: "$94,171.00", educationYears: 14, bmi: 23.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 39, age: 63, sex: "Male", treatmentType: "In-person treatment", survivalDays: 215, income: "$101,124.00", educationYears: 16, bmi: 20.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 40, age: 32, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 338, income: "$56,979.00", educationYears: 10, bmi: 22.7, smokingYears: 0, physicalActivity: 2 },
        { patientID: 41, age: 40, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 309, income: "$106,169.00", educationYears: 15, bmi: 21.7, smokingYears: 0, physicalActivity: 3 },
        { patientID: 42, age: 45, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 357, income: "$85,500.00", educationYears: 16, bmi: 30.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 43, age: 54, sex: "Male", treatmentType: "In-person treatment", survivalDays: 259, income: "$136,972.00", educationYears: 12, bmi: 27.8, smokingYears: 0, physicalActivity: 1 },
        { patientID: 44, age: 64, sex: "Female", treatmentType: "In-person treatment", survivalDays: 238, income: "$87,989.00", educationYears: 17, bmi: 28.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 45, age: 62, sex: "Female", treatmentType: "In-person treatment", survivalDays: 272, income: "$56,802.00", educationYears: 15, bmi: 27.2, smokingYears: 0, physicalActivity: 4 },
        { patientID: 46, age: 70, sex: "Male", treatmentType: "In-person treatment", survivalDays: 293, income: "$36,111.00", educationYears: 14, bmi: 21.6, smokingYears: 5, physicalActivity: 0 },
        { patientID: 47, age: 65, sex: "Female", treatmentType: "In-person treatment", survivalDays: 337, income: "$20,000.00", educationYears: 16, bmi: 23.4, smokingYears: 0, physicalActivity: 3 },
        { patientID: 48, age: 40, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 321, income: "$64,227.00", educationYears: 18, bmi: 26.5, smokingYears: 0, physicalActivity: 1 },
        { patientID: 49, age: 49, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 305, income: "$57,226.00", educationYears: 15, bmi: 21.3, smokingYears: 0, physicalActivity: 1 },
        { patientID: 50, age: 55, sex: "Female", treatmentType: "In-person treatment", survivalDays: 170, income: "$24,443.00", educationYears: 15, bmi: 27.1, smokingYears: 0, physicalActivity: 1 },
        { patientID: 51, age: 34, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 327, income: "$90,252.00", educationYears: 14, bmi: 24.3, smokingYears: 0, physicalActivity: 0 },
        { patientID: 52, age: 55, sex: "Male", treatmentType: "In-person treatment", survivalDays: 287, income: "$32,961.00", educationYears: 13, bmi: 23.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 53, age: 73, sex: "Female", treatmentType: "In-person treatment", survivalDays: 274, income: "$102,178.00", educationYears: 16, bmi: 27.1, smokingYears: 15, physicalActivity: 0 },
        { patientID: 54, age: 31, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 265, income: "$62,692.00", educationYears: 13, bmi: 26.3, smokingYears: 0, physicalActivity: 0 },
        { patientID: 55, age: 20, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 294, income: "$53,047.00", educationYears: 15, bmi: 23.9, smokingYears: 20, physicalActivity: 1 },
        { patientID: 56, age: 30, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 334, income: "$94,757.00", educationYears: 14, bmi: 28.5, smokingYears: 0, physicalActivity: 0 },
        { patientID: 57, age: 73, sex: "Male", treatmentType: "In-person treatment", survivalDays: 232, income: "$61,934.00", educationYears: 15, bmi: 21.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 58, age: 62, sex: "Male", treatmentType: "In-person treatment", survivalDays: 299, income: "$38,467.00", educationYears: 15, bmi: 26.8, smokingYears: 0, physicalActivity: 4 },
        { patientID: 59, age: 48, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 318, income: "$115,383.00", educationYears: 17, bmi: 26.8, smokingYears: 10, physicalActivity: 2 },
        { patientID: 60, age: 45, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 319, income: "$65,924.00", educationYears: 13, bmi: 24.1, smokingYears: 0, physicalActivity: 3 },
        { patientID: 61, age: 51, sex: "Female", treatmentType: "In-person treatment", survivalDays: 303, income: "$34,068.00", educationYears: 14, bmi: 26.0, smokingYears: 5, physicalActivity: 4 },
        { patientID: 62, age: 51, sex: "Male", treatmentType: "In-person treatment", survivalDays: 271, income: "$55,241.00", educationYears: 13, bmi: 21.2, smokingYears: 0, physicalActivity: 0 },
        { patientID: 63, age: 55, sex: "Female", treatmentType: "In-person treatment", survivalDays: 304, income: "$38,109.00", educationYears: 14, bmi: 27.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 64, age: 72, sex: "Female", treatmentType: "In-person treatment", survivalDays: 295, income: "$25,430.00", educationYears: 15, bmi: 24.4, smokingYears: 5, physicalActivity: 1 },
        { patientID: 65, age: 27, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 319, income: "$32,167.00", educationYears: 16, bmi: 23.4, smokingYears: 0, physicalActivity: 1 },
        { patientID: 66, age: 39, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 321, income: "$62,018.00", educationYears: 13, bmi: 28.1, smokingYears: 0, physicalActivity: 0 },
        { patientID: 67, age: 63, sex: "Male", treatmentType: "In-person treatment", survivalDays: 293, income: "$25,035.00", educationYears: 16, bmi: 22.9, smokingYears: 0, physicalActivity: 2 },
        { patientID: 68, age: 43, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 339, income: "$81,409.00", educationYears: 17, bmi: 20.8, smokingYears: 30, physicalActivity: 0 },
        { patientID: 69, age: 23, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 271, income: "$66,498.00", educationYears: 15, bmi: 20.3, smokingYears: 20, physicalActivity: 0 },
        { patientID: 70, age: 54, sex: "Female", treatmentType: "In-person treatment", survivalDays: 265, income: "$47,821.00", educationYears: 18, bmi: 26.8, smokingYears: 0, physicalActivity: 1 },
        { patientID: 71, age: 44, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 327, income: "$47,971.00", educationYears: 13, bmi: 21.2, smokingYears: 0, physicalActivity: 1 },
        { patientID: 72, age: 39, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 318, income: "$75,728.00", educationYears: 12, bmi: 30.0, smokingYears: 15, physicalActivity: 1 },
        { patientID: 73, age: 57, sex: "Female", treatmentType: "In-person treatment", survivalDays: 282, income: "$61,213.00", educationYears: 11, bmi: 18.8, smokingYears: 0, physicalActivity: 0 },
        { patientID: 74, age: 37, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 365, income: "$95,433.00", educationYears: 17, bmi: 30.0, smokingYears: 0, physicalActivity: 2 },
        { patientID: 75, age: 51, sex: "Female", treatmentType: "In-person treatment", survivalDays: 259, income: "$66,761.00", educationYears: 16, bmi: 25.6, smokingYears: 15, physicalActivity: 0 },
        { patientID: 76, age: 45, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 343, income: "$46,260.00", educationYears: 14, bmi: 24.7, smokingYears: 0, physicalActivity: 0 },
        { patientID: 77, age: 42, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 343, income: "$33,976.00", educationYears: 15, bmi: 23.4, smokingYears: 0, physicalActivity: 2 },
        { patientID: 78, age: 64, sex: "Male", treatmentType: "In-person treatment", survivalDays: 298, income: "$37,310.00", educationYears: 12, bmi: 26.2, smokingYears: 0, physicalActivity: 4 },
        { patientID: 79, age: 47, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 305, income: "$89,969.00", educationYears: 18, bmi: 24.9, smokingYears: 15, physicalActivity: 2 },
        { patientID: 80, age: 54, sex: "Female", treatmentType: "In-person treatment", survivalDays: 271, income: "$78,884.00", educationYears: 15, bmi: 28.3, smokingYears: 25, physicalActivity: 2 },
        { patientID: 81, age: 53, sex: "Male", treatmentType: "In-person treatment", survivalDays: 291, income: "$72,522.00", educationYears: 15, bmi: 25.3, smokingYears: 20, physicalActivity: 1 },
        { patientID: 82, age: 33, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 305, income: "$83,470.00", educationYears: 16, bmi: 25.5, smokingYears: 0, physicalActivity: 1 },
        { patientID: 83, age: 32, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 289, income: "$115,378.00", educationYears: 15, bmi: 23.9, smokingYears: 10, physicalActivity: 0 },
        { patientID: 84, age: 50, sex: "Female", treatmentType: "In-person treatment", survivalDays: 252, income: "$78,784.00", educationYears: 15, bmi: 24.8, smokingYears: 5, physicalActivity: 0 },
        { patientID: 85, age: 37, sex: "Male", treatmentType: "In-person treatment", survivalDays: 266, income: "$20,000.00", educationYears: 13, bmi: 25.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 86, age: 42, sex: "Male", treatmentType: "In-person treatment", survivalDays: 288, income: "$73,584.00", educationYears: 15, bmi: 19.9, smokingYears: 5, physicalActivity: 0 },
        { patientID: 87, age: 48, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 329, income: "$72,531.00", educationYears: 18, bmi: 21.0, smokingYears: 0, physicalActivity: 1 },
        { patientID: 88, age: 40, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 264, income: "$109,147.00", educationYears: 17, bmi: 27.2, smokingYears: 0, physicalActivity: 0 },
        { patientID: 89, age: 42, sex: "Female", treatmentType: "In-person treatment", survivalDays: 208, income: "$40,918.00", educationYears: 18, bmi: 25.5, smokingYears: 0, physicalActivity: 0 },
        { patientID: 90, age: 49, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 344, income: "$121,058.00", educationYears: 13, bmi: 24.4, smokingYears: 0, physicalActivity: 0 },
        { patientID: 91, age: 20, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 316, income: "$51,052.00", educationYears: 13, bmi: 25.1, smokingYears: 0, physicalActivity: 1 },
        { patientID: 92, age: 45, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 275, income: "$100,581.00", educationYears: 14, bmi: 26.0, smokingYears: 0, physicalActivity: 0 },
        { patientID: 93, age: 39, sex: "Male", treatmentType: "In-person treatment", survivalDays: 291, income: "$66,493.00", educationYears: 15, bmi: 23.4, smokingYears: 0, physicalActivity: 2 },
        { patientID: 94, age: 45, sex: "Female", treatmentType: "In-person treatment", survivalDays: 288, income: "$37,392.00", educationYears: 17, bmi: 22.7, smokingYears: 0, physicalActivity: 0 },
        { patientID: 95, age: 44, sex: "Female", treatmentType: "In-person treatment", survivalDays: 257, income: "$75,964.00", educationYears: 11, bmi: 25.6, smokingYears: 0, physicalActivity: 0 },
        { patientID: 96, age: 28, sex: "Male", treatmentType: "In-person treatment", survivalDays: 221, income: "$20,000.00", educationYears: 18, bmi: 22.1, smokingYears: 0, physicalActivity: 1 },
        { patientID: 97, age: 20, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 314, income: "$71,917.00", educationYears: 14, bmi: 26.2, smokingYears: 0, physicalActivity: 2 },
        { patientID: 98, age: 46, sex: "Female", treatmentType: "Virtual treatment", survivalDays: 293, income: "$101,526.00", educationYears: 14, bmi: 19.9, smokingYears: 0, physicalActivity: 0 },
        { patientID: 99, age: 42, sex: "Male", treatmentType: "Virtual treatment", survivalDays: 365, income: "$125,070.00", educationYears: 12, bmi: 28.1, smokingYears: 0, physicalActivity: 1 },
        { patientID: 100, age: 46, sex: "Male", treatmentType: "In-person treatment", survivalDays: 249, income: "$61,184.00", educationYears: 11, bmi: 26.4, smokingYears: 0, physicalActivity: 1 }
      ];
    

  return <TreatmentPlot data={data} />;
}
