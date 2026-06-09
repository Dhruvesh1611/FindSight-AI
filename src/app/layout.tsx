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
        {/* Noise texture overlay for premium depth */}
        <div className="noise-overlay" />
        <Navbar />
        <main className="pt-20 min-h-screen">
          {children}
        </main>
        <Toaster
          position="top-right"
          toastOptions={{
            style: {
              background: 'rgba(17, 17, 25, 0.95)',
              border: '1px solid rgba(255, 255, 255, 0.08)',
              color: '#f0f0f5',
              backdropFilter: 'blur(20px)',
              borderRadius: '16px',
              fontSize: '0.9rem',
            },
          }}
          richColors
        />
      </body>
    </html>
  );
}
