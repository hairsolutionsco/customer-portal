import Link from 'next/link'
import { formatCurrency, formatDate } from '@/lib/utils'
import { Order } from '@prisma/client'

interface RecentOrdersProps {
  orders: Order[]
}

const statusColors = {
  PENDING: 'bg-yellow-100 text-yellow-800',
  CONFIRMED: 'bg-blue-100 text-blue-800',
  IN_PRODUCTION: 'bg-purple-100 text-purple-800',
  QUALITY_CHECK: 'bg-indigo-100 text-indigo-800',
  SHIPPED: 'bg-green-100 text-green-800',
  DELIVERED: 'bg-gray-100 text-gray-800',
  CANCELLED: 'bg-red-100 text-red-800',
}

export function RecentOrders({ orders }: RecentOrdersProps) {
  if (orders.length === 0) {
    return (
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Recent Orders</h2>
        <p className="text-gray-500 text-center py-8">No orders yet</p>
        <div className="text-center">
          <Link
            href="/app/customization"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary-600 hover:bg-primary-700"
          >
            Create your first order
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white shadow rounded-lg">
      <div className="px-6 py-4 border-b border-gray-200">
        <h2 className="text-lg font-medium text-gray-900">Recent Orders</h2>
      </div>
      <ul role="list" className="divide-y divide-gray-200">
        {orders.map((order) => (
          <li key={order.id} className="px-6 py-4 hover:bg-gray-50">
            <Link href={`/app/orders/${order.id}`}>
              <div className="flex items-center justify-between">
                <div className="flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {order.orderNumber}
                  </p>
                  <p className="text-sm text-gray-500">{order.productName}</p>
                  <p className="text-xs text-gray-400 mt-1">
                    {formatDate(order.createdAt)}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${statusColors[order.status]}`}>
                    {order.status.replace('_', ' ')}
                  </span>
                  <p className="text-sm font-medium text-gray-900">
                    {formatCurrency(order.total, order.currency)}
                  </p>
                </div>
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {orders.length >= 5 && (
        <div className="px-6 py-3 border-t border-gray-200 text-center">
          <Link
            href="/app/orders"
            className="text-sm font-medium text-primary-600 hover:text-primary-500"
          >
            View all orders
          </Link>
        </div>
      )}
    </div>
  )
}
