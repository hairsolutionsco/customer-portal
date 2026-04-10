import { ShoppingBagIcon, CheckCircleIcon, UserCircleIcon } from '@heroicons/react/24/outline'

interface DashboardStatsProps {
  totalOrders: number
  activeOrders: number
  profileComplete: boolean
}

export function DashboardStats({ totalOrders, activeOrders, profileComplete }: DashboardStatsProps) {
  const stats = [
    {
      name: 'Total Orders',
      value: totalOrders,
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
    },
    {
      name: 'Active Orders',
      value: activeOrders,
      icon: CheckCircleIcon,
      color: 'bg-green-500',
    },
    {
      name: 'Profile',
      value: profileComplete ? 'Complete' : 'Incomplete',
      icon: UserCircleIcon,
      color: profileComplete ? 'bg-green-500' : 'bg-yellow-500',
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3">
      {stats.map((stat) => (
        <div
          key={stat.name}
          className="relative overflow-hidden rounded-lg bg-white px-4 py-5 shadow sm:px-6"
        >
          <dt>
            <div className={`absolute rounded-md ${stat.color} p-3`}>
              <stat.icon className="h-6 w-6 text-white" aria-hidden="true" />
            </div>
            <p className="ml-16 truncate text-sm font-medium text-gray-500">{stat.name}</p>
          </dt>
          <dd className="ml-16 flex items-baseline">
            <p className="text-2xl font-semibold text-gray-900">{stat.value}</p>
          </dd>
        </div>
      ))}
    </div>
  )
}
