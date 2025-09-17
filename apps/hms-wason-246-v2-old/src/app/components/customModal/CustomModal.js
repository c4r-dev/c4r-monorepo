
/*

CustomModal.js

- This component is a wrapper for the Modal component from MUI
- It is used to display a modal dialog

*/

import React from "react";
import Modal from "@mui/material/Modal";

export default function CustomModal({ open, onClose, children }) {
    return (
        <Modal open={open} onClose={onClose}>
            {children}
        </Modal>
    );
}
