import { prisma } from '@backend/db'
import ImmersiveLanding from '@frontend/components/ImmersiveLanding'
import type { Product } from '@frontend/lib/types'

export const dynamic = 'force-dynamic'

export default async function Page() {
  const products = await prisma.product.findMany({
    include: { category: true },
    orderBy: { createdAt: 'desc' },
  })

  const typedProducts = products as unknown as Product[]

  return <ImmersiveLanding products={typedProducts} />
}
