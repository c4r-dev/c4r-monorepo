"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
// import HeaderWithModal from "@/app/components/HeaderWithModal/HeaderWithModal";
import Header from "@/app/components/Header/Header";
import "@/app/pages/congrats/congrats.css";

export default function Congrats() {
    return (
        <div>
            <Header title="Draw a diagram to explain the correlation" />
            <h1>Congrats</h1>
        </div>
    );
}