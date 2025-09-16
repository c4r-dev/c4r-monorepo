"use client";
import React, { useEffect, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import "./page.css";

/*
Init Page:
- Redirects user to the newSession page
*/

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
