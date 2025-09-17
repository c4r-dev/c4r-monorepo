import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Flow Designer",
  description: "Design interactive flowcharts with React Flow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          {/* <NavBar /> */}
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
