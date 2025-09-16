'use client';

import { useState } from 'react';
import Image from 'next/image';
import "./globals.css";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const [showHelpModal, setShowHelpModal] = useState(false);

  const handleResetClick = () => {
    window.scrollTo({ top: 0, behavior: 'auto' });
    window.location.href = '/';
  };

  const handleHelpClick = () => {
    setShowHelpModal(true);
  };

  const handleCloseModal = () => {
    setShowHelpModal(false);
  };

  return (
    <html lang="en">

      <head>
        <title>Card Sorting</title>
        <meta name="description" content="Card Sorting" />
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="icon" href="/favicon.ico" type="image/x-icon" />
        <link rel="shortcut icon" href="/favicon.ico" type="image/x-icon" />
      </head>

      <body>
        <header className="header"> {/* Header class from globals.css */}
          <button
            className="favicon-button" // Favicon button class
            onClick={handleResetClick}
            title="Reset Application"
          >
            <Image
              src="/01_RR_Large.png"
              alt="Logo - Reset"
              width={40}
              height={40}
              className="favicon" // Favicon class
            />
          </button>
          <div className="title-container"> {/* Title container class */}
            <h1 className="title">Card Sorting</h1> {/* Title class */}
            <button className="help-button" onClick={handleHelpClick}>
              <Image
                src="/help-tooltip-fix.svg"
                alt="Help - Click for application instructions"
                width={32}
                height={32}
              />
            </button>
          </div>
        </header>

        <main>{children}</main>

        {showHelpModal && (
          <div className="modal-overlay" onClick={handleCloseModal}>
            <div className="modal-content" onClick={(e) => e.stopPropagation()}>
              <button className="modal-close" onClick={handleCloseModal}>
                ×
              </button>
              <div className="modal-body">
                <ol>
                  <li>Review all cards representing concerns with a study investigating the effects of neuroserpin on axon length.</li>
                  <li>Sort the cards into one of three approaches to &quot;control&quot; their impact on the study. With each choice, explain why you made that choice. If you need a refresher on what each approach means, hover over that box!</li>
                  <li>Review how other users sorted each concern, and explore the rationale behind each approach.</li>
                </ol>
              </div>
            </div>
          </div>
        )}

      </body>

    </html>
  );
}
