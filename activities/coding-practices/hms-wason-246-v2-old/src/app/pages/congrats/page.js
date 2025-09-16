"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import Header from "@/app/components/header";
import "@/app/pages/congrats/congrats.css";

export default function Congrats() {
    return (
        <div>
            <Header />
            <h1>Congrats</h1>
        </div>
    );
}