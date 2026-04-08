import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'
import { z } from 'zod'

const VALID_DENSITIES = ['Light', 'Medium', 'Heavy'] as const
const VALID_BASE_TYPES = ['Lace', 'Swiss Lace', 'French Lace', 'Skin', 'Mono', 'Silk'] as const
const VALID_ATTACHMENT_METHODS = ['Tape', 'Glue', 'Clips', 'Combination'] as const
const VALID_ACTIVITY_LEVELS = ['Low', 'Moderate', 'High'] as const
const VALID_SWEATING_LEVELS = ['Low', 'Moderate', 'High'] as const

const hairProfileSchema = z.object({
  headCircumference: z.union([z.number().min(30).max(80), z.string().transform(Number), z.null()]).optional(),
  frontToNape: z.union([z.number().min(10).max(60), z.string().transform(Number), z.null()]).optional(),
  earToEar: z.union([z.number().min(10).max(60), z.string().transform(Number), z.null()]).optional(),
  templeToTemple: z.union([z.number().min(10).max(60), z.string().transform(Number), z.null()]).optional(),
  preferredStyle: z.string().max(100).optional().nullable(),
  density: z.enum(VALID_DENSITIES).optional().nullable(),
  hairColor: z.string().max(100).optional().nullable(),
  baseType: z.enum(VALID_BASE_TYPES).optional().nullable(),
  attachmentMethod: z.enum(VALID_ATTACHMENT_METHODS).optional().nullable(),
  activityLevel: z.enum(VALID_ACTIVITY_LEVELS).optional().nullable(),
  sweatingLevel: z.enum(VALID_SWEATING_LEVELS).optional().nullable(),
  workEnvironment: z.string().max(200).optional().nullable(),
  sportsActivities: z.array(z.string().max(100)).max(20).optional(),
  notes: z.string().max(2000).optional().nullable(),
  onboardingCompleted: z.boolean().optional(),
})

export async function GET() {
  try {
    const user = await getCurrentUser()

    const hairProfile = await prisma.hairProfile.findUnique({
      where: { userId: user.id },
    })

    return successResponse(hairProfile)
  } catch (error) {
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Internal server error', 500)
  }
}

export async function POST(request: NextRequest) {
  try {
    const user = await getCurrentUser()
    const body = await request.json()

    const parsed = hairProfileSchema.safeParse(body)
    if (!parsed.success) {
      return errorResponse(parsed.error.errors[0].message, 400)
    }

    const data = parsed.data

    const profileData = {
      headCircumference: data.headCircumference != null ? Number(data.headCircumference) : null,
      frontToNape: data.frontToNape != null ? Number(data.frontToNape) : null,
      earToEar: data.earToEar != null ? Number(data.earToEar) : null,
      templeToTemple: data.templeToTemple != null ? Number(data.templeToTemple) : null,
      preferredStyle: data.preferredStyle || null,
      density: data.density || null,
      hairColor: data.hairColor || null,
      baseType: data.baseType || null,
      attachmentMethod: data.attachmentMethod || null,
      activityLevel: data.activityLevel || null,
      sweatingLevel: data.sweatingLevel || null,
      workEnvironment: data.workEnvironment || null,
      sportsActivities: data.sportsActivities || [],
      notes: data.notes || null,
      onboardingCompleted: data.onboardingCompleted || false,
    }

    const hairProfile = await prisma.hairProfile.upsert({
      where: { userId: user.id },
      update: { ...profileData, updatedAt: new Date() },
      create: { userId: user.id, ...profileData },
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        userId: user.id,
        actor: `user:${user.id}`,
        action: 'updated',
        entityType: 'HairProfile',
        entityId: hairProfile.id,
      },
    })

    return successResponse(hairProfile)
  } catch (error) {
    console.error('[HairProfile] Error:', error)
    if (error instanceof Error && error.message === 'Unauthorized') {
      return unauthorizedResponse()
    }
    return errorResponse('Internal server error', 500)
  }
}
