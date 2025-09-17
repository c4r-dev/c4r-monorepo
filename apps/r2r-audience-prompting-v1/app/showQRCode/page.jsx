"use client";

import React from "react";
import { useQRCode } from "next-qrcode";
import Link from "next/link";
import Image from "next/image";
// import Raven1 from "./raven-icon-1.svg";

import "../style.css";

export default function showQRCode() {

  const copyLink = () => {
    navigator.clipboard.writeText("https://r2r-audience-prompting-v1.vercel.app/studentInput");
    alert("Copied to clipboard");
}

    function UseQRCode() {
        const { SVG } = useQRCode();
        return (
            <SVG
                text={
                    "https://r2r-audience-prompting-v1.vercel.app/studentInput"
                }
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
    }

    return (
        <div className="outer-container">
            <div className="container qr-code-page">
                <div className="header-container">
                    <h1>Time to hear your thoughts!</h1>
                </div>
                <div>
                    {/* <Image priority src={Raven1} alt="Follow us at c4r.io" /> */}
                </div>
                <br></br>
                <div className="link-container">
                    <div className="qr-code-container">
                        {UseQRCode()}
                      {/* <a target="_blank" href="/studentInput">
                          Go to App
                      </a> */}
                    </div>
                    <div className="or-container">
                        <h1>OR</h1>
                    </div>
                    <div className="copy-link-container">
                      <div className="copy-link-box">
                        <a target="_blank" href="/studentInput">
                          https://r2r-audience-prompting-v1.vercel.app/studentInput
                      </a>
                          {/* <p>https://r2r-audience-prompting-v1.vercel.app/studentInput</p> */}
                      </div>
                        <button className="copy-link-button" onClick={copyLink}>Copy Link</button>
                    </div>
                </div>

                <br></br>
                <div className="button-row">
                    <Link href="/">
                        <button className="cancel-button">Cancel</button>
                    </Link>
                    <Link href="/discussion">
                        <button>Continue</button>
                    </Link>
                </div>
            </div>
      </div>
    );
}
