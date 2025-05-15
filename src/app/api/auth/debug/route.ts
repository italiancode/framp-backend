import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log("DEBUG API: Starting diagnostics");
    const results: any = {};
    
    // 1. Check tables
    console.log("DEBUG API: Checking tables");
    try {
      const { data: tables, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
      
      results.tables = tables;
      results.tableError = error;
      console.log("DEBUG API: Tables:", tables);
    } catch (e) {
      console.error("DEBUG API: Error checking tables:", e);
      results.tablesException = e;
    }
    
    // 2. Check profiles table
    console.log("DEBUG API: Checking profiles table");
    try {
      const { data: profiles, error } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
      
      results.profiles = profiles;
      results.profilesError = error;
      console.log("DEBUG API: Profiles:", profiles);
    } catch (e) {
      console.error("DEBUG API: Error checking profiles:", e);
      results.profilesException = e;
    }
    
    // 3. Check users table
    console.log("DEBUG API: Checking users table");
    try {
      const { data: users, error } = await supabase
        .from('users')
        .select('*')
        .limit(10);
      
      results.users = users;
      results.usersError = error;
      console.log("DEBUG API: Users:", users);
    } catch (e) {
      console.error("DEBUG API: Error checking users:", e);
      results.usersException = e;
    }
    
    // 4. Check auth users
    console.log("DEBUG API: Checking auth users");
    try {
      const { data: authUsers, error } = await supabase.auth.admin.listUsers();
      
      results.authUsers = authUsers;
      results.authUsersError = error;
      console.log("DEBUG API: Auth Users:", authUsers);
    } catch (e) {
      console.error("DEBUG API: Error checking auth users:", e);
      results.authUsersException = e;
    }
    
    return NextResponse.json({
      message: 'Debug diagnostics completed',
      results
    });
  } catch (error: any) {
    console.error('Unexpected error in debug API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    const { action, userId, email, role } = await request.json();
    console.log(`DEBUG API: Performing action "${action}"`);
    
    if (action === "fix-profile") {
      // Create missing profile for user
      if (!userId) {
        return NextResponse.json(
          { error: 'userId is required' },
          { status: 400 }
        );
      }
      
      // 1. Check if profile exists
      const { data: existingProfile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
        
      if (existingProfile) {
        return NextResponse.json({
          message: 'Profile already exists',
          profile: existingProfile
        });
      }
      
      // 2. Create profile
      const { data: profile, error } = await supabase
        .from('profiles')
        .insert([
          {
            id: userId,
            email: email || 'unknown@example.com',
            role: role || 'user',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          }
        ])
        .select();
        
      if (error) {
        return NextResponse.json(
          { error: 'Failed to create profile', details: error },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        message: 'Profile created successfully',
        profile
      });
    }
    
    return NextResponse.json(
      { error: 'Unknown action' },
      { status: 400 }
    );
  } catch (error: any) {
    console.error('Unexpected error in debug API:', error);
    return NextResponse.json(
      { error: 'Internal server error', details: error.message },
      { status: 500 }
    );
  }
} 