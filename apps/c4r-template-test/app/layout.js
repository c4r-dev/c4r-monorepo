import "./globals.css";

export const metadata = {
  title: "C4R Activity Template",
  description: "C4R Activity Template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        {children}
      </body>
    </html>
  );
}
