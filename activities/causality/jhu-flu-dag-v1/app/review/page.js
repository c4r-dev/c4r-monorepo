"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from "next/image";
import DagUtility from "../components/DagUtility";
import DagDesigner from "../DagDesigner/DagDesigner";
import DagLoader from "../DagLoader/DagLoader";
import DagLoaderModal from "../DagLoaderModal/DagLoaderModal";
import LoadDagGroup from "./LoadDagGroup";
import "./review.css";


export default function Review() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <LoadDagGroup />
        </Suspense>
    );
}

// export const dynamic = 'force-dynamic';
