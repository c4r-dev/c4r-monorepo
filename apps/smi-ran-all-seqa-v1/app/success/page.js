const logger = require('../../../../packages/logging/logger.js');
"use client";
import { useEffect, useState, useRef } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, Cell } from "recharts";
import CustomButton from "../components/CustomButton";

// BarChartVisualizer Component (copied from main page)
const BarChartVisualizer = ({ sequence, title }) => {
  if (!sequence) return null;
  const countA = sequence.filter(item => item === 'A').length;
  const countB = sequence.filter(item => item === 'B').length;
  const total = sequence.length;
  const percentA = total > 0 ? (countA / total * 100).toFixed(1) : 0;
  const percentB = total > 0 ? (countB / total * 100).toFixed(1) : 0;
  const barWidth = 60;
  const maxBarHeight = 200;
  const barHeightA = total > 0 ? Math.max((countA / total) * maxBarHeight, 30) : 30;
  const barHeightB = total > 0 ? Math.max((countB / total) * maxBarHeight, 30) : 30;
  const sequencePreview = sequence.slice(0, 49);

  return (
    <div style={{ backgroundColor: '#f9f9f9', padding: '20px', borderRadius: '8px', boxShadow: 'inset 0px 0px 5px rgba(0, 0, 0, 0.1)', height: '100%', display: 'flex', flexDirection: 'column' }}>
      <h4 style={{ textAlign: 'center', marginBottom: '10px' }}>{title}</h4>
      <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'center', marginBottom: '5px', padding: '8px', backgroundColor: 'white', borderRadius: '4px', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', minHeight: '100px' }}>
        {sequencePreview.map((item, index) => (
          <div key={`preview-${title}-${index}`} style={{ width: '32px', height: '32px', margin: '2px', backgroundColor: item === 'A' ? '#39E1F8' : '#FFA800', borderRadius: '4px', display: 'flex', justifyContent: 'center', alignItems: 'center', color: 'white', fontWeight: 'bold', fontSize: '16px', textShadow: '1px 1px 1px rgba(0,0,0,0.3)' }} title={`Item ${index + 1}: ${item}`}>
            {item}
          </div>
        ))}
      </div>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexGrow: 1, backgroundColor: 'white', borderRadius: '4px', padding: '10px', marginTop: '10px', boxShadow: '0px 1px 3px rgba(0, 0, 0, 0.1)', marginBottom: '40px' }}>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%' }}>
          <div style={{ display: 'flex', alignItems: 'flex-end', height: `${Math.max(barHeightA, barHeightB) + 10}px`, justifyContent: 'center', width: '100%', marginTop: '5px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginRight: '30px' }}>
              <div style={{ width: `${barWidth + 15}px`, height: `${barHeightA}px`, backgroundColor: '#39E1F8', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'height 0.5s ease' }}>
                <span style={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)', fontSize: '14px' }}>{countA}</span>
              </div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
              <div style={{ width: `${barWidth + 15}px`, height: `${barHeightB}px`, backgroundColor: '#FFA800', borderRadius: '6px 6px 0 0', display: 'flex', justifyContent: 'center', alignItems: 'center', transition: 'height 0.5s ease' }}>
                <span style={{ color: 'white', fontWeight: 'bold', textShadow: '1px 1px 2px rgba(0,0,0,0.2)', fontSize: '14px' }}>{countB}</span>
              </div>
            </div>
          </div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '5px' }}>
            <div style={{ fontWeight: 'bold', fontSize: '16px', width: `${barWidth + 15}px`, textAlign: 'center', marginRight: '30px' }}>A</div>
            <div style={{ fontWeight: 'bold', fontSize: '16px', width: `${barWidth + 15}px`, textAlign: 'center' }}>B</div>
          </div>
          <div style={{ display: 'flex', width: '100%', justifyContent: 'center', marginTop: '5px' }}>
            <div style={{ fontSize: '14px', width: `${barWidth + 15}px`, textAlign: 'center', marginRight: '30px' }}>{percentA}%</div>
            <div style={{ fontSize: '14px', width: `${barWidth + 15}px`, textAlign: 'center' }}>{percentB}%</div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Sequence generation functions (copied from main page)
const generateSystematic = (n = 30) => {
  return Array.from({ length: n }, (_, i) => (i % 2 === 0 ? "A" : "B"));
};

const generateManual = (n = 30) => {
  if (n % 2 !== 0) n = n + 1;
  const possibleDifferences = [0, 2, 4];
  const difference = possibleDifferences[Math.floor(Math.random() * possibleDifferences.length)];
  const countA = Math.floor(n / 2) + Math.floor(difference / 2);
  const countB = n - countA;
  const elements = Array(countA).fill('A').concat(Array(countB).fill('B'));
  let result = [];
  let prevElement = null;
  let runLength = 0;
  const maxRunLength = 3;
  for (let i = elements.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [elements[i], elements[j]] = [elements[j], elements[i]];
  }
  for (let i = 0; i < elements.length; i++) {
    const currentElement = elements[i];
    if (currentElement === prevElement) {
      runLength++;
      if (runLength >= maxRunLength) {
        for (let j = i + 1; j < elements.length; j++) {
          if (elements[j] !== currentElement) {
            [elements[i], elements[j]] = [elements[j], elements[i]];
            runLength = 1;
            break;
          }
        }
      }
    } else {
      runLength = 1;
    }
    result.push(elements[i]);
    prevElement = elements[i];
  }
  return result;
};

const generateRandom = (n = 30) => {
  return Array.from({ length: n }, () => (Math.random() < 0.5 ? "A" : "B"));
};

export default function SuccessPage() {
  const [data, setData] = useState([]);
  const [tableData, setTableData] = useState([]);
  const [filteredTableData, setFilteredTableData] = useState([]);
  const [showRandomSequence, setShowRandomSequence] = useState(false);
  const [sequences, setSequences] = useState({ systematic: [], manual: [], random: [] });
  const [chartHeight, setChartHeight] = useState(400);
  const [isPurple, setIsPurple] = useState(false);
  const chartRef = useRef(null);

  // Helper function to check if text has at least 2 words
  const hasAtLeastTwoWords = (text) => {
    if (!text || typeof text !== 'string') return false;
    // Trim whitespace and split by spaces
    const words = text.trim().split(/\s+/);
    return words.length >= 2;
  };

  // Filter function to apply to table data
  const filterTableData = (data) => {
    return data.filter(row => 
      hasAtLeastTwoWords(row.selected1) || 
      hasAtLeastTwoWords(row.selected2) || 
      hasAtLeastTwoWords(row.selected3)
    );
  };

  // Generate sequences when component mounts
  useEffect(() => {
    const newSystematic = generateSystematic();
    const newManual = generateManual();
    const newRandom = generateRandom();

    setSequences({
      systematic: newSystematic,
      manual: newManual,
      random: newRandom,
    });
  }, []);

  useEffect(() => {
    if (typeof window !== "undefined") {
      setChartHeight(window.innerWidth < 600 ? 300 : 400);
    }

    fetch("/api/data")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          logger.app.info("Raw data from API:", result.data); // Log raw data before aggregation

          // Count occurrences of each selectedOption
          const countMap = { 1: 0, 2: 0, 3: 0 };

          const tableEntries = Array(100).fill().map(() => ({ selected1: "", selected2: "", selected3: "" }));
          var cnt1 = 0, cnt2 = 0, cnt3 = 0;
          var s1, s2, s3;

          result.data.forEach((item) => {
            if (item.selectedOption in countMap) {
              countMap[item.selectedOption] += item.count || 1; // Ensure count exists, assume 1 if missing
            }

            if (item.selectedOption === '1') {
              s2 = tableEntries[cnt1].selected2;
              s3 = tableEntries[cnt1].selected3;
              tableEntries[cnt1] = {
                selected1: item.textInput,
                selected2: s2,
                selected3: s3,
              };
              cnt1++;
            } else if (item.selectedOption === '2') {
              s1 = tableEntries[cnt2].selected1;
              s3 = tableEntries[cnt2].selected3;
              tableEntries[cnt2] = {
                selected2: item.textInput,
                selected1: s1,
                selected3: s3,
              };
              cnt2++
            } else {
              s1 = tableEntries[cnt3].selected1;
              s2 = tableEntries[cnt3].selected2;
              tableEntries[cnt3] = {
                selected3: item.textInput,
                selected2: s2,
                selected1: s1,
              };
              cnt3++;
            }
          });

          // Limit table data to 20 rows max
          var slice = 10;
          if (cnt1 > cnt2 && cnt1 > cnt3) {
            slice = cnt1;
          } else if (cnt2 > cnt1 && cnt2 > cnt3) {
            slice = cnt2;
          } else {
            slice = cnt3;
          }

          if (slice > 20) {
            slice = 20;
          }

          const unfiltered = tableEntries.slice(0, slice);
          setTableData(unfiltered);
          
          // Apply the filter to remove entries with less than 2 words
          const filtered = filterTableData(unfiltered);
          setFilteredTableData(filtered);
          
          logger.app.info("Unfiltered table data:", unfiltered);
          logger.app.info("Filtered table data:", filtered);

          // Correctly format aggregatedData as an array of objects with 'sequence', 'count', and 'color'
          const aggregatedData = [
            { sequence: "Sequence 1", count: countMap[1], color: "#1859d7" }, // Green
            { sequence: "Sequence 2", count: countMap[2], color: "#ff5a00" }, // Blue
            { sequence: "Sequence 3", count: countMap[3], color: "#f031dd", isRandom: true }  // Orange with isRandom flag
          ];

          logger.app.info("Aggregated data for chart:", aggregatedData); // Log after transformation

          setData(aggregatedData);
        }
      })
      .catch((err) => logger.app.error("Error fetching data:", err));
  }, []);

  const handleClick = () => {
    setShowRandomSequence(true);
    setIsPurple(true); // Set the button to purple when clicked
    
    // Scroll to bottom after visuals are rendered
    setTimeout(() => {
      window.scrollTo({
        top: document.body.scrollHeight,
        behavior: 'smooth'
      });
    }, 100); // Small delay to ensure visuals are rendered
  };

  // Custom styling for cells when random sequence is revealed
  const getCellStyle = (entry) => {
    if (showRandomSequence && entry.isRandom) {
      return {
        filter: 'drop-shadow(0 0 10px #6f00ff)',
        stroke: '#6f00ff',
        strokeWidth: 2
      };
    }
    return {};
  };

  return (
    <div>
      <h2 className="responsive-text" style={{ marginBottom: "40px" }}>
        Explore other users' reasoning, then reveal which sequence was truly random.
      </h2>

      {/* Added div wrapper with top padding */}
      <div style={{ paddingTop: "30px" }}>
        <ResponsiveContainer width="100%" height={chartHeight} ref={chartRef}>
          <BarChart
            data={data}
            margin={{ top: 45, right: 30, left: 20, bottom: 20 }}
          >
            <text
              x="50%"
              y={20}
              textAnchor="middle"
              fontSize={18}
              fontWeight="bold"
            >
              Distribution of Selections
            </text>
            
            {/* Adding extra space between title and chart */}
            <text x="0" y={40} opacity="0">
              Padding space
            </text>

            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="sequence" />
            <YAxis allowDecimals={false} label={{ value: "Number of Selections", angle: -90, position: "insideLeft" }} />
            <Tooltip />

            <Bar dataKey="count" name="Count">
              {data.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={entry.color} 
                  style={getCellStyle(entry)} 
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>

      {/* Scrollable Table - Modified to match screenshot width */}  
      <div className="table-container">
        <h3>Provided Reasoning</h3>
        {/* <p className="filter-info">Showing quality responses with 2+ words</p> */}
        <div className="scrollable-table">
          <table>
            <thead>
              <tr>
                <th>Sequence 1</th>
                <th>Sequence 2</th>
                <th className={showRandomSequence ? "highlight-header" : ""}>
                  Sequence 3 {showRandomSequence && <span className="random-indicator">✓ Random</span>}
                </th>
              </tr>
            </thead>
            <tbody>
              {filteredTableData.length > 0 ? (
                filteredTableData.map((row, index) => (
                  <tr key={index}>
                    <td>{row.selected1}</td>
                    <td>{row.selected2}</td>
                    <td className={showRandomSequence ? "highlight-cell" : ""}>{row.selected3}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="3" className="no-data-message">No quality responses found</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {/* Reveal the Random Sequence Button */}
        <div style={{ marginTop: '20px', padding: '10px 0' }}>
          <CustomButton
            variant={isPurple ? "#6f00ff" : "primary"} // Use purple color when isPurple is true
            onClick={handleClick}
          >
            Reveal the Random Sequence
          </CustomButton>
        </div>
      </div>

      {/* Sequence blocks and bar charts - shown when Reveal Random Sequence is clicked */}
      {showRandomSequence && (
        <div className="sequence-visualizer-container">
          <div className="sequence-visualizer-item">
            <BarChartVisualizer
              sequence={sequences.systematic}
              title="Alternating Allocation"
            />
          </div>
          <div className="sequence-visualizer-item">
            <BarChartVisualizer
              sequence={sequences.manual}
              title="Manual Allocation"
            />
          </div>
          <div className="sequence-visualizer-item" style={{
            boxShadow: "0px 0px 20px #6f00ff",
            border: "2px solid #6f00ff"
          }}>
            <BarChartVisualizer
              sequence={sequences.random}
              title="Randomized Allocation"
            />
          </div>
        </div>
      )}

      <style jsx>{`
        .table-container {
            display: flex;
            flex-direction: column;
            align-items: center; /* Centers table horizontally */
            justify-content: center; /* Centers table vertically */
            width: 100%;
            max-width: 1200px; /* Increased from 800px to match the width in the screenshot */
            margin: 30px auto;
            text-align: center;
            padding: 0 20px;
        }

        .filter-info {
          font-size: 0.9rem;
          color: #666;
          margin-top: -10px;
          margin-bottom: 10px;
          font-style: italic;
        }

        .scrollable-table {
          max-height: 300px;
          overflow-y: auto;
          border: 3px solid #ddd;
          border-radius: 8px;
          width: 100%;
          margin-bottom: 30px;
          box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
        }

        table {
          width: 100%;
          border-collapse: collapse;
          table-layout: fixed;
        }

        thead {
          position: sticky;
          top: 0;
          z-index: 10;
        }

        th, td {
          width: 33.33%;
          border: 3px solid #ddd;
          padding: 12px;
          text-align: center;
          overflow: hidden;
          text-overflow: ellipsis;
          white-space: normal;
        }

        th:first-child, td:first-child {
          border-left: none;
        }

        th:last-child, td:last-child {
          border-right: none;
        }

        th {
          background-color: #d0d0d0;
          font-weight: bold;
          border-top: none;
          border-bottom: 3px solid #ddd;
        }

        td {
          border-top: none;
        }

        tbody tr:first-child td {
          border-top: none;
        }

        tbody tr:last-child td {
          border-bottom: none;
        }
        
        .highlight-header {
          color: #6f00ff;
          font-weight: bold;
          box-shadow: 0 0 10px 2px rgba(111, 0, 255, 0.5);
        }
        
        .highlight-cell {
          background-color: rgba(111, 0, 255, 0.1);
        }
        
        .random-indicator {
          color: #6f00ff;
          margin-left: 5px;
          font-weight: bold;
        }

        .no-data-message {
          color: #666;
          font-style: italic;
          padding: 20px;
        }

        /* Media query for smaller screens */
        @media (max-width: 768px) {
          .table-container {
            padding: 0 10px;
          }
          
          th, td {
            padding: 8px;
            font-size: 14px;
          }
        }
      `}</style>
    </div>
  );
}