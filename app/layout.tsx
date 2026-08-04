import { Inter, Playfair_Display } from 'next/font/google'
import { CartProvider } from '@frontend/context/CartContext'
import { AuthProvider } from '@frontend/context/AuthContext'
import { WishlistProvider } from '@frontend/context/WishlistContext'
import { MagneticNavbar } from '@frontend/components/MagneticNavbar'
import { CartDrawer } from '@frontend/components/CartDrawer'
import { Toast } from '@frontend/components/Toast'
import { BRAND } from '@frontend/lib/constants'
import './globals.css'

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
})

const playfair = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
})

export const metadata = {
  title: BRAND.title,
  description: BRAND.description,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={`${inter.variable} ${playfair.variable}`}>
      <body className="font-sans antialiased bg-[#0d0d0d] text-white selection:bg-rose-500 selection:text-white">
        <AuthProvider>
          <WishlistProvider>
            <CartProvider>
              <MagneticNavbar />
              {children}
              <CartDrawer />
              <Toast />
            </CartProvider>
          </WishlistProvider>
        </AuthProvider>
      </body>
    </html>
  )
}
