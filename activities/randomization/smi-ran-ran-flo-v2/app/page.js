'use client';

import { useState } from 'react';

// Initial state for environment checkboxes
const initialEnvironmentState = {
    none: false, time: false, batches: false, gradients: false,
    handling: false, testing: false, personnel: false, edge: false, sites: false,
};
// Get keys for environment options to split into columns
const environmentKeys = Object.keys(initialEnvironmentState);
const midIndex = Math.ceil(environmentKeys.length / 2);
const envKeysCol1 = environmentKeys.slice(0, midIndex);
const envKeysCol2 = environmentKeys.slice(midIndex);

// Define labels for environment keys
const environmentLabels = {
    none: 'None', 
    time: 'Time-effects (day/night, seasonal)', 
    batches: 'Enrollment in batches or cohorts', 
    gradients: 'Environmental gradients (temperature, light, position of tank/cage)',
    handling: 'Handling / selection order', 
    testing: 'Testing Order', 
    personnel: 'Personnel effects',
    edge: 'Edge Effects (plates, cages)', 
    sites: 'Multi-sites'
};

export default function WelcomePage() {
    // Study Characteristics state variables
    const [covariates, setCovariates] = useState(''); // Q1
    const [environment, setEnvironment] = useState(initialEnvironmentState); // Q2
    const [sampleSize, setSampleSize] = useState(''); // Q3
    
    // Flowchart/Next Steps state variables
    const [strongCovariates, setStrongCovariates] = useState(''); // Flowchart Q1
    const [envBias, setEnvBias] = useState('');                   // Flowchart Q2
    const [flowchartSampleSize, setFlowchartSampleSize] = useState(''); // Flowchart Q3

    // Modal state
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [recommendedMethodName, setRecommendedMethodName] = useState('');
    const [recommendedMethodDetails, setRecommendedMethodDetails] = useState('');

    // Reset function - Reset all states
    const handleReset = () => {
        setCovariates('');
        setEnvironment(initialEnvironmentState);
        setSampleSize('');
        setStrongCovariates('');
        setEnvBias('');
        setFlowchartSampleSize('');
        setIsModalOpen(false);
        setRecommendedMethodName('');
        setRecommendedMethodDetails('');
    }

    // --- Question Logic (Simplified, Removed modal checks) ---

    // Auto-update flowchart questions based on study characteristics
    const updateFlowchartQuestions = (newCovariates, newEnvironment, newSampleSize) => {
        // Auto-set strong covariates based on covariates selection
        if (newCovariates === 'one_or_more') {
            setStrongCovariates('yes');
        } else if (newCovariates === 'none') {
            setStrongCovariates('no');
        } else {
            setStrongCovariates('');
        }

        // Auto-set environmental bias based on environment selections
        const hasEnvironmentalFactors = Object.entries(newEnvironment).some(([key, value]) => 
            key !== 'none' && value === true
        );
        if (hasEnvironmentalFactors) {
            setEnvBias('yes');
        } else if (newEnvironment.none) {
            setEnvBias('no');
        } else {
            setEnvBias('');
        }

        // Auto-set flowchart sample size based on sample size selection
        if (newSampleSize === 'small' || newSampleSize === 'moderate') {
            setFlowchartSampleSize('small_moderate');
        } else if (newSampleSize === 'large') {
            setFlowchartSampleSize('large');
        } else {
            setFlowchartSampleSize('');
        }
    };

    // Q1 (Covariates): Update state and flowchart
    const handleCovariatesChange = (event) => {
        const newCovariates = event.target.value;
        setCovariates(newCovariates);
        // Reset subsequent steps
        setEnvironment(initialEnvironmentState);
        setSampleSize('');
        updateFlowchartQuestions(newCovariates, initialEnvironmentState, '');
    };

    // Q2 (Environment): Update state and flowchart
    const handleEnvironmentChange = (event) => {
        const { name, checked } = event.target;
        const newEnvironment = { ...environment };
        if (name === 'none') {
            if (checked) {
                for (const key in newEnvironment) newEnvironment[key] = false;
                newEnvironment.none = true;
            } else {
                newEnvironment.none = false;
            }
        } else {
            newEnvironment[name] = checked;
            if (checked) newEnvironment.none = false;
        }
        
        setEnvironment(newEnvironment);
        setSampleSize('');
        updateFlowchartQuestions(covariates, newEnvironment, '');
    };

    // Q3 (Sample Size): Update state and flowchart
    const handleSampleSizeChange = (event) => {
        const newSampleSize = event.target.value;
        setSampleSize(newSampleSize);
        updateFlowchartQuestions(covariates, environment, newSampleSize);
    };

    // Helper functions
    const getFontWeight = (isSelected) => (isSelected ? 'bold' : 'normal');
    const getSelectedClass = (isSelected) => (isSelected ? 'selected-disabled-option' : '');

    // Check if all flowchart questions are answered
    const allFlowchartQuestionsAnswered = !!strongCovariates && !!envBias && !!flowchartSampleSize;

    // Function to determine recommendation and open the modal
    const handleShowRecommendation = () => {
        if (!allFlowchartQuestionsAnswered) return;

        let methodName = '';
        let methodDetails = '';

        // Determine recommendation based on flowchart answers
        if (strongCovariates === 'yes' && envBias === 'yes') {
            methodName = 'Block and Stratified Randomization';
            methodDetails = 'For studies with strong covariates and environmental variations to worry about, block randomization and stratified randomization work together to balance selected covariates, and balance groups over time and place.';
        } else if (strongCovariates === 'yes' && envBias === 'no') {
            methodName = 'Stratified Randomization';
            methodDetails = 'When important covariates need to be controlled, stratified randomization helps balance selected covariates across treatment groups.';
        } else if (strongCovariates === 'no' && envBias === 'yes') {
            methodName = 'Block Randomization';
            methodDetails = 'For studies with environmental variations to worry about such time effects or different sites, block randomization can also create balance over time and place.';
        } else if (strongCovariates === 'no' && envBias === 'no') {
            if (flowchartSampleSize === 'small_moderate') {
                methodName = 'Block Randomization';
                methodDetails = 'For studies with environmental variations to worry about such time effects or different sites, block randomization can also create balance over time and place.';
            } else if (flowchartSampleSize === 'large') {
                methodName = 'Simple randomization';
                methodDetails = 'With a large sample size, simple randomization can produce sufficiently balanced groups. If you do not need to consider environmental sources of bias or strong covariates, simple is easy to implement and interpret.';
            }
        }

        setRecommendedMethodName(methodName);
        setRecommendedMethodDetails(methodDetails);
        setIsModalOpen(true);
    };

    // Function to close the modal
    const closeModal = () => {
        setIsModalOpen(false);
    };

    // --- RENDER ---
    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', width: '100%', maxWidth: '1000px', margin: '80px auto 20px auto', padding: '20px' }}>
            
            <div className="content-boxes-container" style={{ width: '100%', marginBottom: '30px', alignItems: 'stretch' }}>

                {/* Left Column: Study Characteristics */}
                <div className="question-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid black' }}>
                    <h4 style={{ marginBottom: '20px', fontWeight: 'bold', textAlign:'center', width:'100%' }}>Study Characteristics</h4>
                    
                    {/* Question 1 Display */}
                    <div style={{ marginBottom: '25px' }}>
                       <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>1. Known important covariates / prognostic factors?</h5>
                        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', width: 'fit-content' }}>
                           <div className="radio-option" style={{ padding: '5px' }}>
                               <input type="radio" id="cov_none" name="covariates" value="none" checked={covariates === 'none'} onChange={handleCovariatesChange} />
                               <label htmlFor="cov_none" style={{ fontWeight: getFontWeight(covariates === 'none') }}>None</label>
                           </div>
                           <div className="radio-option" style={{ padding: '5px' }}>
                               <input type="radio" id="cov_one_or_more" name="covariates" value="one_or_more" checked={covariates === 'one_or_more'} onChange={handleCovariatesChange} />
                               <label htmlFor="cov_one_or_more" style={{ fontWeight: getFontWeight(covariates === 'one_or_more') }}>One or more</label>
                           </div>
                       </div>
                    </div>

                    {/* Question 2 Display */}
                    <div style={{ marginBottom: '25px' }}>
                        <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>2. Potential sources of environmental variation?</h5>
                        <div style={{ display: 'flex', justifyContent: 'space-between', gap: '20px', width: '100%', maxWidth: '450px' }}>
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                               {envKeysCol1.map((key) => (
                                   <div key={key} className="checkbox-option">
                                       <input type="checkbox" id={`env_${key}`} name={key} checked={environment[key]} onChange={handleEnvironmentChange} />
                                       <label htmlFor={`env_${key}`} style={{ fontWeight: getFontWeight(environment[key]) }}>{environmentLabels[key] || key}</label>
                                   </div>
                               ))}
                           </div>
                           <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', gap: '10px' }}>
                               {envKeysCol2.map((key) => (
                                   <div key={key} className="checkbox-option">
                                       <input type="checkbox" id={`env_${key}`} name={key} checked={environment[key]} onChange={handleEnvironmentChange} />
                                       <label htmlFor={`env_${key}`} style={{ fontWeight: getFontWeight(environment[key]) }}>{environmentLabels[key] || key}</label>
                                   </div>
                               ))}
                           </div>
                        </div>
                    </div>

                    {/* Question 3 Display */}
                    <div style={{ marginBottom: '15px' }}>
                       <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>3. Sample size?</h5>
                       <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', width: 'fit-content' }}>
                           <div className="radio-option" style={{ padding: '5px' }}>
                               <input type="radio" id="small" name="sampleSize" value="small" checked={sampleSize === 'small'} onChange={handleSampleSizeChange} />
                               <label htmlFor="small" style={{ fontWeight: getFontWeight(sampleSize === 'small') }}>Small</label>
                           </div>
                           <div className="radio-option" style={{ padding: '5px' }}>
                               <input type="radio" id="moderate" name="sampleSize" value="moderate" checked={sampleSize === 'moderate'} onChange={handleSampleSizeChange} />
                               <label htmlFor="moderate" style={{ fontWeight: getFontWeight(sampleSize === 'moderate') }}>Moderate</label>
                           </div>
                           <div className="radio-option" style={{ padding: '5px' }}>
                               <input type="radio" id="large" name="sampleSize" value="large" checked={sampleSize === 'large'} onChange={handleSampleSizeChange} />
                               <label htmlFor="large" style={{ fontWeight: getFontWeight(sampleSize === 'large') }}>Large</label>
                           </div>
                       </div>
                   </div>
                </div>

                {/* Right Column: Flowchart / Next Steps */}
                <div className="flowchart-visual-box" style={{ flex: 1, display: 'flex', flexDirection: 'column', border: '1px solid black' }}>
                    <h4 style={{ marginBottom: '15px', fontWeight: 'bold', textAlign:'center', width:'100%' }}>Flowchart / Next Steps</h4>
                    <div style={{ textAlign: 'left', width: '100%', marginTop: '5px', flexGrow: 1, paddingLeft: '20px', display: 'flex', flexDirection: 'column', gap: '25px' }}>

                       {/* Flowchart Question 1 */}
                       <div>
                           <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>1. Are there strong covariates you need to control for?</h5>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', width: 'fit-content' }}>
                               <div className={`radio-option ${getSelectedClass(strongCovariates === 'yes')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="strong_cov_yes" name="strongCovariates" value="yes" checked={strongCovariates === 'yes'} disabled readOnly />
                                   <label htmlFor="strong_cov_yes" style={{ fontWeight: getFontWeight(strongCovariates === 'yes'), cursor: 'default' }}>Yes</label>
                               </div>
                               <div className={`radio-option ${getSelectedClass(strongCovariates === 'no')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="strong_cov_no" name="strongCovariates" value="no" checked={strongCovariates === 'no'} disabled readOnly />
                                   <label htmlFor="strong_cov_no" style={{ fontWeight: getFontWeight(strongCovariates === 'no'), cursor: 'default' }}>No</label>
                               </div>
                           </div>
                       </div>

                       {/* Flowchart Question 2 */}
                       <div>
                           <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>2. Are there environmental sources of bias you need to control for?</h5>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', width: 'fit-content' }}>
                               <div className={`radio-option ${getSelectedClass(envBias === 'yes')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="env_bias_yes" name="envBias" value="yes" checked={envBias === 'yes'} disabled readOnly />
                                   <label htmlFor="env_bias_yes" style={{ fontWeight: getFontWeight(envBias === 'yes'), cursor: 'default' }}>Yes</label>
                               </div>
                               <div className={`radio-option ${getSelectedClass(envBias === 'no')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="env_bias_no" name="envBias" value="no" checked={envBias === 'no'} disabled readOnly />
                                   <label htmlFor="env_bias_no" style={{ fontWeight: getFontWeight(envBias === 'no'), cursor: 'default' }}>No</label>
                               </div>
                           </div>
                       </div>

                       {/* Flowchart Question 3 */}
                       <div>
                           <h5 style={{ marginBottom: '8px', fontWeight: 'bold', width: '100%' }}>3. What is your sample size?</h5>
                           <div style={{ display: 'flex', flexWrap: 'wrap', gap: '5px 20px', width: 'fit-content' }}>
                               <div className={`radio-option ${getSelectedClass(flowchartSampleSize === 'small_moderate')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="flowchart_ss_small_mod" name="flowchartSampleSize" value="small_moderate" checked={flowchartSampleSize === 'small_moderate'} disabled readOnly />
                                   <label htmlFor="flowchart_ss_small_mod" style={{ fontWeight: getFontWeight(flowchartSampleSize === 'small_moderate'), cursor: 'default' }}>Small to Moderate</label>
                               </div>
                               <div className={`radio-option ${getSelectedClass(flowchartSampleSize === 'large')}`} style={{ padding: '5px' }}>
                                   <input type="radio" id="flowchart_ss_large" name="flowchartSampleSize" value="large" checked={flowchartSampleSize === 'large'} disabled readOnly />
                                   <label htmlFor="flowchart_ss_large" style={{ fontWeight: getFontWeight(flowchartSampleSize === 'large'), cursor: 'default' }}>Large</label>
                               </div>
                           </div>
                       </div>

                    </div>
                </div>

            </div>

            {/* Buttons Section */}
            <div className="button-container" style={{ display: 'flex', justifyContent: 'center', gap: '15px', marginTop: '20px', width: '100%', flexWrap: 'wrap' }}>
                {/* Start Over Button */}
                <button
                    onClick={handleReset}
                    className="action-button"
                    style={{ background: '#6c757d' }}
                >
                    Start Over
                </button>

                {/* Randomization Method Button */}
                <button
                    onClick={handleShowRecommendation}
                    className="action-button"
                    disabled={!allFlowchartQuestionsAnswered}
                >
                    RANDOMIZATION METHOD
                </button>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="modal-overlay" onClick={closeModal}>
                    <div className="modal-content" onClick={(e) => e.stopPropagation()}>
                        <h3 style={{marginTop: 0, marginBottom: '10px'}}>Recommended Method</h3>
                        <p style={{marginBottom: '8px'}}>
                            <strong>{recommendedMethodName || 'Error: Could not determine method.'}</strong>
                        </p>
                        <p style={{marginTop: 0, marginBottom: '20px', textAlign: 'left'}}>
                            {recommendedMethodDetails || 'No details available.'}
                        </p>

                        <button
                            onClick={closeModal}
                            className="action-button"
                            style={{marginTop: '10px'}}
                        >
                            Close
                        </button>
                    </div>
                </div>
            )}

        </div>
    );
}