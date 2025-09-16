'use client';

import { useState, useEffect } from 'react';

export default function PhaseThree() {
  const [phase1Data, setPhase1Data] = useState(null);
  const [phase2Data, setPhase2Data] = useState(null);
  const [applicationAnswers, setApplicationAnswers] = useState({
    selfAssessment: '',
    compareExpert: '',
    futureUse: '',
    newRandomization: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  
  // Load saved data from previous phases
  useEffect(() => {
    const p1Data = localStorage.getItem('randomizationReviewAnswers');
    const p2Data = localStorage.getItem('randomizationRevisionAnswers');
    
    if (p1Data) {
      setPhase1Data(JSON.parse(p1Data));
    }
    
    if (p2Data) {
      setPhase2Data(JSON.parse(p2Data));
    }
  }, []);

  // Function to handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setApplicationAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Function to handle submission
  const handleSubmit = () => {
    // Store Phase 3 answers in localStorage
    localStorage.setItem('randomizationApplicationAnswers', JSON.stringify(applicationAnswers));
    
    // Show completion message
    setIsSubmitted(true);
  };

  // Get paper-specific expert revisions
  const getExpertRevision = () => {
    if (!phase1Data || !phase1Data.paper) return null;
    
    const paperType = phase1Data.paper;
    
    const expertRevisions = {
      NMDA: {
        title: "Expert Revision for NMDA Receptor Study",
        content: `
          <h4>Randomization Procedures</h4>
          <p>Mice were randomly assigned to treatment groups using a computer-generated randomization sequence (R software, version 4.1.2, seed 20230317) with block randomization (block size = 4) to ensure equal group sizes. Animal identification numbers were used for randomization, and group assignments were concealed from investigators during the allocation process. The randomization was performed by a researcher not involved in behavioral testing or data analysis.</p>
          
          <h4>Testing Procedures</h4>
          <p>The order of behavioral testing was randomized across animals using a separate randomization sequence (R software, seed 20230318) to control for time-of-day effects. For the Morris water maze test, starting positions were pseudo-randomized across the four possible positions, with each animal starting from each position once per day, presented in a random order. The randomization of starting positions was generated using a Latin square design to ensure balance.</p>
          
          <h4>Data Analysis</h4>
          <p>Before group assignment was revealed for analysis, outlier detection was performed using pre-established criteria (values exceeding 2.5 standard deviations from the group mean). Three mice were excluded from analysis based on these criteria (one from the vehicle group, two from the 0.1 mg/kg MK-801 group).</p>
        `
      },
      Environmental: {
        title: "Expert Revision for Environmental Enrichment Study",
        content: `
          <h4>Randomization of Housing Conditions</h4>
          <p>Upon arrival, rats were randomly allocated to standard housing (SH; n = 18) or environmentally enriched housing (EE; n = 18) using a computer-generated randomization sequence (GraphPad Prism, seed number: 20220614). The randomization was stratified by body weight to ensure similar mean weights across housing conditions at the start of the experiment. The person performing the randomization was different from those conducting behavioral tests and tissue analysis.</p>
          
          <h4>Selection for Testing and Tissue Collection</h4>
          <p>After 30 days, half of the rats from each housing condition were randomly selected for neurochemical assay using a separate randomization sequence (GraphPad Prism, seed number: 20220715). The remaining rats were randomly assigned to a testing order for behavioral assessment using a third randomization sequence, with testing conducted by an investigator blinded to housing conditions.</p>
          
          <h4>Tissue Processing</h4>
          <p>Brain samples were labeled with unique numeric codes to mask housing condition during processing and analysis. The order of tissue processing and MTT assay was randomized using a computer-generated sequence to minimize potential bias from systematic processing effects.</p>
        `
      },
      Family: {
        title: "Expert Revision for Zebrafish Development Study",
        content: `
          <h4>Embryo Collection and Allocation</h4>
          <p>Fertilized eggs were collected from 12 breeding pairs to ensure genetic diversity. Eggs were pooled, and those with normal development at 4 hours post-fertilization were randomly allocated to experimental conditions using a computer-generated randomization sequence (Python 3.9, random.shuffle function, seed=20210327). A total of 450 viable embryos were distributed across the three experimental conditions (isolated rearing, normal density, and high density), with 150 embryos per condition.</p>
          
          <h4>Tank Assignment and Positioning</h4>
          <p>For each condition, embryos were randomly assigned to replicate tanks using a balanced approach to ensure equal numbers per tank. The positioning of tanks within the recirculating system was randomized and rotated every three days to control for potential position effects on water quality or light exposure.</p>
          
          <h4>Behavioral Testing and Tissue Collection</h4>
          <p>At 20 dpf, 20 fish from each condition were randomly selected for behavioral testing using a stratified randomization to include fish from all replicate tanks. The order of behavioral testing was randomized, with tests conducted by an experimenter blinded to rearing conditions. The remaining fish were euthanized at 21 dpf, with the order of processing randomized using a computer-generated sequence to prevent systematic biases in tissue preservation quality.</p>
        `
      }
    };
    
    return expertRevisions[paperType];
  };

  const expertRevision = getExpertRevision();

  return (
    <main className="content-container">
      <section className="review-section">
        <h1 className="section-title">Phase 3: Application and Reflection</h1>
        
        <div className="instructions-container">
          <h2>Instructions</h2>
          <div className="instruction-text">
            <p>In Phase 3, you&apos;ll compare your improvement suggestions with expert recommendations and reflect on how to apply these principles to future research.</p>
            
            <p>This final phase focuses on solidifying your understanding of randomization reporting best practices and preparing you to implement them in your own work.</p>
            
            <p>Review both your answers from Phase 2 and the expert revision provided, then answer the reflection questions below.</p>
          </div>
        </div>

        {(!phase1Data || !phase2Data) ? (
          <div className="alert-message">
            <h3>Missing data from previous phases</h3>
            <p>Please complete Phases 1 and 2 before proceeding to Phase 3.</p>
            <button 
              className="save-proceed-button" 
              onClick={() => window.location.href = '/'}
              style={{ marginTop: '1rem' }}
            >
              Go to Phase 1
            </button>
          </div>
        ) : isSubmitted ? (
          <div className="completion-message">
            <h2>Congratulations!</h2>
            <p>You have completed all three phases of the randomization reporting evaluation.</p>
            <p>Your answers have been saved. Thank you for participating in this exercise on improving randomization reporting in scientific research.</p>
            <div className="completion-actions">
              <button 
                className="save-proceed-button" 
                onClick={() => window.location.href = '/'}
              >
                Start Over
              </button>
            </div>
          </div>
        ) : (
          <>
            <div className="phase-summary-container">
              <div className="phase-summary">
                <h2>Your Phase 2 Improvements</h2>
                <div className="summary-item">
                  <h4>1. Specific details to add about randomization methods</h4>
                  <p>{phase2Data.improvement1}</p>
                </div>
                
                <div className="summary-item">
                  <h4>2. Additional randomization procedures to implement</h4>
                  <p>{phase2Data.improvement2}</p>
                </div>
                
                <div className="summary-item">
                  <h4>3. Your improved randomization paragraph</h4>
                  <p>{phase2Data.improvement3}</p>
                </div>
                
                <div className="summary-item">
                  <h4>4. Best practices you identified as most important</h4>
                  <p>{phase2Data.bestPractices}</p>
                </div>
              </div>
            </div>

            <div className="expert-revision-section">
              <h2>Expert Revision</h2>
              <p className="section-intro">Below is a comprehensive revision of the randomization reporting by an expert in the field. This represents a &quot;gold standard&quot; for how randomization should be reported for this type of study.</p>
              
              {expertRevision && (
                <div className="expert-revision-container">
                  <h3>{expertRevision.title}</h3>
                  <div 
                    className="expert-content"
                    dangerouslySetInnerHTML={{ __html: expertRevision.content }}
                  />
                </div>
              )}
            </div>
            
            <div className="application-section">
              <h2>Reflection and Application</h2>
              <p className="section-intro">Answer the following questions to reflect on what you&apos;ve learned about randomization reporting.</p>
              
              <div className="application-questions">
                <div className="application-question">
                  <h4>1. Self-assessment</h4>
                  <p>Compare your improved randomization paragraph with the expert revision. What key elements did you include or miss? What did you learn from this comparison?</p>
                  <textarea 
                    className="answer-input"
                    value={applicationAnswers.selfAssessment}
                    onChange={(e) => handleAnswerChange('selfAssessment', e.target.value)}
                    placeholder="Reflect on the similarities and differences between your revision and the expert version..."
                    rows={5}
                  />
                </div>
                
                <div className="application-question">
                  <h4>2. Expert techniques</h4>
                  <p>What specific techniques did the expert use to enhance clarity and reproducibility in their randomization reporting?</p>
                  <textarea 
                    className="answer-input"
                    value={applicationAnswers.compareExpert}
                    onChange={(e) => handleAnswerChange('compareExpert', e.target.value)}
                    placeholder="Identify specific techniques, structural elements, or details that made the expert revision effective..."
                    rows={5}
                  />
                </div>
                
                <div className="application-question">
                  <h4>3. Application to your research</h4>
                  <p>How will you apply what you&apos;ve learned about randomization reporting to your own future research or when reviewing others&apos; work?</p>
                  <textarea 
                    className="answer-input"
                    value={applicationAnswers.futureUse}
                    onChange={(e) => handleAnswerChange('futureUse', e.target.value)}
                    placeholder="Describe specific ways you'll implement these principles in your work..."
                    rows={5}
                  />
                </div>
                
                <div className="application-question">
                  <h4>4. Create a template</h4>
                  <p>Based on what you&apos;ve learned, write a general template for reporting randomization that could be adapted for different types of studies.</p>
                  <textarea 
                    className="answer-input"
                    value={applicationAnswers.newRandomization}
                    onChange={(e) => handleAnswerChange('newRandomization', e.target.value)}
                    placeholder="Write a general-purpose template with placeholders that could be adapted to various study types..."
                    rows={6}
                  />
                </div>
              </div>
              
              <div className="submit-section">
                <button 
                  className="save-proceed-button"
                  onClick={handleSubmit}
                  disabled={!applicationAnswers.selfAssessment || !applicationAnswers.compareExpert || !applicationAnswers.futureUse || !applicationAnswers.newRandomization}
                >
                  Complete Exercise
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