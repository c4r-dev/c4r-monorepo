import Script from 'next/script';

import "./styles/tailwind-preflight.css";
import "./styles/globals.css";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export const metadata = {
  title: "Deduce the Number Rule",
  description: "Deduce the Number Rule",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@100..900&display=swap" rel="stylesheet" />
      </head>

      <AppRouterCacheProvider>
        {/* <CssBaseline /> */}
        <body style={{ fontFamily: 'Inter, ui-sans-serif, system-ui, sans-serif' }}>
           {/* Google Analytics Script */}
          <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-QR2FTRGC9D"
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
                gtag('config', 'G-QR2FTRGC9D');
              `,
            }}
          />
          {children}
        </body>
      </AppRouterCacheProvider>
    </html>
  );
}
