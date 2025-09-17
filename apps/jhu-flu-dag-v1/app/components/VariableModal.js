'use client'
/*
React component for the variable modal

This component is a pop-up modal that appears in the center of the screen.
It contains a form for adding a new variable to the DAG.

Visually, it is comprised of 3 rows.
There is a top row that says "Name your variable" on the left side, and a close button labeled "X" on the right side.
Below there is a text input for the variable name, with placeholder text "Variable Name..."
Below that, there is a button labeled "Add Variable", on the right side.

Functionally, it is a modal that is displayed when the user clicks the "Add Variable" button in the DagUtility component.
It should receive props for:
- The function to be called when the user clicks the "Add Variable" button
- The function to be called when the user clicks the close button
*/

import React, { useEffect } from 'react';
import './variableModal.css';

function VariableModal({ addVariableFromModal, onClose }) {

 const handleAddVariable = () => {
    const variableName = document.querySelector('input[type="text"]').value;
    addVariableFromModal(variableName);
 }

// On mount, focus the input
useEffect(() => {
    document.querySelector('input[type="text"]').focus();
}, []);

  return (
    <div className="variable-modal-full-screen" >
        <div className="variable-modal-container" >
            <div className="variable-modal-header" >
                <h1>Name your variable</h1>
                <button className="variable-modal-close-button" onClick={onClose}>X</button>
            </div>
            <input type="text" placeholder="Variable Name..." />
            <div className="variable-modal-footer">
                <button onClick={handleAddVariable}>Add Variable</button>
            </div>
        </div>        
    </div>
  );
}

export default VariableModal;