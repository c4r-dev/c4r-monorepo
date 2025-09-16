// components/FaviconButton.tsx
"use client";

import Image from "next/image";

export default function FaviconButton() {
  const reloadPage = () => {
    window.location.href = "/"; // This forces a full page reload
  };

  return (
    <button className="favicon-button" onClick={reloadPage}>
      <Image
        src="/favicon.ico"
        alt="Home"
        width={40}
        height={40}
        className="favicon"
      />
    </button>
  );
}