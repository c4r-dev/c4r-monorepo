const logger = require('../../../../../../packages/logging/logger.js');
"use client";

import React, { useState } from "react";
import Image from "next/image";
import "./headerWithModal.css";
import logo from "@/app/assets/logo-sideways.svg";

import CustomModal from "@/app/components/CustomModal/CustomModal";
import ravenImage from "./01_RR_Large.png";

const HeaderWithModal = ({ onLogoClick, openModalMode, initalModalVisibility=false }) => {

    // Default visibility of the modal is false
    const [isModalVisible, setIsModalVisible] = useState(initalModalVisibility);

    const closeModal = () => {
        setIsModalVisible(false);
    };
    const openModal = () => {
        setIsModalVisible(true);
    };


    const handleLogoClick = () => {
        if (onLogoClick) {
            logger.app.info("Logo clicked, calling onLogoClick");
            onLogoClick();
            if (openModalMode) {
                openModal();
            }
        } else {
            logger.app.info("No onLogoClick function provided");
            if (openModalMode) {
                openModal();
            }
        }
    };

    return (
        <div>

            <CustomModal isOpen={isModalVisible} closeModal={closeModal} />

            <header className="header-container">
                <div className="header-bar">
                    <Image
                        src={ravenImage}
                        alt="Logo"
                        className="logo logo-mobile clickable-logo"
                        onClick={handleLogoClick}
                        cursor="pointer" // indicates clickable
                    />

                    <div className="logo-desktop">
                        <Image
                            src={ravenImage}
                            alt="Logo"
                            className="logo clickable-logo"
                            onClick={handleLogoClick}
                            cursor="pointer" // indicates clickable
                        />
                        <h1 className="header-title">Test sequences to guess a rule!</h1>
                    </div>

                    {/* <h1 className="header-exit-activity">Exit Activity X</h1> */}
                </div>
                <div className="title-bar">
                    <h1 className="header-title">Test sequences to guess a rule!</h1>
                </div>
            </header>

        </div>

    );
};

export default HeaderWithModal;
