'use client'

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Image from 'next/image';

import './startScreen.css';


// import Raven1 from '../assets/feedback-button-1.svg';


// export default function ResQuesThree() {
export default function StartScreen() {

  const router = useRouter();

  const onStartActivity = () => {
    router.push('/instructions');
  }


  return (

    <div className="start-screen-container">
      <div className="start-screen">
        <div className="start-screen-header">
          <h1>Flu Dag</h1>
          <h2>Decide strategies for certain objects in your research process.</h2>
        </div>
        <div className="start-screen-body">

        </div>
        <div className="start-screen-footer">
          <button onClick={onStartActivity}>Start Activity</button>
        </div>
      </div>    
    </div>
  )
}

// export const dynamic = 'force-dynamic';