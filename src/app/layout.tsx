import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'BuildBridge',
  description: 'Back the skilled workers building their communities.',
  icons: {
    icon: '/buildbridge-favicon.png',
  },
};

import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Roboto:ital,wght@0,300;0,400;0,500;0,700;0,900;1,400;1,700;1,900&display=swap" rel="stylesheet" />
      </head>
      <body className="antialiased min-h-screen flex flex-col bg-white font-sans" style={{ fontFamily: "'Roboto', sans-serif" }}>
        <Providers>
          <Navbar />
          <main className="flex-grow pt-28">
            {children}
          </main>
          <Footer />
        </Providers>
      </body>
    </html>
  );
}