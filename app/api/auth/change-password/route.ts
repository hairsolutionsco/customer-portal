import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, 'Current password is required'),
  newPassword: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()

    const parsed = changePasswordSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { currentPassword, newPassword } = parsed.data

    // Fetch user with password
    const dbUser = await prisma.user.findUnique({
      where: { id: user.id },
    })

    if (!dbUser?.password) {
      return errorResponse('Account not found', 400)
    }

    // Verify current password
    const isValid = await bcrypt.compare(currentPassword, dbUser.password)
    if (!isValid) {
      return errorResponse('Current password is incorrect', 400)
    }

    // Hash and save new password
    const hashedPassword = await bcrypt.hash(newPassword, 12)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword },
    })

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: `user:${user.id}`,
        action: 'password_changed',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return successResponse({ message: 'Password updated successfully' })
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    console.error('[ChangePassword] Error:', error)
    return errorResponse('Internal server error', 500)
  }
}
