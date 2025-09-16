import React from 'react'
import * as d3 from 'd3'
// import data from "../../Data/data.json";

function TreatmentPlot({
  data,
  width,
  height,
  margin,
  xDomain = ['Control', 'Enrichment'],
  yDomain,
  yLabel,
  dotRadius,
  colors,
  medians,
  medianTextColor,
  medianText,
  yField,
  xJitterPositions,
  yJitter,
  isMobile = false,
}) {
  const svgRef = React.useRef(null)

  React.useEffect(() => {
    const svg = d3.select(svgRef.current)

    // Filter out patients with ID 0 and 101
    // const filteredData = data.filter(d => d.patientID !== 0 && d.patientID !== 101);
    const filteredData = data

    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .padding(0.2)

    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top])

    // Clear previous content
    svg.selectAll('*').remove()
    const dashedLine1X = xScale('Control') + xScale.bandwidth() // 1st dashed line
    const dashedLine2X = xScale('Enrichment') + xScale.bandwidth() // 2nd dashed line
    // X Axis
    // svg
    //   .append('g')
    //   .attr('transform', `translate(0, ${height - margin.bottom})`)
    //   .call(d3.axisBottom(xScale));

    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text') // Select all text elements in the x-axis
      .text((d) => {
        if (d === 'In-person treatment') return 'Control' // Change Label
        if (d === 'Virtual treatment') return 'Enrichment' // Change Label
        return d // Default
      })
      .attr('font-size', 14) // Optional: Adjust font size
      .attr('fill', 'black') // Optional: Adjust text color
      .attr('text-anchor', 'middle') // Ensure text is centered

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(
        d3.axisLeft(yScale).tickFormat((d) => {
          if (d >= 1e6) return d / 1e6 + 'M'
          if (d >= 1e3) return d / 1e3 + 'k'
          return d
        })
      )

    // Y Axis Label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr(
        'transform',
        `translate(${margin.left / 2 - 10}, ${height / 2}) rotate(-90)`
      )
      .attr('font-size', 14)
      .attr('fill', 'black')
      .text(yLabel)

    // Tooltip div for hover interaction
    const tooltip = d3
      .select('body')
      .append('div')
      .attr('id', 'tooltip')
      .style('position', 'absolute')
      .style('background-color', 'white')
      .style('border', '1px solid black')
      .style('padding', '10px')
      .style('display', 'none')
      .style('pointer-events', 'none')

    // Plotting the dots with both x and y jitter
    svg
      .selectAll('.dot')
      .data(filteredData) // Use filteredData instead of the original data
      .enter()
      .append('circle')
      .attr('cx', (d, i) => {
        console.log("d and i iss" + JSON.stringify(d), i)
        const xJitterArray = xJitterPositions[d.treatment] || []
        return (
          xScale(d.treatment) +
          xScale.bandwidth() / 2 +
          xJitterArray[i % xJitterArray.length]
        )
      })
      .attr('cy', (d, i) => yScale(d[yField]) + yJitter[i % yJitter.length])
      .attr('r', dotRadius)
      .attr('fill', (d) => colors[d.sex])
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block').html(`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-spacing: 8px;">
              <div style="font-weight: normal;">Fish ID</div><div style="font-weight: bold;">${d.fish_id}</div>
              <div style="font-weight: normal;">Family ID</div><div style="font-weight: bold;">${d.family_id}</div>
              <div style="font-weight: normal;">Sex</div><div style="font-weight: bold;">${d.sex}</div>
              <div style="font-weight: normal;">Treatment</div><div style="font-weight: bold;">${d.treatment}</div>
              <div style="font-weight: normal;">Size</div><div style="font-weight: bold;">${d.size}</div>
              <div style="font-weight: normal;">Swimming Speed</div><div style="font-weight: bold;">${d.swimming_speed}</div>
              <div style="font-weight: normal;">Aggression</div><div style="font-weight: bold;">${d.aggression}</div>
              <div style="font-weight: normal;">Base Aggression</div><div style="font-weight: bold;">${d.base_aggression}</div>

            </div>
          `)
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY + 10 + 'px')
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none')
      })

    // Median Lines
    // const medians = {
    //   "In-person treatment": 265,
    //   "Virtual treatment": 318.5,
    // };

    // Median Line for Control (67) - Ends at 1st Dashed Line
    svg
      .append('line')
      .attr('x1', margin.left) // Start from the left margin
      .attr('x2', dashedLine1X) // Stop at the 1st dashed line
      .attr('y1', yScale(medians['Control']))
      .attr('y2', yScale(medians['Control']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2)

    // Median Text for Control (67) - Positioned Near the Line
    svg
      .append('text')
      .attr('x', margin.left + 10) // Position inside left margin
      .attr('y', yScale(medians['Control']) - 5) // Place slightly above the line
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text(`Median ${medians['Control']}`)

    // Median Line for Enrichment (85) - Starts at 1st Dashed Line, Ends at 2nd Dashed Line
    svg
      .append('line')
      .attr('x1', dashedLine1X) // Start from 1st dashed line
      .attr('x2', dashedLine2X) // End at 2nd dashed line
      .attr('y1', yScale(medians['Enrichment']))
      .attr('y2', yScale(medians['Enrichment']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2)

    // Median Text for Enrichment (85) - Positioned Near the Line
    svg
      .append('text')
      .attr('x', dashedLine1X + 10) // Position right of the 1st dashed line
      .attr('y', yScale(medians['Enrichment']) - 5)
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 14)
      .attr('font-weight', 'bold')
      .text(`Median ${medians['Enrichment']}`)

    // Dashed Vertical Line Between Control & Enrichment
    svg
      .append('line')
      .attr('x1', dashedLine1X)
      .attr('x2', dashedLine1X)
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')

    // Dashed Vertical Line After Enrichment Group
    svg
      .append('line')
      .attr('x1', dashedLine2X)
      .attr('x2', dashedLine2X)
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale))
      .selectAll('text') // Select all text elements in the x-axis
      .text((d) => {
        console.log("d isss" + d)
        if (d === 'In-person treatment') return 'Control' // Change Label
        if (d === 'Virtual treatment') return 'Enrichment' // Change Label
        return d // Default
      })
      .attr('font-size', 14) // Optional: Adjust font size
      .attr('fill', 'black') // Optional: Adjust text color
      .attr('text-anchor', 'middle') // Ensure text is centered

    // X Axis Label
    svg
      .append('text')
      .attr('text-anchor', 'middle')
      .attr('x', (width - margin.left - margin.right) / 2 + margin.left) // Centered horizontally
      .attr('y', height - margin.bottom + 40) // Positioned below the axis
      .attr('font-size', 14)
      .attr('fill', 'black')
      .text('Treatment type')
  }, [
    data,
    width,
    height,
    margin,
    xDomain,
    yDomain,
    yLabel,
    dotRadius,
    colors,
    medians,
    medianTextColor,
    medianText,
    yField,
    xJitterPositions,
    yJitter,
  ])

  return (
    <svg
      ref={svgRef}
      width={isMobile ? 300 : 700}
      height={isMobile ? 300 : 500}
    ></svg>
  )
}

export default TreatmentPlot
