import type { Metadata } from 'next';
import type { ReactNode } from 'react';

import { ThemeStyles } from '@/seams/theme';

import './globals.css';

export const metadata: Metadata = {
  title: 'Team invoices',
  description: "Your studio's invoices, clients and what is still owed.",
  // A private preview: kept out of search engines.
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <head>
        <ThemeStyles />
      </head>
      <body>{children}</body>
    </html>
  );
}
