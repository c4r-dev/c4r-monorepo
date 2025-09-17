import { Inter } from "next/font/google";
import "./globals.css";

import Script from 'next/script';


const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Map the Biases!",
  description: "Map the Biases!",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
           {/* Google Analytics Script */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-X13HX82072"
            strategy="afterInteractive"
          />
          <Script
            id="google-analytics"
            strategy="afterInteractive"
            dangerouslySetInnerHTML={{
              __html: `
                window.dataLayer = window.dataLayer || [];
                function gtag(){dataLayer.push(arguments);}
                gtag('js', new Date());
                gtag('config', 'G-X13HX82072');
              `,
            }}
          />
        {children}
      </body>
    </html>
  );
}
