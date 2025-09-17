"use client"

import dynamic from "next/dynamic";

const DynamicComponent = dynamic(() => import('../components/SummaryCalc2'), { ssr: false })
// const DynamicComponent = dynamic(() => import('../components/FeedbackComparison'), { ssr: false })


export default function Summary() {
  return (
    <DynamicComponent />
  );
}