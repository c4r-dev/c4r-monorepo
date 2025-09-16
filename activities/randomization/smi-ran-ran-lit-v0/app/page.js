'use client';

import { useState } from 'react';

export default function Home() {
  const [selectedPaper, setSelectedPaper] = useState(null);
  const [answers, setAnswers] = useState({
    question1: '',
    question2: '',
    question3: '',
    question4: ''
  });

  // Function to handle paper selection
  const handlePaperSelect = (paperTitle) => {
    setSelectedPaper(paperTitle);
    // Reset answers when switching papers
    setAnswers({
      question1: '',
      question2: '',
      question3: '',
      question4: ''
    });
  };

  // Function to handle answer changes
  const handleAnswerChange = (questionId, value) => {
    setAnswers(prev => ({
      ...prev,
      [questionId]: value
    }));
  };

  // Function to save answers and proceed to Phase 2
  const handleSaveAndProceed = () => {
    // Store answers in localStorage
    localStorage.setItem('randomizationReviewAnswers', JSON.stringify({
      paper: selectedPaper,
      answers: answers
    }));
  
    // Navigate to Phase 2 using window.location
    window.location.href = '/phase-2';
  };

  // Methods sections content for each paper
  const methodsSections = {
    NMDA: {
      title: "Effects of NMDA receptor antagonist on spatial memory in mice",
      citation: "Jensen et al., Neuropharmacology, 2023",
      content: `
        <h4>Animals</h4>
        <p>Male C57BL/6J mice (10-12 weeks old) were obtained from Jackson Laboratory and housed under standard laboratory conditions (12 h light/dark cycle with lights on at 7:00 AM, 22 ± 2°C, 60 ± 5% humidity). Mice were housed in groups of 4-5 per cage with access to food and water ad libitum.</p>
        
        <h4>Drug Treatment</h4>
        <p>MK-801 (dizocilpine), a non-competitive NMDA receptor antagonist, was dissolved in saline and administered intraperitoneally (i.p.) at doses of 0.05, 0.1, or 0.2 mg/kg 30 minutes prior to behavioral testing. Control animals received saline injections of equivalent volumes.</p>
        
        <h4>Experimental Design</h4>
        <p>Mice were divided into four treatment groups (n = 12 per group). The groups were administered either vehicle (saline) or MK-801 at one of three doses (0.05, 0.1, or 0.2 mg/kg). The spatial memory test was conducted in the Morris water maze.</p>
        
        <h4>Morris Water Maze</h4>
        <p>The Morris water maze consisted of a circular pool (120 cm diameter) filled with water (25 ± 1°C) made opaque with non-toxic white paint. The maze was divided into four quadrants, with a hidden platform (10 cm diameter) submerged 1 cm below the water surface in one of the quadrants. Mice underwent 4 training trials per day for 5 consecutive days. On each trial, mice were placed into the water facing the wall of the pool at one of four designated start positions. Mice were allowed to swim until they found the platform or until 60 seconds had elapsed. If the mouse failed to find the platform within 60 seconds, it was guided to the platform by the experimenter. Mice remained on the platform for 15 seconds before being removed.</p>
      `
    },
    Environmental: {
      title: "Environmental enrichment effects on neuronal cell viability",
      citation: "Rodriguez et al., J Neurosci Methods, 2022",
      content: `
        <h4>Animals and Housing Conditions</h4>
        <p>Thirty-six adult male Wistar rats (8 weeks old) were obtained from Charles River Laboratories. Upon arrival, rats were divided into two housing conditions: standard housing (SH; n = 18) or environmentally enriched housing (EE; n = 18). SH rats were housed in pairs in standard laboratory cages (40 × 25 × 20 cm) with bedding material, food, and water. EE rats were housed in groups of six in large cages (100 × 50 × 50 cm) equipped with a variety of objects including tunnels, shelters, toys, and running wheels that were rearranged and partially replaced twice weekly. All rats were maintained under controlled temperature (22 ± 1°C) and humidity (55 ± 5%) with a 12-hour light/dark cycle.</p>
        
        <h4>Experimental Timeline</h4>
        <p>After 30 days in their respective housing conditions, half of the rats from each housing condition (n = 9 per group) were subjected to a neurochemical assay, while the remaining rats underwent behavioral testing before tissue collection.</p>
        
        <h4>Tissue Collection and Preparation</h4>
        <p>Rats were deeply anesthetized with sodium pentobarbital (60 mg/kg, i.p.) and transcardially perfused with ice-cold phosphate-buffered saline followed by 4% paraformaldehyde. Brains were removed, post-fixed overnight, and transferred to 30% sucrose solution. Coronal sections (40 μm) were cut using a cryostat and stored in cryoprotectant solution at -20°C until processing.</p>
        
        <h4>Cell Viability Assessment</h4>
        <p>Neuronal viability was assessed in the hippocampus and prefrontal cortex using the MTT (3-(4,5-dimethylthiazol-2-yl)-2,5-diphenyltetrazolium bromide) assay. Fresh tissue samples were dissected, homogenized, and incubated with MTT solution (0.5 mg/ml) for 3 hours at 37°C. The formazan crystals formed were solubilized with DMSO, and absorbance was measured at 570 nm using a spectrophotometer.</p>
      `
    },
    Family: {
      title: "Family environment effects on zebrafish brain development",
      citation: "Based on Antunes et al., Scientific Reports, 2021",
      content: `
        <h4>Animals and Breeding</h4>
        <p>Wild-type zebrafish (Danio rerio) of the AB strain were maintained in a recirculating system (Techniplast) at 28°C on a 14h light/10h dark cycle. Adult zebrafish were paired for breeding, and fertilized eggs were collected within 1 hour of spawning. Embryos were raised in E3 medium (5 mM NaCl, 0.17 mM KCl, 0.33 mM CaCl2, 0.33 mM MgSO4) supplemented with 0.1% methylene blue to prevent fungal growth.</p>
        
        <h4>Experimental Groups</h4>
        <p>At 5 days post-fertilization (dpf), larvae were allocated to one of three experimental conditions: (1) isolated rearing (1 larva per 200 mL tank), (2) normal density (15 larvae per 1L tank), or (3) high density (50 larvae per 1L tank). Each condition was replicated 6 times. Fish were maintained in these conditions until 21 dpf, at which point they were processed for brain development analysis.</p>
        
        <h4>Behavioral Assessment</h4>
        <p>At 20 dpf, a subset of fish from each condition was tested for locomotor activity in a novel tank test. Individual fish were placed in a rectangular tank (10 × 5 × 5 cm) filled with system water, and their movement was recorded for 10 minutes using a camera positioned above the tank. Videos were analyzed using EthoVision XT software (Noldus) to quantify distance moved, velocity, and time spent in different regions of the tank.</p>
        
        <h4>Tissue Processing and Microscopy</h4>
        <p>At 21 dpf, fish were euthanized with an overdose of MS-222 (tricaine methanesulfonate, 500 mg/L). Whole heads were fixed in 4% paraformaldehyde, embedded in paraffin, and sectioned at 5 μm thickness. Sections were stained with hematoxylin and eosin for general morphological examination. For immunohistochemistry, sections were labeled with antibodies against HuC/D (neuronal marker) and proliferating cell nuclear antigen (PCNA, cell proliferation marker).</p>
      `
    }
  };

  return (
    <main className="content-container">
      <section className="review-section">
        <h1 className="section-title">Phase 1: Critical Review</h1>

        <div className="instructions-container">
          <h2>Instructions</h2>
          <div className="instruction-text">
            <p>In this activity, you&apos;ll examine how randomization is reported in scientific papers and identify what information is missing.</p>

            <p>First, select one of the papers below. Then review its methods section and identify questions you have about how randomization was implemented.</p>

            <p>Consider the following as you review:</p>

            <ul className="review-points">
              <li>Was randomization actually performed?</li>
              <li>What information is missing about the randomization procedure?</li>
              <li>What additional details would you need to replicate this study?</li>
              <li>Are there aspects of the study that should have been randomized but might not have been?</li>
            </ul>
          </div>
        </div>

        <h2 className="paper-selection-heading">Select a paper to review:</h2>

        <div className="paper-selection">
          <button
            className={`paper-option ${selectedPaper === 'NMDA' ? 'selected' : ''}`}
            onClick={() => handlePaperSelect('NMDA')}
          >
            <h3>Effects of NMDA receptor antagonist on spatial memory in mice</h3>
            <p className="paper-citation">Jensen et al., Neuropharmacology, 2023</p>
          </button>

          <button
            className={`paper-option ${selectedPaper === 'Environmental' ? 'selected' : ''}`}
            onClick={() => handlePaperSelect('Environmental')}
          >
            <h3>Environmental enrichment effects on neuronal cell viability</h3>
            <p className="paper-citation">Rodriguez et al., J Neurosci Methods, 2022</p>
          </button>

          <button
            className={`paper-option ${selectedPaper === 'Family' ? 'selected' : ''}`}
            onClick={() => handlePaperSelect('Family')}
          >
            <h3>Family environment effects on zebrafish brain development</h3>
            <p className="paper-citation">Based on Antunes et al., Scientific Reports, 2021</p>
          </button>
        </div>

        {selectedPaper && (
          <div className="methods-review-section">
            <h2 className="methods-title">Methods Section Review</h2>

            <div className="methods-container">
              <div className="methods-header">
                <h3>{methodsSections[selectedPaper].title}</h3>
                <p className="methods-citation">{methodsSections[selectedPaper].citation}</p>
              </div>

              <div
                className="methods-content"
                dangerouslySetInnerHTML={{ __html: methodsSections[selectedPaper].content }}
              />
            </div>

            <div className="review-prompt-container">
              <h3>Review Questions</h3>
              <p>As you read the methods section above, consider the following questions about randomization and type your answers in the text boxes. Your answers will be used in Phase 2.</p>

              <div className="review-questions">
                <div className="review-question">
                  <h4>1. Was randomization performed?</h4>
                  <p>Look for explicit mentions of randomization or random assignment. If not explicitly stated, what clues suggest randomization might or might not have occurred?</p>
                  <textarea
                    className="answer-input"
                    value={answers.question1}
                    onChange={(e) => handleAnswerChange('question1', e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={4}
                  />
                </div>

                <div className="review-question">
                  <h4>2. What information is missing about the randomization procedure?</h4>
                  <p>Consider what details about the randomization process are not reported but would be important to know.</p>
                  <textarea
                    className="answer-input"
                    value={answers.question2}
                    onChange={(e) => handleAnswerChange('question2', e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={4}
                  />
                </div>

                <div className="review-question">
                  <h4>3. What would you need to replicate this study?</h4>
                  <p>Identify specific randomization details that would be necessary to conduct an exact replication.</p>
                  <textarea
                    className="answer-input"
                    value={answers.question3}
                    onChange={(e) => handleAnswerChange('question3', e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={4}
                  />
                </div>

                <div className="review-question">
                  <h4>4. What should have been randomized?</h4>
                  <p>Are there aspects of the study design that should have been randomized but may not have been?</p>
                  <textarea
                    className="answer-input"
                    value={answers.question4}
                    onChange={(e) => handleAnswerChange('question4', e.target.value)}
                    placeholder="Enter your answer here..."
                    rows={4}
                  />
                </div>
              </div>

              <div className="submit-section">
                <button
                  className="save-proceed-button"
                  onClick={handleSaveAndProceed}
                  disabled={!answers.question1 || !answers.question2 || !answers.question3 || !answers.question4}
                >
                  Save and Proceed to Phase 2
                </button>
                <p className="submit-note">Please answer all questions before proceeding.</p>
              </div>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}