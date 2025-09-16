"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";

import Image from "next/image";
import PartyRavens from "@/assets/party-ravens.svg";
import Raven1 from "@/assets/feedback-button-text-1.svg";
import Raven2 from "@/assets/feedback-button-text-2.svg";
import Raven3 from "@/assets/feedback-button-text-3.svg";

import localFont from "next/font/local";
// const myFont = localFont({ src: "./GeneralSans-Semibold.ttf" });


import FeedbackTool from "./components/FeedbackTool";

export default function FeedBack() {
    return (
        <FeedbackTool />
    );
}
