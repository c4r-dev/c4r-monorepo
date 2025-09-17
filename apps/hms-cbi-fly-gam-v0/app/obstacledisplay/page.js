"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import ObstacleDisplayClient from "./ObstacleDisplayClient";
import "../../styles/globals.css"; // Ensure global styles are loaded
import Header from "../components/Header/Header";
import CustomModal from "../components/CustomModal/CustomModal";

export default function ObstacleDisplayPage({ searchParams }) {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const router = useRouter();
  const study = searchParams.study ? JSON.parse(searchParams.study) : null;
  const selections = searchParams.selections ? JSON.parse(searchParams.selections) : null;

  if (!study) {
    return <p>Error: No study data provided.</p>;
  }

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleHelpClick = () => {
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
  };

  return (
    <div className="full-page">
      <CustomModal isOpen={isModalOpen} closeModal={closeModal} />
      <Header onLogoClick={handleLogoClick} onHelpClick={handleHelpClick} />
      <div className="container">
        <Suspense fallback={<p>Loading obstacle display...</p>}>
          <ObstacleDisplayClient study={study} selections={selections} />
        </Suspense>        
      </div>
    </div>
  );
}
