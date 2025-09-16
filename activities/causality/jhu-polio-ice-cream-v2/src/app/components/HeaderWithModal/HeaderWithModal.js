"use client";

import React, { useState } from "react";
import Image from "next/image";
// import "./headerWithModal.css";
import styles from "./headerWithModal.module.css";
import logo from "@/app/assets/logo-sideways.svg";

import CustomModal from "@/app/components/CustomModal/CustomModal";

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
            console.log("Logo clicked, calling onLogoClick");
            onLogoClick();
            if (openModalMode) {
                openModal();
            }
        } else {
            console.log("No onLogoClick function provided");
            if (openModalMode) {
                openModal();
            }
        }
    };

    return (
        <div>

            <CustomModal isOpen={isModalVisible} closeModal={closeModal} />

            <header className={styles.headerContainer}>
                <div className={styles.headerBar}>
                    <Image
                        src={logo}
                        alt="Logo"
                        className={`${styles.logo} ${styles.logoMobile} ${styles.clickableLogo}`}
                        onClick={handleLogoClick}
                        cursor="pointer"
                    />

                    <div className={styles.logoDesktop}>
                        <Image
                            src={logo}
                            alt="Logo"
                            className={`${styles.logo} ${styles.clickableLogo}`}
                            onClick={handleLogoClick}
                            cursor="pointer"
                        />
                        <h1 className={styles.headerTitle}>Test sequences to guess a rule!</h1>
                    </div>

                    {/* <h1 className={styles.headerExitActivity}>Exit Activity X</h1> */}
                </div>
                <div className={styles.titleBar}>
                    <h1 className={styles.headerTitle}>Test sequences to guess a rule!</h1>
                </div>
            </header>

        </div>

    );
};

export default HeaderWithModal;
