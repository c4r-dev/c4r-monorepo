// app/components/FaviconButton.tsx
"use client";

import Link from 'next/link';
import Image from 'next/image';
// import './FaviconButton.css'; // Example CSS import if needed

export default function FaviconButton() {
  return (
    // Use Link directly, remove legacyBehavior and the inner <a> tag
    <Link href="/" className="favicon-button" aria-label="Homepage">
        {/* Apply button styling directly to Link or use a wrapper if necessary */}
        {/* Image component remains as the child */}
        <Image
          src="/favicon.ico"
          alt="Homepage" // Alt text is important
          className="favicon"
          width={40}
          height={40}
          priority
        />
    </Link>
  );
}