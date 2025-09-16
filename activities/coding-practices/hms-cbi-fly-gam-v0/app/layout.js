import Script from 'next/script';


export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
                   {/* Google Analytics Script */}
                   <Script
            async
            src="https://www.googletagmanager.com/gtag/js?id=G-9KJHJ0SZLN"
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
                gtag('config', 'G-9KJHJ0SZLN');
              `,
            }}
          />
        <div>{children}</div>
      </body>
    </html>
  );
}
