import React from "react";
import Image from "next/image";
import "./header.css";
import logo from "@/app/assets/logo-sideways.svg";

const Header = ({ onLogoClick, title="Default Title" }) => {
    const handleLogoClick = () => {
        if (onLogoClick) {
            console.log("Logo clicked, calling onLogoClick");
            onLogoClick();
        } else {
            console.log("No onLogoClick function provided");
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
                    <h1 className="header-title">{title}</h1>
                </div>

                {/* <h1 className="header-exit-activity">Exit Activity X</h1> */}
            </div>
            <div className="title-bar">
                <h1 className="header-title">{title}</h1>
            </div>
        </header>
    );
};

export default Header;
