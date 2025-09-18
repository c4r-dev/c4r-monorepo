const logger = require('../../../../packages/logging/logger.js');
'use client'

import { useState } from 'react';
import noteIcon from '../assets/note.svg';
import Image from 'next/image';

/*
This component is passed a list of strings, noteText, and a function, selectNote.

It displays a list of divs, each containing a string from noteText, and a button.
The button is passed a function, selectNote, that will be called when the button is clicked.
*/

export default function NoteList( {selectedNote, setSelectedNote, noteText} ) {
    // const [selectedNote, setSelectedNote] = useState(null);

    logger.app.info(noteText);

    // Set noteText with: Missed Mistakes, Reporting Results, Designing Experiments
    // const noteText = ['Missed Mistakes', 'Reporting Results', 'Designing Experiments'];

    const selectNote = (note) => {
        setSelectedNote(note);
    }

    return (

        <div className='note-list-container'>
            
            {/* Render a vertical double-sided arrow to the left of the list */}
            {/* spaced at top and bottom */}
            <div className='arrow-text-container' >
                <div className='arrow-text'>High Interest <br></br> High Impact</div>
                <div className='arrow-text'>Low Interest <br></br> Low Impact</div>
            </div>


            {/* Render a vertical double-sided arrow to the left of the list */}
            <div className='arrow-container'>
                    <div className='arrow-up'></div>
                    <div className='line'></div>
                    <div className='arrow-down'></div>
            </div>

            {/* Render a vertical list of note icons, with the text of each note to the right of it 
            Each item on the list is selectable by mouse hover or click, call selectNote with the text of the note */}
            <div className='note-list'>
                {noteText.map((note, index) => (
                    <div 
                        key={index} 
                        onClick={() => selectNote(note)}  
                        onMouseEnter={() => setSelectedNote(note)}
                        // onMouseLeave={() => setSelectedNote(null)}
                        className={`note-list-item ${note === selectedNote ? 'selected-note' : ''}`}
                    >
                        <Image
                            src={noteIcon}
                            alt="Note Icon"
                            objectFit="cover"
                            style={{
                                width: '50px',
                                height: '50px'
                            }}
                        />
                        <div className='note-text'>{note}</div>
                    </div>
                ))}
            </div>
        </div>
    )
}