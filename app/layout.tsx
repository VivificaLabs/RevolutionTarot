import type { Metadata } from 'next'
import { Analytics } from '@vercel/analytics/react'
import './globals.css'

export const metadata: Metadata = {
  title: 'Revolution Tarot | Leitura Online para Quem Pensa com Lógica',
  description: 'Tarot online pra quem já sabe. Leituras diretas, sem enrolação. Atendimento em português, para Brasil e Portugal.',
  keywords: ['tarot online', 'tarot Portugal', 'tarot Brasil', 'leitura de tarot', 'consultora tarot', 'tarot sem bullshit'],
  authors: [{ name: 'Olivia', url: 'https://www.revolutiontarot.com' }],
  creator: 'Revolution Tarot',
  publisher: 'Revolution Tarot',
  metadataBase: new URL('https://www.revolutiontarot.com'),
  alternates: {
    canonical: 'https://www.revolutiontarot.com',
  },
  openGraph: {
    type: 'website',
    locale: 'pt_BR',
    url: 'https://www.revolutiontarot.com',
    siteName: 'Revolution Tarot',
    title: 'Revolution Tarot | Leitura Online de Tarot',
    description: 'Leituras de tarot online. Sem enrolação, sem promessa mágica, mas com muita magia. Atendimento mundial.',
    images: [
      {
        url: 'https://www.revolutiontarot.com/images/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Revolution Tarot - Leitura Online',
        type: 'image/jpeg',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    site: '@revolution.tarot',
    creator: '@revolution.tarot',
    title: 'Revolution Tarot',
    description: 'Tarot para quem já sabe. Sem bullshit.',
    images: ['https://www.revolutiontarot.com/images/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-snippet': -1,
      'max-image-preview': 'large',
      'max-video-preview': -1,
    },
  },
  category: 'Serviços Esotéricos',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const schemaData = {
    '@context': 'https://schema.org',
    '@type': ['LocalBusiness', 'ProfessionalService'],
    name: 'Revolution Tarot',
    description: 'Leitura de tarot online para pessoas que pensam com lógica',
    url: 'https://www.revolutiontarot.com',
    email: 'revolutiontarot.byolivia@gmail.com',
    telephone: '+351939189631',
    areaServed: [
      {
        '@type': 'Country',
        name: 'PT',
      },
      {
        '@type': 'Country',
        name: 'BR',
      },
      {
        '@type': 'Country',
        name: 'Worldwide',
      },
    ],
    sameAs: [
      'https://instagram.com/revolution.tarot',
      'https://tiktok.com/@revolution.tarot',
      'https://wa.me/351939189631',
    ],
    contactPoint: {
      '@type': 'ContactPoint',
      contactType: 'Customer Service',
      telephone: '+351939189631',
      email: 'revolutiontarot.byolivia@gmail.com',
      availableLanguage: ['pt-BR', 'pt-PT', 'en'],
    },
  }

  return (
    <html lang="pt-BR">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <meta name="theme-color" content="#240321" />
        <meta name="apple-mobile-web-app-capable" content="true" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        <link rel="icon" href="/favicon.svg" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(schemaData) }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  )
}
