"use client";

const logger = require('../../../../../packages/logging/logger.js');

import React from "react";
import Image from "next/image";
import "./header.css";
import helpTooltip from "./help-tooltip-fix.svg";
import ravenImage from "./raven-icon.png";

// Reusable C4R Activity Header component
// Pass in onLogoClick and onHelpClick functions to handle logo and help button clicks

/**
 * @typedef {Object} HeaderProps
 * @property {*} Title?
 * @property {*} onLogoClick?
 * @property {*} onHelpClick?
 */

const Header= ({ Title = "C4R Activity Title", onLogoClick, onHelpClick }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            // Implement logo click functionality here
            onLogoClick();
        } else {
            // logger.app.info("No onLogoClick function provided");
        }
    };

    const handleHelpClick = () => {
        if (onHelpClick) {
            // Implement help click functionality here
            onHelpClick();
        } else {
            // logger.app.info("No onHelpClick function provided");
        }
    };

    return (

                    {Title}

    );
};

export default Header;