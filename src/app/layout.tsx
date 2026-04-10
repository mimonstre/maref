import type { Metadata } from 'next';
import { Geist } from 'next/font/google';
import './globals.css';
import TopBar from '@/components/layout/TopBar';
import BottomNav from '@/components/layout/BottomNav';

const geist = Geist({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'MAREF — Intelligence Décisionnelle',
  description: 'Moteur d intelligence décisionnelle appliqué à l achat',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body className={geist.className + ' bg-gray-50 text-gray-900 antialiased'}>
        <TopBar />
        <main className="pt-14 pb-20 md:pb-4 min-h-screen">
          <div className="max-w-2xl mx-auto px-4 py-4">
            {children}
          </div>
        </main>
        <BottomNav />
      </body>
    </html>
  );
}
