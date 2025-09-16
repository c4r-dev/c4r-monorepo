"use client";
import React, { useState, useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Header from "@/app/components/Header/Header";
import CustomModal from "@/app/components/CustomModal/CustomModal";
import CustomButton from "@/app/components/CustomButton/CustomButton";
import { Alert } from "@mui/material";
import { Snackbar } from "@mui/material";

import "./page.css";

/*
Init Page:
- Redirects user to the newSession page in pages folder
*/

export function InitPage() {
    const router = useRouter();

    // Upon load, redirect user to the newSession page
    useEffect(() => {
        router.push(`/pages/newSession`);
    }, []);

    return (
        <div className="full-page">
            <h1>Sticky Note Activity</h1>
        </div>
    );
}

export default function Input() {
    return (
        <Suspense
            fallback={
                <div className="full-page">
                    <h2>Loading...</h2>
                </div>
            }
        >
            {/* Actual content */}
            <InitPage />
        </Suspense>
    );
}
