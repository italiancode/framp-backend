import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password, name, wallet_address } = await request.json();

    // Validate input
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create a new user in Supabase Auth
    const { data: authData, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email for now
    });

    if (authError) {
      console.error('Error creating user in Auth:', authError);
      return NextResponse.json(
        { error: authError.message },
        { status: 400 }
      );
    }

    // 1. Create entry in profiles table with default role 'user'
    const { error: profileError } = await supabase
      .from('profiles')
      .insert([
        {
          id: authData.user.id,
          email: email,
          role: 'user', // Default role
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (profileError) {
      console.error('Error creating user profile:', profileError);
      // If profile creation fails, delete the auth user to avoid orphaned records
      await supabase.auth.admin.deleteUser(authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user profile' },
        { status: 500 }
      );
    }

    // 2. Create entry in users table
    const { error: userError } = await supabase
      .from('users')
      .insert([
        {
          id: authData.user.id,
          name: name || null,
          email: email,
          wallet: wallet_address || null,
          status: 'active',
          ip_address: request.headers.get('x-forwarded-for') || null,
          user_agent: request.headers.get('user-agent') || null,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

    if (userError) {
      console.error('Error creating user record:', userError);
      // If user creation fails, delete the auth user and profile to avoid orphaned records
      await supabase.auth.admin.deleteUser(authData.user.id);
      await supabase.from('profiles').delete().eq('id', authData.user.id);
      return NextResponse.json(
        { error: 'Failed to create user record' },
        { status: 500 }
      );
    }

    // Sign in the user immediately after signup
    const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (signInError) {
      console.error('Error signing in after registration:', signInError);
      // Continue anyway - user can log in manually
    } else {
      // Set auth cookie in the response
      const response = NextResponse.json({
        message: 'Account created successfully',
        userId: authData.user.id,
        signedIn: true,
      }, { status: 201 });
      
      response.cookies.set({
        name: 'session',
        value: signInData.session.access_token,
        httpOnly: true,
        sameSite: 'strict',
        secure: process.env.NODE_ENV === 'production',
        maxAge: 60 * 60 * 24 * 7, // 1 week
        path: '/',
      });
      
      return response;
    }

    // Update waitlist status if applicable
    if (request.headers.get('x-from-waitlist')) {
      await supabase
        .from('waitlist')
        .update({ registered: true })
        .eq('email', email);
    }

    // Only return this if we didn't set cookies above
    return NextResponse.json(
      { 
        message: 'Account created successfully',
        userId: authData.user.id,
        signedIn: false,
      },
      { status: 201 }
    );
  } catch (error: any) {
    console.error('Unexpected error in signup:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 