"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import "@/app/styles/globals.css";
import "@/app/pages/intro/intro.css";
import Header from "@/app/components/Header/Header";

import Image from "next/image";
import boardRaven from "@/app/assets/board-raven.svg";
import boardRaven2 from "@/app/assets/board-raven-2.svg";

/*
TODO:
- Add images to the intro screen
- Make responsive for large screens
    - Conditionally render the image based on screen size
*/

export default function Intro() {
    const [introTextIndex, setIntroTextIndex] = useState(0);

    // Text for the intro screen
    const introText = [
        {
            mainText:
                "I have a Secret Rule that matches some sequences of three numbers.",
            subText: "(e.g. Each number is a multiple of 3.)",
        },
        // {
        //     mainText:
        //         "First, test sequences of three integers against my rule. I will tell you if your sequence matches.",
        //     subText: "",
        // },
        // {
        //     mainText:
        //         "When you are confident that you know the hypothesis, submit you can submit your final guess!",
        //     subText: "",
        // },
        {
            mainText:
                "Your goal is to try and deduce the number rule...But there is a catch—you can’t guess the rule directly!",
            subText: "",
        },
        {
            mainText:
                "When you are confident that you know the hypothesis, submit you can submit your final guess!",
            subText: "",
        },
    ];

    const router = useRouter();

    const openNextPage = () => {
        router.push(`/pages/input`);
    };

    const handleContinue = () => {
        if (introTextIndex < introText.length - 1) {
            setIntroTextIndex(introTextIndex + 1);
        } else {
            openNextPage();
        }
    };

    return (
        <div className="full-page">
            <div className="top-container">
                <Header />
                {/* <h1>Deduce the Number Rule</h1> */}
            </div>

            <div className="bottom-container">
                <div className="speech-bubble-container">
                    <div className="speech-bubble-body">
                        {/* Conditional rendering for main text */}
                        <p className="main-text">
                            {introText[introTextIndex].mainText}
                        </p>
                        {/* Only show subtext if it exists */}
                        {introText[introTextIndex].subText && (
                            <p className="sub-text">
                                {introText[introTextIndex].subText}
                            </p>
                        )}
                    </div>
                    <div className="speech-bubble-tail"></div>
                </div>

                {/* <div className="imagePlaceholder">Image Here</div> */}
                {/* <Image src={boardRaven} alt="Board Raven" className="board-raven"/> */}

                <div className="board-raven-outer-container">
                    <div className="board-raven-inner-container">
                        <Image src={boardRaven} priority alt="Board Raven" className="board-raven"/>
                    </div>
                </div>

                <br />
                <button
                    className="responsive-button continue-button"
                    onClick={handleContinue}
                >
                    Continue
                </button>
                <br />
            </div>
        </div>
    );
}
