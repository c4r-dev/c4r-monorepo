const logger = require('../../../../../packages/logging/logger.js');
import React, {useState} from "react";
import Image from "next/image";
import "./header.css";
// import logo from "../../../public/logo-sideways.svg";
import logo from "../../../public/01_RR_Large.png";

import helpTooltip from "../../../public/help-tooltip-fix.svg";
import CustomModal from '../CustomModal'



const Header = ({ onLogoClick, onHelpClick, text="Develop an alternative hypothesis" }) => {
     const [isGuideModalVisible, setIsGuideModalVisible] = useState(false)
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

    const closeModal = () => {
        setIsGuideModalVisible(false)
      }
    
      const openModal = () => {
        setIsGuideModalVisible(true)
      }
    
      const handleGuideBtn = () => {
        logger.app.info('Guide button clicked')
        openModal(true)
      }



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
                    <button className="header-guide-button" onClick={handleHelpClick}>
                        {/* SVG here */}
                        {/* <img src={helpTooltip} alt="Guide" className="help-tooltip-image" /> */}
                        <Image src={helpTooltip}  alt="Guide" className="help-tooltip-image"      onClick={handleGuideBtn}
 />
                    </button>
                </div>
            </div>
            <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />

        </header>
    );
};

export default Header;