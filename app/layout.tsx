import type { Metadata } from 'next';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { AIChatbot } from '../components/AIChatbot';
import { ProductsInitializer } from '../components/ProductsInitializer';

export const metadata: Metadata = {
  title: 'MarketMVP',
  description: 'Собственный магазин без комиссий маркетплейсов',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <body>
        <ProductsInitializer />
        <div className="flex min-h-screen flex-col bg-white text-gray-900">
          <Header />
          <main className="flex-1">{children}</main>
          <Footer />
          <Toaster position="bottom-right" />
          <AIChatbot />
        </div>
      </body>
    </html>
  );
}
