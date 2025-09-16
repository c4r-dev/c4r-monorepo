"use client";

import React, { useState, useEffect } from "react";

import Link from "next/link";
import Image from "next/image";
import Raven1 from "./raven-icon-1.svg";
import Raven2 from "./raven-icon-2.svg";
import Raven3 from "./raven-icon-3.svg";

import "../style.css";

export default function Discussion() {
    const [timeLeft, setTimeLeft] = useState(30);
    const [imageOpacity, setImageOpacity] = useState([1, 0.5, 0.5]);

    useEffect(() => {
        if (timeLeft <= 0) {
            return;
        }
        const timer = setTimeout(() => {
            if (timeLeft > 20) {
                setImageOpacity([1, 0.5, 0.5]);
            } else if (timeLeft > 10) {
                setImageOpacity([0.5, 1, 0.5]);
            } else if (timeLeft > 0) {
                setImageOpacity([0.5, 0.5, 1]);
            }
            setTimeLeft(timeLeft - 1);
        }, 1000);
        return () => clearTimeout(timer);
    }, [timeLeft]);

    const extendTimer = () => {
        setTimeLeft(timeLeft + 30);
    };
    const endTimer = () => {
        setTimeLeft(0);
    };

    return (
        <div className="outer-container">
            <div className="container discussion-page">
                <div className="header-container">
                    <h2>
                        What surprised you about the difference between your
                    </h2>
                    <h2>guesses and the Baker findings?</h2>
                </div>

                <div className="discussion-timer">
                    {/* Row of 3 images */}
                    <div className="discussion-timer-row">
                        <Image
                            priority
                            src={Raven1}
                            alt="Follow us at c4r.io"
                            id="loading-image-1"
                            style={{ opacity: imageOpacity[0] }}
                        />
                        <Image
                            priority
                            src={Raven2}
                            alt="Follow us at c4r.io"
                            id="loading-image-2"
                            style={{ opacity: imageOpacity[1] }}
                        />
                        <Image
                            priority
                            src={Raven3}
                            alt="Follow us at c4r.io"
                            id="loading-image-3"
                            style={{ opacity: imageOpacity[2] }}
                        />
                    </div>

                    <div className="loading-area">
                        {/* <div className="loading-bar" style={{ width: `${(30 - timeLeft) * 100 / 30}%` }}></div> */}

                        {timeLeft > 0 && <h2>{timeLeft} sec left</h2>}
                        {timeLeft <= 0 && <h2>Time is up!</h2>}
                    </div>
                </div>

                <div>
                    {timeLeft > 0 && (
                        <button onClick={endTimer}>End Timer</button>
                    )}
                    {/* if timeLeft > 0 */}
                    {timeLeft <= 0 && (
                        <>
                            <button onClick={extendTimer}>
                                EXTEND (+ 30 SEC)
                            </button>
                            <Link href="/answers">
                                <button>SHOW ANSWERS</button>
                            </Link>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}
