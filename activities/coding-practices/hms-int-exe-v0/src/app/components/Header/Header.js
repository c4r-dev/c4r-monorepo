const logger = require('../../../../../../../packages/logging/logger.js');
import React from "react";
import Image from "next/image";
import "./Header.css";


const Header = ({ onLogoClick, onHelpClick, text="Integration Exercise" }) => {
    const handleLogoClick = () => {
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
                    src="/01_RR_Large.png"
                    alt="Logo"
                    className="logo logo-mobile clickable-logo"
                    onClick={handleLogoClick}
                    width={36}
                    height={36}
                />

                <div className="logo-desktop">
                    <Image
                        src="/01_RR_Large.png"
                        alt="Logo"
                        className="logo clickable-logo"
                        onClick={handleLogoClick}
                        width={36}
                        height={36}
                    />
                    <h1 className="header-title">  {text} </h1>
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src="/help-tooltip-fix.svg" alt="Guide" className="help-tooltip-image" width={32} height={32} />
                    </button>
                </div>
            </div>
         
        </header>
    );
};

export default Header;