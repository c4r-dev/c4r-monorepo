"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation"; // App Router's navigation hook
import "../styles/globals.css"; // Ensure global styles are loaded
// Standard component imports
import Header from "./components/Header/Header";
import CustomModal from "./components/CustomModal/CustomModal";
import CustomAlert from "./components/CustomAlert/CustomAlert";

export default function Home() {
  const [studies, setStudies] = useState([]);
  const [selectedStudy, setSelectedStudy] = useState(null);
  const router = useRouter(); // Initialize Next.js router
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isAlertOpen, setIsAlertOpen] = useState(false);
  const [alertMessage, setAlertMessage] = useState("Please select a study first.");

  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch("/data.json"); // Adjust your API path if necessary
      const data = await res.json();
      setStudies(data);
    };

    fetchData();
  }, []);

  const handleStudyClick = (study) => {
    setSelectedStudy(study);
  };

  const handleContinue = () => {
    if (selectedStudy) {
      // Navigate to the ObstacleList page with the study ID and title
      router.push(`/obstaclelist?id=${selectedStudy.id}&title=${selectedStudy.title}&description=${selectedStudy.description}&narative=${selectedStudy.narative}`);
    } else {
      setAlertMessage("Please select a study first.");
      triggerError();
    }
  };

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleHelpClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  const triggerError = () => {
    setIsAlertOpen(true);
  };

  const closeAlert = () => {
    setIsAlertOpen(false);
  };

  return (
    <div className="full-page">
      <CustomAlert triggerOpen={isAlertOpen} message={alertMessage} onClose={closeAlert} />
      <CustomModal isOpen={isModalOpen} closeModal={closeModal} />
      <Header onLogoClick={handleLogoClick} onHelpClick={handleHelpClick} />
      <div className="grid-items-container">
        {/* Centered Title */}
        <h2 className="centeredTitle">Select a team to help</h2>

        {/* Study Selection */}
        <div className="buttonGrid">
          {studies.map((study) => (
            <div
              key={study.id}
              onClick={() => handleStudyClick(study)}
              className={`detailedBox ${
                selectedStudy?.id === study.id ? "selected" : ""
              }`}
              style={{ backgroundColor: study.color }}
            >
              <h3>{study.title}</h3>
              <p>{study.description}</p>
            </div>
          ))}
        </div>

        {/* Footer Section */}
        <div className="footer">
          <button onClick={handleContinue} className="lock-button">
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
