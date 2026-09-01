import type { Metadata, Viewport } from 'next';
import './globals.css';
import { Header } from '../components/Header';
import { Footer } from '../components/Footer';
import { Toaster } from 'react-hot-toast';
import { AIChatbotWrapper } from '../components/AIChatbotWrapper';
import { ProductsInitializer } from '../components/ProductsInitializer';
import { AuthProvider } from '../components/AuthProvider';

const APP_NAME = 'SmartMarket';
const APP_DESCRIPTION = 'Собственный магазин без комиссий маркетплейсов';

export const metadata: Metadata = {
  applicationName: APP_NAME,
  title: {
    default: APP_NAME,
    template: `%s — ${APP_NAME}`,
  },
  description: APP_DESCRIPTION,
  manifest: '/manifest.json',
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: APP_NAME,
  },
  formatDetection: {
    telephone: false,
  },
  openGraph: {
    type: 'website',
    siteName: APP_NAME,
    title: APP_NAME,
    description: APP_DESCRIPTION,
  },
};

export const viewport: Viewport = {
  themeColor: '#18181b',
  width: 'device-width',
  initialScale: 1,
  minimumScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru">
      <head>
        <link rel="apple-touch-icon" href="/icons/maskable_icon_x192.png" />
      </head>
      <body>
        <AuthProvider>
          <ProductsInitializer />
          <div className="flex min-h-screen flex-col bg-white text-gray-900">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
            <Toaster position="bottom-right" />
            <AIChatbotWrapper />
          </div>
        </AuthProvider>
      </body>
    </html>
  );
}
