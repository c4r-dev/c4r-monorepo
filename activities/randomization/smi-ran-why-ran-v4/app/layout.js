import { AppLayout } from '@c4r/ui';

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <AppLayout title="Why Randomize?">
          {children}
        </AppLayout>
      </body>
    </html>
  );
}