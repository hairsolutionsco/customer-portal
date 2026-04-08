import { NextRequest } from 'next/server'
import crypto from 'crypto'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse } from '@/lib/api-response'
import { z } from 'zod'

const forgotPasswordSchema = z.object({
  email: z.string().email('Invalid email address'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const parsed = forgotPasswordSchema.safeParse(body)

    if (!parsed.success) {
      return errorResponse('Invalid email address', 400)
    }

    const { email } = parsed.data

    // Always return success to prevent email enumeration
    const successMsg = 'If an account exists with that email, we have sent password reset instructions.'

    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })

    if (!user) {
      // Return success even if user not found (anti-enumeration)
      return successResponse({ message: successMsg })
    }

    // Delete any existing reset tokens for this email
    await prisma.passwordResetToken.deleteMany({
      where: { email: user.email },
    })

    // Generate secure token
    const token = crypto.randomBytes(32).toString('hex')
    const expires = new Date(Date.now() + 60 * 60 * 1000) // 1 hour

    await prisma.passwordResetToken.create({
      data: {
        email: user.email,
        token,
        expires,
      },
    })

    // In production, send email via configured SMTP
    // For now, log the reset link (dev only)
    if (process.env.NODE_ENV !== 'production') {
      const resetUrl = `${process.env.NEXTAUTH_URL || 'http://localhost:3000'}/reset-password?token=${token}`
      console.log(`[Password Reset] Link for ${email}: ${resetUrl}`)
    }

    // TODO: Send email with reset link when SMTP is configured
    // await sendPasswordResetEmail(user.email, token)

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: `user:${user.id}`,
        action: 'password_reset_requested',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return successResponse({ message: successMsg })
  } catch (error) {
    console.error('[ForgotPassword] Error:', error)
    return errorResponse('Internal server error', 500)
  }
}
