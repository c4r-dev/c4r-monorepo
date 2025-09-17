import Script from "next/script";
import "./globals.css";

export const metadata = {
  title: "Assessment Bias",
  description: "Explore the impact of bias.",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      {/* Google Analytics Script */}
      <Script
        async
        src="https://www.googletagmanager.com/gtag/js?id=G-BLD5JDPK5N"
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
                gtag('config', 'G-BLD5JDPK5N');
              `,
        }}
      />
      <body>{children}</body>
    </html>
  );
}
