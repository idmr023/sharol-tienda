import Link from 'next/link'
import { WHATSAPP } from '@frontend/lib/constants'

export function StoreFooter() {
  return (
    <footer className="bg-black/60 border-t border-rose-900/40 px-6 sm:px-12 py-14">
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-3 gap-10">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full overflow-hidden border border-rose-400/50">
              <img src="/logo.jpeg" alt="Sharol Logo" className="w-full h-full object-cover" />
            </div>
            <div>
              <span className="font-serif text-xl font-bold tracking-widest text-white block">
                SHAROL
              </span>
              <span className="text-[9px] tracking-widest text-rose-300 uppercase block -mt-1">
                Exclusividad & Estilo
              </span>
            </div>
          </div>
          <p className="text-sm text-rose-200/60 mt-4 leading-relaxed max-w-xs">
            Joyas, carteras, zapatos y ropa para mujeres que van por más. Calidad y estilo con
            envíos a todo el Perú.
          </p>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-4">
            Navegación
          </h3>
          <ul className="space-y-2.5 text-sm text-rose-200/70">
            <li>
              <Link href="/" className="hover:text-rose-300 transition">
                Inicio
              </Link>
            </li>
            <li>
              <Link href="/carrito" className="hover:text-rose-300 transition">
                Tu Carrito
              </Link>
            </li>
            <li>
              <Link href="/checkout" className="hover:text-rose-300 transition">
                Checkout
              </Link>
            </li>
            <li>
              <Link href="/admin" className="hover:text-rose-300 transition">
                Administración
              </Link>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="text-xs uppercase tracking-widest text-rose-300 font-semibold mb-4">
            Contacto
          </h3>
          <p className="text-sm text-rose-200/70">WhatsApp: {WHATSAPP.display}</p>
          <a
            href={WHATSAPP.waLink('¡Hola Sharol! Quiero hacer un pedido 💕')}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 mt-4 text-sm bg-emerald-600 hover:bg-emerald-500 text-white font-medium px-5 py-2.5 rounded-full transition"
          >
            Escribir por WhatsApp
          </a>
          <p className="text-xs text-rose-200/50 mt-5">🇵🇪 Envíos a todo el Perú</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto mt-12 pt-6 border-t border-rose-900/30 flex flex-col sm:flex-row justify-between items-center gap-3 text-xs text-rose-300/50">
        <p>&copy; {new Date().getFullYear()} Sharol Tienda. Todos los derechos reservados.</p>
        <p className="flex items-center gap-1">
          ✨ Creado por{' '}
          <a
            href="https://portafolio-red-seven.vercel.app/es"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-rose-300 hover:text-rose-200 underline underline-offset-2 transition"
          >
            IDMR
          </a>
        </p>
      </div>
    </footer>
  )
}
