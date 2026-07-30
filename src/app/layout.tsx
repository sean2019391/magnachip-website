import type { Metadata } from 'next'
import { I18nProvider } from '@/i18n/context'
import './globals.css'

export const metadata: Metadata = {
  title: {
    default: 'MagnaChip Semiconductor - Powering Magnificent Moments',
    template: '%s | MagnaChip',
  },
  description: 'MagnaChip Semiconductor delivers innovative power solutions including MOSFETs, IGBTs, SiC devices, and Power ICs for automotive, industrial, and consumer applications.',
  icons: { icon: '/magnachip-image-logo.png' },
  openGraph: {
    type: 'website',
    siteName: 'MagnaChip Semiconductor',
    title: 'MagnaChip Semiconductor - Powering Magnificent Moments',
    description: 'Innovative power solutions for a smarter, smaller, faster world.',
    url: 'https://www.magnachip.com',
  },
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <I18nProvider>{children}</I18nProvider>
      </body>
    </html>
  )
}
