import './globals.css';
import type { Metadata, Viewport } from 'next';
import { Inter, Space_Grotesk, JetBrains_Mono } from 'next/font/google';
import { Toaster } from '@/components/ui/toaster';
import { FirebaseClientProvider } from '@/firebase';
import React from 'react';

const inter = Inter({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-inter',
});

const spaceGrotesk = Space_Grotesk({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-space-grotesk',
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ['latin'],
  display: 'swap',
  variable: '--font-jetbrains-mono',
});

export const metadata: Metadata = {
  title: {
    default: 'EmprendeIA — Convierte tus ideas en negocios reales',
    template: '%s · EmprendeIA',
  },
  description:
    'EmprendeIA usa inteligencia artificial para validar tu idea, lanzarla y mantenerla viva. Para emprendedores que empiezan y para los que necesitan rescatar su negocio.',
  metadataBase: new URL('https://emprendeia.app'),
  openGraph: {
    type: 'website',
    locale: 'es_MX',
    siteName: 'EmprendeIA',
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: '(prefers-color-scheme: light)', color: '#FAFBFF' },
    { media: '(prefers-color-scheme: dark)', color: '#0B0F1A' },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      suppressHydrationWarning
      className={`${inter.variable} ${spaceGrotesk.variable} ${jetbrainsMono.variable}`}
    >
      <head>
        <script
          id="theme-loader"
          dangerouslySetInnerHTML={{
            __html: `(function(){try{var t=localStorage.getItem('theme')||'aurora-light';if(t==='aurora-light'){document.documentElement.classList.add('light');}else{document.documentElement.classList.remove('light');}localStorage.setItem('theme',t);}catch(e){}})();`,
          }}
        />
      </head>
      <body className="font-body antialiased min-h-screen scrollbar-aurora">
        <FirebaseClientProvider>
          {children}
          <Toaster />
        </FirebaseClientProvider>
      </body>
    </html>
  );
}
