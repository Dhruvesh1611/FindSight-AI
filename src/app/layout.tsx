import type { Metadata } from 'next';
import localFont from 'next/font/local';
import './globals.css';
import Navbar from '@/components/ui/Navbar';
import { Toaster } from 'sonner';

const inter = localFont({
  src: [
    {
      path: './fonts/InterVariable.woff2',
      style: 'normal',
    },
  ],
  variable: '--font-inter',
  fallback: [
    'system-ui',
    '-apple-system',
    'BlinkMacSystemFont',
    'Segoe UI',
    'Roboto',
    'sans-serif',
  ],
});

export const metadata: Metadata = {
  title: 'FindSight AI — AI-Powered Missing Person Detection',
  description: 'Leveraging AI & Computer Vision to locate missing persons faster through real-time surveillance analysis.',
  keywords: ['missing person', 'face recognition', 'AI', 'surveillance', 'detection'],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} font-sans antialiased`}>
        <Navbar />
        <main className="pt-16 min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(26, 26, 46, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f1f5f9',
              backdropFilter: 'blur(16px)',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
