const logger = require('../../../../packages/logging/logger.js');
"use client";

import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function ObstacleListClient() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const id = searchParams.get("id");
  const title = searchParams.get("title");
  const description = searchParams.get("description");
  const narative = searchParams.get("narative");

  const [study, setStudy] = useState(null);
  const [currentObstacleIndex, setCurrentObstacleIndex] = useState(0);
  const [selections, setSelections] = useState({});
  const [lockedAnswers, setLockedAnswers] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!id) return;

    const fetchObstacles = async () => {
      try {
        setLoading(true);
        const res = await fetch("/data.json");
        if (!res.ok) throw new Error("Failed to fetch data.");
        const data = await res.json();

        const studyData = data.find((study) => study.id === parseInt(id));
        if (!studyData) throw new Error("Study not found.");

        setStudy(studyData);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchObstacles();
  }, [id]);

  const handleNext = () => {
    setCurrentObstacleIndex((prevIndex) => Math.min(prevIndex + 1, study.obstacles.length - 1));
  };

  const handleStrategySelection = (strategy, impactText) => {
    if (lockedAnswers[currentObstacleIndex]) return;

    setSelections((prevSelections) => ({
      ...prevSelections,
      [currentObstacleIndex]: { strategy, impactText },
    }));
  };

  const handleLockAnswer = () => {
    setLockedAnswers((prevLocked) => ({
      ...prevLocked,
      [currentObstacleIndex]: true,
    }));
  };

  const handleSubmit = async () => {
    try {
      setIsSaving(true);

      const response = await fetch("/api/save-selections", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studyId: id,
          selections,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save selections");
      }

      const data = await response.json();
      logger.app.info("Selections saved:", data);

      const queryParams = new URLSearchParams({
        study: JSON.stringify(study),
        selections: JSON.stringify(selections),
      }).toString();

      router.push(`/obstacledisplay?${queryParams}`);
    } catch (error) {
      logger.app.error(error);
    } finally {
      setIsSaving(false);
    }
  };

  if (!id || !title) {
    return <p>No study selected. Please go back and select a study.</p>;
  }

  if (loading) {
    return <p>Loading obstacles...</p>;
  }

  if (error) {
    return <p>Error: {error}</p>;
  }

  const currentObstacle = study.obstacles[currentObstacleIndex];
  const selectedStrategy = selections[currentObstacleIndex];
  const isLocked = lockedAnswers[currentObstacleIndex];
  const isLastObstacle = currentObstacleIndex === study.obstacles.length - 1;
  const allSelected = Object.keys(selections).length === study.obstacles.length;

  return (
    <div className="obstacle-container">
      
      <button onClick={() => router.push("/")} className="back-button">
        Select a different scenario
      </button>
      <div className="spacer"><br></br></div>
      <div className="spacer"></div>
      {currentObstacle ? (
        <>
          <div className="obstacle-header">
            <h2>{currentObstacle.header}</h2>
            <p>{currentObstacle.text}</p>
            <h3>Which choice do you think is better?</h3>
          </div>

          <div className="strategy-buttons">
            <button
              className={`strategy-button ${selectedStrategy?.strategy === currentObstacle.st1header ? "selected" : ""
                } ${isLocked ? "disabled-hover" : ""}`}
              onClick={() => handleStrategySelection(currentObstacle.st1header, currentObstacle.st1texta)}
              disabled={isLocked}
            >
              <h4>{currentObstacle.st1header}</h4>
              <p>{currentObstacle.st1text}</p>
            </button>
            <button
              className={`strategy-button ${selectedStrategy?.strategy === currentObstacle.st2header ? "selected" : ""
                } ${isLocked ? "disabled-hover" : ""}`}
              onClick={() => handleStrategySelection(currentObstacle.st2header, currentObstacle.st2texta)}
              disabled={isLocked}
            >
              <h4>{currentObstacle.st2header}</h4>
              <p>{currentObstacle.st2text}</p>
            </button>
          </div>

          {selectedStrategy && !isLocked && (
            <button className="lock-button" onClick={handleLockAnswer}>
              Lock Selection
            </button>
          )}

          {isLocked && (
            <div className="selected-strategy-message">
              <p>
                You selected: <strong>{selectedStrategy.strategy}</strong>
              </p>
              <p className="impact-text">{selectedStrategy.impactText}</p>
            </div>
          )}
        </>
      ) : (
        <p>No obstacles available.</p>
      )}

      <div className="navigation-buttons">
        {!isLastObstacle && isLocked && (
          <button onClick={handleNext} className="nav-button">
            Next Obstacle
          </button>
        )}
        {isLastObstacle && isLocked && (
          <button onClick={handleSubmit} disabled={isSaving} className="nav-button">
            {isSaving ? "Submitting..." : "Submit"}
          </button>
        )}
      </div>
    </div>
  );
}
