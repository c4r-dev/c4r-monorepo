"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQRCode } from "next-qrcode";
// import { usePathname } from 'next/navigation'

import Image from "next/image";

// import './startScreen.css';
import "./newSession.css";

// import Raven1 from '../assets/feedback-button-1.svg';


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
        router.push(`/intro/?labGroupId=${labGroupId}`);
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


    const productionBaseURL = "https://jhu-flu-dag-v1.vercel.app";
    const developmentBaseURL = "http://localhost:3000";
    const isDev = false;
    let baseURL = isDev ? developmentBaseURL : productionBaseURL;

    // Generate new lab group ID
    const labGroupId = Math.random().toString(36).substring(2, 15);
    // let labGroupId = "1234567890";
    // Create the full URL
    const fullURL = `${baseURL}/?labGroupId=${labGroupId}`;

    return (
        <div className="new-session-container">
            <div className="new-session">
                <div className="new-session-header">
                    <h1>Flu Dag</h1>
                    <h2>
                        Decide strategies for certain objects in your research
                        process.
                    </h2>
                </div>

            <div className="new-session-body-footer-container">
                <div className="new-session-body">
                    {/* <div className="new-session-body-header">
                <h2>New Session</h2>
                <p>Create a new session to start a new activity.</p>
            </div> */}

                    <div className="new-session-body-qr-code">
                        <QRCode url={fullURL} />
                    </div>
                    <div className="or-container">
                        <h3>OR</h3>
                    </div>
                    <div className="link-container">
                        {/* <p>{fullURL}</p> */}
                        <a href={fullURL}>{fullURL}</a>
                        <button className="copy-link-button" onClick={() => navigator.clipboard.writeText(fullURL)}>Copy Link</button>
                    </div>
                </div>
                <div className="new-session-footer">
                    <button className="dark-button" onClick={onStartActivity}>Start Activity</button>
                    </div>
                </div>
            </div>
        </div>
    );
}

// export const dynamic = 'force-dynamic';
