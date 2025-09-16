"use client";

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Header from "../Header/Header";
import CustomModal from "../CustomModal/CustomModal";
import SessionConfigPopup from "../SessionPopup/SessionConfigPopup";
import SelectionClient from "../../Selection/SelectionClient";

export default function PageWrapper() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showPopup, setShowPopup] = useState(true);
  const [sessionID, setSessionID] = useState('');
  const [selectedGroup, setSelectedGroup] = useState('');

  // Generate or extract sessionID and selectedGroup from URL
  useEffect(() => {
    const urlSessionID = searchParams.get('sessionID');
    
    let newSessionID = urlSessionID;
    let needsUpdate = false;

    if (!urlSessionID) {
      // Generate new sessionID if not in URL
      newSessionID = Math.random().toString(36).substring(2, 15);
      needsUpdate = true;
    }

    setSessionID(newSessionID);

    // Update URL with the new parameters if needed
    if (needsUpdate) {
      router.replace(`/?sessionID=${newSessionID}&round=1`);
    }
    
    setShowPopup(true);
  }, [searchParams, router]);

  const handleLogoClick = () => {
    router.push("/");
  };

  const handleClosePopup = () => {
    setShowPopup(false);
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
        <SessionConfigPopup 
          open={showPopup}
          onClose={handleClosePopup}
          sessionID={sessionID}
          selectedGroup={selectedGroup}
        />
        <SelectionClient />
      </div>
    </div>
  );
}