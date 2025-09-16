"use client";

import { Suspense, useState } from "react";
import { useRouter } from "next/navigation";
import SelectionClient from "./SelectionClient"; // Separate client-side logic into a component
import "../../styles/globals.css";
import Header from "../components/Header/Header";
import CustomModal from "../components/CustomModal/CustomModal";

export default function ObstacleListPage() {
  const router = useRouter();

  const [isModalOpen, setIsModalOpen] = useState(false);

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
        <Suspense fallback={<p>Loading obstacle list...</p>}>
          <SelectionClient />
        </Suspense>
      </div>
    </div>
  );
}