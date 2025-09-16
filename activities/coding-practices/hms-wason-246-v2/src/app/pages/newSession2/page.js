"use client";

import Header from "@/app/components/Header/Header";
// import HeaderWithModal from "@/app/components/HeaderWithModal/HeaderWithModal";

import "./newSession.css";

export default function NewSession() {
    return (
        <div>
            <Header />

            <div>

                {/* Vertical flex div */}
                <div className="new-session-panel">
                    <div className="new-session-options-row">
                        <div className="qr-code-container">QR CODE HERE</div>
                        <h2>OR</h2>
                        <div className="copy-link-container">
                            <div className="copy-link-text">c4r.io/1234567890</div>
                            <button className="copy-link-button">Copy Link</button>
                        </div>
                    </div>
                    <button className="new-session-button">Start Activity</button>
                </div>
            </div>
        </div>
    );
}
