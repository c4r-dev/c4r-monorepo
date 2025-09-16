'use client';

import { useState } from "react";

export default function Home() {
  const [step, setStep] = useState("initial"); // Tracks the current step in the flow
  const [sampleSize, setSampleSize] = useState(""); // Tracks selected sample size
  const [envBias, setEnvBias] = useState(""); // Tracks environmental bias selection
  const [hasStrongCovariates, setHasStrongCovariates] = useState(""); // Tracks covariates selection

  // Handlers for various steps
  const handleContinue = () => {
    if (sampleSize === "small" || sampleSize === "moderate") {
      setStep("blockRecommendation");
    } else if (sampleSize === "large") {
      setStep("environmentalBiasQuestion");
    }
  };

  const handleEnvBiasYes = () => {
    setEnvBias("yes");
    setStep("covariatesQuestion");
  };

  const handleEnvBiasNo = () => {
    setEnvBias("no");
    setStep("covariatesQuestion");
  };

  const handleStrongCovariates = () => {
    setHasStrongCovariates("yes");
    if (envBias === "yes") {
      setStep("stratResult");
    } else {
      setStep("stratOnlyResult");
    }
  };

  const handleNoStrongCovariates = () => {
    setHasStrongCovariates("no");
    if (envBias === "yes") {
      setStep("blockResult");
    } else {
      setStep("largeResult");
    }
  };

  const handleReset = () => {
    setStep("initial");
    setSampleSize("");
    setEnvBias("");
    setHasStrongCovariates("");
  };

  return (
    <div className="flowchart-container">
      <h1 className="main-heading">This interactive flowchart guides researchers through selecting an appropriate randomization method for their study design. Users answer questions about their study characteristics to receive a recommended randomization approach with relevant considerations and implementation guidance.</h1>

      {/* Initial Question */}
      {step === "initial" && (
        <div style={{ textAlign: 'center' }}>
          <h4 className="question-heading">What is your sample size?</h4>

          <div style={{ marginBottom: '20px', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
            <div style={{ marginBottom: '10px' }}>
              <input
                type="radio"
                id="small"
                name="sampleSize"
                value="small"
                checked={sampleSize === "small"}
                onChange={() => setSampleSize("small")}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="small">Small</label>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <input
                type="radio"
                id="moderate"
                name="sampleSize"
                value="moderate"
                checked={sampleSize === "moderate"}
                onChange={() => setSampleSize("moderate")}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="moderate">Moderate</label>
            </div>

            <div style={{ marginBottom: '10px' }}>
              <input
                type="radio"
                id="large"
                name="sampleSize"
                value="large"
                checked={sampleSize === "large"}
                onChange={() => setSampleSize("large")}
                style={{ marginRight: '10px' }}
              />
              <label htmlFor="large">Large</label>
            </div>
          </div>

          <button
            onClick={handleContinue}
            className="action-button"
            disabled={!sampleSize}
            style={{ opacity: !sampleSize ? 0.6 : 1 }}
          >
            Continue
          </button>
        </div>
      )}

      {/* Environmental Bias Question for Large Sample Size */}
      {step === "environmentalBiasQuestion" && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: Large</strong>
          </p>
          <h4 className="question-heading">Are there environmental sources of bias you need to control for?</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button
              onClick={handleEnvBiasYes}
              className="action-button"
            >
              Yes
            </button>
            <button
              onClick={handleEnvBiasNo}
              className="action-button"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Covariates Question after Environmental Bias */}
      {step === "covariatesQuestion" && (
        <div style={{ textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: Large</strong><br />
            <strong>Environmental sources of bias: {envBias === "yes" ? "Yes" : "No"}</strong>
          </p>
          <h4 className="question-heading">Are there strong covariates you need to control for?</h4>
          <div style={{ display: 'flex', justifyContent: 'center', gap: '20px' }}>
            <button
              onClick={handleStrongCovariates}
              className="action-button"
            >
              Yes
            </button>
            <button
              onClick={handleNoStrongCovariates}
              className="action-button"
            >
              No
            </button>
          </div>
        </div>
      )}

      {/* Block Randomization Recommendation */}
      {step === "blockRecommendation" && (
        <div className="result-container" style={{ display: 'flex', flexDirection: 'column', textAlign: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: {sampleSize === "small" ? "Small" : "Moderate"}</strong>
          </p>
          <h4 className="result-heading">Recommended Method: Block Randomization</h4>
          <p className="result-description">
            For smaller studies, block randomization helps maintain balanced group sizes. For larger studies with environmental variations to worry about such time effects or different sites, block randomization can also create balance over time and place.
          </p>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Large Sample Result */}
      {step === "largeResult" && (
        <div className="result-container" style={{ textAlign: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: Large</strong><br />
            <strong>Environmental sources of bias: No</strong><br />
            <strong>Strong covariates: No</strong>
          </p>
          <h4 className="result-heading">Recommended Method: Simple Randomization</h4>
          <p className="result-description">
            With a large sample size, simple randomization can produce sufficiently balanced groups. If you do not need to consider environmental sources of bias or strong covariates, simple is easy to implement and interpret.
          </p>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Block and Stratified Randomization Result */}
      {step === "stratResult" && (
        <div className="result-container" style={{ textAlign: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: Large</strong><br />
            <strong>Environmental sources of bias: Yes</strong><br />
            <strong>Strong covariates: Yes</strong>
          </p>
          <h4 className="result-heading">Recommended Method: Block and Stratified Randomization</h4>
          <p className="result-description">
            For larger studies with strong covariates and environmental variations to worry about, block randomization and stratified randomization work together to balance selected covariates, and balance groups over time and place.
          </p>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Stratified Randomization Only Result */}
      {step === "stratOnlyResult" && (
        <div className="result-container" style={{ textAlign: 'center' }}>
          <p className="result-description">
            <strong>Selected sample size: Large</strong><br />
            <strong>Environmental sources of bias: No</strong><br />
            <strong>Strong covariates: Yes</strong>
          </p>
          <h4 className="result-heading">Recommended Method: Stratified Randomization</h4>
          <p className="result-description">
            When important covariates need to be controlled, stratified randomization helps balance selected covariates across treatment groups.
          </p>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      )}

      {/* Block Randomization Result */}
      {step === "blockResult" && (
        <div className="result-container" style={{ textAlign: 'center' }}>
          {sampleSize === "large" && (
            <p className="result-description">
              <strong>Selected sample size: Large</strong><br />
              <strong>Environmental sources of bias: {envBias === "yes" ? "Yes" : "No"}</strong><br />
              <strong>Strong covariates: No</strong>
            </p>
          )}
          <h4 className="result-heading">Recommended Method: Block Randomization</h4>
          <p className="result-description">
            For small studies, block randomization helps maintain balanced group sizes. For larger studies with environmental variations to worry about such time effects or different sites, block randomization can also create balance over time and place.
          </p>
          <button
            onClick={handleReset}
            className="reset-button"
          >
            Start Over
          </button>
        </div>
      )}
    </div>
  );
}