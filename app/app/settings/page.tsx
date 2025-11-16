import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { SettingsTabs } from '@/components/settings/SettingsTabs'

export default async function SettingsPage() {
  const user = await requireAuth()

  const sessions = await prisma.session.findMany({
    where: { userId: user.id },
    orderBy: { lastActive: 'desc' },
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your account settings and preferences
        </p>
      </div>

      <SettingsTabs user={user} sessions={sessions} />
    </div>
  )
}
