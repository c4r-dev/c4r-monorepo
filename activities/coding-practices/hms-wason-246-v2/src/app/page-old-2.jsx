"use client";

import React, { useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "@/app/styles/globals.css";
import "@/app/pages/intro/intro.css";
import Header from "@/app/components/Header";

import Image from "next/image";
// import boardRaven from "@/app/assets/board-raven.svg";
// import boardRaven2 from "@/app/assets/board-raven-2.svg";
import boardRaven3 from "@/app/assets/board-raven-3.svg";

/*
TODO:
- Add images to the intro screen
- Make responsive for large screens
    - Conditionally render the image based on screen size
*/

const IntroContent = () => {
    const [introTextIndex, setIntroTextIndex] = useState(0);

    const searchParams = useSearchParams();
    const ruleID = searchParams.get("ruleID");
    console.log("ruleID:", ruleID);

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
              "Your goal is to try and deduce the number rule...",
          mainText2:
              "But there is a catch—you can’t guess the rule directly!",
          subText: "",
      },
      {
        mainText:
            "Instead, you must input number sequences.",
        mainText2:
            "I will then tell you if your sequence matches my rule or not.",
        subText: "",
    },
    {
      mainText:
          "After you have tried enough number sequences to be confident that you know the number rule, you can submit your guess for the rule and see if you were correct!",
      subText: "",
  },
    ];

    const router = useRouter();

    const openNextPage = () => {
        if (ruleID) {
            router.push(`/pages/input?ruleID=${ruleID}`);
        } else {
            router.push(`/pages/input`);
        }
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
                        {introText[introTextIndex].mainText2 && (
                            <p className="main-text">
                                {introText[introTextIndex].mainText2}
                            </p>
                        )}

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

                {/* <div className="board-raven-outer-container">
                    <div className="board-raven-inner-container">
                        <Image src={boardRaven3} priority alt="Board Raven" className="board-raven"/>
                    </div>
                </div> */}
                {/* <div className="board-raven-outer-container"> */}
                    <div className="board-raven-image-container">
                        <Image src={boardRaven3} priority alt="Board Raven" className="board-raven-image"/>
                    </div>
                {/* </div> */}

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


export default function Intro() {

    return (
        <Suspense fallback={
            <div className="full-page">
                <h2>
                    Loading...
                </h2>
            </div>
        }>
            {/* Actual content */}
            <IntroContent />
        </Suspense>
    );
}
