const logger = require('../../../../../../packages/logging/logger.js');
import React from "react";
import Image from "next/image";
import "./header.css";
import logo from "@/app/assets/logo-sideways.svg";
import helpTooltip from "@/app/assets/help-tooltip-fix.svg";
import ravenImage from "./01_RR_Large.png";


const Header = ({ onLogoClick }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            logger.app.info("Logo clicked, calling onLogoClick");
            onLogoClick();
        } else {
            logger.app.info("No onLogoClick function provided");
        }
    };

    return (
        <header className="header-container">
            <div className="header-bar">
                <Image
                    src={ravenImage}
                    alt="Logo"
                    className="logo logo-mobile clickable-logo"
                    onClick={handleLogoClick}
                />

                <div className="logo-desktop">
                    <Image
                        src={ravenImage}
                        alt="Logo"
                        className="logo clickable-logo"
                        onClick={handleLogoClick}
                    />
                    <h1 className="header-title">Deduce the number rule.</h1>
                    <button className="header-guide-button" onClick={onLogoClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
                </div>
            </div>
            <div className="title-bar">
                <h1 className="header-title">Deduce the number rule.</h1>
                <button className="header-guide-button-mobile" onClick={onLogoClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
            </div>
        </header>
    );
};

export default Header;
