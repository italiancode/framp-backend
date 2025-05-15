import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("LOGOUT API: Processing logout request");
    
    // Create Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);

    // Sign out the user from Supabase
    await supabase.auth.signOut();
    
    // Create a response that clears all session cookies
    const response = NextResponse.json({ 
      success: true,
      message: 'Logged out successfully' 
    }, {
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
        'Pragma': 'no-cache',
        'Expires': '0',
      }
    });
    
    // Clear all possible session cookies
    const cookiesToClear = [
      'session',
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    });

    console.log("LOGOUT API: User logged out successfully, all cookies cleared");
    
    return response;
  } catch (error) {
    console.error("LOGOUT API: Error during logout:", error);
    
    // Still try to clear all cookies even if there was an error
    const response = NextResponse.json(
      { error: 'Logout failed, but cookies have been cleared' },
      { 
        status: 500,
        headers: {
          'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate',
          'Pragma': 'no-cache',
          'Expires': '0',
        }
      }
    );
    
    // Clear all possible session cookies
    const cookiesToClear = [
      'session',
      'sb-access-token',
      'sb-refresh-token',
      'supabase-auth-token',
    ];
    
    cookiesToClear.forEach(cookieName => {
      response.cookies.set({
        name: cookieName,
        value: '',
        path: '/',
        maxAge: 0,
        expires: new Date(0),
        sameSite: 'lax',
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
      });
    });
    
    return response;
  }
} 