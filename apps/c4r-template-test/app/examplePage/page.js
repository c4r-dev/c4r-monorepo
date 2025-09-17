"use client";

/*
Example page demonstrating URL parameter reading with Suspense boundary requirement
*/

import React, { Suspense } from "react";
import "@/app/globals.css";
import { useSearchParams } from "next/navigation";
import Header from "@/app/components/Header/Header";

const PageContent = () => {

  const searchParams = useSearchParams();
  const sessionID = searchParams.get('sessionID');

  return (
    <div className="full-page">
      <Header />
      <h2>URL param reading example</h2>

      {sessionID && <p>Session ID found in URL: {sessionID}</p>}
      {!sessionID && <p>SessionID not found in URL</p>}

    </div>
  );
}

export default function ExamplePage() {
  return (
    <Suspense fallback={ <h2>Loading...</h2> }>
      <PageContent />
    </Suspense>
  );
}

