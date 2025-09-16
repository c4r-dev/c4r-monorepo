"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";

export default function ObstacleDisplayClient({ study, selections = [] }) {
  const router = useRouter();


  const { id, title, description, narative, obstacles } = study;

  // Initialize state based on the current selections
  const [selectedStrategies, setSelectedStrategies] = useState(
    obstacles.map((_, index) => selections[index]?.strategy)
  );

  const handlePrint = () => {
    window.print();
  };

  // Function to toggle the selected strategy
  const toggleStrategy = (index, strategy) => {
    setSelectedStrategies((prevStrategies) => {
      const newStrategies = [...prevStrategies];
      newStrategies[index] = strategy;
      return newStrategies;
    });
  };

  if (!study) {
    return <p>Error: No study data provided.</p>;
  }

  return (
    <div className="obstacle-container">
      <button onClick={() => router.push("/")} className="back-button">
        Select a different scenario
      </button>
      <div className="spacer"><br></br></div>
      {/* <div className="spacer"></div> */}
      <h2>{title}</h2>
      <h3>{description}</h3>

      {obstacles && obstacles.length > 0 ? (
        <div>
          {obstacles.map((obstacle, index) => {
            // Use the selectedStrategies state instead of directly accessing selections
            const selectedStrategy = selectedStrategies[index];

            return (
              <div key={index} className="obstacle-table">
                <table>
                  <thead>
                    <tr>
                      <th><p><strong>{obstacle.header}</strong></p></th>
                      <th><p><strong>{obstacle.st1header}</strong></p></th>
                      <th><p><strong>{obstacle.st2header}</strong></p></th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td>
                        <p>{obstacle.text}</p>
                      </td>
                      {/* 1ST interactive column */}
                      <td
                        className={obstacle.st1header === selectedStrategy ? "highlight" : ""}
                        onClick={() => toggleStrategy(index, obstacle.st1header)}
                      >
                        {obstacle.st1header && (
                          <p>{obstacle.st1header === selectedStrategy ? <strong>{obstacle.st1texta}</strong> : obstacle.st1text}</p>
                        )}
                      </td>
                      {/* 2ND interactive column */}
                      <td
                        className={obstacle.st2header === selectedStrategy ? "highlight" : ""}
                        onClick={() => toggleStrategy(index, obstacle.st2header)}
                      >
                        {obstacle.st2header && (
                          <p>{obstacle.st2header === selectedStrategy ? <strong>{obstacle.st2texta}</strong> : obstacle.st2text}</p>
                        )}
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            );
          })}
        </div>
      ) : (
        <p>No obstacles available.</p>
      )}

      {/* Move narative here */}
      <p><strong>{narative}</strong></p>

      <div className="navigation-buttons">
        {/* <button onClick={handleGoBack} className="back-button">
          Go Back to Studies
        </button> */}
        <button onClick={handlePrint} className="nav-button">
          Print to PDF
        </button>
      </div>
    </div>
  );
}
