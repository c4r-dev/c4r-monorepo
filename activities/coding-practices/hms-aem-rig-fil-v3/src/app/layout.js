
import localFont from "next/font/local";

// import "./styles/normalize.css";
// import "./globals.css";
// import CssBaseline from '@mui/material/CssBaseline';

import Script from "next/script";

import "./styles/tailwind-preflight.css";
import "./styles/globals.css";

import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

const generalSansSemiBold = localFont({
  src: "./fonts/GeneralSans-Semibold.woff",
  variable: "--font-general-sans-semi-bold",
  weight: "100 900",
});

const generalSansVariable = localFont({
  src: "./fonts/GeneralSans-Variable.woff",
  variable: "--font-general-sans-variable",
  weight: "100 900",
});

const generalSansMedium = localFont({
  src: "./fonts/GeneralSans-Medium.woff",
  variable: "--font-general-sans-medium",
  weight: "100 900",
});

// export const metadata = {
//   title: "Rigor Files",
//   description: "Rigor Files",
// };

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AppRouterCacheProvider>
        {/* <CssBaseline /> */}
        <body className={`${generalSansSemiBold.variable} ${generalSansVariable.variable} ${generalSansMedium.variable}`}>
                     {/* Google Analytics Script */}
                     <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-QBS3XDVJTQ"
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
                gtag('config', 'G-QBS3XDVJTQ');
              `,
            }}
          />
          {children}
        </body>
      </AppRouterCacheProvider>
    </html>
  );
}
