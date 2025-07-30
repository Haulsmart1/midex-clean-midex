import { getToken } from 'next-auth/jwt';
import { NextResponse } from 'next/server';

export async function middleware(req) {
  const token = await getToken({ req, secret: process.env.NEXTAUTH_SECRET });
  const { pathname } = req.nextUrl;

  console.log('🧠 middleware token:', token);

  // ✅ Only redirect if token exists AND has a role
  if (pathname === '/login' && token?.role) {
    let redirectPath = '/';
    switch (token.role) {
      case 'super_admin':
        redirectPath = '/dashboard/super';
        break;
      case 'admin':
        redirectPath = '/dashboard/admin/dashboard';
        break;
      case 'forwarder':
        redirectPath = '/dashboard/forwarder';
        break;
      case 'user':
        redirectPath = '/dashboard/users';
        break;
    }
    return NextResponse.redirect(new URL(redirectPath, req.url));
  }

  // ✅ Block dashboard access if no session
  if (pathname.startsWith('/dashboard') && !token?.role) {
    return NextResponse.redirect(new URL('/login', req.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/login', '/dashboard/:path*'],
};
