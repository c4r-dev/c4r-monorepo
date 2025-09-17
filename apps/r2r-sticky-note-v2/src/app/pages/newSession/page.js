"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useQRCode } from "next-qrcode";
import { getBasePath } from "@/app/utils/basePath";

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

export function NewSessionContent() {
    const router = useRouter();

    // URL param fetching
    const searchParams = useSearchParams();
    // const userID = searchParams.get("userID");
    const sessionIDParam = searchParams.get("sessionID");
    const randomSessionID = Math.random().toString(36).substring(2, 15);
    // If sessionIDParam is not provided, use a random sessionID
    const sessionID = sessionIDParam ? sessionIDParam : randomSessionID;

    // If sessionID is not in the URL, refresh the page with a randomly generated sessionID
    useEffect(() => {
        if (!sessionIDParam) {
            const base = getBasePath();
            router.push(`${base}/pages/newSession?sessionID=${randomSessionID}`);
        }
    }, [sessionIDParam]);

    // URL construction
    // Build a local base URL using the current origin + activity base path
    const origin = typeof window !== 'undefined' ? window.location.origin : '';
    const activityBase = getBasePath();
    const baseURL = `${origin}${activityBase}/pages/input`;
    const fullURL = `${baseURL}/?sessionID=${sessionID}`;


    // On Start button handler
    const onStartActivity = () => {
        console.log("Starting activity");
        router.push(fullURL);
    };
    const onSkipToResults = () => {
        console.log("Skipping to results");
        const base = getBasePath();
        router.push(`${base}/pages/review?sessionID=${sessionID}`);
    };

    return (
        <div className="new-session-container">
            <div className="new-session">
                <Header title=" " />

                <div className="page-container">


                    <div className="instructions-container">
                        <h1>JOIN THE WHITEBOARD EXERCISE</h1>
                        <h1>FOR A GROUP EXPERIENCE!</h1>
                    </div>

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
                                onClick={onSkipToResults}
                            >
                                SKIP TO RESULTS
                            </button>
                            <button
                                className="dark-button"
                                onClick={onStartActivity}
                            >
                                OPEN WHITEBOARD
                            </button>
                        </div>
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
