import "./styles/globals.css";

export const metadata = {
  title: "Deduce the Number Rule",
  description: "Deduce the Number Rule",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
