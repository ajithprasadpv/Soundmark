import type { Metadata } from 'next';
import { AppProvider } from '@/components/providers';
import './globals.css';

export const metadata: Metadata = {
  title: 'Soundmark - AI-Powered Ambient Music Platform',
  description: 'Real-time, context-aware music generation for commercial venues',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-screen antialiased">
        <AppProvider>{children}</AppProvider>
      </body>
    </html>
  );
}
