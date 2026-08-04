export const BRAND = {
  name: 'SHAROL',
  tagline: 'Exclusividad & Estilo',
  title: 'Sharol | Para mujeres que van por más',
  description:
    'Joyas, carteras, zapatos y ropa. Calidad, estilo y exclusividad con envíos a todo el Perú.',
} as const

export const WHATSAPP = {
  display: '916 663 318',
  number: '51916663318',
  waLink: (message: string) =>
    `https://wa.me/51916663318?text=${encodeURIComponent(message)}`,
} as const

export const STORE = {
  shippingNote: 'Enviamos a todo el Perú',
  categories: ['Joyas', 'Carteras', 'Zapatos', 'Ropa'],
} as const
