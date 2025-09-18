const logger = require('../../../../packages/logging/logger.js');
"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";

import Raven1 from '../assets/raven-2.svg';
import ConfettiWhole from '../assets/confetti-whole.svg';



export default function Congratulations() {

  const router = useRouter();

    const startActivity = () => {
        router.push(`/`);
    }
    const exitActivity = () => {
        // router.push(`/`);
        logger.app.info("Exit button clicked");
    }

    return (
      <div>

            <div className="activity-header">
                <h1>Formulating a Valid Research Question</h1>
                {/* <h1>Evaluate</h1> */}
            </div>

            <div className="congratulations-body">
                <h2>You&apos;ve finished this activity</h2>

                <h1>Congratulations!</h1>
                <div className="congratulations-button-container">
                    <button onClick={startActivity} className="try-again-button">Try Again</button>
                    <button onClick={exitActivity} className="exit-activity-button">Exit Activity</button>
                </div>
            </div>          

            {/* <div className="activity-start-button-footer">
                <button onClick={startActivity}>Start Activity</button>
            </div> */}

              {/* Fixed footer Raven */}
            <div>
                <Image
                    priority
                    src={Raven1}
                alt="Follow us at c4r.io"
                className="raven-footer-1"
                />
            </div>

            <div className="confetti-whole-container">
                <Image
                    priority
                    src={ConfettiWhole}
                alt="Follow us at c4r.io"
                className="confetti-whole"
                />
            </div>
        </div>


    );
}
