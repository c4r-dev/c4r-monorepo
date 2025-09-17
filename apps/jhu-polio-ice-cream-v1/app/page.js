"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import "./startScreen/startScreen.css";

import IntroIcons from "./assets2/intro-icons.svg";

// import FluRaven1 from "./assets2/flu-raven-1.svg";
// import FluRaven2 from "./assets2/flu-raven-2.svg";
// import FluRaven3 from "./assets2/flu-raven-3.svg";

export default function StartScreen() {
    const router = useRouter();

    const onStartActivity = () => {
        router.push("/newSession");
    };

    return (
        <div className="start-screen-container">
            <div className="start-screen">
                <div className="start-screen-header">
                    <h1>Why did kids in the 1920s who ate ice cream get polio?</h1>
                    <h2>Let&quot;s explore this question using a tool called a DAG.</h2>
                </div>
                <div className="start-screen-body">
                    <div className="start-screen-icons-container">
                        <Image
                            src={IntroIcons}
                            className="start-screen-icons"
                            alt="Intro Icons"
                        />
                        {/* <Image
                            src={FluRaven1}
                            className="start-screen-raven-left"
                            alt="Flu Raven"
                        /> */}
                        {/* <Image
                        src={FluRaven2}
                        className="start-screen-raven-center"
                        alt="Flu Raven"
                    /> */}
                        {/* <Image
                            src={FluRaven3}
                            className="start-screen-raven-right"
                            alt="Flu Raven"
                        /> */}
                    </div>
                </div>
                <div className="start-screen-footer">
                    <button className="start-screen-button" onClick={onStartActivity}>Start Activity</button>
                </div>
            </div>
        </div>
    );
}

// export const dynamic = 'force-dynamic';
