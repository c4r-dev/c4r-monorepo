import React, { useRef, useEffect } from "react";
import * as d3 from "d3";

const ActivityPlot = ({ data }) => {
  const svgRef = useRef();

  useEffect(() => {
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove(); // Clear previous contents
    
    const width = 400;
    const height = 400;
    const margin = { top: 20, right: 30, bottom: 60, left: 50 };

    // Set up scales
    const xScale = d3
      .scaleBand()
      .domain([...new Set(data.map(d => d["Treatment Type"]))])
      .range([margin.left, width - margin.right])
      .padding(0.3);

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(data, d => d["Physical Activity Level"])])
      .nice()
      .range([height - margin.bottom, margin.top]);

    const colorScale = d3.scaleOrdinal()
      .domain(["In-person", "Virtual"])
      .range(["#1f77b4", "#ff7f0e"]);

    // Add axes
    svg.append("g")
      .attr("transform", `translate(0,${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    svg.append("g")
      .attr("transform", `translate(${margin.left},0)`)
      .call(d3.axisLeft(yScale));

    // Jittered dots for physical activity levels
    svg.selectAll(".dot")
      .data(data)
      .enter()
      .append("circle")
      .attr("class", "dot")
      .attr("cx", d => xScale(d["Treatment Type"]) + Math.random() * 20 - 10) // Random jitter
      .attr("cy", d => yScale(d["Physical Activity Level"]))
      .attr("r", 3)
      .attr("fill", d => colorScale(d["Treatment Type"]))
      .attr("opacity", 0.5);

    // Median line
    const medians = d3.rollups(
      data,
      v => d3.median(v, d => d["Physical Activity Level"]),
      d => d["Treatment Type"]
    );

    svg.selectAll(".median-line")
      .data(medians)
      .enter()
      .append("line")
      .attr("class", "median-line")
      .attr("x1", d => xScale(d[0]) - xScale.bandwidth() / 2 + 10)
      .attr("x2", d => xScale(d[0]) + xScale.bandwidth() / 2 - 10)
      .attr("y1", d => yScale(d[1]))
      .attr("y2", d => yScale(d[1]))
      .attr("stroke", "black")
      .attr("stroke-width", 2);

    // Median labels
    svg.selectAll(".median-label")
      .data(medians)
      .enter()
      .append("text")
      .attr("class", "median-label")
      .attr("x", d => xScale(d[0]) + xScale.bandwidth() / 2 + 20)
      .attr("y", d => yScale(d[1]) - 5)
      .attr("fill", "purple")
      .text(d => d[1]?.toFixed(1));

    // Labels
    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(${width / 2},${height - 10})`)
      .text("Treatment Type");

    svg.append("text")
      .attr("text-anchor", "middle")
      .attr("transform", `translate(15,${height / 2})rotate(-90)`)
      .text("Physical Activity Level (hours per day)");

  }, [data]);

  return (
    <svg ref={svgRef} width={400} height={400}></svg>
  );
};

export default ActivityPlot;
