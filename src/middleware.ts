import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function middleware(request: NextRequest) {
  // Paths that don't require authentication
  const publicPaths = [
    '/',
    '/login',
    '/signup',
    '/waitlist',
    '/api/auth/login',
    '/api/auth/signup',
    '/api/waitlist',
  ];

  const isPublicPath = publicPaths.some(path => request.nextUrl.pathname.startsWith(path));
  const isApiPath = request.nextUrl.pathname.startsWith('/api/');
  
  // If the path is public, allow access
  if (isPublicPath) {
    return NextResponse.next();
  }

  // Get token from cookie
  const session = request.cookies.get('session')?.value;

  // If there's no session and the path requires auth
  if (!session) {
    // Redirect API requests to 401 response
    if (isApiPath) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }
    
    // Redirect browser requests to login page
    return NextResponse.redirect(new URL('/login', request.url));
  }

  // Verify the token with Supabase
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { data, error } = await supabase.auth.getUser(session);

    if (error || !data.user) {
      // Invalid or expired token, clear the cookie
      const response = isApiPath
        ? NextResponse.json({ error: 'Invalid session' }, { status: 401 })
        : NextResponse.redirect(new URL('/login', request.url));
      
      response.cookies.delete('session');
      return response;
    }

    // User is authenticated, proceed
    return NextResponse.next();
  } catch (error) {
    console.error('Auth middleware error:', error);
    
    // Handle errors by clearing session and redirecting
    const response = isApiPath
      ? NextResponse.json({ error: 'Authentication error' }, { status: 500 })
      : NextResponse.redirect(new URL('/login', request.url));
    
    response.cookies.delete('session');
    return response;
  }
}

// Specify which routes this middleware should run on
export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|frampapplogo.webp|.*\\.png$|.*\\.jpg$|.*\\.svg$).*)',
  ],
};
