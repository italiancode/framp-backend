import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log("AUTH-CHECK: Checking authentication status");
    
    // Initialize Supabase client with admin privileges for direct DB access
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Initialize Supabase Auth client with cookies
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        auth: {
          persistSession: false
        }
      }
    );
    
    // Get cookies to check
    const cookies: Record<string, string> = {};
    for (const [name, value] of request.cookies.entries()) {
      cookies[name] = value.value;
    }
    
    // Attempt to manually create a session from cookies
    let userId = null;
    let accessToken = cookies['sb-access-token'];
    
    if (accessToken) {
      try {
        // Set auth cookie manually
        const { data: sessionData, error: sessionError } = await supabase.auth.setSession({
          access_token: accessToken,
          refresh_token: cookies['sb-refresh-token'] || '',
        });
        
        if (!sessionError && sessionData?.session) {
          userId = sessionData.session.user.id;
        }
      } catch (err) {
        console.error("Error setting session from cookies:", err);
      }
    }
    
    // Return authentication status
    return NextResponse.json({
      authenticated: !!userId,
      userId: userId,
      cookies: {
        hasAccessToken: !!cookies['sb-access-token'],
        hasRefreshToken: !!cookies['sb-refresh-token'],
        cookiesList: Object.keys(cookies),
      }
    });
  } catch (error: any) {
    console.error('Unexpected error in auth check:', error);
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
} 