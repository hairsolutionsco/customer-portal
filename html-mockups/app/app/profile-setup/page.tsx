import { requireAuth } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { HairProfileForm } from '@/components/profile/HairProfileForm'

export default async function ProfileSetupPage() {
  const user = await requireAuth()

  const hairProfile = await prisma.hairProfile.findUnique({
    where: { userId: user.id },
  })

  return (
    <div className="max-w-3xl">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-gray-900">
          {hairProfile?.onboardingCompleted ? 'Hair Profile' : 'Complete Your Hair Profile'}
        </h1>
        <p className="mt-1 text-sm text-gray-500">
          {hairProfile?.onboardingCompleted
            ? 'Update your measurements and preferences'
            : 'Help us create the perfect hair system for you'
          }
        </p>
      </div>

      <HairProfileForm initialData={hairProfile} userId={user.id} />
    </div>
  )
}
