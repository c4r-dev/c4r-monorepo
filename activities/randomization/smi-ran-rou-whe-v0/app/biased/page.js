"use client";

import { useState, useEffect, useCallback, useMemo } from "react";
import Image from "next/image";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from "chart.js";
import Link from "next/link";

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend);

// Constants moved outside the component
const COLORS = {
  RED: [3, 4, 5, 7, 9, 11, 13, 15],
  BLACK: [1, 2, 6, 8, 10, 12, 14, 16],
  GREEN: [0],
};

// Default colors that will be used before client-side initialization
const DEFAULT_COLORS = {
  RED: "#FF5A00",
  BLACK: "#020202",
  GREEN: "#00C802",
};

// Move getCSSVariable inside a useEffect to ensure it only runs on client
const getCSSVariable = (variable) => {
  if (typeof window !== 'undefined' && typeof document !== 'undefined') {
    return getComputedStyle(document.documentElement).getPropertyValue(variable).trim();
  }
  return '';
};

export default function BiasedPage() {
  const [spins, setSpins] = useState([]);

  const [colorHex, setColorHex] = useState({
    RED: DEFAULT_COLORS.RED,
    BLACK: DEFAULT_COLORS.BLACK,
    GREEN: DEFAULT_COLORS.GREEN,
  });

  useEffect(() => {
    // This will only run on the client side
    setColorHex({
      RED: getCSSVariable("--color-red") || DEFAULT_COLORS.RED,
      BLACK: getCSSVariable("--color-black") || DEFAULT_COLORS.BLACK,
      GREEN: getCSSVariable("--color-green") || DEFAULT_COLORS.GREEN,
    });
  }, []);

  // Use colorHex instead of COLOR_HEX
  const getColor = useCallback((num) => {
    if (COLORS.RED.includes(num)) return colorHex.RED;
    if (COLORS.BLACK.includes(num)) return colorHex.BLACK;
    if (COLORS.GREEN.includes(num)) return colorHex.GREEN;
    return "gray"; // Fallback color
  }, [colorHex]);

  // Using useCallback to prevent unnecessary re-renders
  const handleSpin = useCallback((times = 1) => {
    const newSpins = [];
    for (let i = 0; i < times; i++) {
      // Biased spinning mechanism - red numbers are more likely to appear
      const randomValue = Math.random();
      let newNumber;

      if (randomValue < 0.7000) {
        // 70% chance to get a red number
        const redNumbers = COLORS.RED;
        newNumber = redNumbers[Math.floor(Math.random() * redNumbers.length)];
      } else if (randomValue < 0.9412) {
        // 24.12% chance to get a black number
        const blackNumbers = COLORS.BLACK;
        newNumber = blackNumbers[Math.floor(Math.random() * blackNumbers.length)];
      } else {
        // 5.88% (1/17) chance to get green (0)
        newNumber = 0;
      }

      newSpins.push(newNumber);
    }
    setSpins(newSpins);
  }, []);

  // Using useMemo to optimize calculations
  const statistics = useMemo(() => {
    const colorCounts = {
      [colorHex.RED]: spins.filter((num) => getColor(num) === colorHex.RED).length,
      [colorHex.BLACK]: spins.filter((num) => getColor(num) === colorHex.BLACK).length,
      [colorHex.GREEN]: spins.filter((num) => getColor(num) === colorHex.GREEN).length,
    };

    const totalSpins = spins.length || 1;
    const uniqueNumbers = Array.from(new Set(spins)).sort((a, b) => a - b);
    const colorMap = uniqueNumbers.map(getColor);

    return {
      colorCounts,
      totalSpins,
      uniqueNumbers,
      colorMap,
    };
  }, [spins, colorHex, getColor]); // Add `getColor` as a dependency

  // Chart data preparation using memoization
  const chartData = useMemo(() => {
    return {
      labels: statistics.uniqueNumbers,
      datasets: [
        {
          label: "Repetition",
          data: statistics.uniqueNumbers.map(
            (num) => spins.filter((x) => x === num).length
          ),
          backgroundColor: statistics.uniqueNumbers.map(getColor),
          borderColor: statistics.uniqueNumbers.map(getColor),
          borderWidth: 1,
        },
      ],
    };
  }, [statistics, spins, getColor]);

  return (
    <div style={{ textAlign: "center", maxWidth: "900px", margin: "0 auto", padding: "20px" }}>
      {/* Back to regular wheel button */}
      <div style={{ display: "flex", justifyContent: "flex-start", width: "100%", marginBottom: "20px" }}>
        <Link href="/">
          <button
            className="compare-answer-button"
            style={{ backgroundColor: colorHex.GREEN }}
          >
            Regular Wheel
          </button>
        </Link>
      </div>

      {/* Flex container for heading and SVG */}
      <div
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          flexWrap: "wrap",
          gap: "10px",
          minHeight: "150px",
          height: "auto",
          width: "100%",
        }}
      >
        <h2
          style={{
            fontSize: "1.2rem",
            fontWeight: "bold",
            marginBottom: "50px",
            flex: "2",
            maxWidth: "66%",
            textAlign: "center",
          }}
        >
          This wheel is broken! It doesn&apos;t spin fairly. Try it out and see how the distributions differ from the normal wheel.
        </h2>

        <div
          style={{
            flex: "1",
            maxWidth: "33%",
            textAlign: "center",
            minHeight: "200px",
            display: "flex",
            justifyContent: "center",
            alignItems: "center"
          }}
        >
          <div
            className="image-container"
            style={{
              width: "250px",
              height: "250px",
              position: "relative",
              display: "flex",
              justifyContent: "center",
              alignItems: "center",
              overflow: "hidden"
            }}
          >
            <Image
              src="/broken-wheel.svg"
              alt="Broken Roulette Wheel"
              width={200}
              height={200}
              style={{
                transform: "rotate(11deg)",
                objectFit: "contain",
                maxWidth: "100%",
                maxHeight: "100%",
              }}
              priority
            />
          </div>
        </div>
      </div>

      <p
        style={{
          fontSize: "0.9rem",
          textTransform: "uppercase",
          fontWeight: "bold",
          color: "#666",
          letterSpacing: "1px",
          marginTop: "-20px",
        }}
      >
        Let&apos;s spin the biased wheel
      </p>

      {/* Button Container for Horizontal Layout */}
      <div style={{ display: "flex", justifyContent: "center", gap: "10px", marginTop: "10px" }}>
        <div className="button-container">
          {[1, 10, 100, 1000].map(times => (
            <button
              key={times}
              onClick={() => handleSpin(times)}
              className="compare-answer-button"
              aria-label={`Spin ${times} times`}
            >
              {times}X
            </button>
          ))}
        </div>
      </div>

      {/* Color Distribution */}
      <div
        style={{
          marginTop: "20px",
          padding: "10px",
          background: "#f0f0f0",
          borderRadius: "8px",
        }}
      >
        <h3
          style={{
            fontSize: "14px",
            fontWeight: "bold",
            textAlign: "left",
          }}
        >
          COLOR DISTRIBUTION
        </h3>

        <div style={{ display: "flex", height: "15px", borderRadius: "5px", overflow: "hidden" }}>
          {Object.entries(statistics.colorCounts).map(([color, count]) => (
            <div
              key={color}
              style={{
                background: color,
                width: `${(count / statistics.totalSpins) * 100}%`,
              }}
              aria-label={`${color} percentage: ${((count / statistics.totalSpins) * 100).toFixed(1)}%`}
            ></div>
          ))}
        </div>

        {/* Percentages Below */}
        <div
          style={{
            display: "flex",
            justifyContent: "space-between",
            marginTop: "5px",
            fontSize: "12px",
            fontWeight: "bold",
            textAlign: "center",
          }}
        >
          <span style={{ color: colorHex.RED, flex: 1, textAlign: "left" }}>
            {((statistics.colorCounts[colorHex.RED] / statistics.totalSpins) * 100).toFixed(1)}%
          </span>
          <span style={{ color: colorHex.BLACK, flex: 1, textAlign: "center" }}>
            {((statistics.colorCounts[colorHex.BLACK] / statistics.totalSpins) * 100).toFixed(1)}%
          </span>
          <span style={{ color: colorHex.GREEN, flex: 1, textAlign: "right" }}>
            {((statistics.colorCounts[colorHex.GREEN] / statistics.totalSpins) * 100).toFixed(1)}%
          </span>
        </div>
      </div>

      {/* Number Distribution (Chart) */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "left",
          marginTop: "20px",
        }}
      >
        NUMBER DISTRIBUTION
      </h3>

      <div
        style={{
          display: "flex",
          flexWrap: "nowrap",
          justifyContent: "center",
          alignItems: "center",
          gap: "10px",
        }}
      >
        <div style={{ flex: "1", maxWidth: "100%" }}>
          <Bar
            data={{
              ...chartData,
              datasets: [
                {
                  ...chartData.datasets[0],
                  label: "",
                },
              ],
            }}
            height={125}
            options={{
              maintainAspectRatio: false,
              responsive: true,
              plugins: {
                legend: {
                  display: false,
                },
                tooltip: {
                  callbacks: {
                    title: (tooltipItems) => {
                      return `Number: ${tooltipItems[0].label}`;
                    },
                    label: (tooltipItem) => {
                      return `Count: ${tooltipItem.raw}`;
                    }
                  }
                }
              },
              scales: {
                y: {
                  beginAtZero: true,
                  ticks: {
                    stepSize: 1,
                  },
                },
              },
            }}
          />
        </div>
      </div>

      {/* Number Runs */}
      <h3
        style={{
          fontSize: "14px",
          fontWeight: "bold",
          textAlign: "left",
          marginTop: "20px",
        }}
      >
        NUMBER RUNS
      </h3>
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center" }}>
        {spins.length > 0 ? (
          spins.slice(0, 25).map((num, index) => (
            <div
              key={index}
              style={{
                fontSize: "18px",
                fontWeight: "bold",
                color: "white",
                backgroundColor: getColor(num),
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
              }}
              aria-label={`Spin result ${index + 1}: ${num}, color: ${getColor(num)}`}
            >
              {num}
            </div>
          ))
        ) : (
          <div
            style={{
              fontSize: "18px",
              fontWeight: "bold",
              color: "white",
              backgroundColor: "red",
              padding: "10px",
              borderRadius: "50%",
              display: "inline-block",
              width: "40px",
              height: "40px",
              textAlign: "center",
              lineHeight: "40px",
            }}
            aria-label="No spins yet"
          >
            -
          </div>
        )}
      </div>
    </div>
  );
}