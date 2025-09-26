import type { Metadata, Viewport } from 'next'
import { SkinSelectionProvider } from '@/contexts/SkinSelectionContext'
import { ChampionInfoProvider } from '@/contexts/ChampionInfoContext'
import { TeamProvider } from '@/contexts/TeamContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'LoL Champion Guide',
  description: 'Complete League of Legends champion reference guide with abilities, skins, and more',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  themeColor: '#010A13',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="icon" href="/icon-192.png.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/icon-192.png.svg" />
      </head>
      <body className="bg-riot-dark text-riot-gold min-h-screen">
        <SkinSelectionProvider>
          <ChampionInfoProvider>
            <TeamProvider>
              {children}
            </TeamProvider>
          </ChampionInfoProvider>
        </SkinSelectionProvider>
      </body>
    </html>
  )
}