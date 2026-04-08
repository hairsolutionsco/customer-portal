import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const updateProfileSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
})

export async function PATCH(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()

    const parsed = updateProfileSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { name } = parsed.data

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { name },
      select: { id: true, name: true, email: true },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: `user:${user.id}`,
        action: 'profile_updated',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return successResponse(updated)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    console.error('[Profile] Error:', error)
    return errorResponse('Internal server error', 500)
  }
}
