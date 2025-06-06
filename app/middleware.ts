// middleware.ts
import { NextRequest, NextResponse } from 'next/server';

export function middleware(req: NextRequest) {
    const token = req.cookies.get('session')?.value;
    const { pathname } = req.nextUrl;

    const isAuthPage = pathname === '/admin/login';

    if (!token && !isAuthPage) {
        return NextResponse.redirect(new URL('/admin/login', req.url));
    }

    if (token && isAuthPage) {
        return NextResponse.redirect(new URL('/admin/dashboard', req.url));
    }

    return NextResponse.next();
}

export const config = {
    matcher: ['/admin/dashboard/:path*', '/admin/login'],
};
