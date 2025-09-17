import localFont from "next/font/local";
import Script from 'next/script';
import "./styles/tailwind-preflight.css";

// import "./styles/normalize.css";
// import "./globals.css";

import "./styles/globals.css";
import { AppRouterCacheProvider } from "@mui/material-nextjs/v14-appRouter";
// import CssBaseline from '@mui/material/CssBaseline';

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

// General sans medium
const generalSansMedium = localFont({
    src: "./fonts/GeneralSans-Medium.woff",
    variable: "--font-general-sans-medium",
    weight: "100 900",
});

export const metadata = {
    title: "Sticky Note Activity",
    description: "Sticky Note Activity",
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <AppRouterCacheProvider>
                {/* <CssBaseline /> */}
                <body
                    className={`${generalSansSemiBold.variable} ${generalSansVariable.variable} ${generalSansMedium.variable}`}
                >
                    {process.env.NEXT_PUBLIC_ENABLE_GA === 'true' && (
                        <>
                            <Script
                                async
                                src="https://www.googletagmanager.com/gtag/js?id=G-93H3LHNDSN"
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
                        gtag('config', 'G-93H3LHNDSN');
                      `,
                                }}
                            />
                        </>
                    )}
                    {children}
                </body>
            </AppRouterCacheProvider>
        </html>
    );
}
