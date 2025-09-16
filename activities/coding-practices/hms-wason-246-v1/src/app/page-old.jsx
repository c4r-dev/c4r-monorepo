"use client";
import dynamic from "next/dynamic";

// const Tasks = dynamic(() => import("@/app/components/Tasks"));

import Header from "@/app/components/header";
import { useRouter } from "next/navigation";
export default function HomePage() {

  const router = useRouter();

  return (
    <div>
      <Header />
        <p> Hello World</p>
        <button className="responsive-button" onClick={() => {
          router.push("/pages/intro");
        }}>
          Intro
        </button>
    </div>
  );
} 