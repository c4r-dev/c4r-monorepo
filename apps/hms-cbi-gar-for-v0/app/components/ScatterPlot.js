import React, { useEffect, useRef } from 'react'
import * as d3 from 'd3'
import { Box, Typography } from '@mui/material'

export default function ScatterPlot({
  data,
  selectedX,
  selectedY,
  onCorrelationChange,
}) {
  const svgRef = useRef()

  const axisLabels = {
    exercise: "Exercise (average # of minutes)",
    conversation: "Text / Phone Conversations (average # of minutes)",
    walking: "Walking (average # of minutes)",
    sleep: "Sleep (average # of hours)",
    socializing: "Socializing (average # of people)",
    deadlines: "Course Deadlines (average #)",
    loneliness: "UCLA Loneliness Scale (higher = lonelier)",
    flourishing: "Flourishing Scale (higher = more self-perceived success)",
    happiness: "Happiness (higher = happier)",
    sadness: "Sadness (higher = sadder)",
    stress: "Stress (higher =  more stressed)",
    gpa_qtr: "Grade Point Average (Spring 2013 quarter)",
    grade_cs65: "Grade (CS 65 class)",
  };

  useEffect(() => {
    if (!data.length || !selectedY || !selectedX) {
      console.warn('No data available or no variables selected')
      return
    }

    // Manually define min and max for each x and y variable
    const axisRanges = {
      x: {
        min: {
          exercise: -11.25,
          conversation: 51.729,
          walking: -7.8,
          sleep: 4.4614,
          socializing: -4,
          deadlines: -0.0188,
        },
        max: {
          exercise: 123.75,
          conversation: 545.649,
          walking: 85.8,
          sleep: 9.7246,
          socializing: 44,
          deadlines: 1.2988,
        },
      },
      y: {
        min: {
          loneliness: 22.2,
          flourishing: 12,
          happiness: -0.3,
          sadness: -0.32,
          stress: 1.8708,
          gpa_qtr: 0.8221,
          grade_cs65: 2.1663,
        },
        max: {
          loneliness: 67.8,
          flourishing: 60,
          happiness: 3.3,
          sadness: 3.52,
          stress: 5.1372,
          gpa_qtr: 4.2889,
          grade_cs65: 4.1667,
        },
      },
    }

    // Assign specific min and max values for the selected variables
    const xMin = axisRanges.x.min[selectedY]
    const xMax = axisRanges.x.max[selectedY]
    const yMin = axisRanges.y.min[selectedX]
    const yMax = axisRanges.y.max[selectedX]

    // Filtered data
    const filteredData = data
      .map((d) => ({
        x: d[selectedY],
        y: d[selectedX],
      }))
      .filter((d) => d.y != null && d.x != null)

    const svg = d3.select(svgRef.current)
    svg.selectAll('*').remove()

    const width = 500
    const height = 500
    const margin = { top: 40, right: 30, bottom: 50, left: 60 }

    // Define scales using the manually assigned ranges
    const xScale = d3
      .scaleLinear()
      .domain([xMin, xMax]) // Use the specific x range
      .range([margin.left, width - margin.right])

    const yScale = d3
      .scaleLinear()
      .domain([yMin, yMax]) // Use the specific y range
      .range([height - margin.bottom, margin.top])

    // Draw X and Y axes
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale).ticks(10))
      .style('font-size', '1rem') // Set the font size
      .append('text')
      .attr('fill', 'black')
      .attr('x', width / 2)
      .attr('y', 40)
      .attr('text-anchor', 'middle')
      .text(axisLabels[selectedY] || selectedY) // ✅ Use custom label if available
      .style('font-size', '1rem') // Set the font size

    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale).ticks(10))
      .style('font-size', '1rem') // Set the font size
      .append('text')
      .style('font-size', '1rem') // Set the font size
      .attr('fill', 'black')
      .attr('x', -height / 2)
      .attr('y', -40)
      .attr('transform', 'rotate(-90)')
      .attr('text-anchor', 'middle')
      .text(axisLabels[selectedX] || selectedX) // ✅ Use custom label if available
      .style('font-size', '1rem') // Set the font size

    // Draw scatter plot points
    svg
      .selectAll('circle')
      .data(filteredData)
      .enter()
      .append('circle')
      .attr('cx', (d) => xScale(d.x))
      .attr('cy', (d) => yScale(d.y))
      .attr('r', 5)
      .style('fill', '#1976d2')

    // Calculate and display the correlation coefficient
    const xMean = d3.mean(filteredData, (d) => d.x)
    const yMean = d3.mean(filteredData, (d) => d.y)

    const correlationNumerator = d3.sum(
      filteredData,
      (d) => (d.x - xMean) * (d.y - yMean),
    )
    const correlationDenominator = Math.sqrt(
      d3.sum(filteredData, (d) => (d.x - xMean) ** 2) *
        d3.sum(filteredData, (d) => (d.y - yMean) ** 2),
    )
    const correlationCoefficient = correlationNumerator / correlationDenominator

    console.log('Correlation Coefficient (r):', correlationCoefficient)

    if (onCorrelationChange) {
      onCorrelationChange(correlationCoefficient)
    }

    // Draw the regression line
    const slope =
      correlationNumerator / d3.sum(filteredData, (d) => (d.x - xMean) ** 2)
    const intercept = yMean - slope * xMean

    const xStart = xMin
    const yStart = slope * xStart + intercept
    const xEnd = xMax
    const yEnd = slope * xEnd + intercept

    svg
      .append('line')
      .attr('x1', xScale(xStart))
      .attr('y1', yScale(yStart))
      .attr('x2', xScale(xEnd))
      .attr('y2', yScale(yEnd))
      .attr('stroke', 'black')
      .attr('stroke-width', 2)
  }, [data, selectedY, selectedX, onCorrelationChange])

  return (
    <Box display="flex" flexDirection="column" alignItems="center">
      <Box display="flex" alignItems="center">
        {/* <Typography
          variant="body1"
          style={{
            writingMode: 'vertical-rl',
            transform: 'rotate(180deg)',
            marginRight: '10px',
            fontWeight: 'bold',
          }}
        >
          Outcome ------&gt;
        </Typography> */}
        <Box ref={svgRef} width={500} height={500} component="svg"></Box>
      </Box>
      {/* <Typography
        variant="body1"
        style={{ marginTop: '10px', fontWeight: 'bold' }}
      >
        Activities ------&gt;
      </Typography> */}
    </Box>
  )
}
