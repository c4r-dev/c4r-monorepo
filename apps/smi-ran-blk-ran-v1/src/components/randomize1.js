const logger = require('../../../../packages/logging/logger.js');
import React from "react";
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Legend from "./Legend";

export default function Randomize1() {
    const navigate = useNavigate();

    let numBlocks = 2;
    let blockSize = 10;
    let numTreatments = 2;
    const [randomization, setRandomization] = useState([]);

    const submitContinueClick = () => {
        navigate("/randomize2");
    };

    const submitRunClick = () => {
        function createBlockRandomization(numBlocks, blockSize) {
            let blockRandomization = [];
            for (let i = 0; i < numBlocks; i++) {
                let block = [];
                // Fill the block with equal numbers of each group
                for (let j = 0; j < blockSize / numBlocks; j++) {
                    block.push("purple1");
                    block.push("purple2");
                    // block.push("purple3");
                    // block.push("purple4");
                }
                // Shuffle the block
                block = shuffleArray(block);
                blockRandomization = blockRandomization.concat(block);
            }

            // logger.app.info(blockRandomization)

            // let outArray = [" ", " ", " ", "Treatme", "nts", " "];
            let outArray = []
            outArray.push(" ");
            outArray.push(" ");
            // let num = 0;
            for (let k = 0; k < blockRandomization.length; k++) {
                // if (k % blockSize === 0) {
                //     num = numBlocks - k / blockSize;
                //     // if (num === 3) {
                //     //     outArray.push("Block");
                //     // } else {
                //         // outArray.push(" ");
                //     // }
                //     // outArray.push(num);
                // }

                outArray.push(blockRandomization[k]);
            }

            // outArray.push(" ");
            // outArray.push(" ");
            for (let k = 1; k <= numTreatments; k++) {
                outArray.push(k);
            }

            // outArray.push(" ");
            // outArray.push(" ");
            for (let k = 1; k <= numTreatments; k++) {
                if (k === 1) {
                    outArray.push("Blo");
                } else if (k === 2) {
                    outArray.push("ck");
                } else {
                    outArray.push(" ");
                }
            }

            // return blockRandomization;
            return outArray;
        }

        // Utility function to shuffle an array
        function shuffleArray(array) {
            for (let i = array.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [array[i], array[j]] = [array[j], array[i]]; // Swap
            }
            return array;
        }

        setRandomization(createBlockRandomization(numBlocks, blockSize));
    };

    function arrayOutput(item) {
        // logger.app.info(item)
        if (item === "purple1") {
            return <div className="block1"></div>;
        } else if (item === "purple2") {
            return <div className="block2"></div>;
        } else if (item === "purple3") {
            return <div className="block1"></div>;
        } else if (item === "purple4") {
            return <div className="block2"></div>;
        } else if (item === "Block") {
            return <div className="block">{item}</div>;
        } else if (item === "Blo") {
            return <div className="Blo">{item}</div>;
        } else if (item === "ck") {
            return <div className="ck"> {item}</div>;
        } else if (item === "Treatme") {
            return <div className="treat">{item}</div>;
        } else if (item === "nts") {
            return <div className="ments"> {item}</div>;
        } else {
            return <div className="block0">{item}</div>;
        }
    }

    return (
        <div className="randomize-1-container">
            <div className="top">
                <h2>Let's Visualize Block Randomization.</h2>
                <h4>
                    Block randomization is as simple as hitting a button! Free
                    software packages such as{" "}
                    <i>blockrand, randomizR, or pspych in R</i> can randomize
                    your study.
                </h4>
                <h4>
                    But what is happening under the hood? Click "RUN CODE" on
                    this R code to see a visualization of a block randomized
                    study with 2 treatments.
                </h4>
            </div>

            <div className="container">
                <div className="code-container">
                    <div className="code">
                        <div>
                            <br></br>
                        </div>
                        <div>
                            library<span className="spanY">(</span>viridisLite
                            <span className="spanY">)</span>
                        </div>
                        <div>
                            <br></br>
                        </div>

                        <div>
                            <span className="spanG">
                                # In how many blocks will subjects be
                                randomized?
                            </span>
                        </div>
                        <div>
                            n_blocks &lt;-{" "}
                            <span className="spanLG">{numBlocks}</span>
                        </div>
                        <div>
                            <br></br>
                        </div>
                        <div>
                            <span className="spanG">
                                # How many treatments are we using?
                            </span>
                        </div>
                        <div>
                            n_treatments &lt;-{" "}
                            <span className="spanLG">{numTreatments}</span>
                        </div>
                        <div>
                            <br></br>
                        </div>
                        <div>
                            <span className="spanG">
                                # What is the block size? (It must be a multiple
                                of number of treatments.)
                            </span>
                        </div>
                        <div>
                            block_size &lt;-{" "}
                            <span className="spanLG">{blockSize}</span>
                        </div>
                        <div>
                            stopifnot<span className="spanY">(</span>block_size
                            %% n_treatments == 0<span className="spanY">)</span>
                        </div>

                        <div>
                            <br></br>
                        </div>
                        <div>
                            <span className="spanG">
                                # Generate random orders of treatments
                            </span>
                        </div>
                        <div>
                            treatments_in_block &lt;- rep
                            <span className="spanY">(</span>seq
                            <span className="spanP">(</span>n_treatments
                            <span className="spanP">)</span>,
                        </div>
                        <div className="indentLarge">
                            block_size %/% n_treatments
                            <span className="spanY">)</span>
                        </div>
                        <div>study_blocks &lt;-</div>
                        <div className="indent">
                            sample<span className="spanY">(</span>
                            treatments_in_block<span className="spanY">)</span>{" "}
                            |&gt;
                        </div>
                        <div className="indent">
                            replicate<span className="spanY">(</span>n =
                            n_blocks<span className="spanY">)</span>
                        </div>
                        <div className="indent">
                            t<span className="spanY">()</span>
                        </div>
                        <div>
                            <br></br>
                        </div>
                        <div>
                            <span className="spanG">
                                # Visualize the treatment orders
                            </span>
                        </div>
                        <div>
                            treatment_colors &lt;- inferno
                            <span className="spanY">(</span>n_treatments
                            <span className="spanO"></span>
                            <span className="spanY">)</span>
                        </div>
                        <div>
                            par<span className="spanY">(</span>xpd ={" "}
                            <span className="spanB">FALSE</span>, mar = c
                            <span className="spanP">(</span>
                            <span className="spanLG">5</span>,{" "}
                            <span className="spanLG">4</span>,{" "}
                            <span className="spanLG">4</span>,{" "}
                            <span className="spanLG">11</span>
                            <span className="spanP">)</span>
                            <span className="spanY">)</span>
                        </div>
                        <div>
                            image<span className="spanY">(</span>study_blocks,
                        </div>
                        <div className="indent">col = treatment_colors,</div>
                        <div className="indent">
                            xlab ={" "}
                            <span className="spanO">"Block"</span>,
                        </div>
                        <div className="indent">
                            axes = <span className="spanB">FALSE</span>
                            <span className="spanY">)</span>
                        </div>

                        <div>
                            axis<span className="spanY">(</span>
                            <span className="spanLG">1</span>, at = seq
                            <span className="spanP">(</span>
                            <span className="spanLG">0</span>,{" "}
                            <span className="spanLG">1</span>, length.out =
                            n_blocks<span className="spanP">)</span>, labels =
                            seq<span className="spanP">(</span>n_blocks
                            <span className="spanP">)</span>
                            <span className="spanY">)</span>
                        </div>

                        <div>
                            grid<span className="spanY">(</span>
                            nx = n_blocks, ny = block_size, col = "red", lty =
                            <span className="spanLG"> 1</span>, lwd =
                            <span className="spanLG"> 1</span>
                            <span className="spanY">)</span>
                        </div>

                        <div>
                            par<span className="spanY">(</span>xpd ={" "}
                            <span className="spanB">TRUE</span>
                            <span className="spanY">)</span>
                        </div>

                        <div>
                            legend<span className="spanY">(</span>
                            <span className="spanLG">1</span> +{" "}
                            <span className="spanLG">1.25</span> / n_blocks,{" "}
                            <span className="spanLG">1</span>,
                        </div>

                        <div className="indent">
                            legend = c<span className="spanP">(</span>
                            <span className="spanO">"Treatment"</span>,
                            <span className="spanO"> "Control"</span>
                            <span className="spanP">)</span>, fill =
                            treatment_colors<span className="spanY">)</span>
                        </div>

                        <br></br>
                    </div>
                    {/* <div>
                <input
                    className="button"
                    type="button"
                    onClick={submitRunClick}
                    value="RUN CODE" />
                <input
                    className="button"
                    type="button"
                    onClick={submitContinueClick}
                    value="CONTINUE ACTIVITY" />
                <br></br>
                <br></br>
            </div> */}
                </div>

                {/* If randomization array is not empty, display the legend and block chart */}
                {randomization.length > 0 && (
                    <div className="chart-container">
                        {randomization.length > 0 && (
                            <div className="legend-container">
                                <Legend />
                            </div>
                        )}

                        <div className="block-chart2">
                            {randomization.map((item) => arrayOutput(item))}
                        </div>
                    </div>
                )}
            </div>
            <div>
                <input
                    className="button"
                    type="button"
                    onClick={submitRunClick}
                    value="RUN CODE"
                />
                <input
                    className="button"
                    type="button"
                    onClick={submitContinueClick}
                    value="CONTINUE ACTIVITY"
                />
                <br></br>
                <br></br>
                <br></br>
                <br></br>
            </div>
        </div>
    );
}
