import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const CustomSVGPlot = () => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.attr("width", 288).attr("height", 288).style("background", "#FFF");

    // Define margins, width, and height
    const margin = { top: 20, right: 20, bottom: 40, left: 50 };
    const width = 288 - margin.left - margin.right;
    const height = 288 - margin.top - margin.bottom;

    // Clear previous contents
    svg.selectAll("*").remove();

    const g = svg
      .append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    // Scales
    const xScale = d3.scaleLinear().domain([0, 80]).range([0, width]);
    const yScale = d3.scaleLinear().domain([0, 300]).range([height, 0]);

    // Axes
    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(xScale).ticks(4));
    g.append("g").call(d3.axisLeft(yScale).ticks(4));

    // Circles for data points
    const circles = [
      { cx: 49.27, cy: 83.38 },
      { cx: 49.27, cy: 103.24 },
      { cx: 49.27, cy: 43.65 },
      { cx: 50.27, cy: 43.65 },
      // add other points as needed
    ];

    g.selectAll("circle")
      .data(circles)
      .enter()
      .append("circle")
      .attr("cx", (d) => xScale(d.cx))
      .attr("cy", (d) => yScale(d.cy))
      .attr("r", 2.49)
      .attr("fill", "black");

    // Polylines (adding sample polyline points, replicate as needed)
    const polylineData1 = [
      [49.27, 79.10],
      [52.08, 79.12],
      [54.89, 79.11],
      [57.71, 79.08],
      [60.52, 79.03],
      // add more points as necessary
    ];
    g.append("polyline")
      .attr("points", polylineData1.map(([x, y]) => [xScale(x), yScale(y)]))
      .attr("stroke", "#3366FF")
      .attr("stroke-width", 2.13)
      .attr("fill", "none");

    // X-axis label
    svg
      .append("text")
      .attr("x", width / 2 + margin.left)
      .attr("y", height + margin.top + 40)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text("Smoking History");

    // Y-axis label
    svg
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("x", -height / 2 - margin.top)
      .attr("y", margin.left / 3)
      .attr("text-anchor", "middle")
      .attr("font-size", "11px")
      .text("Survival (in days)");

  }, []);

  return <svg ref={svgRef}></svg>;
};

export default CustomSVGPlot;
