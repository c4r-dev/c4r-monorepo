import React, { useEffect, useRef } from "react";
import * as d3 from "d3";

const ScatterPlot = ({ data, yLabel }) => {
  const svgRef = useRef();
  const tooltipRef = useRef();

  useEffect(() => {
    const svg = d3
      .select(svgRef.current)
      .attr("width", 500)
      .attr("height", 400)
      .style("overflow", "visible");

    const tooltip = d3
      .select(tooltipRef.current)
      .style("position", "absolute")
      .style("background", "white")
      .style("border", "1px solid #ccc")
      .style("padding", "8px")
      .style("border-radius", "4px")
      .style("pointer-events", "none")
      .style("display", "none") // Initially hidden
      .style("z-index", "10"); // Ensure it appears above other elements

    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 500 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    const x = d3.scaleLinear().domain([0, 40]).range([0, width]);
    const y = d3.scaleLinear().domain([0, 100]).range([height, 0]);

    const color = d3
      .scaleOrdinal()
      .domain(["In-person treatment", "Virtual treatment"])
      .range(["lime", "magenta"]);

    g.append("g")
      .attr("transform", `translate(0, ${height})`)
      .call(d3.axisBottom(x).ticks(5));
    g.append("g").call(d3.axisLeft(y).ticks(5));

    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 30)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text("Survival in days");

    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", margin.left / 3)
      .attr("x", -height / 2 - margin.top)
      .attr("text-anchor", "middle")
      .attr("font-size", "16px")
      .text(yLabel.charAt(0).toUpperCase() + yLabel.slice(1));

    const jitterAmount = 35;

    svg
      .selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("cx", (d) => {
        const survival = Math.min(Math.max(d[yLabel], 0), 40); // Keep x within 0-40
        return x(survival);
      })
      .attr("cy", (d) => {
        const idealY = 100 - (100 / 40) * d[yLabel];
        const jitteredY = idealY + (Math.random() - 0.5) * jitterAmount;
        return y(Math.max(0, Math.min(jitteredY, 100))); // Keep y within 0-100
      })
      .attr("r", 5)
      .attr("fill", (d) => color(d[yLabel]))
      .attr("opacity", 0.8)
      .on("mouseover", (event, d) => {
        tooltip.style("display", "block").html(`
                  <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
                    <div><strong>Patient ID</strong></div><div>${d.patientID}</div>
                    <div><strong>Age</strong></div><div>${d.age}</div>
                    <div><strong>Sex</strong></div><div>${d.sex}</div>
                    <div><strong>Treatment Type</strong></div><div>${d.treatmentType}</div>
                    <div><strong>Income</strong></div><div>${d.income}</div>
                    <div><strong>Education Years</strong></div><div>${d.educationYears}</div>
                    <div><strong>BMI</strong></div><div>${d.bmi}</div>
                    <div><strong>Smoking History</strong></div><div>${d.smokingYears} years</div>
                    <div><strong>Physical Activity</strong></div><div>${d.physicalActivity} hours/day</div>
                  </div>
              `);
      })
      .on("mousemove", (event) => {
        const svgRect = svgRef.current.getBoundingClientRect();
        const tooltipX = event.clientX - svgRect.left + 10;
        const tooltipY = event.clientY - svgRect.top + 10;

        tooltip.style("left", `${tooltipX}px`).style("top", `${tooltipY}px`);
      })
      .on("mouseout", () => {
        tooltip.style("display", "none"); // Hide the tooltip when the mouse leaves a point
      })
      .on("mouseleave", () => {
        tooltip.style("display", "none"); // Hide the tooltip when leaving the entire SVG area
      });
    g.append("line")
      .attr("x1", x(3))
      .attr("y1", y(95))
      .attr("x2", x(37))
      .attr("y2", y(3))
      .attr("stroke", "blue")
      .attr("stroke-width", 1.5);

    // Adding a dashed vertical line at the end of the x-axis
    g.append("line")
      .attr("x1", x(40)) // Position at the end of the x-axis (40 based on your domain)
      .attr("y1", y(0)) // Starting from the bottom of the y-axis
      .attr("x2", x(40)) // Keep x constant to make it a vertical line
      .attr("y2", y(100)) // Extending to the top of the y-axis
      .attr("stroke", "gray")
      .attr("stroke-width", 1.5)
      .attr("stroke-dasharray", "4 4"); // Creates the dashed effect
  }, [data,yLabel]);

  return (
    <div style={{ position: "relative" }}>
      <svg ref={svgRef}></svg>
      <div ref={tooltipRef}></div>
    </div>
  );
};

export default ScatterPlot;
