"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from 'next/navigation';
import HeaderWithModal from "@/app/components/HeaderWithModal/HeaderWithModal";
import "@/app/pages/congrats/congrats.css";

export default function Congrats() {
    return (
        <div>
            <HeaderWithModal openModalMode={true} />
            <h1>Congrats</h1>
        </div>
    );
}