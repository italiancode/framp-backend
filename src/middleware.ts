import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This middleware runs on admin routes to verify user is authenticated and has admin privileges
export async function middleware(request: NextRequest) {
  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        return request.cookies.get(name)?.value;
      },
      set() {
        // This is a read-only operation in middleware
      },
      remove() {
        // This is a read-only operation in middleware
      },
    },
  });
  
  try {
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError || !session) {
      // Redirect to login if no session is found
      const url = new URL("/login", request.url);
      url.searchParams.set("redirect", request.nextUrl.pathname);
      return NextResponse.redirect(url);
    }
    
    // Check if user has admin role by querying the profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    
    if (profileError || !profile || profile.role !== "admin") {
      // Redirect to home if user is not an admin
      return NextResponse.redirect(new URL("/", request.url));
    }
    
    // Allow the request to proceed
    return NextResponse.next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    // Redirect to login on any error
    const url = new URL("/login", request.url);
    url.searchParams.set("redirect", request.nextUrl.pathname);
    return NextResponse.redirect(url);
  }
}

// Only run this middleware on admin routes
export const config = {
  matcher: ["/admin/:path*"],
};
