const logger = require('../../../../packages/logging/logger.js');
// File: app/randomize2/page.js
"use client"; // Needed for useState and useRouter

import React, { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import Legend from "../components/Legend"; // Adjusted import path

export default function Randomize2Page() {
    const router = useRouter();
    const [randomization, setRandomization] = useState([]);

    // --- State Variables for User Input ---
    const [numBlocks, setNumBlocks] = useState(30); // Default value 30
    const [blockSize, setBlockSize] = useState(5);   // Default value 5
    const [numTreatments, setNumTreatments] = useState(2); // Default value 2
    // --- End State Variables ---

    const [numBlockColumns, setNumBlockColumns] = useState(0);
    const [numRows, setNumRows] = useState(0);
    const [validationError, setValidationError] = useState("");
    const [runCodeClicked, setRunCodeClicked] = useState(false);

    // --- Validation Effect ---
    // Now depends on the state variables numBlocks, blockSize, numTreatments
    useEffect(() => {
        // Ensure inputs are numbers before validation
        const currentNumBlocks = Number(numBlocks);
        const currentBlockSize = Number(blockSize);
        const currentNumTreatments = Number(numTreatments);

        // Basic input validation (ensure they are positive integers)
        if (isNaN(currentNumBlocks) || currentNumBlocks <= 0 || !Number.isInteger(currentNumBlocks) ||
            isNaN(currentBlockSize) || currentBlockSize <= 0 || !Number.isInteger(currentBlockSize) ||
            isNaN(currentNumTreatments) || currentNumTreatments <= 0 || !Number.isInteger(currentNumTreatments)) {
            setValidationError("Please enter valid positive integers for all parameters.");
            setNumBlockColumns(0);
            setNumRows(0);
            setRandomization([]); // Clear results on invalid input type
            return; // Stop validation if inputs are not valid numbers
        }


        const product = currentBlockSize * currentNumTreatments;
        let isValid = true;
        let errorMsg = "";
        let calculatedRows = 0;
        let calculatedColumns = 0;

        // // Rule 1: numBlocks divisibility by numTreatments
        // if (currentNumBlocks % currentNumTreatments !== 0) {
        //     errorMsg = `Balanced assignment requires numBlocks (<span class="math-inline">\{currentNumBlocks\}\) to be perfectly divisible by numTreatments \(</span>{currentNumTreatments}).`;
        //     logger.app.error(errorMsg);
        //     isValid = false;
        // }

        // Rule 1: numBlocks divisibility by product (for grid layout)
        if (isValid && (currentNumBlocks % product !== 0)) {
            errorMsg = `Grid layout requires numBlocks (${currentNumBlocks}) to be perfectly divisible by (blockSize * numTreatments = ${product}).`;
            // logger.app.error(errorMsg);
            isValid = false;
        }

        // Set state based on validation result
        if (isValid) {
            calculatedColumns = product;
            calculatedRows = currentNumBlocks / calculatedColumns;
            setNumBlockColumns(calculatedColumns);
            setNumRows(calculatedRows);
            setValidationError(""); // Clear error if valid
        } else {
            setNumBlockColumns(0);
            setNumRows(0);
            setValidationError(errorMsg);
            setRandomization([]); // Clear results if validation fails
        }

    }, [numBlocks, blockSize, numTreatments]); // Re-run validation when these state variables change
    // --- End Validation Effect ---


    // --- Helper Functions ---
    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    // Uses state variables numBlocks and numTreatments
    function createBalancedBlockAssignments() {
       const currentNumBlocks = Number(numBlocks);
       const currentNumTreatments = Number(numTreatments);

        // Use the validation result stored in state
        if (numBlockColumns === 0 || validationError) {
             logger.app.error("Attempted to create block assignments when validation failed.");
             return [];
        }
        // Redundant check (already covered by useEffect validation), but safe
        if (currentNumBlocks % currentNumTreatments !== 0) {
            const internalErrorMsg = `Internal Error: numBlocks (<span class="math-inline">\{currentNumBlocks\}\) is not divisible by numTreatments \(</span>{currentNumTreatments}).`;
            logger.app.error(internalErrorMsg);
            setValidationError(internalErrorMsg); // Already set by useEffect
            return [];
        }

        const assignmentsPerType = currentNumBlocks / currentNumTreatments;
        let typesToAssign = [];
        // Assuming 2 treatments: Treatment and Control for simplicity here.
        // You might need to adjust this if numTreatments can be > 2
        for (let i = 0; i < assignmentsPerType; i++) {
            typesToAssign.push("Treatment");
            typesToAssign.push("Control");
        }
        typesToAssign = shuffleArray(typesToAssign);

        let blockAssignments = [];
        for (let i = 0; i < currentNumBlocks; i++) {
            blockAssignments.push({ number: i + 1, type: typesToAssign[i] });
        }
        // setValidationError(""); // Already handled by useEffect
        return blockAssignments;
    }
    // --- End Helper Functions ---

    const submitContinueClick = () => {
        // You might want to navigate to a different page or final step
        router.push("/"); // Example: Navigate back to the first page or a results page
    };

    const submitRunClick = () => {
        setRandomization([]); // Clear previous results
        setRunCodeClicked(true); // Set clicked state to true

        // Check validation state before running
        if (numBlockColumns > 0 && !validationError) {
            const result = createBalancedBlockAssignments(); // Now uses state implicitly
            setRandomization(result);
        } else {
            // Validation failed, message is already set by useEffect
            logger.app.info(`Submit clicked but validation failed: ${validationError}`);
            alert(`Submit clicked but validation failed: ${validationError}`);
            setRandomization([]); // Ensure results are cleared
        }
    };

    // --- Render Logic ---
    const renderGridContent = () => {
       // Use calculated numRows and numBlockColumns from state
        const gridItems = [];
        for (let r = 0; r < numRows; r++) {
            gridItems.push(
                <div key={`label-${r}`} className="y-axis-label">
                    Block {r + 1}
                </div>
            );
            for (let c = 0; c < numBlockColumns; c++) {
                const blockIndex = r * numBlockColumns + c;
                if (blockIndex < randomization.length) {
                    const block = randomization[blockIndex];
                    gridItems.push(
                        <div key={block.number}
                             className={block.type === "Treatment" ? "block1" : "block2"}
                        >
                            {block.number}
                        </div>
                    );
                } else {
                    gridItems.push(<div key={`empty-<span class="math-inline">\{r\}\-</span>{c}`} className="empty-cell"></div>);
                }
            }
        }
        return gridItems;
    };


    return (
        // Changed container class name for clarity
        <div className="randomize-2-container">
            <div className="top">
                <h2>
                    Update the parameters and run the code to see the new block randomization.
                </h2>
            </div>

            {/* Code Container - Displays ILLUSTRATIVE R code with dynamic values */}
            <div className="code-container">
                 <div className="code">
                    {/* --- R Code Simulation --- */}
                    <div><br></br></div>
                    <div><span className="spanG"># Install required packages</span></div>
                    <div>installed.packages<span className="spanY">(</span><span className="spanO">&quot;blockrand&quot;</span>, <span className="spanO">&quot;tidyverse&quot;</span><span className="spanY">)</span></div>
                    <div><br></br></div>
                    <div><span className="spanG"># Load required packages</span></div>
                    <div>library<span className="spanY">(</span>blockrand<span className="spanY">)</span></div>
                    <div>library<span className="spanY">(</span>tidyverse<span className="spanY">)</span></div>
                    <div><br></br></div>
                    <div><span className="spanG"># --- User Modifiable Parameters ---</span></div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'5px' }}>
                       <label htmlFor="numBlocksInput" style={{color: 'lightgray', minWidth: '110px'}}>numBlocks:</label>
                       <input
                           id="numBlocksInput"
                           type="number"
                           value={numBlocks}
                           onChange={(e) => setNumBlocks(e.target.value)}
                           className="custom-input" // Add specific class if needed
                           style={{width: '50px', color:'black', backgroundColor:'lightgray', border:'1px solid white'}} // Basic styling
                       />
                    </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'5px' }}>
                       <label htmlFor="blockSizeInput" style={{color: 'lightgray', minWidth: '110px'}}>blockSize:</label>
                       <input
                           id="blockSizeInput"
                           type="number"
                           value={blockSize}
                           onChange={(e) => setBlockSize(e.target.value)}
                            className="custom-input"
                            style={{width: '50px', color:'black', backgroundColor:'lightgray', border:'1px solid white'}}
                        />
                     </div>
                     <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom:'15px' }}>
                       <label htmlFor="numTreatmentsInput" style={{color: 'lightgray', minWidth: '110px'}}>numTreatments:</label>
                       <input
                           id="numTreatmentsInput"
                           type="number"
                           value={numTreatments}
                           onChange={(e) => setNumTreatments(e.target.value)}
                           className="custom-input"
                            style={{width: '50px', color:'black', backgroundColor:'lightgray', border:'1px solid white'}}
                       />
                     </div>
                    <div><span className="spanG"># --- End User Modifiable Parameters ---</span></div>
                    <div><br></br></div>
                    <div><span className="spanG"># Create block randomization allocation sequence using blockrand package</span></div>
                    {/* Dynamically display state values in the simulated code */}
                    <div>block_rand &lt;- blockrand<span className="spanY">(</span>n = <span className="spanLG">{numBlocks}</span>, <span className="spanG"># target number (dynamic)</span></div>
                    <div className="indent">num.levels = <span className="spanLG">{numTreatments}</span>, <span className="spanG"># number of treatment arms (dynamic)</span></div>
                    <div className="indent">levels = c<span className="spanP">(</span><span className="spanO">&quot;Treatment&quot;</span>, <span className="spanO">&quot;Control&quot;</span><span className="spanP">)</span>, <span className="spanG"># arm names</span></div>
                    <div className="indent">block.sizes = c<span className="spanP">(</span><span className="spanLG">{blockSize}</span><span className="spanP">)</span>, <span className="spanG"># block sizes (dynamic)</span></div>
                    <div className="indent">block.prefix = <span className="spanO">&quot;Block&quot;</span><span className="spanY">) </span><span className="spanG"># block names prefix</span></div>
                    {/* Rest of the simulated R code remains largely the same */}
                    <div><br></br></div>
                    <div><span className="spanG"># Add sequential position within each block</span></div>
                    <div>block_rand &lt;- block_rand %&gt;%</div>
                    <div className="indent">group_by<span className="spanY">(</span>block.id<span className="spanY">) </span> %&gt;%</div>
                    <div className="indent">mutate<span className="spanY">(</span>position_in_block = row_number<span className="spanP">()</span><span className="spanY">)</span> %&gt;%</div>
                    <div className="indent">ungroup<span className="spanY">()</span></div>
                    <div><br></br></div>
                    <div><span className="spanG"># Create visualization of the block randomization</span></div>
                    <div>ggplot<span className="spanY">(</span>block_rand, aes<span className="spanP">(</span>x = position_in_block, y = factor<span className="spanB">(</span>block.id, levels =</div>
                    <div className="indent">rev<span className="spanY">(</span>unique<span className="spanP">(</span>block.id<span className="spanP">)</span><span className="spanY">)</span><span className="spanB">)</span><span className="spanP">)</span><span className="spanY">)</span> +</div>
                    <div className="indent">geom_tile<span className="spanY">(</span>aes<span className="spanP">(</span>fill = treatment<span className="spanP">)</span>, color = <span className="spanO">&apos;gray30&apos;</span>, width = <span className="spanLG">0.9</span>, height = <span className="spanLG">0.9</span><span className="spanY">)</span> +</div>
                    <div className="indent">geom_text<span className="spanY">(</span>aes<span className="spanP">(</span>label = id<span className="spanP">)</span>, color = <span className="spanO">&quot;black&quot;</span>, size = <span className="spanLG">3</span><span className="spanY">)</span> +</div>
                    <div className="indent">scale_fill_brewer<span className="spanY">(</span>palette = <span className="spanO">&quot;Set1&quot;</span>, name = <span className="spanO">&quot;Treatment&quot;</span><span className="spanY">)</span> +</div>
                    <div className="indent">labs<span className="spanY">(</span>title = <span className="spanO">&quot;Block randomization of samples by block&quot;</span>,</div>
                    {/* The subtitle now dynamically reflects the potentially changing parameters */}
                    <div className="indent2">subtitle = paste<span className="spanP">(</span><span className="spanLG">{numRows}</span>, <span className="spanO">&quot;blocks with&quot;</span>, <span className="spanLG">{blockSize}</span>,</div>
                    <div className="indent4"><span className="spanO">&quot;samples per block, randomized to&quot;</span>,</div>
                    <div className="indent4"><span className="spanLG">{numTreatments}</span>, <span className="spanO">&quot;treatments&quot;</span><span className="spanP">)</span>,</div>
                    <div className="indent2">x = <span className="spanO">&quot;Treatment sequence&quot;</span>, y = <span className="spanO">&quot;Block&quot;</span><span className="spanY">)</span> +</div>
                    <div className="indent">theme_minimal<span className="spanY">()</span> +</div>
                    <div className="indent">theme<span className="spanY">(</span></div>
                    <div className="indent2">panel.grid = element_blank<span className="spanP">()</span>,</div>
                    <div className="indent2">axis.text.x = element_blank<span className="spanP">()</span>,</div>
                    <div className="indent2">axis.ticks.x = element_blank<span className="spanP">()</span></div>
                    <div className="indent"><span className="spanY">)</span></div>
                    <div><br></br></div>
                    <div>ggsave<span className="spanY">(</span><span className="spanO">&quot;plots/01_block-randomization.png&quot;</span>, width = <span className="spanLG">8</span>, height = <span className="spanLG">4</span>, dpi = <span className="spanLG">400</span><span className="spanY">)</span></div>
                    <div>ggsave<span className="spanY">(</span><span className="spanO">&quot;plots/01_block-randomization.svg&quot;</span>, width = <span className="spanLG">8</span>, height = <span className="spanLG">4</span>, dpi = <span className="spanLG">400</span><span className="spanY">)</span></div>
                    <br></br>
                    {/* --- End R Code Simulation --- */}
                </div>
            </div>

           {/* Display persistent validation error message */}
           {validationError && (
               <div className="top" style={{textAlign: 'center', marginTop: '15px'}}>
                  <p style={{color: 'red', fontSize: '0.9em'}}>Error: {validationError}</p>
              </div>
           )}

           {/* Centered RUN Button */}
           <div className="button-container-centered">
                <input
                    className={`button run-button ${runCodeClicked ? 'run-clicked' : ''}`}
                    type="button"
                    onClick={submitRunClick}
                    // Disable button if validation fails
                    disabled={!!validationError}
                    value="RUN CODE" />
            </div>

            {/* Chart Container - Renders only if validation passes and run is clicked */}
            {!validationError && numBlockColumns > 0 && randomization.length > 0 && (
                <div className="chart-container">
                    <div className="legend-container">
                        <Legend />
                    </div>
                    <div className="block-grid-chart" style={{ '--num-columns': numBlockColumns }}>
                        {renderGridContent()}
                    </div>
                     {/* Optional: Remove Continue button or change its behavior */}
                     <div className="button-container-centered">
                         <input
                             className="button continue-button"
                             type="button"
                             onClick={submitContinueClick}
                             value="START OVER" // Example: Change button text
                             />
                     </div>
                </div>
            )}


        </div>
    );
}