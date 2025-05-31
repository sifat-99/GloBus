import { NextResponse } from 'next/server';
import { verifyToken } from './lib/authUtils'; // Adjusted path if lib is at root

const PUBLIC_PATHS = [
    '/', // Homepage
    '/login',
    '/register',
    '/api/auth/login',
    '/api/auth/register',
    '/api/auth/logout',
    // Assuming product listing and detail pages are public
    '/api/products', // API route for fetching products
    '/products', // Matches /products and /products/
];

// Define which roles can access which path prefixes
const ROLE_BASED_ROUTES_CONFIG = {
    '/admin': ['admin'],
    '/seller': ['seller'],
    '/dashboard': ['user'], // Standard user dashboard
};

export async function middleware(request) {
    const { pathname } = request.nextUrl;
    const sessionToken = request.cookies.get('session-token')?.value;

    // Allow Next.js specific paths, static assets, and public API routes needed before login
    if (pathname.startsWith('/_next/') || pathname.startsWith('/static/') || pathname.match(/\.(ico|png|jpg|jpeg|svg|json|css|js|woff2|map)$/i)) {
        return NextResponse.next();
    }

    // Check if the path is explicitly public
    const isPublicPath = PUBLIC_PATHS.some(p => pathname === p || (pathname.startsWith(p) && p !== '/')) || pathname.startsWith('/products/');

    if (isPublicPath) {
        return NextResponse.next();
    }

    const userPayload = await verifyToken(sessionToken);

    // If user is authenticated and tries to access login or register, redirect them
    if (userPayload) {
        if (pathname === '/login' || pathname === '/register') {
            let homePath = '/'; // Default redirect
            if (userPayload.role === 'admin') homePath = '/admin/dashboard';
            else if (userPayload.role === 'seller') homePath = '/seller/dashboard';
            else if (userPayload.role === 'user') homePath = '/dashboard';

            return NextResponse.redirect(new URL(homePath, request.url));
        }
    }


    if (!userPayload) {
        // Not authenticated, and trying to access a non-public route
        const loginUrl = new URL('/login', request.url);
        loginUrl.searchParams.set('redirectedFrom', pathname);
        return NextResponse.redirect(loginUrl);
    }

    // User is authenticated, check role-based access
    let authorizedForRoute = false;
    let matchedProtectedPath = false;

    // Sort keys by length, descending, to match most specific paths first
    const sortedPathPrefixes = Object.keys(ROLE_BASED_ROUTES_CONFIG)
        .sort((a, b) => b.length - a.length);

    for (const pathPrefix of sortedPathPrefixes) {
        if (pathname.startsWith(pathPrefix)) {
            matchedProtectedPath = true;
            const allowedRoles = ROLE_BASED_ROUTES_CONFIG[pathPrefix];
            if (allowedRoles.includes(userPayload.role)) {
                authorizedForRoute = true;
            }
            break; // Found the most specific rule for this path
        }
    }

    if (matchedProtectedPath) {
        if (authorizedForRoute) {
            return NextResponse.next(); // Authorized for this specific protected route
        } else {
            // Logged in, but role not allowed for this specific protected route
            console.warn(`Unauthorized access attempt to ${pathname} by user ${userPayload.email} (Role: ${userPayload.role})`);
            // Redirect to their respective "home" dashboard or an unauthorized page
            let unauthorizedRedirectPath = '/login'; // Fallback
            if (userPayload.role === 'admin') unauthorizedRedirectPath = '/admin';
            else if (userPayload.role === 'seller') unauthorizedRedirectPath = '/seller';
            else if (userPayload.role === 'user') unauthorizedRedirectPath = '/dashboard';

            const redirectUrl = new URL(unauthorizedRedirectPath, request.url);
            // Avoid redirecting to login if they are already on their base dashboard
            if (pathname.startsWith(unauthorizedRedirectPath) && unauthorizedRedirectPath !== '/login') {
                return NextResponse.next(); // Or show a specific "access denied component" within their layout
            }
            return NextResponse.redirect(redirectUrl);
        }
    }

    // If authenticated, but the path isn't explicitly public or covered by ROLE_BASED_ROUTES_CONFIG,
    // it's an authenticated route not yet specifically restricted. Allow access.
    return NextResponse.next();
}

export const config = {
    matcher: [
        // Apply middleware to all paths except for static files and image optimization
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
};
