import { Inter } from "next/font/google";

import './globals.css'



export const metadata = {
  title: "Polio Ice Cream",
  description: "Polio Ice Cream",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
