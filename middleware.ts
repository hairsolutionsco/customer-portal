import { withAuth } from 'next-auth/middleware'
import { NextResponse } from 'next/server'

export default withAuth(
  function middleware(request) {
    const response = NextResponse.next()

    // Security headers
    response.headers.set('X-Frame-Options', 'DENY')
    response.headers.set('X-Content-Type-Options', 'nosniff')
    response.headers.set('Referrer-Policy', 'origin-when-cross-origin')
    response.headers.set('X-XSS-Protection', '1; mode=block')
    response.headers.set(
      'Strict-Transport-Security',
      'max-age=63072000; includeSubDomains; preload'
    )
    response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()')

    return response
  },
  {
    callbacks: {
      authorized: ({ token, req }) => {
        // Public routes that don't require auth
        const publicPaths = ['/login', '/signup', '/forgot-password', '/api/auth', '/api/webhooks']
        const path = req.nextUrl.pathname

        if (publicPaths.some((p) => path.startsWith(p))) {
          return true
        }

        // Protected routes require a valid token
        return !!token
      },
    },
    pages: {
      signIn: '/login',
    },
  }
)

export const config = {
  matcher: [
    // Match all routes except static files and Next.js internals
    '/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)',
  ],
}
