import React from "react";
import Image from "next/image";
import "./header.css";
// import logo from "@/public/logo-sideways.svg";
import logo from "@/public/01_RR_Large.png";


const Header = ({ onLogoClick, text="Pick the most biased choice!" }) => {
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
                    <h1 className="header-title">  {text} </h1>
                </div>
            </div>
         
        </header>
    );
};

export default Header;