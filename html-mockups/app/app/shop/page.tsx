import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { formatCurrency } from '@/lib/utils'
import Image from 'next/image'

export default async function ShopPage() {
  await requireAuth()

  const products = await prisma.product.findMany({
    where: { isActive: true },
    orderBy: [{ featured: 'desc' }, { displayOrder: 'asc' }],
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Maintenance Shop</h1>
        <p className="mt-1 text-sm text-gray-500">
          Professional products to care for your hair system
        </p>
      </div>

      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product) => (
          <div key={product.id} className="bg-white shadow rounded-lg overflow-hidden group">
            <div className="aspect-w-1 aspect-h-1 bg-gray-200 relative h-48">
              {product.primaryImage ? (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">Product Image</span>
                </div>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <span className="text-gray-400 text-sm">No image</span>
                </div>
              )}
            </div>
            <div className="p-4">
              <h3 className="text-sm font-medium text-gray-900">{product.name}</h3>
              {product.shortDescription && (
                <p className="mt-1 text-xs text-gray-500">{product.shortDescription}</p>
              )}
              <div className="mt-3 flex items-center justify-between">
                <div>
                  {product.compareAtPrice && product.compareAtPrice > product.price ? (
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-red-600">
                        {formatCurrency(product.price, product.currency)}
                      </span>
                      <span className="text-xs text-gray-500 line-through">
                        {formatCurrency(product.compareAtPrice, product.currency)}
                      </span>
                    </div>
                  ) : (
                    <span className="text-sm font-medium text-gray-900">
                      {formatCurrency(product.price, product.currency)}
                    </span>
                  )}
                </div>
                <button className="px-3 py-1.5 bg-primary-600 text-white text-xs font-medium rounded hover:bg-primary-700">
                  Add to Cart
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
