import { prisma } from '@backend/db'
import { CatalogClient } from '@frontend/components/CatalogClient'
import type { CatalogProduct } from '@frontend/components/ProductCard'

export const dynamic = 'force-dynamic'

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; wishlist?: string }>
}) {
  const params = await searchParams

  const [products, categories] = await Promise.all([
    prisma.product.findMany({
      include: { category: true },
      orderBy: { createdAt: 'desc' },
    }),
    prisma.category.findMany({ orderBy: { name: 'asc' } }),
  ])

  const typedProducts = products as unknown as CatalogProduct[]

  return (
    <CatalogClient
      products={typedProducts}
      categories={categories.map((category) => ({ id: category.id, name: category.name }))}
      initialQuery={params.q ?? ''}
      initialWishlistOnly={params.wishlist === '1'}
    />
  )
}
