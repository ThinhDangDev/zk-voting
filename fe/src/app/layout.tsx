import type { Metadata, Viewport } from 'next'

import UiProvider from '@/providers/ui.provider'
import WalletProvider from '@/providers/wallet.provider'
import { Footer } from './footer'

const title = 'Atbash | ZK Voting'
const description =
  'Atbash: Redefining Digital Democracy with Advanced Privacy Tech. Unveiling the next era of secure, confidential e-voting.'
const thumbnail = '/thumbnail.jpeg'

export const metadata: Metadata = {
  title,
  description,
  metadataBase: new URL('https://viction.atbash.xyz'),
  openGraph: {
    title,
    description,
    images: [thumbnail],
  },
  icons: {
    icon: '/logo.svg',
    apple: '/logo.svg',
  },
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
}

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://api.fontshare.com/v2/css?f[]=satoshi@1,900,700,500,300,400,2&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="w-full bg-bg-light bg-cover bg-no-repeat ">
        <UiProvider>
          <WalletProvider>
            <div className="w-full min-h-[100vh] flex flex-col gap-6">
              <main>{children}</main>
            </div>
          </WalletProvider>
        </UiProvider>
        <footer className="sticky bottom-0 z-10">
          <Footer />
        </footer>
      </body>
    </html>
  )
}
