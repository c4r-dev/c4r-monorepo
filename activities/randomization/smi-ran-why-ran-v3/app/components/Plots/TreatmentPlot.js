import React from 'react'
import * as d3 from 'd3'
// import data from "../../Data/data.json";

function TreatmentPlot({
  data,
  width,
  height,
  margin,
  xDomain = ['In-person treatment', 'Virtual treatment'],
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
    const svg = d3.select(svgRef.current);
  
    // Filter out patients with ID 0 and 101
    const filteredData = data.filter(d => d.patientID !== 0 && d.patientID !== 101);
  
    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .padding(0.2);
  
    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top]);
  
    // Clear previous content
    svg.selectAll('*').remove();
  
    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));
  
    // Y Axis
    svg
      .append("g")
      .attr("transform", `translate(${margin.left}, 0)`)
      .call(
        d3.axisLeft(yScale).tickFormat((d) => {
          if (d >= 1e6) return d / 1e6 + "M"; 
          if (d >= 1e3) return d / 1e3 + "k";
          return d;
        })
      );
  
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
      .text(yLabel);
  
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
      .style('pointer-events', 'none');
  
    // Plotting the dots with both x and y jitter
    svg
      .selectAll('.dot')
      .data(filteredData) // Use filteredData instead of the original data
      .enter()
      .append('circle')
      .attr('cx', (d, i) => {
        const xJitterArray = xJitterPositions[d.treatmentType];
        return (
          xScale(d.treatmentType) +
          xScale.bandwidth() / 2 +
          xJitterArray[i % xJitterArray.length]
        );
      })
      .attr('cy', (d, i) => yScale(d[yField]) + yJitter[i % yJitter.length])
      .attr('r', dotRadius)
      .attr('fill', (d) => colors[d.treatmentType])
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        tooltip.style('display', 'block').html(`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; border-spacing: 8px;">
              <div style="font-weight: normal;">Patient ID</div><div style="font-weight: bold;">${d.patientID}</div>
              <div style="font-weight: normal;">Age</div><div style="font-weight: bold;">${d.age}</div>
              <div style="font-weight: normal;">Sex</div><div style="font-weight: bold;">${d.sex}</div>
              <div style="font-weight: normal;">Treatment Type</div><div style="font-weight: bold;">${d.treatmentType}</div>
              <div style="font-weight: normal;">Income</div><div style="font-weight: bold;">${d.income}</div>
              <div style="font-weight: normal;">Education Years</div><div style="font-weight: bold;">${d.educationYears}</div>
              <div style="font-weight: normal;">BMI</div><div style="font-weight: bold;">${d.bmi}</div>
              <div style="font-weight: normal;">Smoking History</div><div style="font-weight: bold;">${d.smokingYears} years</div>
              <div style="font-weight: normal;">Physical Activity</div><div style="font-weight: bold;">${d.physicalActivity} hours/day</div>
            </div>
          `);
      })
      .on('mousemove', (event) => {
        tooltip
          .style('left', event.pageX + 10 + 'px')
          .style('top', event.pageY + 10 + 'px');
      })
      .on('mouseout', () => {
        tooltip.style('display', 'none');
      });
  
    // Median Lines
    // const medians = {
    //   "In-person treatment": 265,
    //   "Virtual treatment": 318.5,
    // };

    // Median Line for In-person Treatment
    svg
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', xScale('In-person treatment') + xScale.bandwidth())
      .attr('y1', yScale(medians['In-person treatment']))
      .attr('y2', yScale(medians['In-person treatment']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2)

    svg
      .append('text')
      .attr('x', margin.left + 5)
      .attr('y', yScale(medians['In-person treatment']) - 5)
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 12)
      .text(`Median ${medians['In-person treatment']} ${medianText}`)

    // Median Line for Virtual Treatment
    svg
      .append('line')
      .attr('x1', xScale('In-person treatment') + xScale.bandwidth())
      .attr('x2', xScale('Virtual treatment') + xScale.bandwidth())
      .attr('y1', yScale(medians['Virtual treatment']))
      .attr('y2', yScale(medians['Virtual treatment']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2)

    svg
      .append('text')
      .attr('x', xScale('In-person treatment') + xScale.bandwidth() + 5)
      .attr('y', yScale(medians['Virtual treatment']) - 5)
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 12)
      .text(`Median ${medians['Virtual treatment']} ${medianText}`)

    // Dashed vertical line between the two groups
    svg
      .append('line')
      .attr('x1', xScale('In-person treatment') + xScale.bandwidth())
      .attr('x2', xScale('In-person treatment') + xScale.bandwidth())
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')

    // Dashed vertical line after the "Virtual treatment" group
    svg
      .append('line')
      .attr('x1', xScale('Virtual treatment') + xScale.bandwidth())
      .attr('x2', xScale('Virtual treatment') + xScale.bandwidth())
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4')
  
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
  ]);
  

  return <svg ref={svgRef} width={isMobile? 300 : 700} height={isMobile? 300 : 500}></svg>
}

export default TreatmentPlot
