"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";

// import Image from "next/image";
// import DagUtility from "../components/DagUtility";
// import DagDesigner from "../DagDesigner/DagDesigner";
// import DagLoader from "../DagLoader/DagLoader";
// import DagLoaderModal from "../DagLoaderModal/DagLoaderModal";
import LoadDagGroup from "./LoadDagGroup";
import "./review.css";
import Header from "@/app/components/Header/Header";

// import Raven1 from '../assets/feedback-button-1.svg';

// export default function ResQuesThree() {





export default function Review() {
    return (
        <Suspense fallback={<div>Loading...</div>}>
            <Header title="Draw a diagram to explain the correlation" />
            <LoadDagGroup />
        </Suspense>
    );
}

// export const dynamic = 'force-dynamic';
