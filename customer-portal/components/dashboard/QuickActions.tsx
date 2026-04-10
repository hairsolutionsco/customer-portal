import Link from 'next/link'
import {
  ShoppingBagIcon,
  UserCircleIcon,
  ChatBubbleLeftRightIcon,
  CreditCardIcon,
} from '@heroicons/react/24/outline'

interface QuickActionsProps {
  hasProfile: boolean
  hasPlan: boolean
}

export function QuickActions({ hasProfile, hasPlan }: QuickActionsProps) {
  const actions = [
    {
      name: 'Quick Reorder',
      description: 'Reorder with your saved configuration',
      href: '/app/customization?reorder=true',
      icon: ShoppingBagIcon,
      color: 'bg-blue-500',
      enabled: hasProfile,
    },
    {
      name: hasProfile ? 'Update Profile' : 'Complete Profile',
      description: hasProfile ? 'Update your hair profile' : 'Set up your hair profile',
      href: '/app/profile-setup',
      icon: UserCircleIcon,
      color: hasProfile ? 'bg-green-500' : 'bg-yellow-500',
      enabled: true,
    },
    {
      name: 'Contact Support',
      description: 'Get help from our team',
      href: '/app/support',
      icon: ChatBubbleLeftRightIcon,
      color: 'bg-purple-500',
      enabled: true,
    },
    {
      name: hasPlan ? 'Manage Plan' : 'Choose a Plan',
      description: hasPlan ? 'View and manage your subscription' : 'Subscribe for regular deliveries',
      href: '/app/billing',
      icon: CreditCardIcon,
      color: 'bg-green-500',
      enabled: true,
    },
  ]

  return (
    <div>
      <h2 className="text-lg font-medium text-gray-900 mb-4">Quick Actions</h2>
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {actions.map((action) => (
          <Link
            key={action.name}
            href={action.href}
            className={`relative group bg-white p-6 rounded-lg shadow hover:shadow-md transition-shadow ${
              !action.enabled ? 'opacity-50 cursor-not-allowed' : ''
            }`}
          >
            <div>
              <span className={`inline-flex p-3 ${action.color} rounded-lg`}>
                <action.icon className="h-6 w-6 text-white" aria-hidden="true" />
              </span>
            </div>
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-900">{action.name}</h3>
              <p className="mt-1 text-xs text-gray-500">{action.description}</p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  )
}
