import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { verifyToken } from './utils/verify-token';

const protectedRoutes = ['/Insight360']
const protectedSDRRoutes = "/api/sdr";

export async function middleware(req: NextRequest) {
  const cookie = await cookies()
  const token = cookie.get('access_token')?.value
  const pathname = req.nextUrl.pathname
  const response = NextResponse.next()

  if (protectedRoutes.includes(pathname) && !token) {
    const url = new URL('/Insight360/sign-in', req.url)
    return NextResponse.redirect(url)
  }

  if (!token || !verifyToken(token)) {
    return NextResponse.redirect(new URL("/Insight360/sign-in", req.url));
  }

  if (pathname === '/Insight360/sign-in' && token) {
    const url = new URL('/Insight360/create', req.url)
    return NextResponse.redirect(url)
  }

   if (pathname.startsWith(protectedSDRRoutes)) {
    const auth = req.headers.get("authorization");
    if (!auth || !auth.startsWith("Basic ")) {
      return new NextResponse(
        JSON.stringify({ error: "Autenticação necessária" }),
        {
          status: 401,
          headers: { "WWW-Authenticate": 'Basic realm="Restricted"' },
        }
      );
    }
    
    const base64Credentials = auth.split(" ")[1];
    const credentials = Buffer.from(base64Credentials, "base64").toString("utf-8");
    const [user, password] = credentials.split(":");
    if (user !== process.env.SDR_DB_USER || password !== process.env.SDR_DB_PASSWORD) {
      return new NextResponse(JSON.stringify({ error: "Usuário ou senha inválidos" }), {
        status: 401,
      });
    }
  }

  return response
}

export const config = {
  matcher: ['/Insight360', '/Insight360/sign-in', "/api/sdr/:path*"],
}
