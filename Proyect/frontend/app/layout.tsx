import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import { Providers } from '@/components/providers/Providers';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'Trade Bionic - Sistema Automatizado de Trading',
  description: 'Plataforma de trading automatizado con bots algorítmicos, copy-trading y token ERC-20 para distribución de ganancias.',
  keywords: 'trading, bot, automatizado, crypto, blockchain, ethereum, binance',
  authors: [{ name: 'Trade Bionic Team' }],
  viewport: 'width=device-width, initial-scale=1',
  robots: 'index, follow',
  openGraph: {
    title: 'Trade Bionic - Sistema Automatizado de Trading',
    description: 'Plataforma de trading automatizado con bots algorítmicos, copy-trading y token ERC-20 para distribución de ganancias.',
    type: 'website',
    locale: 'es_ES',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Trade Bionic - Sistema Automatizado de Trading',
    description: 'Plataforma de trading automatizado con bots algorítmicos, copy-trading y token ERC-20 para distribución de ganancias.',
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={inter.className}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
} 