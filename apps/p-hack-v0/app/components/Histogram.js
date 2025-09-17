// import React, { useEffect, useRef } from 'react';
// import * as d3 from 'd3';
// import { Box } from '@mui/material';

// export default function Histogram({ data }) {
//   const svgRef = useRef();

//   useEffect(() => {
//     const svg = d3.select(svgRef.current);
//     svg.selectAll('*').remove(); // Clear previous chart

//     const width = 500;
//     const height = 300;
//     const margin = { top: 20, right: 30, bottom: 30, left: 40 };

//     // Set up scales
//     const xScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(data)])
//       .range([margin.left, width - margin.right]);

//     const histogram = d3
//       .histogram()
//       .domain(xScale.domain())
//       .thresholds(xScale.ticks(20)); // Number of bins

//     const bins = histogram(data);

//     const yScale = d3
//       .scaleLinear()
//       .domain([0, d3.max(bins, d => d.length)])
//       .range([height - margin.bottom, margin.top]);

//     // Draw bars
//     svg
//       .selectAll('rect')
//       .data(bins)
//       .enter()
//       .append('rect')
//       .attr('x', d => xScale(d.x0) + 1)
//       .attr('y', d => yScale(d.length))
//       .attr('width', d => xScale(d.x1) - xScale(d.x0) - 1)
//       .attr('height', d => yScale(0) - yScale(d.length))
//       .style('fill', 'orange');

//     // Add axes
//     svg
//       .append('g')
//       .attr('transform', `translate(0,${height - margin.bottom})`)
//       .call(d3.axisBottom(xScale).ticks(20));

//     svg
//       .append('g')
//       .attr('transform', `translate(${margin.left},0)`)
//       .call(d3.axisLeft(yScale));
//   }, [data]);

//   return <Box ref={svgRef} component="svg" width={500} height={300}></Box>;
// }


import React, { useEffect, useRef, useState } from 'react';
import * as Plot from '@observablehq/plot';

const InterleavedHistogram = ({ data, showMale, showFemale, setShowMale, setShowFemale }) => {
  const plotRef = useRef(null);

  // State to control the visibility of male and female data
//   const [showMale, setShowMale] = useState(true);
//   const [showFemale, setShowFemale] = useState(true);

  useEffect(() => {
    if (plotRef.current) {
      // Clear any existing plot in case of re-render
      plotRef.current.innerHTML = '';
    }

    // Define the marks based on the state
    const marks = [];
    if (showMale) {
      marks.push(
        Plot.rectY(
          data,
          Plot.binX(
            { y: "count" },
            { filter: (d) => d.sex === "male", x: "weight", fill: "sex", insetLeft: 2 }
          )
        )
      );
    }
    if (showFemale) {
      marks.push(
        Plot.rectY(
          data,
          Plot.binX(
            { y: "count" },
            { filter: (d) => d.sex === "female", x: "weight", fill: "sex", insetRight: 2 }
          )
        )
      );
    }

    // Create the plot and append it to the ref
    const plot = Plot.plot({
      round: true,
      color: {
        legend: true,
        domain: ["male", "female"],
        range: ["#fbb040", "#377eb8"]
      },
      marks: [...marks, Plot.ruleY([0])], // Include only the selected marks
      x: {
        label: "Weight",
        grid: true
      },
      y: {
        label: "Frequency",
        grid: true
      }
    });

    // Append the plot to the DOM
    plotRef.current.appendChild(plot);

    // Cleanup function to remove the plot on component unmount
    return () => {
      if (plotRef.current && plotRef.current.contains(plot)) {
        plotRef.current.removeChild(plot);
      }
    };
  }, [data, showMale, showFemale]); // Re-render when showMale or showFemale changes

  return (
    <div>
     
      <div ref={plotRef}></div>
    </div>
  );
};

export default InterleavedHistogram;


