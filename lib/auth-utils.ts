import { getServerSession } from 'next-auth'
import { authOptions } from './auth'
import { UserRole } from '@prisma/client'
import { redirect } from 'next/navigation'

/**
 * Get the current authenticated user from the session
 * Throws error if user is not authenticated
 */
export async function getCurrentUser() {
  const session = await getServerSession(authOptions)

  if (!session?.user) {
    throw new Error('Unauthorized')
  }

  return session.user
}

/**
 * Get the current user or return null if not authenticated
 */
export async function getCurrentUserOrNull() {
  const session = await getServerSession(authOptions)
  return session?.user ?? null
}

/**
 * Require authentication - redirect to login if not authenticated
 */
export async function requireAuth() {
  const user = await getCurrentUserOrNull()

  if (!user) {
    redirect('/login')
  }

  return user
}

/**
 * Require specific role(s)
 */
export async function requireRole(roles: UserRole | UserRole[]) {
  const user = await getCurrentUser()

  const allowedRoles = Array.isArray(roles) ? roles : [roles]

  if (!allowedRoles.includes(user.role)) {
    throw new Error('Forbidden: Insufficient permissions')
  }

  return user
}

/**
 * Require customer role (default user role)
 */
export async function requireCustomer() {
  return requireRole(UserRole.CUSTOMER)
}

/**
 * Require admin role
 */
export async function requireAdmin() {
  return requireRole(UserRole.ADMIN)
}

/**
 * Require support or admin role
 */
export async function requireSupport() {
  return requireRole([UserRole.SUPPORT, UserRole.ADMIN])
}

/**
 * Check if user has role
 */
export function hasRole(userRole: UserRole, allowedRoles: UserRole | UserRole[]) {
  const roles = Array.isArray(allowedRoles) ? allowedRoles : [allowedRoles]
  return roles.includes(userRole)
}

/**
 * Check if user is admin
 */
export function isAdmin(userRole: UserRole) {
  return userRole === UserRole.ADMIN
}

/**
 * Check if user is support or admin
 */
export function isSupportOrAdmin(userRole: UserRole) {
  return userRole === UserRole.SUPPORT || userRole === UserRole.ADMIN
}
