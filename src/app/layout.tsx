// src/app/layout.tsx
import type { Metadata } from 'next'
import { Playfair_Display, DM_Sans, Fira_Code } from 'next/font/google'
import './globals.css'
import { Toaster } from 'sonner'

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-playfair',
  display: 'swap',
})

const dmSans = DM_Sans({
  subsets: ['latin'],
  variable: '--font-dm-sans',
  display: 'swap',
})

const firaCode = Fira_Code({
  subsets: ['latin'],
  variable: '--font-fira-code',
  display: 'swap',
})

export const metadata: Metadata = {
  title: {
    default: 'Cultupedia — Encyclopédie culturelle haïtienne',
    template: '%s | Cultupedia',
  },
  description: "L'encyclopédie vivante de la culture haïtienne — musique, danse, cinéma, arts visuels, théâtre, gastronomie et édition.",
  keywords: ['Haïti', 'culture haïtienne', 'musique haïtienne', 'compas', 'encyclopédie', 'kiltipedya'],
  verification: {
    google: 'f_sURmloPD06QQgNJvpyXIR1ySaUbKjxRVRNVXIV16w',
  },
  metadataBase: new URL('https://cultupedia.ht'),
  openGraph: {
    type: 'website',
    locale: 'fr_HT',
    url: 'https://cultupedia.ht',
    siteName: 'Cultupedia',
    images: [{ url: '/og-image.jpg', width: 1200, height: 630 }],
  },
  twitter: { card: 'summary_large_image', site: '@cultupedia' },
  robots: { index: true, follow: true },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr" suppressHydrationWarning>
      <body className={`${playfair.variable} ${dmSans.variable} ${firaCode.variable} font-body antialiased`}>
        {children}
        <Toaster position="bottom-right" richColors />
      </body>
    </html>
  )
}
