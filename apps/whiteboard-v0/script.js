const logger = require('../../packages/logging/logger.js');
// Global Vars
const noteContents = [
    "Missed mistakes",
    "Reporting results",
    "Designing experiments",
    "Hard to reproduce analyses",
    "Hard to find files",
    "Data loss and corruption",
    "Deviating from lab protocols",
    "Difficulty onboarding + offboarding",
];

// Data structure to store note scores and text
let noteScores = {
    "Missed mistakes": { impact: 0, interest: 0 },
    "Reporting results": { impact: 0, interest: 0 },
    "Designing experiments": { impact: 0, interest: 0 },
    "Hard to reproduce analyses": { impact: 0, interest: 0 },
    "Hard to find files": { impact: 0, interest: 0 },
    "Data loss and corruption": { impact: 0, interest: 0 },
    "Deviating from lab protocols": { impact: 0, interest: 0 },
    "Difficulty onboarding + offboarding": {
        impact: 0,
        interest: 0,
    },
};

// empty array to store note scores
let noteScoresArray = [];

// Test session ID
let currentSessionID = "543";

// Determines if the user wants to display results from all sessions
let allSessions = false;

// Get the session ID from the URL parameter
// http://127.0.0.1:5500/index.html?sessionID=bdaq4
const urlParams = new URLSearchParams(window.location.search);
const sessionID = urlParams.get("sessionID");
logger.app.info("sessionID", sessionID);

if (sessionID) {
    currentSessionID = sessionID;
}

// Toggle all sessions
function toggleAllSessions() {
    logger.app.info("toggleAllSessions");
    logger.app.info("allSessions", allSessions);

    allSessions = !allSessions;
    logger.app.info("new allSessions", allSessions);
    fetchNoteScores(currentSessionID);
}


// Populate the carousel with notes
document.addEventListener("DOMContentLoaded", () => {
    const carouselTrack = document.querySelector(".carousel-track");

    noteContents.forEach((content) => {
        // Create the list item for the slide
        const li = document.createElement("li");
        li.className = "carousel-slide";

        // Create the note container
        const note = document.createElement("div");
        note.className = "note carousel-note";
        note.setAttribute("draggable", true);

        // Create the note content container
        const noteContent = document.createElement("div");
        noteContent.className = "note-content";
        noteContent.textContent = content;

        // Nest the elements correctly
        note.appendChild(noteContent);
        li.appendChild(note);
        carouselTrack.appendChild(li);
    });

    slides = document.querySelectorAll(".carousel-slide");
    totalSlides = slides.length;
});

let slideIndex = 0;
let slides = document.querySelectorAll(".carousel-slide");
let totalSlides = slides.length;

function moveSlide(step) {
    slideIndex = (slideIndex + step + totalSlides) % totalSlides;
    const track = document.querySelector(".carousel-track");
    const slideWidth = slides[0].getBoundingClientRect().width;
    track.style.transform = "translateX(-" + slideIndex * slideWidth + "px)";


    logger.app.info("slideIndex", slideIndex);
    logger.app.info("totalSlides", totalSlides);
}

// Drag and Drop logic

document.addEventListener("DOMContentLoaded", (event) => {
    let dragged = null;
    let offsetX = 0;
    let offsetY = 0;

    document.querySelectorAll(".carousel-note").forEach((note) => {
        note.addEventListener("dragstart", function (e) {
            dragged = this;
            offsetX = e.clientX - dragged.getBoundingClientRect().left;
            offsetY = e.clientY - dragged.getBoundingClientRect().top;
            e.dataTransfer.setData("text", ""); // DataTransfer object requires setting some data.
            e.dataTransfer.effectAllowed = "move";
        });

        // Same as above, but with mobile device support
        // note.addEventListener("touchstart", function (e) {
        //     logger.app.info("touchstart");
        //     dragged = this;
        //     offsetX = e.clientX - dragged.getBoundingClientRect().left;
        //     offsetY = e.clientY - dragged.getBoundingClientRect().top;
        //     logger.app.info(e);
        //     // e.dataTransfer.setData("text", ""); // DataTransfer object requires setting some data.
        //     // e.dataTransfer.effectAllowed = "move";
        // });
        // note.addEventListener("touchmove", function (e) {
        //     // Prevent default touchmove event
        //     e.preventDefault();

        //     logger.app.info("touchmove");
        //     dragged = this;
        //     offsetX = e.clientX - dragged.getBoundingClientRect().left;
        //     offsetY = e.clientY - dragged.getBoundingClientRect().top;
        //     logger.app.info(e);
        //     // e.dataTransfer.setData("text", ""); // DataTransfer object requires setting some data.
        //     // e.dataTransfer.effectAllowed = "move";

        //     // Move the note along with the cursor
        //     const noteClone = dragged.cloneNode(true);
        //     noteClone.classList.remove("carousel-note");
        //     noteClone.style.left = `${e.clientX - offsetX}px`;
        //     noteClone.style.top = `${e.clientY - offsetY}px`;
        //     dragged.parentNode.replaceChild(noteClone, dragged); 
        // });
    });

    const whiteboard = document.querySelector(".whiteboard");
    whiteboard.addEventListener("dragover", function (e) {
        e.preventDefault(); // Necessary to allow dropping
        e.dataTransfer.dropEffect = "move";
    });

    whiteboard.addEventListener("drop", function (e) {
        e.preventDefault();
        if (dragged) {
            const whiteboardRect = whiteboard.getBoundingClientRect();
            // Calculate the position to place the note within the whiteboard
            const x = e.clientX - whiteboardRect.left - offsetX;
            const y = e.clientY - whiteboardRect.top - offsetY;

            const xPercent = (x / whiteboardRect.width) * 100;
            const yPercent = (y / whiteboardRect.height) * 100;

            // Clone the note, set the cloned note's position, and append it to the whiteboard
            const noteClone = dragged.cloneNode(true);
            noteClone.classList.remove("carousel-note");

            noteClone.style.left = `${xPercent}%`;
            noteClone.style.top = `${yPercent}%`;

            logger.app.info("x:", x, "y:", y);
            logger.app.info("xPercent:", xPercent, "yPercent:", yPercent);

            // Normalize the values to the range of -10 to 10
            const xValue = (x / whiteboardRect.width) * 20 - 10;
            const yValue = ((y / whiteboardRect.height) * 20 - 10) * -1;
            logger.app.info("xValue:", xValue, "yValue:", yValue);

            // Update the scores in our noteScores data structure
            const noteText =
                noteClone.querySelector(".note-content").textContent;
            noteScores[noteText].impact = xValue;
            noteScores[noteText].interest = yValue;

            whiteboard.appendChild(noteClone);
            noteClone.addEventListener("dragstart", handleDragStartWithinBoard);

            dragged.remove(); // Remove the note from the carousel
            slides = document.querySelectorAll(".carousel-slide"); // Re-select slides
            updateCarousel(); // Adjust carousel for the missing space
        }
    });

    function handleDragStartWithinBoard(e) {
        dragged = this;
        offsetX = e.clientX - dragged.getBoundingClientRect().left;
        offsetY = e.clientY - dragged.getBoundingClientRect().top;
        e.dataTransfer.setData("text", "");
        e.dataTransfer.effectAllowed = "move";
    }

    // Update carousel slides
    function updateCarousel() {
        logger.app.info("updateCarousel");

        // This assumes the width of each slide is fixed and known.
        // Recalculate the slideIndex based on remaining slides
        slideIndex = Math.max(0, Math.min(slideIndex, slides.length - 1));
        totalSlides = totalSlides - 1;

        // Remove the empty slides that no longer have notes
        slides.forEach((slide, index) => {
            if (slide.children.length === 0) {
                slide.remove();
                if (index < slideIndex) {
                    slideIndex--;
                }
            }
        });

        if (totalSlides === slideIndex) {
            // logger.app.info("No slides left");
            moveSlide(-1);
        }

    }
});

function handleNextBtn(phase) {
    if (phase === 1) {

        // TODO: uncomment
        // Verify that all notes have been placed on the whiteboard
        // If not, display an error message and return
        const whiteboard = document.querySelector(".whiteboard");
        if (whiteboard.children.length < 8) {
            alert("Please place all notes on the whiteboard.");
            return;
        }

        // disable the next button
        document.getElementById("phase1-next").disabled = true;

        // Set the phase 1 loading spinner to visible
        document.getElementById("phase1-loader").style.display = "block";

        // Submit the note scores to the server
        logger.app.info("noteScores:", noteScores);

        // Submit note scores to the server

        let entryID = Math.floor(Math.random() * 1000000) + 1;
        const jsonScores = JSON.stringify(noteScores);
        let url =
            "https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/activeSessions1/userSubmissions";
        let body = {
            usersubmission: {
                sessionId: currentSessionID,
                entryId: entryID,
                noteScores: jsonScores,
                date: new Date().toLocaleString(),
            },
        };

        fetch(url, {
            method: "POST",
            body: JSON.stringify(body),
            headers: {
                "Content-Type": "application/json",
            },
        })
            .then((response) => response.json())
            .then((json) => {
                // Update the div with the new sessionId
                logger.app.info("response: ", json);
                logger.app.info("Continue to results");
            })
            .then(() => {
                // Fetch the note scores from the server
                fetchNoteScores(currentSessionID);
            })
            .catch((error) => {
                logger.app.info(error);
                alert("There was an error submitting your answer.");
                document.getElementById("phase1-next").disabled = false;
            });

        // Hide phase 1 and show phase 2
    } else if (phase === 2) {
      // Swap out header text
      document.getElementById("phase2-header-text").style.display = "none";
      document.getElementById("phase3-header-text").style.display = "block";

      // Hide phase 2 and show phase 3
        document.getElementById("phase2").style.display = "none";
        document.getElementById("phase3").style.display = "block";

        // Render sorted notes in phase3-sticky-notes as vertical notes
        const phase3StickyNotes = document.getElementById(
            "phase3-sticky-notes"
        );
        const wordList = document.querySelector("#word-list");
        wordList.innerHTML = "";

        noteContents.forEach((content) => {
            const note = document.createElement("div");
            note.className = "vertical-note";
            note.textContent = content;

            // Render the corresponding solutions in the resource pane
            const solution = noteSolutions[content];
            const span = document.createElement("span");
            span.textContent = solution;
            wordList.appendChild(span);

            note.addEventListener("mouseenter", function () {
                // Clear the note preview
                // notePreview.textContent = '';

                // Render the corresponding solutions in the resource pane
                // Based on the selected note, get the resources from the notesWithResources object and display them in the resource pane
                // Render the resource's topic in resource-topic and the resource's text in resource-text
                const note = noteResources[this.textContent];

                // Render the resource's content in resource-content
                const resourceContent =
                    document.getElementById("resource-content");
                resourceContent.innerHTML = noteResources[this.textContent];

                // Bolden the resource's solutions in the word list
                const wordList = document.querySelector("#word-list");
                // Clear all bolded words
                wordList.querySelectorAll("span").forEach((span) => {
                    span.classList.remove("bold");
                });
                // Bold the current resource's solutions
                const solutions = noteSolutions[this.textContent];
                solutions.split(" ").forEach((word) => {
                    wordList.querySelectorAll("span").forEach((span) => {
                        if (span.textContent === word) {
                            span.classList.add("bold");
                        }
                    });
                });

                // Set the note preview to the clicked note
                // notePreview.textContent = content;
                logger.app.info("Note clicked", content);

                // Highlight the clicked note
                const selectedNotes = document.querySelectorAll(
                    ".vertical-note.selected"
                );
                selectedNotes.forEach((note) =>
                    note.classList.remove("selected")
                );
                this.classList.add("selected");
            });
            phase3StickyNotes.appendChild(note);
        });

        // Highlight the first note
        const firstNote = phase3StickyNotes.querySelector(".vertical-note");
        firstNote.classList.add("selected");
        // Trigger the click event on the first note
        firstNote.click();
        // Automate a mouseover event on the first note
        firstNote.dispatchEvent(new MouseEvent('mouseenter'));
    }
}


// On page load, detect if the URL has a resultsMode=true query string
window.addEventListener('load', function(){
    const urlParams = new URLSearchParams(window.location.search);
    const resultsMode = urlParams.get('resultsMode');
    logger.app.info("resultsMode:", resultsMode);
    if (resultsMode === 'true') {

        // Submit the note scores to the server
        logger.app.info("noteScores:", noteScores);  // may need to set some manual scores here

        logger.app.info("Fetching note scores");
        fetchNoteScores(currentSessionID);
    }
});




// Fetch the note scores from the server
function fetchNoteScores(sessionId) {
    let url = `https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/activeSessions1/userSubmissions?filter[sessionId]=${currentSessionID}`;
    // let url = `https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/activeSessions1/userSubmissions`;

    if (allSessions) {
        url = `https://api.sheety.co/f86a219e4c66ae9bacf55c87219398c1/activeSessions1/userSubmissions`;
    }

    // Check URL parameters to see if we should use small notes
    const urlParams = new URLSearchParams(window.location.search);
    let useSmallNotes = urlParams.get('useSmallNotes');
    logger.app.info("useSmallNotes:", useSmallNotes);

    // Fetch the user submissions from the API and calculate the median note scores
    fetch(url)
        .then((response) => response.json())
        .then((json) => {
            // If response is empty, display an error message
            if (json.userSubmissions.length === 0) {
                logger.app.info("Session does not exist or no submissions yet.");
                // Display an error message
                alert("This session has no submissions yet, please hit the refresh button to load incoming results.");

                // Render the notes in phase2-sticky-notes
                const phase2StickyNotes = document.getElementById(
                    "phase2-sticky-notes"
                );
                // Clear the phase2-sticky-notes so that the notes are not duplicated on refresh
                phase2StickyNotes.innerHTML = "";

                // Clear the notes in phase2-whiteboard
                const whiteboard = document.querySelector("#phase2-whiteboard");
                whiteboard.innerHTML = "";

                // Clear the contents of the note-preview
                const notePreview = document.getElementById("note-preview");
                notePreview.innerHTML = "";

                // Clear the note scores array
                noteScoresArray = [];

            } else {
                logger.app.info("Session exists!");

                logger.app.info("Json response", json);
                // logger.app.info("Session exists!");

                // log all user submissions
                logger.app.info("All user submissions", json.userSubmissions);

                // get the note scores from each user submission
                logger.app.info("Note scores", json.userSubmissions[0].noteScores);

                // for each user submission in the array, get the note scores
                json.userSubmissions.forEach((userSubmission) => {
                    logger.app.info("Note scores", userSubmission.noteScores);
                });

                // for each user submission in the array, get the note scores and add them to some data structure. Convert the json string to a json object
                // let noteScoresArray = [];

                // Clear the note scores array
                noteScoresArray = [];

                json.userSubmissions.forEach((userSubmission) => {
                    logger.app.info("Note scores", userSubmission.noteScores);
                    let noteScoresJson = JSON.parse(userSubmission.noteScores);
                    noteScoresArray.push(noteScoresJson);
                });
                logger.app.info("Note scores array", noteScoresArray);

                // Create an object to store linear scores for each note
                let linearScores = {};

                // Calculate linear score for each note in each user submission and store them
                noteScoresArray.forEach((noteScores) => {
                    for (let note in noteScores) {
                        if (!linearScores[note]) {
                            linearScores[note] = [];
                        }
                        let impact = noteScores[note].impact;
                        let interest = noteScores[note].interest;
                        let linearScore = (impact + interest) / 2;
                        linearScores[note].push(linearScore);
                    }
                });
                logger.app.info("Linear Scores:", linearScores);

                // Calculate median linear score for each note
                let medianScores = {};
                for (let note in linearScores) {
                    medianScores[note] = median(linearScores[note]);
                }

                logger.app.info("Median Linear Scores:", medianScores);

                // Now instead of calculating the median linear score for each note, calculate the average score for each note
                let averageNoteScores = {};
                for (let note in linearScores) {
                    let sum = linearScores[note].reduce((a, b) => a + b, 0);
                    let avg = sum / linearScores[note].length;
                    averageNoteScores[note] = avg;
                }
                logger.app.info("Average Linear Scores:", averageNoteScores);

                // Sort notes based on median linear scores and render them
                // const sortedNotesDescending = Object.entries(medianScores)
                //     .sort((a, b) => a[1] - b[1])
                //     .map((entry) => entry[0]);
                // logger.app.info("sortedNotes", sortedNotesDescending);

                const sortedNotes = Object.entries(medianScores)
                    .sort((a, b) => b[1] - a[1])
                    .map((entry) => entry[0]);
                logger.app.info("sortedNotes", sortedNotes);

                // Render the notes in phase2-sticky-notes
                const phase2StickyNotes = document.getElementById(
                    "phase2-sticky-notes"
                );
                // Clear the phase2-sticky-notes so that the notes are not duplicated on refresh
                phase2StickyNotes.innerHTML = "";
                
                const notePreview = document.getElementById("note-preview");
                const whiteboard = document.querySelector("#phase2-whiteboard");

                sortedNotes.forEach((content) => {
                    const note = document.createElement("div");
                    note.className = "vertical-note";
                    note.textContent = content;

                    // On mouse hover
                    note.addEventListener("mouseenter", function () {
                        // Clear the note preview
                        notePreview.textContent = "";

                        // Set the note preview to the clicked note
                        notePreview.textContent = content;

                        // Highlight the clicked note
                        const selectedNotes = document.querySelectorAll(
                            ".vertical-note.selected"
                        );
                        selectedNotes.forEach((note) =>
                            note.classList.remove("selected")
                        );
                        this.classList.add("selected");

                        // Clear the whiteboard
                        whiteboard.innerHTML = "";

                        // Render the note on the whiteboard
                        // const noteClone = this.cloneNode(true);
                        // noteClone.classList.remove('vertical-note');
                        // noteClone.classList.add('whiteboard-note');
                        // noteClone.style.left = '50%';
                        // noteClone.style.top = '50%';
                        // whiteboard.appendChild(noteClone);

                        // Based on the selected note, create a note for each entry in noteScoresArray and append it to phase2-whiteboard based on the note's impact and interest
                        const noteScores = noteScoresArray.filter(
                            (note) => note[content]
                        );
                        noteScores.forEach((noteScore) => {
                            const note = document.createElement("div");
                            note.className = "whiteboard-note";
                            note.textContent = content;
                            // Calculate the position to place the note within the whiteboard
                            // These notes should be fixed to that region of the whiteboard, even when the whiteboard is resized
                            const x = 50 + noteScore[content].impact * 5;
                            const y = 50 + noteScore[content].interest * 5;
                            note.style.left = `${x}%`;
                            note.style.top = `${100-y}%`;

                            // If viewing data from all sessions, set the note to be small
                            if (allSessions || useSmallNotes) {
                                note.id = "small-note";
                                note.style.left = `${x}%`;
                                note.style.top = `${100-y}%`;                               
                            }

                            whiteboard.appendChild(note);
                        });
                    });

                    phase2StickyNotes.appendChild(note);
                });
                // Set the note preview to the first note
                notePreview.textContent = sortedNotes[0];
                // Highlight the first note
                const firstNote = document.querySelector(".vertical-note");
                firstNote.classList.add("selected");

                // Trigger the click event on the first note
                firstNote.click();
                // Trigger the mouseenter event on the first note
                firstNote.dispatchEvent(new MouseEvent('mouseenter'));
            }

        // Set the phase 1 loading spinner to invisible
        document.getElementById("phase1-loader").style.display = "none";

        // Swap out header text
        document.getElementById("phase1-header-text").style.display = "none";
        document.getElementById("phase2-header-text").style.display = "block";

        // Hide phase 1 and show phase 2
        document.getElementById("phase1").style.display = "none";
        document.getElementById("phase2").style.display = "block";
        });
}


function refreshResults() {
    // Re-fetch the note scores
    logger.app.info("Refresh results called");
    // Re-fetch the note scores
    fetchNoteScores(currentSessionID);
    logger.app.info("Refresh results finished");
}

function median(values) {
    values.sort(function (a, b) {
        return a - b;
    });

    let half = Math.floor(values.length / 2);

    if (values.length % 2) return values[half];
    else return (values[half - 1] + values[half]) / 2.0;
}

var noteResources = {
    "Missed mistakes": `<div>
                <h1>Missed mistakes</h1>
                <p>We all make mistakes! Brainstorming with your lab colleagues about approaches to check and validate your lab’s work is a great way to make your work more rigorous.</p>
                <ul>
                    <li>Error Tight: Exercises for Lab Groups to Prevent Research Mistakes
                        <ul>
                            <li><a href="https://osf.io/preprints/psyarxiv/rsn5y/" target="_blank">https://osf.io/preprints/psyarxiv/rsn5y/</a></li>
                        </ul>
                    </li>
                </ul>
            </div>`,
    "Reporting results": `<div>
                    <h1>Interpreting results</h1>
                    <p>Knowing how to appropriately report your results can be tricky - especially if there are unexpected findings. A reporting guideline can help you ensure you are reporting all the results in a systematic manner.</p>
                    <ul>
                        <li>Reporting Guidelines
                            <ul>
                                <li><a href="https://www.equator-network.org/" target="_blank">https://www.equator-network.org/</a></li>
                            </ul>
                        </li>
                    </ul>
                </div>`,
    "Designing experiments": `<div>
                    <h1>Designing experiments</h1>
                    <p>What are the important factors to consider when designing an experiment? Ensuring that your experiment’s rationale is aligned with the study design and the analyses helps to support the rigor of your research.</p>
                    <ul>
                        <li>Better Inference in Neuroscience: Test Less, Estimate More
                            <ul>
                                <li><a href="https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9665913/" target="_blank">https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9665913/</a></li>
                            </ul>
                        </li>
                    </ul>
                 </div>`,
    "Hard to reproduce analyses": `<div>
                          <h1>Hard to reproduce analyses</h1>
                          <p>Ever try to rerun an analysis and get an error? Or a different result? Computational reproducibility can be difficult. There are many ways to improve reproducibility of your analyses that also make future analyses easier for you and your lab colleagues.</p>
                          <ul>
                              <li>Guide for Reproducible Research
                                  <ul>
                                      <li><a href="https://the-turing-way.netlify.app/reproducible-research/reproducible-research.html" target="_blank">https://the-turing-way.netlify.app/reproducible-research/reproducible-research.html</a></li>
                                  </ul>
                              </li>
                          </ul>
                      </div>`,
    "Hard to find files": `<div>
                  <h1>Hard to find files</h1>
                  <p>Designing and documenting simple organization rules for your research files is easy and impactful. File naming conventions can be as simple as short set of naming rules documented in a central README file.</p>
                  <ul>
                      <li>File Naming Conventions
                          <ul>
                              <li><a href="https://datamanagement.hms.harvard.edu/plan-design/file-naming-conventions" target="_blank">https://datamanagement.hms.harvard.edu/plan-design/file-naming-conventions</a></li>
                          </ul>
                      </li>
                  </ul>
               </div>`,
    "Data loss and corruption": `<div>
                       <h1>Data loss and corruption</h1>
                       <p>Data loss and corruption can be a common source of irreproducible research, not to mention headaches and wasted time. Many researchers consider using data repositories to share data after a publication. However, many repositories can be used as a backup and a way to preserve access for your lab colleagues and your future self.</p>
                       <ul>
                           <li>Registry of research data repositories
                               <ul>
                                   <li><a href="https://www.re3data.org/" target="_blank">https://www.re3data.org//a></li>
                               </ul>
                           </li>
                           <li>Data repositories
                               <ul>
                                   <li><a href="https://datamanagement.hms.harvard.edu/share-publish/data-repositories" target="_blank">https://datamanagement.hms.harvard.edu/share-publish/data-repositories</a></li>
                               </ul>
                           </li>
                       </ul>
                   </div>`,
    "Deviating from lab protocols": `<div>
                            <h1>Deviating from lab protocols</h1>
                            <p>Deviation from a protocol in a study can lead to biased results. In large labs or complex studies, you may have multiple people working on the same method. Ensuring that they are doing the same thing can improve the rigor of your research.</p>
                            <ul>
                                <li>Protocol checklists
                                    <ul>
                                        <li><a href="https://www.protocols.io/" target="_blank">https://www.protocols.io/</a></li>
                                    </ul>
                                </li>
                            </ul>
                        </div>`,
    "Difficulty onboarding + offboarding": `<div>
                                   <h1>Difficult onboarding and offboarding</h1>
                                   <p>Onboarding new lab colleagues can be time consuming for current members and frustrating for new members. Offboarding is often an afterthought, with files and methods and data leaving along with lab colleagues. An electronic laboratory notebook is one way to improve documentation of important aspects of your lab protocols, data, and systems.</p>
                                   <ul>
                                       <li>How to pick an electronic laboratory notebook
                                           <ul>
                                               <li><a href="https://www.nature.com/articles/d41586-018-05895-3" target="_blank">https://www.nature.com/articles/d41586-018-05895-3</a></li>
                                           </ul>
                                       </li>
                                   </ul>
                               </div>`,
};

var noteSolutions = {
    "Missed mistakes": "Validation",
    "Reporting results": "Interpretation",
    "Designing experiments": "Alignment",
    "Hard to reproduce analyses": "Automation",
    "Hard to find files": "Organization",
    "Data loss and corruption": "Dissemination",
    "Deviating from lab protocols": "Containment",
    "Difficulty onboarding + offboarding": "Documentation",
};
