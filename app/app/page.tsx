import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { DashboardStats } from '@/components/dashboard/DashboardStats'
import { RecentOrders } from '@/components/dashboard/RecentOrders'
import { NextProductionAlert } from '@/components/dashboard/NextProductionAlert'
import { QuickActions } from '@/components/dashboard/QuickActions'

export default async function DashboardPage() {
  const user = await requireAuth()

  // Fetch dashboard data
  const [orders, hairProfile, customerPlan, nextProduction] = await Promise.all([
    prisma.order.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      take: 5,
      include: {
        invoices: true,
      },
    }),
    prisma.hairProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.customerPlan.findUnique({
      where: { userId: user.id },
      include: { plan: true },
    }),
    prisma.orderProductionSchedule.findFirst({
      where: {
        userId: user.id,
        scheduledProductionDate: {
          gte: new Date(),
        },
      },
      orderBy: { scheduledProductionDate: 'asc' },
      include: { order: true },
    }),
  ])

  const activeOrders = orders.filter(
    (o) => o.status !== 'DELIVERED' && o.status !== 'CANCELLED'
  )

  return (
    <div className="space-y-8">
      {/* Welcome */}
      <div>
        <h1 className="text-2xl font-bold text-gray-900">
          Welcome back, {user.name?.split(' ')[0] || 'there'}!
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          Here&apos;s what&apos;s happening with your hair systems
        </p>
      </div>

      {/* Stats */}
      <DashboardStats
        totalOrders={orders.length}
        activeOrders={activeOrders.length}
        profileComplete={hairProfile?.onboardingCompleted || false}
      />

      {/* Next production alert */}
      {nextProduction && (
        <NextProductionAlert production={nextProduction} />
      )}

      {/* Quick actions */}
      <QuickActions
        hasProfile={!!hairProfile}
        hasPlan={!!customerPlan}
      />

      {/* Recent orders */}
      <RecentOrders orders={orders} />
    </div>
  )
}
