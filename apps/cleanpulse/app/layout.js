import { SessionProvider } from 'next-auth/react'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  variable: '--font-jakarta',
  display: 'swap',
})

export const metadata = {
  metadataBase: new URL('https://cleanpulse.app'),
  title: 'Cleanpulse',
  twitter: { card: 'summary_large_image' },   // large preview on X; image comes from app/opengraph-image.js
  description: 'Restroom feedback and alerts — customers tap or scan, your team knows what needs attention.',
}

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${jakarta.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-[family-name:var(--font-jakarta)]">
        <SessionProvider>
          {children}
        </SessionProvider>
      </body>
    </html>
  )
}
