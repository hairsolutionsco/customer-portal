import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { formatCurrency, formatDate } from '@/lib/utils'
import Link from 'next/link'

export default async function BillingPage() {
  const user = await requireAuth()

  const [customerPlan, plans] = await Promise.all([
    prisma.customerPlan.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    }),
    prisma.subscriptionPlan.findMany({
      where: { isActive: true },
      orderBy: { displayOrder: 'asc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Plans & Billing</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your subscription and payment methods
        </p>
      </div>

      {/* Current Plan */}
      {customerPlan ? (
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-lg font-medium text-gray-900 mb-4">Current Plan</h2>
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-bold text-gray-900">{customerPlan.plan.name}</h3>
              <p className="text-2xl font-bold text-primary-600 mt-2">
                {formatCurrency(customerPlan.plan.price, customerPlan.plan.currency)}
                <span className="text-sm text-gray-500 font-normal">
                  /{customerPlan.plan.interval}
                </span>
              </p>
              <p className="mt-2 text-sm text-gray-500">
                Next billing date: {formatDate(customerPlan.currentPeriodEnd)}
              </p>
            </div>
            <Link
              href="/app/billing/manage"
              className="px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
            >
              Manage
            </Link>
          </div>
        </div>
      ) : (
        <div className="bg-primary-50 border-l-4 border-primary-600 p-4 rounded-r-lg">
          <p className="text-sm text-primary-700">
            You don&apos;t have an active subscription. Choose a plan below to get started.
          </p>
        </div>
      )}

      {/* Available Plans */}
      <div>
        <h2 className="text-lg font-medium text-gray-900 mb-4">
          {customerPlan ? 'Change Plan' : 'Choose a Plan'}
        </h2>
        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {plans.map((plan) => (
            <div
              key={plan.id}
              className={`bg-white shadow rounded-lg p-6 ${
                customerPlan?.planId === plan.id ? 'ring-2 ring-primary-600' : ''
              }`}
            >
              <h3 className="text-lg font-medium text-gray-900">{plan.name}</h3>
              <p className="mt-2 text-3xl font-bold text-gray-900">
                {formatCurrency(plan.price, plan.currency)}
                <span className="text-sm text-gray-500 font-normal">/{plan.interval}</span>
              </p>
              {plan.description && (
                <p className="mt-2 text-sm text-gray-500">{plan.description}</p>
              )}
              <ul className="mt-4 space-y-2">
                {(plan.features as string[]).map((feature, index) => (
                  <li key={index} className="text-sm text-gray-600 flex items-start">
                    <svg className="h-5 w-5 text-green-500 mr-2 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    {feature}
                  </li>
                ))}
              </ul>
              <button
                className={`mt-6 w-full px-4 py-2 rounded-md text-sm font-medium ${
                  customerPlan?.planId === plan.id
                    ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                    : 'bg-primary-600 text-white hover:bg-primary-700'
                }`}
                disabled={customerPlan?.planId === plan.id}
              >
                {customerPlan?.planId === plan.id ? 'Current Plan' : 'Select Plan'}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Payment Methods */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-lg font-medium text-gray-900 mb-4">Payment Methods</h2>
        <p className="text-sm text-gray-500 mb-4">
          Manage your payment methods for subscriptions and orders
        </p>
        <button className="px-4 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 text-sm font-medium">
          Add Payment Method
        </button>
      </div>
    </div>
  )
}
