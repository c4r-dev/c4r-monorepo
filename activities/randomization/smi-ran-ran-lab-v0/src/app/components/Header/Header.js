"use client";
import React from "react";
import Image from "next/image";
import "./header.css";
import helpTooltip from "./help-tooltip-fix.svg";
import ravenImage from "./01_RR_Large.png";

// Reusable C4R Activity Header component
// Pass in onLogoClick and onHelpClick functions to handle logo and help button clicks

const Header = ({ onLogoClick, onHelpClick }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            // console.log("Logo clicked, calling onLogoClick");
            onLogoClick();
        } else {
            // console.log("No onLogoClick function provided");
        }
    };

    const handleHelpClick = () => {
        if (onHelpClick) {
            // console.log("Help clicked, calling onHelpClick");
            onHelpClick();
        } else {
            // console.log("No onHelpClick function provided");
        }
    };

    return (
        <header className="header-container">
            <div className="header-bar">
                <div className="logo-desktop">
                    <Image
                        src={ravenImage}
                        alt="Logo"
                        className="logo clickable-logo"
                        onClick={handleLogoClick}
                    />
                    <h1 className="header-title">Randomization in the Lab</h1>
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
