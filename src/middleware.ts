import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { createServerClient } from '@supabase/ssr';

// This middleware runs on protected routes to verify user is authenticated
export async function middleware(request: NextRequest) {
  console.log(`Middleware running for path: ${request.nextUrl.pathname}`);
  
  // Create a Supabase client
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || "";
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || "";
  
  // Initialize Supabase client with cookies
  const supabase = createServerClient(supabaseUrl, supabaseKey, {
    cookies: {
      get(name: string) {
        const cookie = request.cookies.get(name)?.value;
        console.log(`Cookie ${name}: ${cookie ? 'exists' : 'missing'}`);
        return cookie;
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
    // Check if any auth cookies exist
    const accessToken = request.cookies.get('sb-access-token')?.value;
    if (!accessToken) {
      console.log("No access token cookie found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Get the current session
    const { data, error } = await supabase.auth.getSession();
    
    // Log full response for debugging
    console.log("Session check response:", { 
      hasSession: !!data.session, 
      hasError: !!error,
      error: error?.message
    });
    
    // If no session is found, redirect to login
    if (error || !data.session) {
      console.log("No valid session found, redirecting to login");
      return NextResponse.redirect(new URL("/login", request.url));
    }
    
    // Admin page specific check
    if (request.nextUrl.pathname.startsWith('/admin')) {
      console.log("Admin path detected, checking admin privileges");
      
      try {
        // Check if user has admin role by querying the profiles table
        const { data: profile, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.session.user.id)
          .single();
        
        console.log("Profile check:", { profile, error: profileError?.message });
        
        // If not admin, redirect to dashboard
        if (profileError || !profile || profile.role !== "admin") {
          console.log("User is not an admin, redirecting to dashboard");
          return NextResponse.redirect(new URL("/dashboard", request.url));
        }
        
        console.log("Admin access granted");
      } catch (err) {
        console.error("Error checking admin role:", err);
        return NextResponse.redirect(new URL("/dashboard", request.url));
      }
    }
    
    // Allow the request to proceed
    console.log("Request authorized, proceeding");
    return NextResponse.next();
  } catch (err) {
    console.error("Auth middleware error:", err);
    // Redirect to login on any error
    return NextResponse.redirect(new URL("/login", request.url));
  }
}

// Run this middleware on all protected routes
export const config = {
  matcher: [
    "/admin/:path*",
    "/dashboard/:path*",
    "/dashboard"
  ],
};
