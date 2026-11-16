import type { Metadata } from 'next';
import type { ReactNode } from 'react';
import './globals.css';

export const metadata: Metadata = {
  title: 'Negiysem — Hava değişir. Sen hazır çık.',
  description: 'Bugün ne giysem? Saatlik hava tahminini giyim kararlarına çeviren kişisel rehberin. Konumunu seç, katmanını al, güne hazır çık.',
  applicationName: 'Negiysem',
  icons: { icon: '/icon.svg' },
  openGraph: { title: 'Negiysem', description: 'Hava değişir. Sen hazır çık.', locale: 'tr_TR', type: 'website' },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="tr">
      <body className="min-h-screen bg-bg-app font-sans text-text-primary">
        {children}
      </body>
    </html>
  );
}
