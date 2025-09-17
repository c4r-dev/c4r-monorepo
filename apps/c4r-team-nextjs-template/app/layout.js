import './globals.css';

export const metadata = {
  title: "Team Template",
  description: "Team Template",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
