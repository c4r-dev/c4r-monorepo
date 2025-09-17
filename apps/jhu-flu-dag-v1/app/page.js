"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from "next/image";

import "./startScreen/startScreen.css";

import FluRaven1 from "./assets2/flu-raven-1.svg";
import FluRaven2 from "./assets2/flu-raven-2.svg";
import FluRaven3 from "./assets2/flu-raven-3.svg";

export default function StartScreen() {
    const router = useRouter();

    const onStartActivity = () => {
        router.push("/newSession");
    };

    return (
        <div className="start-screen-container">
            <div className="start-screen">
                <div className="start-screen-header">
                    <h1>Flu Dag</h1>
                    <h2>
                        Decide strategies for certain objects in your research
                        process.
                    </h2>
                </div>
                <div className="start-screen-body">
                    <div className="start-screen-raven-container">
                        <Image
                            src={FluRaven1}
                            className="start-screen-raven-left"
                            alt="Flu Raven"
                        />
                        {/* <Image
                        src={FluRaven2}
                        className="start-screen-raven-center"
                        alt="Flu Raven"
                    /> */}
                        <Image
                            src={FluRaven3}
                            className="start-screen-raven-right"
                            alt="Flu Raven"
                        />
                    </div>
                </div>
                <div className="start-screen-footer">
                    <button onClick={onStartActivity}>Start Activity</button>
                </div>
            </div>
        </div>
    );
}

// export const dynamic = 'force-dynamic';
