"use client";

import React, { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import '@xyflow/react/dist/style.css';
import '../biasMapping/biasMapping.css';
import './review.css';
import ReadOnlyBiasMapping from './ReadOnlyBiasMapping';

import Header from '@/app/components/Header/Header';

/**
 * Review page for displaying submitted bias mappings.
 * Features:
 * - Fetches and displays all submissions for a given session
 * - Renders read-only ReactFlow diagrams for each submission
 * - Grid layout for comparing multiple submissions
 * - Displays submission metadata (instance number, bias count)
 * 
 * URL Parameters:
 * - sessionID: Unique identifier for grouping related submissions
 * 
 * Components:
 * - ReviewFlow: Individual ReactFlow diagram renderer
 * - PageContent: Main content wrapper with data fetching
 * - ReadOnlyBiasMapping: Custom bias mapping component for display - will render a grid of these - same as BiasMapping.js but without the drag and drop or any interactivity
 * - ReadOnlyBiasNode: Custom node component for display - same as BiasNode.js but without the delete button or any interactivity
 * - ReadOnlyFloatingEdge: Custom edge component for display - same as FloatingEdge.js but without the interactive features
 * - EdgeLabel: Custom edge label component for display - same as EdgeLabel.js but without the interactive features
 * 
 */


const PageContent = () => {
  const searchParams = useSearchParams();
  const sessionID = searchParams.get('sessionID');
  const [submissions, setSubmissions] = useState([]);

  useEffect(() => {
    const fetchSubmissions = async () => {
      try {
        const response = await fetch('/api/biasMappingApi');
        const data = await response.json();
        const sessionSubmissions = data.filter(
          (submission) => submission.sessionID === sessionID
        );
        setSubmissions(sessionSubmissions);
      } catch (error) {
        console.error('Error fetching submissions:', error);
      }
    };

    if (sessionID) {
      fetchSubmissions();
    }
  }, [sessionID]);

  return (
    <div className="review-page">
      <Header />
      <div className="review-content">
        <div className="bias-mapping-directions">
          <p>This page displays the map you submitted. Did others draw similar links? What other connections do you see?</p>
        </div>
        {/* <h1>Review</h1> */}
        <div className="review-grid">
          {submissions.map((submission, index) => (
            <div key={index} className="review-grid-item">
              <h3>Submission #{index + 1}</h3>
              <ReadOnlyBiasMapping flowState={JSON.parse(submission.flow)} />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}


export default function ReviewPage() {
  return (
    <Suspense fallback={<h2>Loading...</h2>}>
      <PageContent />
    </Suspense>
  );
}
