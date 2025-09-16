'use client';

import { useState } from 'react';

/*
Visual description:
Two side by side selectable rectangles with the text "Yes" and "No"
The selected rectangle is slightly larger with a shadow
On click, the selected rectange calls setShowAllSessions(true or false)

To the right, the text "Show All Sessions"

*/


export default function AllSessionsToggle( {showAllSessions, setShowAllSessions} ) {
    return (
        <div className="sessions-toggle-container" style={{ display: 'flex', alignItems: 'center' }}>
            <div className="sessions-toggle-buttons">
                <button
                    // Style the left border radius
                    style={{ borderTopLeftRadius: '10px', borderBottomLeftRadius: '5px' }}
                    onClick={() => setShowAllSessions(true)}
                    className={`session-toggle ${showAllSessions ? 'session-toggle-selected' : 'session-toggle-unselected'}`}
                >
                    Yes
                </button>
                <button
                    // Style the right border radius
                    style={{ borderTopRightRadius: '10px', borderBottomRightRadius: '5px' }}
                    onClick={() => setShowAllSessions(false)}
                    className={`session-toggle ${showAllSessions ? 'session-toggle-unselected' : 'session-toggle-selected'}`}
                >
                    No
                </button>
            </div>
            <div>Show All Sessions</div>
        </div>
    );
}