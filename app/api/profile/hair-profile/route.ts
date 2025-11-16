import { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth-utils'
import { prisma } from '@/lib/prisma'
import { successResponse, errorResponse, unauthorizedResponse } from '@/lib/api-response'

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

    const hairProfile = await prisma.hairProfile.upsert({
      where: { userId: user.id },
      update: {
        headCircumference: body.headCircumference ? parseFloat(body.headCircumference) : null,
        frontToNape: body.frontToNape ? parseFloat(body.frontToNape) : null,
        earToEar: body.earToEar ? parseFloat(body.earToEar) : null,
        templeToTemple: body.templeToTemple ? parseFloat(body.templeToTemple) : null,
        preferredStyle: body.preferredStyle || null,
        density: body.density || null,
        hairColor: body.hairColor || null,
        baseType: body.baseType || null,
        attachmentMethod: body.attachmentMethod || null,
        activityLevel: body.activityLevel || null,
        sweatingLevel: body.sweatingLevel || null,
        workEnvironment: body.workEnvironment || null,
        sportsActivities: body.sportsActivities || [],
        notes: body.notes || null,
        onboardingCompleted: body.onboardingCompleted || false,
        updatedAt: new Date(),
      },
      create: {
        userId: user.id,
        headCircumference: body.headCircumference ? parseFloat(body.headCircumference) : null,
        frontToNape: body.frontToNape ? parseFloat(body.frontToNape) : null,
        earToEar: body.earToEar ? parseFloat(body.earToEar) : null,
        templeToTemple: body.templeToTemple ? parseFloat(body.templeToTemple) : null,
        preferredStyle: body.preferredStyle || null,
        density: body.density || null,
        hairColor: body.hairColor || null,
        baseType: body.baseType || null,
        attachmentMethod: body.attachmentMethod || null,
        activityLevel: body.activityLevel || null,
        sweatingLevel: body.sweatingLevel || null,
        workEnvironment: body.workEnvironment || null,
        sportsActivities: body.sportsActivities || [],
        notes: body.notes || null,
        onboardingCompleted: body.onboardingCompleted || false,
      },
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
