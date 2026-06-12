import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ProposalAI — Instant Project Proposals',
  description:
    'Upload a client requirements PDF and get a complete proposal — scope, timeline, quote, contract draft, and discovery questions — in seconds.',
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  // Do NOT set maximumScale / userScalable=false — pinch-zoom must stay available.
  themeColor: '#ffffff',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className={inter.className}>{children}</body>
    </html>
  );
}
