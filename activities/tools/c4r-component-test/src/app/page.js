"use client";

import Image from "next/image";
import styles from "./page.module.css";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import { useState } from "react";

export default function Home() {
    // State to control the visibility of the guide modal
    const [isGuideModalVisible, setIsGuideModalVisible] = useState(false);

    // Function to close the guide modal
    const closeModal = () => {
        setIsGuideModalVisible(false);
    };

    // Function to open the guide modal
    const openModal = () => {
        setIsGuideModalVisible(true);
    };

    const buttonStyles = {
        // optional styles for overriding default styles of the button
    };

    return (
        // Full page div, useful outermost wrapper for each page
        <div className="full-page">
            {/* Popup modal component */}
            <CustomModal isOpen={isGuideModalVisible} closeModal={closeModal} />
            {/* Header component */}
            <Header onLogoClick={openModal} onHelpClick={openModal} />

            <div className="section-container">
                <h1>Custom Button Examples</h1>

                {/* Buttons */}
                <div className="button-group">
                    <CustomButton
                        onClick={() => console.log("Clear clicked")}
                        ariaLabel="Clear button"
                        disabled={false}
                        variant="grey"
                        customStyles={
                            {
                                /*buttonStyles*/
                            }
                        }
                    >
                        CLEAR
                    </CustomButton>

                    <CustomButton
                        onClick={() => console.log("Test clicked")}
                        ariaLabel="Test button"
                        disabled={false}
                        variant="purple"
                        customStyles={
                            {
                                /*buttonStyles*/
                            }
                        }
                        className=""
                    >
                        TEST
                    </CustomButton>
                </div>
            </div>
            <div className="section-container">
                <h1>Yellow Header</h1>
                <div className="yellow-header">
                    <h2>This is the yellow header text</h2>
                </div>
                <div className="yellow-header">
                    <h1>This is the yellow header text</h1>
                    <h2>This is the yellow header text</h2>
                </div>
            </div>
            <div className="section-container">
                <h1>Text input</h1>
                {/* Text input area */}
                <div className="textarea-container">
                    <textarea
                        className="styled-textarea"
                        placeholder="Enter text"
                        onChange={(e) => console.log(e.target.value)}
                    />
                </div>
            </div>
        </div>
    );
}
