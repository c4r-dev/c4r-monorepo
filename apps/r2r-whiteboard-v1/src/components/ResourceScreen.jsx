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

export default function DragAndDropGame() {
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

    const initialResource = {
        topic: 'Missed mistakes',
        solution: 'Validation',
        headerText: 'We all make mistakes! Brainstorming with your lab colleagues about approaches to check and validate your lab’s work is a great way to make your work more rigorous.',
        resourceHeader: 'Error Tight: Exercises for Lab Groups to Prevent Research Mistakes',
        resourceURL: 'https://osf.io/preprints/psyarxiv/rsn5y/'
    }


    const [noteText, setNoteText] = useState(initialNotes);

    const [squares, setSquares] = useState(initialNotes);
    const [whiteboardSquares, setWhiteboardSquares] = useState([]);
    const [noteScores, setNoteScores] = useState({});
    const [hasNotesRemaining, setHasNotesRemaining] = useState(true);
    const [reviewPhase, setReviewPhase] = useState(false);
    const [combinedNoteScores, setCombinedNoteScores] = useState({});

    const [selectedNote, setSelectedNote] = useState(initialNotes[0]);
    const [showAllSessions, setShowAllSessions] = useState(false);

    const [selectedResource, setSelectedResource] = useState(initialResource);



    useEffect(() => {
        // console.log('selectedNote:', selectedNote);
        setSelectedResource(topics.find(topic => topic.topic === selectedNote));
    }, [selectedNote]);

    useEffect(() => {
        // console.log('noteScores:', noteScores);
    }, [noteScores]);

    useEffect(() => {
        console.log('selectedResource:', selectedResource);
    }, [selectedResource]);

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

    const topics = [
        {
            topic: 'Missed mistakes',
            solution: 'Validation',
            headerText: 'We all make mistakes! Brainstorming with your lab colleagues about approaches to check and validate your lab’s work is a great way to make your work more rigorous.',
            resourceHeader: 'Error Tight: Exercises for Lab Groups to Prevent Research Mistakes',
            resourceURL: 'https://osf.io/preprints/psyarxiv/rsn5y/'
        },
        {
            topic: 'Reporting Results',
            solution: 'Interpretation',
            headerText: 'Knowing how to appropriately report your results can be tricky - especially if there are unexpected findings. A reporting guideline can help you ensure you are reporting all the results in a systematic manner. Reporting guidelines include checklists, example text, and guidance on how to write a reproducible report. The EQUATOR Network has a database of health research reporting guidelines that are specific to study designs.',
            resourceHeader: 'Reporting Guidelines',
            resourceURL: 'https://www.equator-network.org/'
        },
        {
            topic: 'Difficulty Onboarding + Offboarding',
            solution: 'Documentation',
            headerText: 'Onboarding new lab colleagues can be time consuming for current members and frustrating for new members. Offboarding is often an afterthought, with files and methods and data leaving along with lab colleagues. An electronic laboratory notebook is one way to improve documentation of important aspects of your lab protocols, data, and systems.',
            resourceHeader: 'How to pick an electronic laboratory notebook',
            resourceURL: 'https://www.nature.com/articles/d41586-018-05895-3'
        },
        {
            topic: 'Designing Experiments',
            solution: 'Alignment',
            headerText: 'What are the important factors to consider when designing an experiment? Ensuring that your experiment’s rationale is aligned with the study design and the analyses helps to support the rigor of your research. Start by considering whether you are interested in exploratory research (discovery) or confirmatory research (hypothesis testing).',
            resourceHeader: 'Better Inference in Neuroscience: Test Less, Estimate More',
            resourceURL: 'https://www.ncbi.nlm.nih.gov/pmc/articles/PMC9665913/'
        },
        {
            topic: 'Hard to Reproduce Analysis',
            solution: 'Automation',
            headerText: 'Ever try to rerun an analysis and get an error? Or a different result? Computational reproducibility can be difficult. There are many ways to improve reproducibility of your analyses that also make future analyses easier for you and your lab colleagues. Consider automating as much of your analyses as you can.',
            resourceHeader: 'Guide for Reproducible Research',
            resourceURL: 'https://the-turing-way.netlify.app/reproducible-research/reproducible-research.html'
        },
        {
            topic: 'Hard to find Files',
            solution: 'Organization',
            headerText: 'Designing and documenting simple organization rules for your research files is easy and impactful. File naming conventions can be as simple as short set of naming rules documented in a central README file. Choose naming rules that are both machine readable and human readable.',
            resourceHeader: 'File Naming Conventions',
            resourceURL: 'https://datamanagement.hms.harvard.edu/plan-design/file-naming-conventions'
        },
        {
            topic: 'Data loss and Corruption',
            solution: 'Dissemination',
            headerText: 'Data loss or corruption can be a common source of irreproducible research, not to mention headaches and wasted time. Many researchers consider using data repositories to share data after a publication. However, many repositories can be used as a backup and a way to preserve access for your lab colleagues and your future self.',
            resourceHeader: 'Registry of research data repositories',
            resourceURL: 'https://www.re3data.org/'
        },
        {
            topic: 'Deviating from Lab Protocols',
            solution: 'Containment',
            headerText: 'Deviation from a protocol in a study can lead to biased results. In large labs or complex studies, you may have multiple people working on the same method. Ensuring that they are doing the same thing can improve the rigor of your research. It also makes running protocols in your lab a breeze when you can rely on a checklist and automated documentation of what was done.',
            resourceHeader: 'Protocol checklists',
            resourceURL: 'https://www.protocols.io/'
        }
    ];

    return (
        <div style={{ display: 'flex', flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start' }} className={myFont.className}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }} className={myFont.className}>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start', margin: '20px', width: '60%', gap: '10px' }} className={myFont.className}>
                    <h1 style={{ color: '#333132', fontSize: '28px' }}>Whiteboard exercise</h1>
                    <p style={{ color: '#060606', fontSize: '20px' }}>Which issues have the biggest impact on yourself and your research?</p>
                    <p style={{ color: '#333132', opacity: '0.6', fontSize: '16px' }}>Drag the sticky notes to the board</p>

                    

                        <div>
                            <NoteList selectedNote={selectedNote} setSelectedNote={setSelectedNote} noteText={noteText} />
                        </div>

                </div>
            </div>

            <div className='resource-area'>
                <div className='resource-container'>
                    <div className='resource-pane'>
                        <div className='resource-header'>
                            <h1>{selectedResource?.headerText}</h1>
                            {/* <p>Deviation from a protocol in a study can lead to biased results. In large labs or complex studies, you may have multiple people working on the same method. Ensuring that they are doing the same thing can improve the rigor of your research.</p> */}
                        </div>
                        {/* <div className='resource-link'> */}
                            <a className='resource-link' href='https://www.sciencedirect.com/topics/engineering/protocol'>
                                <div className='resource-icon'>
                                    <Image src={''}  width={34} height={34} />
                                </div>
                                <div className='resource-text'>
                                    <h1>{selectedResource?.resourceHeader}</h1>
                                    
                                    {/* <p>Consectetur adipiscing elit. Donec vestibulum mi vitae lacus hendrerit aliquam. Sed ornare auctor justo, at molestie orci pharetra sed.</p> */}
                                </div>

                            </a>
                        {/* </div> */}
                        <div className='focus-list-container'>
                            {/* <p>Validation · Interpretation · Alignment · Automation · Organization · Dissemination · Containment · Documentation</p> */}
                            {/* <p>{selectedResource.solution}</p> */}
                            {/* <p>
                                {['Validation', 'Interpretation', 'Alignment', 'Automation', 'Organization', 'Dissemination', 'Containment', 'Documentation'].map((item, index) => (
                                    <span key={index} style={{ fontWeight: item === selectedResource.solution ? 'bold' : 'normal' }}>
                                        {item}{index < 7 ? ' · ' : ''}
                                    </span>
                                ))}
                            </p> */}
                            <p>
                                {['Validation', 'Interpretation', 'Alignment', 'Automation', 'Organization', 'Dissemination', 'Containment', 'Documentation'].map((item, index) => (
                                    <span key={index} style={{ color: item === selectedResource.solution ? 'black' : 'gray' }}>
                                        {item}{index < 7 ? ' · ' : ''}
                                    </span>
                                ))}
                            </p>
                        </div>
                    </div>

                </div>
            </div>

            <button className='exit-button'>Exit Activity X</button>
            <button className='continue-button'>Continue</button>
        </div>
    );
}