"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQRCode } from "next-qrcode";
// import { usePathname } from 'next/navigation'

import Image from "next/image";

// import './startScreen.css';
import "./newSession.css";

// import Raven1 from '../assets/feedback-button-1.svg';

import Header from "@/app/components/Header/Header";

const QRCode = ({ url }) => {
    const { SVG } = useQRCode();

    return (
        <SVG
            text={url}
            options={{
                margin: 2,
                width: 200,
                color: {
                    dark: "#000000FF",
                    light: "#FFFFFFFF",
                },
            }}
        />
    );
};

// export default function ResQuesThree() {
export default function NewSession() {
    const router = useRouter();

    const onStartActivity = () => {
        router.push(`/?sessionID=${sessionID}`);
    };

    const { SVG } = useQRCode();

    // const QRCode = (url) => {
    //     return (
    //         <SVG
    //             text={url}
    //             options={{
    //                 margin: 2,
    //                 width: 200,
    //                 color: {
    //                     dark: "#000000FF",
    //                     light: "#FFFFFFFF",
    //                 },
    //             }}
    //         />
    //     );
    // };

    const productionBaseURL = "https://hms-wason-246-v2.vercel.app";
    const developmentBaseURL = "http://localhost:3000";
    const isDev = false;
    let baseURL = isDev ? developmentBaseURL : productionBaseURL;

    // Generate new lab group ID
    const sessionID = Math.random().toString(36).substring(2, 15);
    // let labGroupId = "1234567890";
    // Create the full URL
    const fullURL = `${baseURL}/?sessionID=${sessionID}`;

    return (
        <div className="new-session-container">
            <div className="new-session">
                <Header />
                {/* <div className="new-session-header">
                    <h1>Polio Ice Cream</h1>
                    <h2>
                        Decide strategies for certain objects in your research
                        process.
                    </h2>
                </div> */}

                <div className="new-session-body-footer-container">
                    <div className="new-session-body">
                        <div className="new-session-body-qr-code">
                            <QRCode url={fullURL} />
                        </div>
                        <div className="or-container">
                            <h3>OR</h3>
                        </div>
                        <div className="link-container">
                            {/* <p>{fullURL}</p> */}
                            <a href={fullURL}>{fullURL}</a>
                            <button
                                className="copy-link-button"
                                onClick={() =>
                                    navigator.clipboard.writeText(fullURL)
                                }
                            >
                                Copy Link
                            </button>
                        </div>
                    </div>
                    <div className="new-session-footer">
                        <button
                            className="dark-button"
                            onClick={onStartActivity}
                        >
                            Start Activity
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// export const dynamic = 'force-dynamic';
