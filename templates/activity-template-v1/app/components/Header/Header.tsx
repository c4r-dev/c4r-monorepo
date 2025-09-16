"use client";
import React from "react";
import Image from "next/image";
import "./header.css";
import helpTooltip from "./help-tooltip-fix.svg";
import ravenImage from "./raven-icon.png";

// Reusable C4R Activity Header component
// Pass in onLogoClick and onHelpClick functions to handle logo and help button clicks

interface HeaderProps {
    Title?: string;
    onLogoClick?: () => void;
    onHelpClick?: () => void;
}

const Header: React.FC<HeaderProps> = ({ Title = "C4R Activity Title", onLogoClick, onHelpClick }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            // Implement logo click functionality here
            onLogoClick();
        } else {
            // console.log("No onLogoClick function provided");
        }
    };

    const handleHelpClick = () => {
        if (onHelpClick) {
            // Implement help click functionality here
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
                    <h1 className="header-title">{Title}</h1>
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
