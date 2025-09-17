import { Inter } from "next/font/google";

import './globals.css'



export const metadata = {
  title: "R2R Feedback",
  description: "R2R Feedback",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
