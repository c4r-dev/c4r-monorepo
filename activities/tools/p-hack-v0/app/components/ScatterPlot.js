import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';
import { Box, Typography } from '@mui/material';

export default function ScatterPlot({ selectedX, selectedY }) {
  const svgRef = useRef();

  useEffect(() => {
    const data = Array.from({ length: 100 }, () => ({
      x: Math.random() * 100,
      y: Math.random() * 100,
    }));

    const svg = d3.select(svgRef.current);
    svg.selectAll('*').remove();

    const width = 500;
    const height = 500;
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };

    const xScale = d3.scaleLinear().domain([0, 100]).range([margin.left, width - margin.right]);
    const yScale = d3.scaleLinear().domain([0, 100]).range([height - margin.bottom, margin.top]);

    // Draw X and Y axes
    svg.append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10));

    svg.append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10));

    // Draw scatter plot points
    svg.selectAll('circle')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', d => xScale(d.x))
      .attr('cy', d => yScale(d.y))
      .attr('r', 5)
      .style('fill', 'orange');

    // Calculate the linear regression line
    const xMean = d3.mean(data, d => d.x);
    const yMean = d3.mean(data, d => d.y);

    const numerator = d3.sum(data, d => (d.x - xMean) * (d.y - yMean));
    const denominator = d3.sum(data, d => (d.x - xMean) ** 2);
    const slope = numerator / denominator;
    const intercept = yMean - slope * xMean;

    // Define the start and end points of the regression line
    const xStart = 0;
    const yStart = slope * xStart + intercept;
    const xEnd = 100;
    const yEnd = slope * xEnd + intercept;

    // Draw the regression line
    svg.append('line')
      .attr('x1', xScale(xStart))
      .attr('y1', yScale(yStart))
      .attr('x2', xScale(xEnd))
      .attr('y2', yScale(yEnd))
      .attr('stroke', 'black')
      .attr('stroke-width', 2);

  }, [selectedX, selectedY]);

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" alignItems="center">
        <Typography variant="body1" style={{ writingMode: 'vertical-rl', transform: 'rotate(180deg)', marginRight: '10px', fontWeight: 'bold' }}>
          Variable ------&gt;
        </Typography>
        <Box ref={svgRef} width={500} height={500} component="svg"></Box>
      </Box>
      <Typography variant="body1" style={{ marginTop: '10px', fontWeight: 'bold' }}>
        Choice ------&gt;
      </Typography>
    </Box>
  );
}
