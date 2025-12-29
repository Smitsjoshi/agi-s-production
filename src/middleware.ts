import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
    // We can't verify Firebase Auth server-side easily without admin SDK or cookie session.
    // For this client-side auth implementation, we'll rely on client-side redirects in SessionProvider
    // OR we can implement a basic check if we set a cookie on login.

    // However, since the user requested "real login" and the structure suggests client-side auth state,
    // the most robust way without complex edge config is to let the client handle the comprehensive protection
    // via the SessionProvider which we already updated.

    // BUT, to prevent flashing content, we can do a simple check for a session cookie if we were setting one.
    // Given we are using pure client-side firebase SDK, we might not have a session cookie available to middleware easily.

    // STRATEGY CHANGE: 
    // Instead of complex edge middleware validation which requires cookies, 
    // we will rely on the SessionProvider to push users to /login if they are null.
    // Middleware here will just pass through or handle basic public paths.

    return NextResponse.next();
}

export const config = {
    matcher: [
        /*
         * Match all request paths except for the ones starting with:
         * - api (API routes)
         * - _next/static (static files)
         * - _next/image (image optimization files)
         * - favicon.ico (favicon file)
         * - login (login page)
         * - signup (signup page)
         */
        '/((?!api|_next/static|_next/image|favicon.ico|login|signup).*)',
    ],
};
