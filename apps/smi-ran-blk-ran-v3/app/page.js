// File: app/page.js
"use client"; // Needed for useState and useRouter

import React, { useState, useEffect } from "react"; // Import useEffect
import { useRouter } from "next/navigation";
import Legend from "./components/Legend"; // Adjusted import path

export default function Randomize1Page() {
    const router = useRouter();
    // State holds balanced block assignments: [{ number: 1, type: 'Control' }, ...]
    const [randomization, setRandomization] = useState([]);
    // Fixed parameters for this page
    const numBlocks = 30;
    const blockSize = 5; // Used for grid layout calculation
    const numTreatments = 2; // Assuming 2 treatments: Treatment and Control

    // State signals if parameters are valid for graph generation (based on BOTH rules)
    // and stores the number of columns needed if valid.
    const [numBlockColumns, setNumBlockColumns] = useState(0);
    const [numRows, setNumRows] = useState(0); // Store number of rows
    // State to store the specific validation error message
    const [validationError, setValidationError] = useState("");
    // State to track if the RUN CODE button has been clicked
    const [runCodeClicked, setRunCodeClicked] = useState(false); // Added state for click tracking

    // Validate parameters once on mount based on BOTH rules
    useEffect(() => {
        const product = blockSize * numTreatments;
        let isValid = true;
        let errorMsg = "";
        let calculatedRows = 0;
        let calculatedColumns = 0;

        // Rule 1: numBlocks divisibility by numTreatments
        if (numBlocks % numTreatments !== 0) {
            errorMsg = `Balanced assignment requires numBlocks (${numBlocks}) to be perfectly divisible by numTreatments (${numTreatments}).`;
            console.error(errorMsg);
            isValid = false;
        }

        // Rule 2: numBlocks divisibility by product (for grid layout)
        if (isValid && (numBlocks % product !== 0)) {
            errorMsg = `Grid layout requires numBlocks (${numBlocks}) to be perfectly divisible by (blockSize * numTreatments = ${product}).`;
            console.error(errorMsg);
            isValid = false;
        }

        // Set state based on validation result
        if (isValid) {
            calculatedColumns = product; // Columns = blockSize * numTreatments
            calculatedRows = numBlocks / calculatedColumns; // Rows = numBlocks / product
            setNumBlockColumns(calculatedColumns);
            setNumRows(calculatedRows);
            setValidationError("");
        } else {
            setNumBlockColumns(0);
            setNumRows(0);
            setValidationError(errorMsg);
        }

    }, []); // Empty dependency array


    // --- Helper Functions (for JS calculation and graph) ---

    function shuffleArray(array) {
        for (let i = array.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array;
    }

    function createBalancedBlockAssignments(numBlocks, numTreatments) {
        if (numBlockColumns === 0) {
             console.error("Attempted to create block assignments when validation failed.");
             return [];
        }
        if (numBlocks % numTreatments !== 0) { // Safeguard check
            const internalErrorMsg = `Internal Error: numBlocks (${numBlocks}) is not divisible by numTreatments (${numTreatments}).`;
            console.error(internalErrorMsg);
            setValidationError(internalErrorMsg);
            return [];
        }

        const assignmentsPerType = numBlocks / numTreatments;
        let typesToAssign = [];
        for (let i = 0; i < assignmentsPerType; i++) {
            typesToAssign.push("Treatment");
            typesToAssign.push("Control");
        }
        typesToAssign = shuffleArray(typesToAssign);

        let blockAssignments = [];
        for (let i = 0; i < numBlocks; i++) {
            blockAssignments.push({ number: i + 1, type: typesToAssign[i] });
        }
        setValidationError("");
        return blockAssignments;
    }

    // Removed arrayOutput function

    // --- End Helper Functions ---

    const submitContinueClick = () => {
        router.push("/randomize2");
    };

    const submitRunClick = () => {
        setRandomization([]); // Clear previous results
        setRunCodeClicked(true); // Set clicked state to true
        if (numBlockColumns > 0) {
            const result = createBalancedBlockAssignments(numBlocks, numTreatments);
            setRandomization(result);
        } else {
            console.log(`Submit clicked but validation failed: ${validationError}`);
            setRandomization([]);
        }
    };

    // --- Render Logic ---

    // Helper to render the grid content including labels
    const renderGridContent = () => {
        const gridItems = [];
        for (let r = 0; r < numRows; r++) {
            // Add Y-axis label for the row - CHANGED "Row" to "Block"
            gridItems.push(
                <div key={`label-${r}`} className="y-axis-label">
                    Block {r + 1} {/* Changed label text */}
                </div>
            );
            // Add block squares for the row
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
                    // Handle potential empty cells if data doesn't perfectly fill grid (shouldn't happen with validation)
                    gridItems.push(<div key={`empty-${r}-${c}`} className="empty-cell"></div>);
                }
            }
        }
        return gridItems;
    };


    return (
        <div className="randomize-1-container">
            <div className="top">
                <h2>
                    Run the code to see the block randomization based on the parameters below.
                </h2>
            </div>

            {/* Code Container - Displays ILLUSTRATIVE R code - UNCHANGED */}
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
                    <div><span className="spanG"># Create block randomization allocation sequence using blockrand package</span></div>
                    <div>block_rand &lt;- blockrand<span className="spanY">(</span>n = <span className="spanLG">30</span>, <span className="spanG"># target number (example value)</span></div>
                    <div className="indent">num.levels = <span className="spanLG">2</span>, <span className="spanG"># number of treatment arms</span></div>
                    <div className="indent">levels = c<span className="spanP">(</span><span className="spanO">&quot;Treatment&quot;</span>, <span className="spanO">&quot;Control&quot;</span><span className="spanP">)</span>, <span className="spanG"># arm names</span></div>
                    <div className="indent">block.sizes = c<span className="spanP">(</span><span className="spanLG">5</span><span className="spanP">)</span>, <span className="spanG"># vector of possible block sizes (here, just {blockSize})</span></div>
                    <div className="indent">block.prefix = <span className="spanO">&quot;Block&quot;</span><span className="spanY">) </span><span className="spanG"># block names prefix</span></div>
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
                    <div className="indent2">subtitle = paste<span className="spanP">(</span>length<span className="spanB">(</span>unique<span className="spanY">(</span>block_rand<span className="spanB">$</span>block.id<span className="spanY">)</span><span className="spanB">)</span>, <span className="spanO">&quot;blocks with&quot;</span>,</div>
                    <div className="indent4">unique<span className="spanB">(</span>block_rand<span className="spanB">$</span>block.size<span className="spanB">)</span>,</div>
                    <div className="indent4"><span className="spanO">&quot;samples per block, randomized to&quot;</span>,</div>
                    <div className="indent4">length<span className="spanB">(</span>unique<span className="spanY">(</span>block_rand<span className="spanB">$</span>treatment<span className="spanY">)</span><span className="spanB">)</span>, <span className="spanO">&quot;treatments&quot;</span><span className="spanP">)</span>, </div>
                    <div className="indent2">x = <span className="spanO">&quot;Treatment sequence&quot;</span>, y = <span className="spanO">&quot;Block&quot;</span><span className="spanY">)</span> + <span className="spanG"># Remove x-axis label</span></div>
                    <div className="indent">theme_minimal<span className="spanY">()</span>,  +</div>
                    <div className="indent">theme<span className="spanY">(</span></div>
                    <div className="indent2">panel.grid = element_blank<span className="spanP">()</span>,</div>
                    <div className="indent2">axis.text.x = element_blank<span className="spanP">()</span>,  <span className="spanG"># Remove x-axis text</span></div>
                    <div className="indent2">axis.ticks.x = element_blank<span className="spanP">()</span> <span className="spanG"># Remove x-axis ticks</span></div>
                    <div className="indent"><span className="spanY">)</span></div>
                    <div><br></br></div>
                    <div>ggsave<span className="spanY">(</span><span className="spanO">&quot;plots/01_block-randomization.png&quot;</span>, width = <span className="spanLG">8</span>, height = <span className="spanLG">4</span>, dpi = <span className="spanLG">400</span><span className="spanY">)</span></div>
                    <div>ggsave<span className="spanY">(</span><span className="spanO">&quot;plots/01_block-randomization.svg&quot;</span>, width = <span className="spanLG">8</span>, height = <span className="spanLG">4</span>, dpi = <span className="spanLG">400</span><span className="spanY">)</span></div>
                    <br></br>
                    {/* --- End R Code Simulation --- */}
                </div>
            </div>

             {/* Centered RUN Button */}
             <div className="button-container-centered">
                {/* Added run-button class and conditional clicked class */}
                <input
                    className={`button run-button ${runCodeClicked ? 'run-clicked' : ''}`}
                    type="button"
                    onClick={submitRunClick}
                    value="RUN CODE" />
            </div>

            {/* Chart Container - Displays the new block assignment grid */}
            {numBlockColumns > 0 && randomization.length > 0 && (
                <div className="chart-container">
                    <div className="legend-container">
                        <Legend /> {/* Now displays horizontally by default */}
                    </div>
                    {/* Grid for displaying labels and blocks */}
                    {/* Set CSS variable for column count */}
                    <div className="block-grid-chart" style={{ '--num-columns': numBlockColumns }}>
                        {/* Render labels and blocks using the helper */}
                        {renderGridContent()}
                    </div>
                     {/* Centered CONTINUE Button */}
                    <div className="button-container-centered">
                        {/* Added continue-button class */}
                        <input
                            className="button continue-button"
                            type="button"
                            onClick={submitContinueClick}
                            value="CONTINUE ACTIVITY" />
                    </div>
                </div>
            )}
             {/* Display persistent validation error message if parameters are invalid */}
             {validationError && (
                 <div className="top" style={{textAlign: 'center', marginTop: '15px'}}>
                    <p style={{color: 'red', fontSize: '0.9em'}}>Note: {validationError}</p>
                </div>
             )}
        </div>
    );
}