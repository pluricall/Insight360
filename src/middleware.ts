import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const TOKEN_KEY = 'access_token'
const protectedRoutes = ['/']

export async function middleware(request: NextRequest) {
  const cookie = await cookies()
  const token = cookie.get(TOKEN_KEY)
  const pathname = request.nextUrl.pathname
  const response = NextResponse.next()

  if (protectedRoutes.includes(pathname) && !token) {
    const url = new URL('/sign-in', request.url)
    return NextResponse.redirect(url)
  }

  if (pathname === '/sign-in' && token) {
    const url = new URL('/', request.url)
    return NextResponse.redirect(url)
  }

  return response
}

export const config = {
  matcher: ['/', '/sign-in'],
}
