// import React, { useEffect, useRef } from 'react';
// import * as Plot from '@observablehq/plot';

// const InterleavedHistogram = ({ data, showMale, showFemale }) => {
//   const plotRef = useRef(null);


//   useEffect(() => {
//     if (plotRef.current) {
//       plotRef.current.innerHTML = '';
//     }

//     const marks = [];
//     if (showMale) {
//       marks.push(
//         Plot.rectY(
//           data,
//           Plot.binX(
//             { y: "count" },
//             { filter: (d) => d.hypothesis === 1, x: "coefficient", fill: () => "Hypothesis 1", insetLeft: 2 }
//           )
//         )
//       );
//     }
//     if (showFemale) {
//       marks.push(
//         Plot.rectY(
//           data,
//           Plot.binX(
//             { y: "count" },
//             { filter: (d) => d.hypothesis === 2, x: "coefficient", fill: () => "Hypothesis 2", insetRight: 2 }
//           )
//         )
//       );
//     }

//     const plot = Plot.plot({
//       round: true,
//       color: {
//         legend: true,
//         domain: ["Hypothesis 1", "Hypothesis 2"],
//         range: ["#fbb040", "#377eb8"]
//       },
//       marks: [...marks, Plot.ruleY([0]),
//       Plot.axisX({
//         label: "Correlation Coefficient",
//         labelAnchor: "center", // Adjusts the label's anchor point
//          labelOffset: 30,       // Controls the distance of the label from the axis
//         fontSize: 13.5,          // Sets the font size of the axis label
//         fontWeight: "bold"     // Sets the font weight of the axis label
//       }),
//       Plot.axisY({
//         label: "Proportion",
//         labelAnchor: "center", // Adjusts the label's anchor point
//          labelOffset: 40.8,       // Controls the distance of the label from the axis
//         fontSize: 13,          // Sets the font size of the axis label
//         fontWeight: "bold"     // Sets the font weight of the axis label
//       })
    
//     ], // Include only the selected marks
//       x: {
//         label: "Correlation Coefficient",
//         grid: true,
//          domain: [-0.6, 0.6],                  // Fix the x-axis range to [-1, 1]

//         // labelOffset: 40, // Adjusts the distance of the label from the axis
//       },
//       y: {
//         label: "Proportion",
//         grid: true
//       }
//     });

//     plotRef.current.appendChild(plot);

//     return () => {
//       if (plotRef.current && plotRef.current.contains(plot)) {
//         plotRef.current.removeChild(plot);
//       }
//     };
//   }, [data, showMale, showFemale]);

//   return (
//     <div>
//       <div style={{marginLeft:"20px"}} ref={plotRef}></div>
//     </div>
//   );
// };

// export default InterleavedHistogram;


// import React, { useEffect, useRef } from 'react';
// import * as Plot from '@observablehq/plot';

// const InterleavedHistogram = ({ data, showMale, showFemale }) => {
//   const plotRef = useRef(null);

//   useEffect(() => {
//     if (plotRef.current) {
//       plotRef.current.innerHTML = '';
//     }

//     const marks = [];
//     if (showMale) {
//       marks.push(
//         Plot.rectY(
//           data,
//           Plot.binX(
//             { y: "count" },
//             {
//               filter: (d) => d.hypothesis === 1,
//               x: "coefficient",
//               fill: () => "Hypothesis 1",
//               insetLeft: 2,
//               opacity: 0.7, // Set transparency
//             }
//           )
//         )
//       );
//     }
//     if (showFemale) {
//       marks.push(
//         Plot.rectY(
//           data,
//           Plot.binX(
//             { y: "count" },
//             {
//               filter: (d) => d.hypothesis === 2,
//               x: "coefficient",
//               fill: () => "Hypothesis 2",
//               insetRight: 2,
//               opacity: 0.7, // Set transparency
//             }
//           )
//         )
//       );
//     }

//     const plot = Plot.plot({
//       round: true,
//       color: {
//         legend: true,
//         domain: ["Hypothesis 1", "Hypothesis 2"],
//         range: ["#fbb040", "#377eb8"],
//       },
//       marks: [
//         ...marks,
//         Plot.ruleY([0]),
//         Plot.axisX({
//           label: "Correlation Coefficient",
//           labelAnchor: "center",
//           labelOffset: 30,
//           fontSize: 13.5,
//           fontWeight: "bold",
//         }),
//         Plot.axisY({
//           label: "Proportion",
//           labelAnchor: "center",
//           labelOffset: 40.8,
//           fontSize: 13,
//           fontWeight: "bold",
//         }),
//       ],
//       x: {
//         label: "Correlation Coefficient",
//         grid: true,
//         domain: [-0.6, 0.6], // Fix the x-axis range
//       },
//       y: {
//         label: "Proportion",
//         grid: true,
//       },
//     });

//     plotRef.current.appendChild(plot);

//     return () => {
//       if (plotRef.current && plotRef.current.contains(plot)) {
//         plotRef.current.removeChild(plot);
//       }
//     };
//   }, [data, showMale, showFemale]);

//   return (
//     <div>
//       <div style={{ marginLeft: "20px" }} ref={plotRef}></div>
//     </div>
//   );
// };

// export default InterleavedHistogram;

import React, { useEffect, useRef } from 'react';
import * as Plot from '@observablehq/plot';

const InterleavedHistogram = ({ data, showMale, showFemale }) => {
  const plotRef = useRef(null);

  useEffect(() => {
    if (plotRef.current) {
      plotRef.current.innerHTML = '';
    }

    const marks = [];
    if (showMale) {
      marks.push(
        Plot.rectY(
          data,
          Plot.binX(
            { y: "count" },
            {
              filter: (d) => d.hypothesis === 1,
              x: "coefficient",
              fill: () => "Hypothesis 1",
              insetLeft: 2,
              opacity: 0.7, // Set transparency
            }
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
            {
              filter: (d) => d.hypothesis === 2,
              x: "coefficient",
              fill: () => "Hypothesis 2",
              insetRight: 2,
              opacity: 0.7, // Set transparency
            }
          )
        )
      );
    }

    const plot = Plot.plot({
      round: true,
      color: {
        legend: true,
        domain: ["Hypothesis 1", "Hypothesis 2"],
        // range: ["#fbb040", "#377eb8"],
        //range:["#ffeb3b","rgba(0, 163, 255, 0.4)"]
        range:["rgba(255, 90, 0, 0.4)", "rgba(24, 89, 215, 0.4)"]
      },
      marks: [
        ...marks,
        Plot.ruleY([0]),
        Plot.axisX({
          label: "Correlation Coefficient",
          labelAnchor: "center",
          labelOffset: 30,
          tickSize: 6,
          fontSize: 14, // Match font size
          fontFamily: 'Arial, sans-serif', // Match font style
          fontWeight: "normal", // Match weight
        }),
        Plot.axisY({
          label: "Proportion",
          labelAnchor: "center",
          labelOffset: 40,
          tickSize: 6,
          fontSize: 14, // Match font size
          fontFamily: 'Arial, sans-serif', // Match font style
          fontWeight: "normal", // Match weight
        }),
      ],
      x: {
        label: "Sleep (average # of hours)",
        grid: true,
        domain: [-0.6, 0.6], // Fix the x-axis range
      },
      y: {
        label: "Proportion",
        grid: true,
      },
    });

    plotRef.current.appendChild(plot);

    return () => {
      if (plotRef.current && plotRef.current.contains(plot)) {
        plotRef.current.removeChild(plot);
      }
    };
  }, [data, showMale, showFemale]);

  return (
    <div>
      <div style={{ marginLeft: "20px" }} ref={plotRef}></div>
    </div>
  );
};

export default InterleavedHistogram;



