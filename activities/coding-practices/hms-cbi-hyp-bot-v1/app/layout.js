import { Inter } from "next/font/google";
import "./globals.css";
import Script from 'next/script';



const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Alternative Hypothesis Bot",
  description: "Generate alternative hypothesis that is mutually exclusive",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
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
