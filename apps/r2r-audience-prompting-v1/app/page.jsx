"use client";

import Link from "next/link";
import Image from "next/image";
import Raven1 from "../assets/raven-group.svg";
import "./style.css";


export default function Home() {
    return (
        <>
            <div className="outer-container">
                <div className="container">
                    <div>
                        <h1>Time to hear your thoughts!</h1>
                    </div>
                    <div className="text-container">
                        <h2>
                            Click the button below to generate a link/code your
                            labmates
                        </h2>
                        <h2>
                            can use to participate in the lesson by offering
                            their own
                        </h2>
                        <h2>answers.</h2>
                    </div>
                    <div className="footer-container">
                        <Image
                            priority
                            src={Raven1}
                            alt="Follow us at c4r.io"
                            className="raven-group"
                        />
                        <Link href="/showQRCode">
                            <button className="generate-button">GENERATE LINK / CODE</button>
                        </Link>
                    </div>
                </div>
            </div>
        </>
    );
}
