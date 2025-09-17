import { Inter } from "next/font/google";
import "./globals.css";
import NavBar from "./components/NavBar";
import Header from "./components/Header/Header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "DAG For Causality",
  description: "Design interactive flowcharts with React Flow",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <div className="app-container">
          <Header title="DAG For Causality" />
          <main className="app-main">
            {children}
          </main>
        </div>
      </body>
    </html>
  );
}
