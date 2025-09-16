import React from 'react';
import * as d3 from 'd3';

function SurvivalSexPlot({
  data,
  width,
  height,
  margin,
  xDomain = ['Female', 'Male'],
  yDomain,
  yLabel,
  dotRadius,
  colors,
  medians,
  medianTextColor,
  yField,
  xJitterPositions,
  yJitter,
}) {
  const svgRef = React.useRef(null);

  React.useEffect(() => {
    const svg = d3.select(svgRef.current);

    const xScale = d3
      .scaleBand()
      .domain(xDomain)
      .range([margin.left, width - margin.right])
      .padding(0.2);

    const yScale = d3
      .scaleLinear()
      .domain(yDomain)
      .range([height - margin.bottom, margin.top]);

    svg.selectAll('*').remove();

    // X Axis
    svg
      .append('g')
      .attr('transform', `translate(0, ${height - margin.bottom})`)
      .call(d3.axisBottom(xScale));

    // Y Axis
    svg
      .append('g')
      .attr('transform', `translate(${margin.left}, 0)`)
      .call(d3.axisLeft(yScale));

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

    // Plot dots with hover interaction
    svg
      .selectAll('.dot')
      .data(data)
      .enter()
      .append('circle')
      .attr('cx', (d, i) => {
        const xJitterArray = xJitterPositions[d.sex] || [0];
        return (
          xScale(d.sex) +
          xScale.bandwidth() / 2 +
          xJitterArray[i % xJitterArray.length]
        );
      })
      .attr('cy', (d, i) => yScale(d[yField]) + (yJitter[i % yJitter.length] || 0))
      .attr('r', dotRadius)
      .attr('fill', (d) => colors[d.sex])
      .attr('opacity', 0.8)
      .on('mouseover', (event, d) => {
        tooltip
          .style('display', 'block')
          .html(`
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px;">
              <div><strong>Patient ID:</strong></div><div>${d.patientID}</div>
              <div><strong>Age:</strong></div><div>${d.age}</div>
              <div><strong>Sex:</strong></div><div>${d.sex}</div>
              <div><strong>Survival Days:</strong></div><div>${d.survivalDays}</div>
              <div><strong>Smoking History:</strong></div><div>${d.smokingYears} years</div>
              <div><strong>Physical Activity:</strong></div><div>${d.physicalActivity} hrs/day</div>
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

    // Median Line for Female
    svg
      .append('line')
      .attr('x1', margin.left)
      .attr('x2', xScale('Female') + xScale.bandwidth())
      .attr('y1', yScale(medians['Female']))
      .attr('y2', yScale(medians['Female']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2);

    svg
      .append('text')
      .attr('x', margin.left + 5)
      .attr('y', yScale(medians['Female']) - 5)
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 12)
      .text(`Median ${medians['Female']} days`);

    // Median Line for Male
    svg
      .append('line')
      .attr('x1', xScale('Female') + xScale.bandwidth())
      .attr('x2', xScale('Male') + xScale.bandwidth())
      .attr('y1', yScale(medians['Male']))
      .attr('y2', yScale(medians['Male']))
      .attr('stroke', medianTextColor)
      .attr('stroke-width', 2);

    svg
      .append('text')
      .attr('x', xScale('Female') + xScale.bandwidth() + 5)
      .attr('y', yScale(medians['Male']) - 5)
      .attr('text-anchor', 'start')
      .attr('fill', medianTextColor)
      .attr('font-size', 12)
      .text(`Median ${medians['Male']} days`);

    // Dashed vertical line between Female and Male
    svg
      .append('line')
      .attr(
        'x1',
        xScale('Female') +
          xScale.bandwidth() +
          (xScale.step() * xScale.padding()) / 2 -18
      )
      .attr(
        'x2',
        xScale('Female') +
          xScale.bandwidth() +
          (xScale.step() * xScale.padding()) / 2-18
      )
      .attr('y1', margin.top)
      .attr('y2', height - margin.bottom)
      .attr('stroke', 'black')
      .attr('stroke-width', 1)
      .attr('stroke-dasharray', '4,4');
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
    yField,
    xJitterPositions,
    yJitter,
  ]);

  return <svg ref={svgRef} width={width} height={height}></svg>;
}

export default SurvivalSexPlot;
