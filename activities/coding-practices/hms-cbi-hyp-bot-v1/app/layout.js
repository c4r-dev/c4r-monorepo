import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import Script from 'next/script';



const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Alternative Hypothesis Bot",
  description: "Generate alternative hypothesis that is mutually exclusive",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={`${geistSans.variable} ${geistMono.variable}`}>
      <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-8MRBZCXNKB"
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
                gtag('config', 'G-8MRBZCXNKB');
              `,
            }}
          />
        {children}
      </body>
    </html>
  );
}
