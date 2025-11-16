import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { CustomizationTemplates } from '@/components/customization/CustomizationTemplates'

export default async function CustomizationPage() {
  const user = await requireAuth()

  const [hairProfile, templates] = await Promise.all([
    prisma.hairProfile.findUnique({
      where: { userId: user.id },
    }),
    prisma.customizationTemplate.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    }),
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900">Hair System Customization</h1>
        <p className="mt-1 text-sm text-gray-500">
          Manage your customization templates and create new orders
        </p>
      </div>

      {!hairProfile?.onboardingCompleted && (
        <div className="bg-yellow-50 border-l-4 border-yellow-400 p-4 rounded-r-lg">
          <p className="text-sm text-yellow-700">
            Please{' '}
            <a href="/app/profile-setup" className="font-medium underline">
              complete your hair profile
            </a>{' '}
            first to create customization templates.
          </p>
        </div>
      )}

      <CustomizationTemplates
        templates={templates}
        hairProfile={hairProfile}
        userId={user.id}
      />
    </div>
  )
}
