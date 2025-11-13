// app/layout.tsx
import { AuthProvider } from '@/lib/auth-context'
import './globals.css' // Make sure this import exists

export const metadata = {
  title: 'RubHub - Massages on the go',
  description: 'Massage on demand system',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body>
        <AuthProvider>
          {children}
        </AuthProvider>
      </body>
    </html>
  )
}