"use client";

// import Image from "next/image";
// import styles from "./page.module.css";

import React, {useEffect} from "react";
import "@/app/globals.css";
import "@/app/startScreen.css";

import { useRouter } from "next/navigation";

export default function Home() {
  const router = useRouter();

  // Upon load, redirect user to the main activity page
  useEffect(() => {
      router.push('/pages/biasMapping');
  }, []);

  return (
    <div className="start-screen-loader-container">
      <h1> 
        Loading...
      </h1>
      {/* <h1>HMS Bias Mapping Activity</h1> */}
      {/* <button onClick={() => router.push("pages/biasMapping")}>Start</button> */}
    </div>
  );
}

