import { NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import bcrypt from 'bcryptjs'
import { successResponse, errorResponse } from '@/lib/api-response'
import { UserRole } from '@prisma/client'
import { z } from 'zod'

const signupSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100, 'Name too long'),
  email: z.string().email('Invalid email address'),
  password: z
    .string()
    .min(8, 'Password must be at least 8 characters')
    .regex(/[A-Z]/, 'Password must contain at least one uppercase letter')
    .regex(/[a-z]/, 'Password must contain at least one lowercase letter')
    .regex(/[0-9]/, 'Password must contain at least one number'),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const parsed = signupSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const { name, email, password } = parsed.data
    const normalizedEmail = email.toLowerCase()

    // Check if user already exists
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
    })

    if (existingUser) {
      // Generic message to reduce enumeration risk
      return errorResponse('Unable to create account. Please try again or use a different email.', 400)
    }

    // Hash password (12 rounds per OWASP recommendation)
    const hashedPassword = await bcrypt.hash(password, 12)

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email: normalizedEmail,
        password: hashedPassword,
        role: UserRole.CUSTOMER,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
      },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: `user:${user.id}`,
        action: 'signup',
        entityType: 'User',
        entityId: user.id,
      },
    })

    return successResponse(user, 201)
  } catch (error) {
    console.error('[Signup] Error:', error)
    return errorResponse('Internal server error', 500)
  }
}
