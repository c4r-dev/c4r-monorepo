'use client';
import { useEffect, useState } from 'react';
import styles from './pyodide-1.css';
import { Textarea } from "./Textarea.js";
import { TextareaHighlight } from "./TextareaHighlight.js";
import FunctionPanel from './components/FunctionPanel';
import FunctionReview from './components/FunctionReview';
import GeneratedCode from './components/GeneratedCode';
import { DEFAULT_CODE, PHASES } from './utils/sharedUtils';

export default function PyodidePage() {
  const [value, setValue] = useState(DEFAULT_CODE);
  const [functions, setFunctions] = useState([]);
  const [selectedFunction, setSelectedFunction] = useState(null);
  const [currentPhase, setCurrentPhase] = useState(PHASES.CREATION);
  const [pyodide, setPyodide] = useState(null);

  // Define hardcoded region for import statements
  const hardcodedRegion = {
    startLine: 12,
    endLine: 24,
    tooltipText: "{When parts of the code are selected, a pop up with an axplanation of what the line of code is doing} Example: This for loop is ..."
  };

  const handleNextPhase = () => {
    if (functions.length >= 2) {
      setCurrentPhase(PHASES.REVIEW);
    }
  };

  const handleBackToScript = () => {
    setCurrentPhase(PHASES.CREATION);
  };

  const handleProceedToGenerated = () => {
    setCurrentPhase(PHASES.GENERATED);
  };

  const handleBackToReview = () => {
    setCurrentPhase(PHASES.REVIEW);
  };

  const handleFinish = () => {
    console.log('Function building process completed!');
    // You can add logic here to save the final code or proceed to the next step
  };

  useEffect(() => {
    async function loadPyodideScript() {
      // Load Pyodide script if not already loaded
      if (!window.loadPyodide) {
        const script = document.createElement('script');
        script.src = 'https://cdn.jsdelivr.net/pyodide/v0.27.7/full/pyodide.js';
        script.async = true;
        document.head.appendChild(script);
        
        return new Promise((resolve, reject) => {
          script.onload = resolve;
          script.onerror = reject;
        });
      }
    }

    async function initPyodide() {
      try {
        console.log('Loading Pyodide...');
        await loadPyodideScript();
        const loadPyodide = window.loadPyodide;
        const pyodideInstance = await loadPyodide({
          indexURL: "https://cdn.jsdelivr.net/pyodide/v0.27.7/full/"
        });
        
        console.log('Loading Python packages...');
        
        // Load required packages
        await pyodideInstance.loadPackage([
          "numpy", 
          "matplotlib", 
          "scipy",
          "micropip"
        ]);
        
        // Install additional packages via micropip that aren't in the standard Pyodide distribution
        try {
          await pyodideInstance.runPythonAsync(`
            import micropip
            await micropip.install(["tifffile"])
            print("Successfully installed tifffile")
          `);
        } catch (e) {
          console.log("Could not install tifffile:", e.message);
        }
        
        try {
          await pyodideInstance.runPythonAsync(`
            import micropip
            await micropip.install(["nd2reader"])
            print("Successfully installed nd2reader")
          `);
        } catch (e) {
          console.log("Could not install nd2reader:", e.message);
        }
        
        setPyodide(pyodideInstance);
        console.log('Pyodide and packages loaded successfully!');
      } catch (error) {
        console.error('Error initializing Pyodide:', error);
      }
    }
    initPyodide();
  }, []);

  return (
    <div className="container">
      <h1>Function Builder</h1>
      
      {currentPhase === PHASES.CREATION ? (
        <>
          {/* Instructional text */}
          <div className="instructions">
            The script below is unstructured and could benefit from refactoring. Use the 
            interface below to create functions. You can assign lines of code to a function by 
            dragging them, or by using the context menu.
          </div>

          {/* Function Builder Section */}
          <div className="function-builder">
            <TextareaHighlight
              name="test-textarea-highlight"
              value={value}
              onValueChange={(value) => setValue(value)}
              numOfLines={10}
              functions={functions}
              setFunctions={setFunctions}
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              hardcodedRegion={hardcodedRegion}
            />
            
            <FunctionPanel
              functions={functions}
              setFunctions={setFunctions}
              selectedFunction={selectedFunction}
              setSelectedFunction={setSelectedFunction}
              value={value}
            />
          </div>

          {/* Next Button */}
          <div className="phase-controls">
            <button 
              className={`next-button ${functions.length >= 2 ? '' : 'disabled'}`}
              onClick={handleNextPhase}
              disabled={functions.length < 2}
            >
              {functions.length >= 2 ? 'Next' : 'Must create at least two functions'}
            </button>
          </div>
        </>
      ) : currentPhase === PHASES.REVIEW ? (
        <FunctionReview
          functions={functions}
          setFunctions={setFunctions}
          value={value}
          onBackToScript={handleBackToScript}
          onProceed={handleProceedToGenerated}
        />
      ) : (
        <GeneratedCode
          functions={functions}
          originalValue={value}
          onBackToReview={handleBackToReview}
          onFinish={handleFinish}
          pyodide={pyodide}
        />
      )}
    </div>
  );
} 
