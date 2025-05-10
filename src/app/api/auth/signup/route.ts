import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function POST(request: NextRequest) {
  try {
    const { email, password } = await request.json();

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

    // Store minimal user profile information in Supabase
    const { error: profileError } = await supabase
      .from('user_profiles')
      .insert([
        {
          user_id: authData.user.id,
          email: email,
          created_at: new Date().toISOString(),
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