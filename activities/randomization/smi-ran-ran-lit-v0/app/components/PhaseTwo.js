'use client';

import { useState, useEffect } from 'react';

export default function PhaseTwo() {
  const [savedData, setSavedData] = useState(null);
  const [revisionAnswers, setRevisionAnswers] = useState({
    improvement1: '',
    improvement2: '',
    improvement3: '',
    bestPractices: ''
  });
  
  // Load saved data from Phase 1
  useEffect(() => {
    const data = localStorage.getItem('randomizationReviewAnswers');
    if (data) {
      setSavedData(JSON.parse(data));
    }
  }, []);

  // Function to handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setRevisionAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Function to handle submission
  const handleSubmit = () => {
    // Store Phase 2 answers in localStorage
    localStorage.setItem('randomizationRevisionAnswers', JSON.stringify(revisionAnswers));
    
    // Navigate to Phase 3
    window.location.href = '/phase-3';
  };

  // Sample best practices for each paper type
  const bestPracticesContent = {
    NMDA: `
      <h4>Best Practices for Randomization in Animal Studies</h4>
      <ul>
        <li>Use computerized random number generators for group assignment</li>
        <li>Implement block randomization to ensure balanced group sizes</li>
        <li>Randomize housing conditions and cage locations</li>
        <li>Randomize the order of behavioral testing</li>
        <li>Report random seed numbers for computational randomization</li>
        <li>Use automated testing equipment when possible to reduce experimenter bias</li>
      </ul>
    `,
    Environmental: `
      <h4>Best Practices for Randomization in Housing Condition Studies</h4>
      <ul>
        <li>Randomly assign animals to housing conditions using validated methods</li>
        <li>Randomize animal selection for testing and assay procedures</li>
        <li>Perform tissue collection in random order</li>
        <li>Assign random identifiers to samples for blinded analysis</li>
        <li>Randomize the orientation and position of subjects during imaging</li>
        <li>Document the randomization procedure in detail for replication</li>
      </ul>
    `,
    Family: `
      <h4>Best Practices for Randomization in Developmental Studies</h4>
      <ul>
        <li>Randomize embryo selection from multiple breeding pairs</li>
        <li>Assign larvae to experimental conditions using a formal randomization procedure</li>
        <li>Randomize tank positions in the housing system</li>
        <li>Process samples in random order for histological analysis</li>
        <li>Randomize the order of behavioral testing</li>
        <li>Use randomization software and report the method used</li>
      </ul>
    `
  };

  // Get paper-specific information if available
  const getPaperInfo = () => {
    if (!savedData || !savedData.paper) return null;
    
    const paperType = savedData.paper;
    const titles = {
      NMDA: "Effects of NMDA receptor antagonist on spatial memory in mice",
      Environmental: "Environmental enrichment effects on neuronal cell viability",
      Family: "Family environment effects on zebrafish brain development"
    };
    
    const citations = {
      NMDA: "Jensen et al., Neuropharmacology, 2023",
      Environmental: "Rodriguez et al., J Neurosci Methods, 2022",
      Family: "Based on Antunes et al., Scientific Reports, 2021"
    };
    
    return {
      title: titles[paperType],
      citation: citations[paperType],
      bestPractices: bestPracticesContent[paperType]
    };
  };

  const paperInfo = getPaperInfo();

  return (
    <main className="content-container">
      <section className="review-section">
        <h1 className="section-title">Phase 2: Improving Randomization Reporting</h1>
        
        <div className="instructions-container">
          <h2>Instructions</h2>
          <div className="instruction-text">
            <p>In Phase 1, you identified issues with how randomization was reported in the methods section. Now, you&apos;ll develop specific improvements to enhance the randomization reporting.</p>
            
            <p>Review your Phase 1 answers and consider how the authors could better report their randomization procedures to improve transparency and reproducibility.</p>
            
            <p>The goal of this phase is to develop concrete, specific recommendations that could be implemented in a revised methods section.</p>
          </div>
        </div>

        {!savedData ? (
          <div className="alert-message">
            <h3>No data from Phase 1 found</h3>
            <p>Please complete Phase 1 before proceeding to Phase 2.</p>
            <button 
              className="save-proceed-button" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1rem' }}
            >
              Go to Phase 1
            </button>
          </div>
        ) : (
          <>
            <div className="phase1-summary">
              <h2>Paper Selected in Phase 1</h2>
              {paperInfo && (
                <div className="paper-summary">
                  <h3>{paperInfo.title}</h3>
                  <p className="paper-citation">{paperInfo.citation}</p>
                </div>
              )}
              
              <h3 className="summary-heading">Your Phase 1 Answers</h3>
              <div className="summary-container">
                <div className="summary-item">
                  <h4>Was randomization performed?</h4>
                  <p>{savedData.answers.question1}</p>
                </div>
                
                <div className="summary-item">
                  <h4>What information is missing about the randomization procedure?</h4>
                  <p>{savedData.answers.question2}</p>
                </div>
                
                <div className="summary-item">
                  <h4>What would you need to replicate this study?</h4>
                  <p>{savedData.answers.question3}</p>
                </div>
                
                <div className="summary-item">
                  <h4>What should have been randomized?</h4>
                  <p>{savedData.answers.question4}</p>
                </div>
              </div>
            </div>

            <div className="best-practices-section">
              <h2>Best Practices for Randomization Reporting</h2>
              
              {paperInfo && (
                <div 
                  className="best-practices-container"
                  dangerouslySetInnerHTML={{ __html: paperInfo.bestPractices }}
                />
              )}
            </div>
            
            <div className="revision-section">
              <h2>Improving the Methods Section</h2>
              <p className="section-intro">Based on your analysis in Phase 1 and the best practices above, provide specific recommendations to improve the randomization reporting in this methods section.</p>
              
              <div className="revision-questions">
                <div className="revision-question">
                  <h4>1. Specific details to add about randomization methods</h4>
                  <p>What specific information about the randomization procedure should be added?</p>
                  <textarea 
                    className="answer-input"
                    value={revisionAnswers.improvement1}
                    onChange={(e) => handleAnswerChange('improvement1', e.target.value)}
                    placeholder="Example: The authors should specify the method used for random assignment (e.g., computer-generated random numbers)..."
                    rows={4}
                  />
                </div>
                
                <div className="revision-question">
                  <h4>2. Additional randomization procedures to implement</h4>
                  <p>What additional aspects of the study should be randomized?</p>
                  <textarea 
                    className="answer-input"
                    value={revisionAnswers.improvement2}
                    onChange={(e) => handleAnswerChange('improvement2', e.target.value)}
                    placeholder="Example: The authors should randomize the order of behavioral testing to avoid time-of-day effects..."
                    rows={4}
                  />
                </div>
                
                <div className="revision-question">
                  <h4>3. Write an improved randomization paragraph</h4>
                  <p>Draft a paragraph that could be added to the methods section to properly describe the randomization procedures.</p>
                  <textarea 
                    className="answer-input"
                    value={revisionAnswers.improvement3}
                    onChange={(e) => handleAnswerChange('improvement3', e.target.value)}
                    placeholder="Example: Animals were randomly assigned to experimental groups using a computer-generated randomization sequence with a block size of 4 to ensure equal group sizes..."
                    rows={6}
                  />
                </div>
                
                <div className="revision-question">
                  <h4>4. Which best practices are most important for this study?</h4>
                  <p>From the list of best practices, which 3-5 would be most crucial to implement in this specific study?</p>
                  <textarea 
                    className="answer-input"
                    value={revisionAnswers.bestPractices}
                    onChange={(e) => handleAnswerChange('bestPractices', e.target.value)}
                    placeholder="Example: 1. Use of computerized random number generation, 2. Randomization of testing order, 3. Reporting of the random seed number..."
                    rows={4}
                  />
                </div>
              </div>
              
              <div className="submit-section">
                <button 
                  className="save-proceed-button"
                  onClick={handleSubmit}
                  disabled={!revisionAnswers.improvement1 || !revisionAnswers.improvement2 || !revisionAnswers.improvement3 || !revisionAnswers.bestPractices}
                >
                  Submit Your Answers
                </button>
                <p className="submit-note">Please answer all questions before submitting.</p>
              </div>
            </div>
          </>
        )}
      </section>
    </main>
  );
}