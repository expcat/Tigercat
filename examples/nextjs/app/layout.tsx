import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: 'Tigercat Next.js SSR Example',
  description: 'SSR smoke page for Tigercat React components'
}

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  )
}
