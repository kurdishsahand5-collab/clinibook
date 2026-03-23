import type { Metadata } from 'next'
import { LanguageProvider } from '@/lib/LanguageContext'
import { ThemeProvider } from '@/lib/ThemeContext'
import './globals.css'

export const metadata: Metadata = {
  title: 'CliniBook',
  description: 'Book your appointment online',
}

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>
        <ThemeProvider>
          <LanguageProvider>
            {children}
          </LanguageProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}