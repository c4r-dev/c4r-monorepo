import type { Metadata } from 'next';

// import './globals.css'

export const metadata: Metadata = {
  title: "R2R Audience Prompting",
  description: "R2R Audience Prompting",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
