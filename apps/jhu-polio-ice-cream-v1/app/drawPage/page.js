'use client'

import { Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";

import Image from 'next/image';
import DagUtility from '../components/DagUtility';
import { Dag } from '../components/DragAndDrop/Dag';

// import Raven1 from '../assets/feedback-button-1.svg';


// export default function ResQuesThree() {
export default function DrawPage() {

  return (

    <div className="utility-container">
      {/* <h1>Welcome to the Draw Page</h1> */}
      <DagUtility />
      {/* <Dag /> */}
      {/* <DagUtility /> */}
      {/* <h1>Welcome to the Draw Page</h1> */}
    </div>
  )
}

export const dynamic = 'force-dynamic';
