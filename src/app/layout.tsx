import type { Metadata, Viewport } from 'next'
import '@/styles/globals.css'

export const metadata: Metadata = {
  title: {
    default: 'Cykrus — World of Dreams',
    template: '%s · Cykrus',
  },
  description:
    'Cykrus baut Welten zwischen Pflege, Code und KI. Eine Stadt aus Ideen — von Vault City.',
  metadataBase: new URL('https://cykrus.at'),
  openGraph: {
    title: 'Cykrus — World of Dreams',
    description: 'Eine Stadt aus Ideen, gebaut von Vault City.',
    url: 'https://cykrus.at',
    siteName: 'Cykrus',
    locale: 'de_AT',
    type: 'website',
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: '/favicon.ico',
  },
}

export const viewport: Viewport = {
  themeColor: '#0E0B14',
  width: 'device-width',
  initialScale: 1,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="de">
      <body className="bg-cykra-ink text-cykra-body">{children}</body>
    </html>
  )
}
