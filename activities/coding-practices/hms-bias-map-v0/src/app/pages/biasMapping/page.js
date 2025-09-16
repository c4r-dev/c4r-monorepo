"use client";

import React, { useEffect, useState, Suspense } from "react";
import "@/app/globals.css";
import "./biasMapping.css";
import BiasMapping from "./BiasMapping";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import BiasConfigPopup from "@/app/components/BiasConfigPopup/BiasConfigPopup";
import CustomModal from "@/app/components/CustomModal/CustomModal";


// This is the page that renders the BiasMapping component, which is a ReactFlow component that allows the user to map relationships between bias nodes.
// There will be a drag and drop pane below the ReactFlow area that allows the user to drag and drop the bias nodes into the ReactFlow area.
// Upon adding the bias nodes to the ReactFlow area, the nodes will disapear from the drag and drop pane.
// If the node is deleted from the ReactFlow area, it will reappear in the drag and drop pane.
// Connection
// Utilize the ReactFlow easyconnect feature to connect the nodes.

// Config Popup
// This is a popup that appears at the start of the activity.
// It will be split down the middle.
// On the left side, there will be a count-selection-area.
// On the right side, there will be a region with displaying a link to the same page, but with a the sessionID parameter and the biasNumber parameter.
// Below is a button to start the activity.
// Below that, there will be a button to go back to the config popup.

/*
On page load, the page will check if the URL has a sessionID parameter and a biasNumber parameter.
If it does not, it will open up the config popup (We havent implemented this popup yet)
*/


const PageContent = () => {
  const [showConfigPopup, setShowConfigPopup] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);
  const searchParams = useSearchParams();
  const groupModeOnly = searchParams.get('groupModeOnly') === 'true';

  
  useEffect(() => {
    // Show config popup if no sessionID is present
    if (!searchParams.get('sessionID')) {
      setShowConfigPopup(true);
    }
  }, [searchParams]);

  const handleConfigSubmit = (config) => {
    setShowConfigPopup(false);
  };

  const handleHelpClick = () => {
    setShowGuideModal(true);
  };

  return (
    <div className="full-page">
      <Header onHelpClick={handleHelpClick} />
      <div className="bias-mapping-content">
        <div className="bias-mapping-directions">
          <p>Draw lines to connect selected biases in a non-linear web. Describe the relationship that links them together.</p>
        </div>
        <div className="bias-mapping-interface">
          <BiasMapping />
        </div>
      </div>
      
      <BiasConfigPopup
        open={showConfigPopup}
        onClose={() => setShowConfigPopup(false)}
        onConfigSubmit={handleConfigSubmit}
        groupModeOnly={groupModeOnly}
      />

      <CustomModal 
        isOpen={showGuideModal}
        closeModal={() => setShowGuideModal(false)}
      />
    </div>
  );
}

export default function BiasMappingPage() {

  return (
    <Suspense fallback={
            <h2>
                Loading...
            </h2>
    }>
        <PageContent />
    </Suspense>
);
}



