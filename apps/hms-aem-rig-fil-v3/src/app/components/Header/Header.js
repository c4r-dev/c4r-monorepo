import React from "react";
import Image from "next/image";
import "./header.css";
// import logo from "/logo-sideways.svg";
import logo from "./logo-sideways.svg";
import helpTooltip from "./help-tooltip-fix.svg";


const Header = ({ onLogoClick, onHelpClick }) => {
    const handleLogoClick = () => {
const logger = require('../../../../../../packages/logging/logger.js');

        if (onLogoClick) {
            logger.app.info("Logo clicked, calling onLogoClick");
            onLogoClick();
        } else {
            logger.app.info("No onLogoClick function provided");
        }
    };

    const handleHelpClick = () => {
        if (onHelpClick) {
            logger.app.info("Help clicked, calling onHelpClick");
            onHelpClick();
        } else {
            logger.app.info("No onHelpClick function provided");
        }
    };

    return (
        <header className="header-container">
            <div className="header-bar">
                <Image
                    src={logo}
                    alt="Logo"
                    className="logo logo-mobile clickable-logo"
                    onClick={handleLogoClick}
                />

                <div className="logo-desktop">
                    <Image
                        src={logo}
                        alt="Logo"
                        className="logo clickable-logo"
                        onClick={handleLogoClick}
                    />
                    <h1 className="header-title">How might the mask fail?</h1>
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
                </div>
            </div>
            <div className="title-bar">
                <h1 className="header-title">How might the mask fail?</h1>
                <button className="header-guide-button-mobile" onClick={handleHelpClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
            </div>
        </header>
    );
};

export default Header;
