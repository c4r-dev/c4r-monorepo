'use client'
import React, { useState, useEffect } from 'react';
import styles from '../styles/globals.css';

import localFont from 'next/font/local';
const myFont = localFont({
    src: './GeneralSans-Semibold.ttf'
});

import Image from 'next/image';
import noteIcon from '../assets/note.svg';
// import photo1 from '../assets/photo2.png';
import NoteList from './NoteList';
import AllSessionsToggle from './AllSessionsToggle';


/*
Drag and drop activity in which 9 squares are displayed in a 3x3 grid. The user can drag and drop the squares into the whiteboard.
Upon placement on the whiteboard, the squares are removed from their initial container and positioned on the whiteboard at the location they were dropped.
The user can then drag and drop the squares continously on the whiteboard.
The user can not place the squares back into the initial container.
*/

export default function DragAndDropGame({showResource}) {
    const initialNotes = [
        'Missed mistakes',
        'Hard to Reproduce Analysis',
        'Data loss and Corruption',
        // 'TESTNOTE',
        'Deviating from Lab Protocols',
        'Difficulty Onboarding + Offboarding',
        'Reporting Results',
        'Designing Experiments',
        'Hard to find Files'
    ];

    const [noteText, setNoteText] = useState(initialNotes);
    const [squares, setSquares] = useState(initialNotes);
    const [whiteboardSquares, setWhiteboardSquares] = useState([]);
    const [noteScores, setNoteScores] = useState({});
    const [hasNotesRemaining, setHasNotesRemaining] = useState(true);
    const [reviewPhase, setReviewPhase] = useState(false);
    const [combinedNoteScores, setCombinedNoteScores] = useState({});
    const [selectedNote, setSelectedNote] = useState(null);
    const [showAllSessions, setShowAllSessions] = useState(false);

    useEffect(() => {
        console.log('selectedNote:', selectedNote);
    }, [selectedNote]);

    useEffect(() => {
        console.log('noteScores:', noteScores);
    }, [noteScores]);

    // Upon change of noteScores, update combinedNoteScores
    useEffect(() => {
        setCombinedNoteScores(noteScores);
    }, [noteScores]);



    // Use effect if squares is 0
    useEffect(() => {
        if (squares.length === 0) {
            // setHasNotesRemaining(false);
            console.log('No notes remaining');
            setHasNotesRemaining(false);
        }
    }, [squares]);

    const handleDragStart = (e, id) => {
        e.dataTransfer.setData('text/plain', id);
    };

    useEffect(() => {
        console.log(noteScores);
    }, [noteScores]);

    const handleDrop = (e) => {
        e.preventDefault();
        const id = e.dataTransfer.getData('text/plain');

        // Ensure the drop target is the whiteboard
        if (!e.currentTarget.classList.contains('whiteboard')) {
            return;
        }

        const rect = e.currentTarget.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Check if the drop is within the whiteboard bounds
        if (x < 0 || x > rect.width || y < 0 || y > rect.height) {
            return; // Exit if the drop is outside the whiteboard
        }

        const relativeX = ((x - rect.width / 2) / (rect.width / 2)) * 100;
        const relativeY = ((y - rect.height / 2) / (rect.height / 2)) * 100;

        if (squares.includes(id)) {
            setSquares(squares.filter(square => square !== id));
        }

        setWhiteboardSquares(prevState => [
            ...prevState.filter(item => item.id !== id),
            { id, x, y }
        ]);

        setNoteScores(prevScores => ({
            ...prevScores,
            [id]: { x: relativeX, y: -relativeY }
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
        console.log('Submitting notes');
        clearWhiteboard();
    };

    // Clear the whiteboard notes
    const clearWhiteboard = () => {
        setWhiteboardSquares([]);

        setReviewPhase(true);

    };

    return (
        <div className={`flex flex-col justify-between items-start ${myFont.className}`}>
            <div className={`flex justify-between items-start ${myFont.className}`}>
                <div className={`flex flex-col items-start m-5 w-3/10 gap-2.5 ${myFont.className}`}>
                    <h1 className="text-gray-800 text-3xl">Whiteboard exercise</h1>
                    <p className="text-gray-900 text-xl">Which issues have the biggest impact on yourself and your research?</p>
                    <p className="text-gray-800 opacity-60 text-base">Drag the sticky notes to the board</p>

                    {reviewPhase &&

                        <div>
                            <NoteList selectedNote={selectedNote} setSelectedNote={setSelectedNote} noteText={noteText} />

                            <AllSessionsToggle showAllSessions={showAllSessions} setShowAllSessions={setShowAllSessions} />
                        </div>
                    }

                    {/* If no notes remaining, display a message */}
                    {!hasNotesRemaining && !reviewPhase &&
                        <div style={{ color: '#333132', fontSize: '20px', backgroundColor: '#E5E5E5', padding: '20px', borderRadius: '10px', margin: '20px' }}>
                            <h2 style={{ color: '#333132', fontSize: '20px' }}>You've placed all the sticky notes!</h2>
                            <p style={{ color: '#333132', fontSize: '16px' }}>Review their position on the white board one last time by dragging them around and when finished submit them.</p>
                            <button style={{ backgroundColor: '#333132', color: 'white', fontSize: '20px', padding: '10px 20px', border: 'none', borderRadius: '5px', cursor: 'pointer' }} onClick={submitNotes}>Submit Whiteboard</button>
                        </div>}

                    {/* Input phase */}
                    {hasNotesRemaining && !reviewPhase &&

                        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 100px)', gap: '10px', marginRight: '20px', alignSelf: 'center' }}>
                            {squares.map((square, index) => {
                                const { row, col } = getGridPosition(index);
                                return (
                                    <div
                                        key={square}
                                        draggable
                                        onDragStart={(e) => handleDragStart(e, square)}
                                        style={{
                                            width: '100px',
                                            height: '100px',
                                            position: 'relative',
                                            cursor: 'grab',
                                            gridRow: row + 1,
                                            gridColumn: col + 1,
                                            textAlign: 'center'
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
                                                width: '100px',
                                                height: '100px'
                                            }}
                                        />
                                        <span style={{
                                            position: 'absolute',
                                            top: '50%',
                                            left: '50%',
                                            transform: 'translate(-50%, -50%)',
                                            color: 'black',
                                            //   fontWeight: 'bold',
                                            textAlign: 'center',
                                            width: '100%',
                                            padding: '0 5px',
                                            fontSize: '14px'
                                        }}>
                                            {square}
                                        </span>
                                    </div>
                                );
                            })}
                        </div>


                    }
                </div>

                {/* Whiteboard - Input phase */}
                {!reviewPhase &&
                    <div
                    onDrop={handleDrop}
                    onDragOver={allowDrop}
                    className={'whiteboard'}
                    style={{
                        //   width: '500px',
                        //   height: '500px',
                        //   backgroundColor: 'white',
                        //   position: 'relative',
                        //   margin: '80px'
                        }}
                    >
                        {/* Horizontal Line */}
                        <div style={{
                        position: 'absolute',
                        top: '50%',
                        left: 0,
                        width: '100%',
                        height: '2px',
                        backgroundColor: 'black'
                    }}></div>

                    {/* Vertical Line */}
                    <div style={{
                        position: 'absolute',
                        top: 0,
                        left: '50%',
                        width: '2px',
                        height: '100%',
                        backgroundColor: 'black'
                    }}></div>

                    {/* Text left of horizontal line */}
                    <p style={{ position: 'absolute', top: '50%', left: '-40px', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>Low<br></br>Impact</p>
                    {/* Text right of horizontal line */}
                    <p style={{ position: 'absolute', top: '50%', right: '-110px', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>High<br></br>Impact</p>
                    {/* Text above of vertical line */}
                    <p style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>High<br></br>Interest</p>
                    {/* Text below of vertical line */}
                    <p style={{ position: 'absolute', bottom: '-90px', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>Low<br></br>Interest</p>

                    {whiteboardSquares.map((square) => (
                        <div
                            key={square.id}
                            draggable
                            onDragStart={(e) => handleDragStart(e, square.id)}
                            style={{
                                width: '100px',
                                height: '100px',
                                position: 'absolute',
                                top: `${square.y}px`,
                                left: `${square.x}px`,
                                display: 'flex',
                                justifyContent: 'center',
                                alignItems: 'center',
                                cursor: 'grab',
                                textAlign: 'center'
                            }}
                        >
                            <Image
                                src={noteIcon}
                                alt="Note Icon"
                                layout="fill"
                                objectFit="cover"
                            />
                            <span style={{
                                position: 'absolute',
                                top: '50%',
                                left: '50%',
                                transform: 'translate(-50%, -50%)',
                                color: 'black',
                                fontWeight: 'bold',
                                textAlign: 'center',
                                width: '100%',
                                padding: '0 5px'
                            }}>
                                {square.id}
                            </span>
                        </div>
                    ))}
                </div>
                }
                
                {/* Whiteboard - Review phase */}
                {reviewPhase &&
                    <div
                        onDrop={handleDrop}
                        onDragOver={allowDrop}
                        className={'whiteboard'}
                        style={{
                            //   width: '500px',
                            //   height: '500px',
                            //   backgroundColor: 'white',
                            //   position: 'relative',
                            //   margin: '80px'
                        }}
                    >
                        {/* Horizontal Line */}
                        <div style={{
                            position: 'absolute',
                            top: '50%',
                            left: 0,
                            width: '100%',
                            height: '2px',
                            backgroundColor: 'black'
                        }}></div>

                        {/* Vertical Line */}
                        <div style={{
                            position: 'absolute',
                            top: 0,
                            left: '50%',
                            width: '2px',
                            height: '100%',
                            backgroundColor: 'black'
                        }}></div>

                        {/* Text left of horizontal line */}
                        <p style={{ position: 'absolute', top: '50%', left: '-40px', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>Low<br></br>Impact</p>
                        {/* Text right of horizontal line */}
                        <p style={{ position: 'absolute', top: '50%', right: '-110px', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>High<br></br>Impact</p>
                        {/* Text above of vertical line */}
                        <p style={{ position: 'absolute', top: '-40px', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>High<br></br>Interest</p>
                        {/* Text below of vertical line */}
                        <p style={{ position: 'absolute', bottom: '-90px', left: '50%', transform: 'translate(-50%, -50%)', fontSize: '20px', color: 'black', textAlign: 'center' }}>Low<br></br>Interest</p>

                        {/* 
                        Each note contains a position.x and position.y which may be from -100 to 100
                        Map them to the whiteboard in a manner such that:
                                position.x is the x coordinate
                                position.y is the y coordinate
                                The center of the whiteboard is 0, 0
                                The top left corner of the whiteboard is -100, 100
                                The bottom right corner of the whiteboard is 100, -100
                        */}
                        {Object.entries(combinedNoteScores).map(([id, position]) => {
                            if (selectedNote && selectedNote !== id) {
                                return null;
                            }
                            const x = (position.x + 100) / 2; // Map -100 to 100 range to 0 to 100
                            const y = (100 - position.y) / 2; // Map -100 to 100 range to 0 to 100 and invert y-axis
                            return (
                                <div
                                    key={id}
                                    style={{
                                        width: '50px',
                                        height: '50px',
                                        position: 'absolute',
                                        top: `${y}%`,
                                        left: `${x}%`,
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        cursor: 'grab',
                                        textAlign: 'center'
                                    }}
                                >
                                    <Image
                                        src={noteIcon}
                                        alt="Note Icon"
                                        layout="fill"
                                        objectFit="cover"
                                    />
                                    <span style={{
                                        position: 'absolute',
                                        top: '50%',
                                        left: '50%',
                                        transform: 'translate(-50%, -50%)',
                                        color: 'black',
                                        fontWeight: 'bold',
                                        textAlign: 'center',
                                        width: '100%',
                                        padding: '0 5px'
                                    }}>
                                        {/* {id} */}
                                    </span>
                                </div>
                            );
                        })}
                        </div>
                }
            </div>
            <button className='exit-button'>Exit Activity X</button>
            {/* on review phase */}
            {reviewPhase &&
                <button className='continue-button' onClick={() => showResource()}>Continue</button>
            }
        </div>
    );
}