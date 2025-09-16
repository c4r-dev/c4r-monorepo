"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./page.css";

// Init Page Component
// Purpose: Serves as the entry point of the application
// Behavior: Automatically redirects to input page on component mount
// Note: This is a temporary landing page, consider adding loading indicators
// or transition animations for better UX
export function InitPage() {
    const router = useRouter();

    // Upon load, redirect user to the newSession page
    useEffect(() => {
        router.push(`/pages/input`);
    }, []);

    return (
        <div className="full-page">
            <h1>Rigor Files</h1>
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
