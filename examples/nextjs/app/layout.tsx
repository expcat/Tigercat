import type { Metadata } from 'next'
import './globals.css'
import { TigercatProviders } from './providers'

export const metadata: Metadata = {
  title: 'Tigercat Next.js SSR Example',
  description: 'SSR smoke page for Tigercat React components'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="zh-CN" dir="ltr">
      <body>
        <TigercatProviders>{children}</TigercatProviders>
      </body>
    </html>
  )
}
