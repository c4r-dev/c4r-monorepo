"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQRCode } from "next-qrcode";

import "./newSession.css";

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
export function NewSessionContent() {
    const router = useRouter();

    // URL param fetching
    const searchParams = useSearchParams();
    const userID = searchParams.get("userID");
    const sessionID = searchParams.get("sessionID");
    const researchQuestion = searchParams.get("researchQuestion");
    const questionNumber = searchParams.get("questionNumber");

    // URL construction
    const productionBaseURL = "https://duq-finer-v1.vercel.app/pages/finer1";
    const developmentBaseURL = "http://localhost:3000/pages/finer1";
    const isDev = false;
    let baseURL = isDev ? developmentBaseURL : productionBaseURL;
    const fullURL = `${baseURL}/?sessionID=${sessionID}&userID=${userID}&researchQuestion=${researchQuestion}&questionNumber=${questionNumber}`;

    // On Start button handler
    const onStartActivity = () => {
        router.push(fullURL);
    };

    return (
        <div className="new-session-container">
            <div className="new-session">
                <Header />

                <div className="new-session-body-footer-container">
                    <div className="new-session-body">
                        <div className="new-session-body-qr-code">
                            <QRCode url={fullURL} />
                        </div>
                        <div className="or-container">
                            <h3>OR</h3>
                        </div>
                        <div className="link-container">
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

export default function NewSession() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <NewSessionContent />
        </Suspense>
    );
}
