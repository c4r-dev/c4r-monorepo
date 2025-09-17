"use client";

import { useState, useEffect, useRef } from "react";
import jStat from "jstat";
import { Chart, registerables } from "chart.js";

// 1. Import the annotation plugin
import annotationPlugin from 'chartjs-plugin-annotation';
// 2. Register the annotation plugin along with other registerables
Chart.register(...registerables, annotationPlugin);

function calculateNoncentralTCDF(x, df, ncp) {
  // When the ncp is very small, it's close to central t-distribution
  if (Math.abs(ncp) < 1e-10) {
    return jStat.studentt.cdf(x, df);
  }

  const z = (x - ncp) / Math.sqrt(1 + (x * x) / (2 * df));
  return jStat.normal.cdf(z, 0, 1);
}

export default function Page() {
  const [sampleSize, setSampleSize] = useState(5);
  const [biasAmount, setBiasAmount] = useState(0);
  const chartRef = useRef(null);
  const chartInstanceRef = useRef(null);

  const calculateProbability = (d, b, n, alpha = 0.05) => {
    d = d + b;

    // Critical t-value for the given alpha (one-sided test)
    const tCritical = jStat.studentt.inv(1 - alpha, n - 1);

    // Non-centrality parameter
    const ncp = d * Math.sqrt(n);

    // Compute power (one-sided test)
    const powerUpper = 1 - calculateNoncentralTCDF(tCritical, n - 1, ncp);

    return powerUpper;
  }

  const updateChart = () => {
    if (!chartInstanceRef.current) return;

    const effectSizes = Array.from({ length: 401 }, (_, i) => -2 + i * 0.01);
    const probabilities05 = effectSizes.map((d) =>
      calculateProbability(d, 0, sampleSize)
    );
    const probabilities01 = effectSizes.map((d) =>
      calculateProbability(d, biasAmount, sampleSize)
    );

    const data05 = effectSizes.map((val, index) => ({ x: val, y: probabilities05[index] }));
    const data01 = effectSizes.map((val, index) => ({ x: val, y: probabilities01[index] }));

    chartInstanceRef.current.data.datasets[0].data = data05; // Unbiased
    chartInstanceRef.current.data.datasets[1].data = data01; // Biased

    chartInstanceRef.current.update('none');
  };

  useEffect(() => {
    const ctx = chartRef.current.getContext("2d");
    const darkerPinkFill = 'rgba(255, 105, 180, 0.4)'; // Semi-transparent hot pink
    const unbiasedColor = "#00C802"; // Green
    const biasedColor = "#FF5A00"; // Red

    chartInstanceRef.current = new Chart(ctx, {
      type: "line",
      data: {
        datasets: [
          // Dataset 0: Unbiased Line (Green)
          {
            label: "Unbiased",
            data: [],
            borderColor: unbiasedColor, // Use variable
            borderWidth: 6,
            fill: false,
            pointRadius: 0,
            tension: 0.1,
          },
          // Dataset 1: Biased Line (Red) - CONFIGURED FOR CONDITIONAL FILL
          {
            label: "Biased",
            data: [],
            borderColor: biasedColor, // Use variable
            borderWidth: 6,
            pointRadius: 0,
            tension: 0.1,
            fill: 0, // Fill towards dataset 0
            segment: {
              backgroundColor: ctx => ctx.p0.parsed.x < 0 ? darkerPinkFill : undefined,
            }
          },
        ],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        parsing: false,
        plugins: {
          legend: {
            display: true,
            labels: {
              // Use custom function to generate legend items
              generateLabels: function(chart) {
                // Get default labels
                const originalLabels = Chart.defaults.plugins.legend.labels.generateLabels(chart);

                // --- MODIFICATION START: Apply styles to ALL labels ---
                originalLabels.forEach((label, index) => {
                  // Set black border for default items
                  label.strokeStyle = 'black';
                  label.lineWidth = 1;

                  // Ensure fillStyle is correct (defaults usually use borderColor)
                  if (index === 0) { // Unbiased
                    label.fillStyle = unbiasedColor;
                  } else if (index === 1) { // Biased
                    label.fillStyle = biasedColor;
                  }
                });
                // --- MODIFICATION END ---


                // Determine default font color
                let defaultFontColor = '#666';
                if (originalLabels.length > 0 && originalLabels[0].fontColor) {
                  defaultFontColor = originalLabels[0].fontColor;
                }

                // Create the custom "False Positives" legend item
                const falsePositiveLabel = {
                  text: 'False Positives',
                  fillStyle: darkerPinkFill, // Swatch color = darker pink
                  strokeStyle: 'black',      // Border color = black
                  lineWidth: 1,            // Border width = 1px
                  fontColor: defaultFontColor, // Match text color
                  hidden: false,
                  datasetIndex: -1
                };

                // Insert the custom label after 'Biased'
                originalLabels.splice(2, 0, falsePositiveLabel);

                return originalLabels;
              }
            }
          },
          annotation: {
            annotations: {
              line1: {
                type: 'line',
                scaleID: 'x',
                value: 0,
                borderColor: 'black',
                borderWidth: 3,
              }
            }
          }
        },
        scales: {
          x: {
            type: 'linear',
            // --- CHANGE 1: Updated title text ---
            title: { display: true, text: "True Effect Size" }, // Removed (d)
            min: -2,
            max: 2,
            ticks: {
              stepSize: 0.5,
              // --- CHANGE 2: Added callback for tick formatting ---
              callback: function(value, index, ticks) {
                // Check if the value is numeric before formatting
                if (typeof value === 'number') {
                   return value === 0 ? '0' : value + 'σ';
                }
                return value; // Return original value if not numeric
              }
            }
          },
          y: {
            title: { display: true, text: "Probability of Detecting an Effect" },
            min: 0,
            max: 1,
          },
        },
      },
    });

    updateChart();

    return () => {
      if (chartInstanceRef.current) {
          chartInstanceRef.current.destroy();
          chartInstanceRef.current = null;
      }
    };
  }, []);

  useEffect(() => {
    if (chartInstanceRef.current) {
        updateChart();
    }
  }, [biasAmount, sampleSize]);


  return (
    <div className="container">
      {/* Header Section */}
      <div className="header">
        <button onClick={() => window.location.reload()} className="favicon-button">
          <img src="/favicon.ico" alt="Favicon" className="favicon" />
        </button>
        <h1 className="title">
          Explore the impact of bias.
        </h1>
      </div>

      {/* Centered Title */}
      <h2 className="centeredTitle">
        Explore how sample size and bias influence discovery of effects.
      </h2>

      {/* Sample Size Slider */}
      <div className="sliderContainer">
        <label htmlFor="sampleSizeSlider" className="sliderLabel">
          Sample Size: <strong>{sampleSize}</strong>
        </label>
        <div className="sliderWrapper">
          <span className="sliderMin">5</span>
          <input
            type="range"
            id="sampleSizeSlider"
            min="5"
            max="100"
            step="1"
            value={sampleSize}
            onChange={(e) => setSampleSize(parseInt(e.target.value))}
            className="slider"
          />
          <span className="sliderMax">100</span>
        </div>
      </div>

      {/* Bias Amount Slider */}
      <div className="sliderContainer biasSliderContainer">
        <label htmlFor="biasAmountSlider" className="sliderLabel">
          Bias Amount: <strong>{biasAmount.toFixed(2)}</strong>
        </label>
        <div className="sliderWrapper">
          <span className="sliderMin">0</span>
          <div className="sliderInputWrapper">
            <input
              type="range"
              id="biasAmountSlider"
              min="0"
              max="1"
              step="0.01"
              value={biasAmount}
              onChange={(e) => setBiasAmount(parseFloat(e.target.value))}
              className="slider"
            />
            <div className="sliderTicks">
              <div className="tick" style={{ left: "28%" }}>
                <span className="tickLabel">0.28</span>
              </div>
              <div className="tick" style={{ left: "91%" }}>
                <span className="tickLabel">0.91</span>
              </div>
              <div
                className="tickRangeLabel"
              >
                Estimated Range if you Fail to Mask
              </div>
            </div>
          </div>
          <span className="sliderMax">1σ</span>
        </div>
      </div>

      {/* Chart Container */}
      <div className="chartContainer">
        <canvas ref={chartRef} />
      </div>
    </div>
  );
}