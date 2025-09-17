import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Fix That Bias",
  description: "Interactive activity to identify and address methodological concerns in research studies",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
