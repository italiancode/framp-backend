import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    console.log("LOGIN API: Processing login request");
    
    // Parse request body
    const { email, password } = await request.json();

    // Validate required fields
    if (!email || !password) {
      console.log("LOGIN API: Missing required fields");
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    console.log(`LOGIN API: Attempting to sign in with email: ${email}`);
    
    // Initialize Supabase client
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    // Sign in with Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password
    });

    if (authError) {
      console.error("LOGIN API: Authentication error:", authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 401 }
      );
    }

    const { session, user } = authData;
    
    if (!session || !user) {
      console.error("LOGIN API: No session or user returned after successful authentication");
      return NextResponse.json(
        { error: 'Authentication failed' },
        { status: 401 }
      );
    }

    console.log(`LOGIN API: User authenticated successfully: ${user.id}`);
    
    // Initialize admin client for database operations
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!, 
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // Get user role from profiles table
    const { data: profileData, error: profileError } = await supabaseAdmin
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('LOGIN API: Error fetching user profile:', profileError);
    }

    console.log(`LOGIN API: User profile data:`, profileData);
    
    // Check if the profile exists, create if not
    if (!profileData) {
      console.log(`LOGIN API: No profile found for user ${user.id}, creating one`);
      
      const { error: insertError } = await supabaseAdmin
        .from('profiles')
        .insert([
          {
            id: user.id,
            email: user.email,
            role: 'user', // Default role
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
        
      if (insertError) {
        console.error('LOGIN API: Error creating profile:', insertError);
      } else {
        console.log('LOGIN API: Profile created successfully');
      }
    }
    
    // Get user data from users table
    const { data: userData, error: userError } = await supabaseAdmin
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('LOGIN API: Error fetching user data:', userError);
    }

    // Check if the user record exists, create if not
    if (!userData && user.email) {
      console.log(`LOGIN API: No user record found for user ${user.id}, creating one`);
      
      const { error: insertUserError } = await supabaseAdmin
        .from('users')
        .insert([
          {
            id: user.id,
            email: user.email,
            status: 'active',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ]);
        
      if (insertUserError) {
        console.error('LOGIN API: Error creating user record:', insertUserError);
      } else {
        console.log('LOGIN API: User record created successfully');
      }
    }

    console.log(`LOGIN API: Login successful for user ${user.id}`);

    const role = profileData?.role || 'user';
    console.log(`LOGIN API: User role: ${role}`);
    
    // Create a response that includes the user info
    const response = NextResponse.json({
      user: {
        id: user.id,
        email: user.email,
        role: role,
        profile: userData || null,
      }
    });
    
    // Set the auth cookie
    response.cookies.set({
      name: 'sb-access-token',
      value: session.access_token,
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    response.cookies.set({
      name: 'sb-refresh-token',
      value: session.refresh_token || '',
      path: '/',
      maxAge: 60 * 60 * 24 * 7, // 1 week
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
    });
    
    return response;
  } catch (error: any) {
    console.error('Unexpected error in /api/auth/login:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 