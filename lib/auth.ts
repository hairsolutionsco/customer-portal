import type { NextAuthOptions } from 'next-auth'
import CredentialsProvider from 'next-auth/providers/credentials'
import { PrismaAdapter } from '@next-auth/prisma-adapter'
import { prisma } from './prisma'
import bcrypt from 'bcryptjs'
import { UserRole } from '@prisma/client'

export const authOptions: NextAuthOptions = {
  adapter: PrismaAdapter(prisma),
  session: {
    strategy: 'jwt',
    maxAge: 14 * 24 * 60 * 60, // 14 days
  },
  pages: {
    signIn: '/login',
    signOut: '/login',
    error: '/login',
  },
  providers: [
    CredentialsProvider({
      name: 'credentials',
      credentials: {
        email: { label: 'Email', type: 'email' },
        password: { label: 'Password', type: 'password' },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          throw new Error('Invalid credentials')
        }

        const user = await prisma.user.findUnique({
          where: { email: credentials.email },
        })

        if (!user || !user.password) {
          throw new Error('Invalid credentials')
        }

        const isPasswordValid = await bcrypt.compare(
          credentials.password,
          user.password
        )

        if (!isPasswordValid) {
          throw new Error('Invalid credentials')
        }

        // Create audit log
        await prisma.auditLog.create({
          data: {
            userId: user.id,
            actor: `user:${user.id}`,
            action: 'login',
            entityType: 'User',
            entityId: user.id,
          },
        })

        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role,
          emailVerified: user.emailVerified,
        }
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, trigger, session }) {
      if (user) {
        token.id = user.id
        token.role = user.role
        if (typeof user.email === 'string') token.email = user.email
        if (typeof user.name === 'string' || user.name === null) token.name = user.name
      }

      // Update session data
      if (trigger === 'update' && session) {
        if (typeof session.name === 'string' || session.name === null) {
          token.name = session.name
        }
        if (typeof session.email === 'string') {
          token.email = session.email
        }
      }

      return token
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id
        session.user.role = token.role
        session.user.email =
          typeof token.email === 'string' ? token.email : session.user.email ?? ''
        if (token.name !== undefined) session.user.name = token.name
      }
      return session
    },
  },
  events: {
    async signOut({ token }) {
      // Create audit log
      if (token?.id) {
        await prisma.auditLog.create({
          data: {
            userId: token.id as string,
            actor: `user:${token.id}`,
            action: 'logout',
            entityType: 'User',
            entityId: token.id as string,
          },
        })
      }
    },
  },
}
