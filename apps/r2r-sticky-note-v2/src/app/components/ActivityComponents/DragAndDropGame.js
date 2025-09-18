const logger = require('../../../../../../packages/logging/logger.js');
"use client";
import React, { useState, useEffect, Suspense, useCallback } from "react";

import localFont from "next/font/local";

const myFont = localFont({
    src: "./GeneralSans-Semibold.ttf",
});

import Image from "next/image";
import noteIcon from "@/app/assets/note.svg";

import NoteList from "./NoteList";
import AllSessionsToggle from "./AllSessionsToggle";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import { getBasePath } from "@/app/utils/basePath";

import { useRouter, useSearchParams } from "next/navigation";

/*
Drag and drop activity in which 9 squares are displayed in a 3x3 grid. The user can drag and drop the squares into the whiteboard.
Upon placement on the whiteboard, the squares are removed from their initial container and positioned on the whiteboard at the location they were dropped.
The user can then drag and drop the squares continously on the whiteboard, adjusting their position as needed.
The user can not place the squares back into the initial container or remove them from the whiteboard.

There are two modes for this component:
- Normal mode: For use on the input page, where the user can drag and drop squares to the whiteboard
- Review mode: Renders a read-only whiteboard which displays user-submitted sticky notes
*/

function DragAndDropGameContent({ reviewMode = false }) {
    const searchParams = useSearchParams();
    const sessionID = searchParams.get("sessionID");
    logger.app.info("sessionID:", sessionID);

    const initialNotes = [
        "Missed mistakes",
        "Hard to Reproduce Analysis",
        "Data loss and Corruption",
        "Deviating from Lab Protocols",
        "Difficulty Onboarding + Offboarding",
        "Reporting Results",
        "Designing Experiments",
        "Hard to find Files",
    ];

    const [noteText, setNoteText] = useState(initialNotes);
    const [squares, setSquares] = useState(initialNotes);
    const [whiteboardSquares, setWhiteboardSquares] = useState([]);
    const [noteScores, setNoteScores] = useState({});
    const [hasNotesRemaining, setHasNotesRemaining] = useState(true);
    const [reviewPhase, setReviewPhase] = useState(reviewMode);
    const [combinedNoteScores, setCombinedNoteScores] = useState({});
    const [selectedNote, setSelectedNote] = useState(initialNotes[0]);
    const [showAllSessions, setShowAllSessions] = useState(false);
    const [compiledGroupData, setCompiledGroupData] = useState([]);

    const [linearNoteScores, setLinearNoteScores] = useState({});

    const [notesFromApi, setNotesFromApi] = useState([]);

    const [isModalOpen, setIsModalOpen] = useState(true);

    const router = useRouter();

    const handleModalClose = () => {
        setIsModalOpen(false);
    }

    const handleModalOpen = () => {
        setIsModalOpen(true);
    }

    // console log note text
    useEffect(() => {
        logger.app.info("noteText:", noteText);
    }, [noteText]);

    useEffect(() => {
        logger.app.info("selectedNote:", selectedNote);
    }, [selectedNote]);

    useEffect(() => {
        logger.app.info("noteScores:", noteScores);
    }, [noteScores]);


    // UseEffect for combinedNoteScores
    useEffect(() => {
        // Lets do some processing here
        // For each note in combinedNoteScores, calculate the average x and y coordinates
        // and store them in a new object

        if (reviewMode) {
            let averageNoteScores = {};
            Object.entries(combinedNoteScores).forEach(([noteText, coordinates]) => {
                const averageX = coordinates.reduce((sum, coord) => sum + coord.x, 0) / coordinates.length;
                const averageY = coordinates.reduce((sum, coord) => sum + coord.y, 0) / coordinates.length;
                averageNoteScores[noteText] = { x: averageX, y: averageY };
            });

            // For each note in averageNoteScores, calculate the linear score
            // linear = (x + y) / 2
            let tempLinearNoteScores = {};
            Object.entries(averageNoteScores).forEach(([noteText, coordinates]) => {
                const linearScore = (coordinates.x + coordinates.y) / 2;
                tempLinearNoteScores[noteText] = linearScore;
            });
            setLinearNoteScores(tempLinearNoteScores);

            // TODO: Sort the order of the notes based on the linear score 
            logger.app.info("linearNoteScores:", linearNoteScores);
        }

    }, [combinedNoteScores]);



    // UseEffect for linearNoteScores
    useEffect(() => {
        logger.app.info("linearNoteScores:", linearNoteScores);

        // If review mode is true, and linearNoteScores is not empty, sort the linearNoteScores by value in descending order
        if (reviewMode && Object.keys(linearNoteScores).length > 0) {
            const sortedLinearNoteScores = Object.entries(linearNoteScores).sort((a, b) => b[1] - a[1]);

            // Sort the noteText array based on the sortedLinearNoteScores
            const sortedNoteText = sortedLinearNoteScores.map(([noteText, _]) => noteText);
            setNoteText(sortedNoteText);
        }

    }, [linearNoteScores]);


    // Upon change of noteScores, update combinedNoteScores
    useEffect(() => {
        setCombinedNoteScores(noteScores);
    }, [noteScores]);


    // Detect if there are no notes remaining to activate the submit button
    useEffect(() => {
        if (squares.length === 0) {
            // setHasNotesRemaining(false);
            logger.app.info("No notes remaining");
            setHasNotesRemaining(false);
        }
    }, [squares]);

    const handleSubmitToApi = async () => {
        const randomUserID =
            Math.random().toString(36).substring(2, 15) +
            Math.random().toString(36).substring(2, 15);

        const payload = {
            userID: randomUserID,
            sessionID: sessionID,
            noteScores: noteScores,
        };

        // Submit the data to the API
        try {
            const base = getBasePath();
            const res = await fetch(`${base}/api/stickyNoteApi`, {
                method: "POST",
                headers: {
                    "Content-type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (res.ok) {
                logger.app.info("Successfully submitted");
                openReviewPage();
            } else {
                // TODO: Add additionalerror handling
                logger.app.info("Response not ok.");
                throw new Error("Response not ok.");
            }
        } catch (error) {
            // TODO: Add additional error handling
            logger.app.info("Error in fetch");
            logger.app.info(error);
        }
    };

    const fetchNotesFromApi = useCallback(async () => {
        logger.app.info("showAllSessions:", showAllSessions);
        logger.app.info("hello world!:");
        const base = getBasePath();
        const res = await fetch(`${base}/api/stickyNoteApi`);
        const data = await res.json();

        // Filter notesFromApi based on showAllSessions
        const filteredNotesFromApi = showAllSessions
            ? data
            : data.filter((note) => note.sessionID === sessionID);

        setNotesFromApi(filteredNotesFromApi);
        logger.app.info("notesFromApi:", filteredNotesFromApi);
    }, [sessionID, showAllSessions]);

    // Fetch notes from api if review mode is true and there are no notes from api
    useEffect(() => {
        if (reviewMode && notesFromApi.length === 0) {
            fetchNotesFromApi();
        }
        if (reviewMode && showAllSessions) {
            fetchNotesFromApi();
        }
    }, [reviewMode, fetchNotesFromApi, showAllSessions]);

    useEffect(() => {
        logger.app.info("showAllSessions toggled:", showAllSessions);

        // Clear whiteboard
        setNotesFromApi([]);
        setCombinedNoteScores({});
        setCompiledGroupData({});

        // Re-fetch notes from api
        fetchNotesFromApi();
    }, [showAllSessions]);

    // Use effect to update combinedNoteScores after notesFromApi is updated
    useEffect(() => {
        logger.app.info("notesFromApi:", notesFromApi);
        if (notesFromApi.length > 0) {
            logger.app.info("setting combinedNoteScores");
            logger.app.info("notesFromApi:", notesFromApi);

            // Build an object with the noteScores of each entry in notesFromApi
            let combinedNoteData = [];
            notesFromApi.forEach((entry) => {
                combinedNoteData.push(entry.noteScores[0]);
            });
            logger.app.info("combinedNoteData:", combinedNoteData);
            setCombinedNoteScores(combinedNoteData);

            /*
                Compile group data:
                - Create a data structure that contains data based on the text of the 8 initial notes
                - For each given noteText, it will store a list of x,y coordinates (one for each users submission)
            */
            let groupData = {};

            // Initialize groupData with empty arrays for each note text
            initialNotes.forEach((noteText) => {
                groupData[noteText] = [];
            });

            // Populate groupData by iterating through each user's submission
            notesFromApi.forEach((submission) => {
                const noteScores = submission.noteScores[0];

                // For each note in the submission, add its coordinates to groupData
                Object.entries(noteScores).forEach(
                    ([noteText, coordinates]) => {
                        if (groupData[noteText]) {
                            groupData[noteText].push({
                                x: coordinates.x,
                                y: coordinates.y,
                            });
                        }
                    }
                );
            });

            logger.app.info("Compiled group data:", groupData);
            setCompiledGroupData(groupData);
            setCombinedNoteScores(groupData);

            // setCombinedNoteScores(combinedNoteData);
        }
    }, [notesFromApi]);

    // Useeffect to print combinedNoteScores
    useEffect(() => {
        logger.app.info("combinedNoteScores:", combinedNoteScores);
    }, [combinedNoteScores]);

    const handleDragStart = (e, id) => {
        const rect = e.target.getBoundingClientRect();
        const offsetX = e.clientX - rect.left;
        const offsetY = e.clientY - rect.top;
        e.dataTransfer.setData("text/plain", JSON.stringify({ id, offsetX, offsetY }));
    };

    useEffect(() => {
        logger.app.info(noteScores);
    }, [noteScores]);

    const handleDrop = (e) => {
        e.preventDefault();
        const { id, offsetX, offsetY } = JSON.parse(e.dataTransfer.getData("text/plain"));

        // Ensure the drop target is the whiteboard
        if (!e.currentTarget.classList.contains("whiteboard")) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left - offsetX;
        const y = e.clientY - rect.top - offsetY;

        // Check if the drop is within the whiteboard bounds
        if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
            return; // Exit if the drop is outside the whiteboard
        }

        const relativeX = ((x - rect.width / 2) / (rect.width / 2)) * 100;
        const relativeY = ((y - rect.height / 2) / (rect.height / 2)) * 100;

        if (squares.includes(id)) {
            setSquares(squares.filter((square) => square !== id));
        }

        setWhiteboardSquares((prevState) => [
            ...prevState.filter((item) => item.id !== id),
            { id, x, y },
        ]);

        setNoteScores((prevScores) => ({
            ...prevScores,
            [id]: { x: relativeX, y: -relativeY },
        }));
    };

    const allowDrop = (e) => {
        e.preventDefault();
    };

    const getGridPosition = (index) => {
        const row = Math.floor(index / 3);
        const col = index % 3;
        return { row, col };
    };

    const submitNotes = () => {
        logger.app.info("Submitting notes");
        clearWhiteboard();
    };

    // Clear the whiteboard notes
    const clearWhiteboard = () => {
        setWhiteboardSquares([]);

        // setReviewPhase(true);
        handleSubmitToApi(); // Routes to review page upon submission
        // openReviewPage();
    };

    const openReviewPage = () => {
        if (sessionID) {
            const base2 = getBasePath();
            router.push(`${base2}/pages/review?sessionID=${sessionID}`);
        } else {
            const base3 = getBasePath();
            router.push(`${base3}/pages/review`);
        }
    };

    const openResourcePage = () => {
        const base4 = getBasePath();
        router.push(`${base4}/pages/resources`);
    };

    return (
        <div
            style={{
                display: "flex",
                flexDirection: "column",
                justifyContent: "space-between",
                alignItems: "flex-start",
            }}
            className={myFont.className}
        >
            {!reviewPhase && (
                <CustomModal
                    isOpen={isModalOpen}
                    closeModal={handleModalClose}
                    title="Hello World"
                    content="This is a modal"
                />
            )}
            <div
                style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "flex-start",
                }}
                className={myFont.className}
            >
                <div
                    style={{
                        display: "flex",
                        flexDirection: "column",
                        alignItems: "flex-start",
                        margin: "20px",
                        width: "30%",
                        gap: "10px",
                    }}
                    className={myFont.className}
                >
                    <h1 className="text-custom-dark-bg text-3xl">
                        {/* Whiteboard exercise */}
                    </h1>

                    {!reviewPhase && (
                        <p className="text-custom-black-bg text-lg">
                            Which issues have the biggest impact on yourself and
                            your research?
                        </p>
                    )}
                    {reviewPhase && (
                        <p className="text-custom-black-bg text-lg">
                            What solutions are your colleagues most interested in trying?
                        </p>
                    )}
                    {!reviewPhase && (
                        <p className="text-custom-dark-bg opacity-60 text-base">
                            Drag the sticky notes to the board
                        </p>
                    )}
                    {reviewPhase && (
                        <p className="text-custom-dark-bg opacity-60 text-base">
                           The sticky notes below are ordered from most high interest and impact to low interest and impact
                        </p>
                    )}

                    {reviewPhase && (
                        <div className='review-phase-panel'>
                            <NoteList
                                selectedNote={selectedNote}
                                setSelectedNote={setSelectedNote}
                                noteText={noteText}
                            />

                            <AllSessionsToggle
                                showAllSessions={showAllSessions}
                                setShowAllSessions={setShowAllSessions}
                            />

                            <button className='continue-button' onClick={openResourcePage}>Continue</button>
                        </div>
                    )}

                    {/* If no notes remaining, display a message */}
                    {!hasNotesRemaining && !reviewPhase && (
                        <div
                            style={{
                                color: "#333132",
                                fontSize: "20px",
                                backgroundColor: "#E5E5E5",
                                padding: "20px",
                                borderRadius: "10px",
                                margin: "20px",
                            }}
                        >
                            <h2 className="text-gray-800 text-xl">
                                You&apos;ve placed all the sticky notes!
                            </h2>
                            <p className="text-gray-800 text-base">
                                Review their position on the white board one
                                last time by dragging them around and when
                                finished submit them.
                            </p>
                            <button
                                style={{
                                    backgroundColor: "#333132",
                                    color: "white",
                                    fontSize: "20px",
                                    padding: "10px 20px",
                                    border: "none",
                                    borderRadius: "5px",
                                    cursor: "pointer",
                                }}
                                onClick={submitNotes}
                            >
                                Submit Whiteboard
                            </button>
                        </div>
                    )}

                    {/* Input phase */}
                    {hasNotesRemaining && !reviewPhase && (
                        <div
                            style={{
                                display: "grid",
                                gridTemplateColumns: "repeat(3, 100px)",
                                gap: "10px",
                                marginRight: "20px",
                                alignSelf: "center",
                            }}
                        >
                            {squares.map((square, index) => {
                                const { row, col } = getGridPosition(index);
                                return (
                                    <div
                                        key={square}
                                        draggable
                                        onDragStart={(e) =>
                                            handleDragStart(e, square)
                                        }
                                        style={{
                                            width: "100px",
                                            height: "100px",
                                            position: "relative",
                                            cursor: "grab",
                                            gridRow: row + 1,
                                            gridColumn: col + 1,
                                            textAlign: "center",
                                        }}
                                    >
                                        {/* If no notes remaining, display a message */}
                                        {/* {!hasNotesRemaining && <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: 'black', fontSize: '20px' }}>No notes remaining</div>} */}

                                        <Image
                                            src={noteIcon}
                                            alt="Note Icon"
                                            //   layout="fill"
                                            objectFit="cover"
                                            style={{
                                                width: "100px",
                                                height: "100px",
                                            }}
                                        />
                                        <span
                                            style={{
                                                position: "absolute",
                                                top: "50%",
                                                left: "50%",
                                                transform:
                                                    "translate(-50%, -50%)",
                                                color: "black",
                                                //   fontWeight: 'bold',
                                                textAlign: "center",
                                                width: "100%",
                                                padding: "0 5px",
                                                fontSize: "14px",
                                            }}
                                        >
                                            {square}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>
                    )}
                </div>

                {/* Whiteboard - Input phase */}
                {!reviewPhase && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={allowDrop}
                        className={"whiteboard"}
                        style={
                            {
                                //   width: '500px',
                                //   height: '500px',
                                //   backgroundColor: 'white',
                                //   position: 'relative',
                                //   margin: '80px'
                            }
                        }
                    >
                        {/* Horizontal Line */}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                width: "100%",
                                height: "2px",
                                backgroundColor: "black",
                            }}
                        ></div>

                        {/* Vertical Line */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: "50%",
                                width: "2px",
                                height: "100%",
                                backgroundColor: "black",
                            }}
                        ></div>

                        {/* Text left of horizontal line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "-40px",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            Low<br></br>Impact
                        </p>
                        {/* Text right of horizontal line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: "-110px",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            High<br></br>Impact
                        </p>
                        {/* Text above of vertical line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "-40px",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            High<br></br>Interest
                        </p>
                        {/* Text below of vertical line */}
                        <p
                            style={{
                                position: "absolute",
                                bottom: "-90px",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            Low<br></br>Interest
                        </p>

                        {whiteboardSquares.map((square) => (
                            <div
                                key={square.id}
                                draggable
                                onDragStart={(e) =>
                                    handleDragStart(e, square.id)
                                }
                                style={{
                                    width: "100px",
                                    height: "100px",
                                    position: "absolute",
                                    top: `${square.y}px`,
                                    left: `${square.x}px`,
                                    display: "flex",
                                    justifyContent: "center",
                                    alignItems: "center",
                                    cursor: "grab",
                                    textAlign: "center",
                                }}
                            >
                                <Image
                                    src={noteIcon}
                                    alt="Note Icon"
                                    layout="fill"
                                    objectFit="cover"
                                />
                                <span
                                    style={{
                                        position: "absolute",
                                        top: "50%",
                                        left: "50%",
                                        transform: "translate(-50%, -50%)",
                                        color: "black",
                                        fontWeight: "bold",
                                        textAlign: "center",
                                        width: "100%",
                                        padding: "0 5px",
                                    }}
                                >
                                    {square.id}
                                </span>
                            </div>
                        ))}
                    </div>
                )}

                {/* Whiteboard - Review phase */}
                {reviewPhase && (
                    <div
                        onDrop={handleDrop}
                        onDragOver={allowDrop}
                        className={"whiteboard"}
                        style={
                            {
                                //   width: '500px',
                                //   height: '500px',
                                //   backgroundColor: 'white',
                                //   position: 'relative',
                                //   margin: '80px'
                            }
                        }
                    >
                        {/* Horizontal Line */}
                        <div
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: 0,
                                width: "100%",
                                height: "2px",
                                backgroundColor: "black",
                            }}
                        ></div>

                        {/* Vertical Line */}
                        <div
                            style={{
                                position: "absolute",
                                top: 0,
                                left: "50%",
                                width: "2px",
                                height: "100%",
                                backgroundColor: "black",
                            }}
                        ></div>

                        {/* Text left of horizontal line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "50%",
                                left: "-40px",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            Low<br></br>Impact
                        </p>
                        {/* Text right of horizontal line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "50%",
                                right: "-110px",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            High<br></br>Impact
                        </p>
                        {/* Text above of vertical line */}
                        <p
                            style={{
                                position: "absolute",
                                top: "-40px",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            High<br></br>Interest
                        </p>
                        {/* Text below of vertical line */}
                        <p
                            style={{
                                position: "absolute",
                                bottom: "-90px",
                                left: "50%",
                                transform: "translate(-50%, -50%)",
                                fontSize: "20px",
                                color: "black",
                                textAlign: "center",
                            }}
                        >
                            Low<br></br>Interest
                        </p>

                        {/* 
                        Each note contains a position.x and position.y which may be from -100 to 100
                        Map them to the whiteboard in a manner such that:
                                position.x is the x coordinate
                                position.y is the y coordinate
                                The center of the whiteboard is 0, 0
                                The top left corner of the whiteboard is -100, 100
                                The bottom right corner of the whiteboard is 100, -100
                        */}
                        {/* <div>Hello World</div> */}
                        {Object.entries(combinedNoteScores).map(
                            ([id, positions]) => {
                                if (selectedNote && selectedNote !== id) {
                                    return null;
                                }

                                // Return an array of elements for each position
                                return positions.map((pos) => {
                                    const x = (pos.x + 100) / 2;
                                    const y = (100 - pos.y) / 2;

                                    return (
                                        <div
                                            key={`${id}-${x}-${y}`}
                                            style={{
                                                width: "50px",
                                                height: "50px",
                                                position: "absolute",
                                                top: `${y}%`,
                                                left: `${x}%`,
                                                display: "flex",
                                                justifyContent: "center",
                                                alignItems: "center",
                                                cursor: "grab",
                                                textAlign: "center",
                                                marginLeft: "25px",
                                                marginTop: "25px",
                                            }}
                                        >
                                            <Image
                                                src={noteIcon}
                                                alt="Note Icon"
                                                layout="fill"
                                                objectFit="cover"
                                            />
                                            <span
                                                style={{
                                                    position: "absolute",
                                                    top: "50%",
                                                    left: "50%",
                                                    transform:
                                                        "translate(-50%, -50%)",
                                                    color: "black",
                                                    fontWeight: "bold",
                                                    textAlign: "center",
                                                    width: "100%",
                                                    padding: "0 5px",
                                                }}
                                            >
                                                {/* {id} */}
                                            </span>
                                        </div>
                                    );
                                });
                            }
                        )}
                    </div>
                )}
            </div>
            {/* <button className='exit-button'>Exit Activity X</button> */}
            {/* on review phase */}
            {/* {reviewPhase && (
                <button
                    className="continue-button"
                    onClick={() => openResourcePage()}
                >
                    Continue
                </button>
            )} */}
        </div>
    );
}

export default function DragAndDropGame({ reviewMode = false }) {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <DragAndDropGameContent reviewMode={reviewMode} />
        </Suspense>
    );
}
