import React from "react";
import Image from "next/image";
import "./header.css";
import logo from "../assets/logo.png";
import helpTooltip from "../assets/help.svg";

const Header = ({ onLogoClick, onHelpClick, text="Pick the most biased choice!" }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            onLogoClick();
        }
    };

    const handleHelpClick = () => {
        if (onHelpClick) {
            onHelpClick();
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
                    <h1 className="header-title">{text}</h1>
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        <Image src={helpTooltip} alt="Guide" className="help-tooltip-image" />
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
