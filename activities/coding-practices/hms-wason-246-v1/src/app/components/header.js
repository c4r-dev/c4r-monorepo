import React from "react";
import Image from "next/image";
import "./header.css";
import logo from "../assets/logo-sideways.svg";

const Header = () => {
    return (
        <header className="header-container">
            <div className="header-bar">

                <Image src={logo} alt="Logo" className="logo logo-mobile" />

                <div className="logo-desktop">
                    <Image src={logo} alt="Logo" className="logo" />
                    <h1 className="header-title">Deduce the Number Rule</h1>                    
                </div>

                {/* <h1 className="header-exit-activity">Exit Activity X</h1> */}
            </div>
            <div className="title-bar">
                <h1 className="header-title">Deduce the Number Rule</h1>
            </div>
        </header>
    );
};

export default Header;
