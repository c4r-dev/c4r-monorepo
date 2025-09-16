import "./styles/globals.css";
import { AppRouterCacheProvider } from '@mui/material-nextjs/v14-appRouter';

export const metadata = {
  title: "Deduce the Number Rule",
  description: "Deduce the Number Rule",
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <AppRouterCacheProvider>
        <body>{children}</body>
      </AppRouterCacheProvider>
    </html>
  );
}
