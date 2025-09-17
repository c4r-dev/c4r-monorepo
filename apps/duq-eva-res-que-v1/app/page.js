"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import Raven1 from './assets/raven-1-angled.svg';

import IconGroup1 from "./assets/icon-group-1.svg";
// import Raven3 from "./assets/feedback-button-3.svg";



export default function FeedBack() {
    const router = useRouter();

    const [rqtool, setRQTool] = useState("");

    const onValueChange = (event) => {
        setRQTool(event.target.value);
    };

    // const handleSubmit = async (e) => {
    //     e.preventDefault();
    //     if (!rqtool) {
    //         alert("Selection is required to Continue.");
    //         return;
    //     }
    //     // router.push(`/startRaven?rqtool=${rqtool}`);
    //     router.push(`/topicSelection?rqtool=${rqtool}`);
    // };

    const startActivity = () => {
        router.push(`/topicSelection`);
    }

    return (
      <div className="start-activity-container">

<div className="background-image-container">
                <Image
                    priority
                    src={IconGroup1}
                alt="Follow us at c4r.io"
                className="background-image"
                />
            </div>


            <div className="activity-header">
                <h1>Formulating a Valid Research Question</h1>
                <h1>Evaluate</h1>
            </div>

            <div className="activity-start-button-footer">
                <button onClick={startActivity}>Start Activity</button>
            </div>

              {/* Fixed footer Raven */}
            <div>
                <Image
                    priority
                    src={Raven1}
                alt="Follow us at c4r.io"
                className="raven-footer-0"
                />
            </div>
            {/* <div className="background-image-container">
                <Image
                    priority
                    src={IconGroup1}
                alt="Follow us at c4r.io"
                className="background-image"
                />
            </div> */}
        </div>


    );
}
