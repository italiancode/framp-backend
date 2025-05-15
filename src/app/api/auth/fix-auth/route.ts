import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import type { NextRequest } from 'next/server';

export async function GET(request: NextRequest) {
  try {
    console.log("FIX-AUTH: Starting auth repair process");
    const results: any = {
      success: true,
      usersChecked: 0,
      profilesFixed: 0,
      adminsCreated: 0,
      errors: []
    };
    
    // Initialize Supabase client with admin privileges
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
    const supabaseAdmin = createClient(
      supabaseUrl,
      process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
    );
    
    // 1. Get all authenticated users
    console.log("FIX-AUTH: Fetching all authenticated users");
    const { data: authUsers, error: authError } = await supabaseAdmin.auth.admin.listUsers();
    
    if (authError) {
      console.error("FIX-AUTH: Error fetching users:", authError);
      results.errors.push(`Failed to fetch users: ${authError.message}`);
      return NextResponse.json(results, { status: 500 });
    }
    
    const users = authUsers.users;
    results.usersChecked = users.length;
    console.log(`FIX-AUTH: Found ${users.length} users`);
    
    // 2. Get existing profiles
    const { data: existingProfiles, error: profilesError } = await supabaseAdmin
      .from('profiles')
      .select('id, role');
      
    if (profilesError) {
      console.error("FIX-AUTH: Error fetching profiles:", profilesError);
      results.errors.push(`Failed to fetch profiles: ${profilesError.message}`);
    }
    
    const profileMap = new Map();
    if (existingProfiles) {
      existingProfiles.forEach(profile => {
        profileMap.set(profile.id, profile);
      });
      console.log(`FIX-AUTH: Found ${existingProfiles.length} existing profiles`);
    }
    
    // 3. Process each user
    for (const user of users) {
      try {
        // Check if user has a profile
        if (!profileMap.has(user.id)) {
          console.log(`FIX-AUTH: Creating profile for user ${user.id} (${user.email})`);
          
          // Determine if this should be the first admin
          const isFirstUser = users.indexOf(user) === 0;
          const role = isFirstUser ? 'admin' : 'user';
          
          if (isFirstUser) {
            console.log(`FIX-AUTH: Setting first user ${user.email} as admin`);
            results.adminsCreated++;
          }
          
          // Create profile
          const { error: insertError } = await supabaseAdmin
            .from('profiles')
            .insert([
              {
                id: user.id,
                email: user.email,
                role: role,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              }
            ]);
            
          if (insertError) {
            console.error(`FIX-AUTH: Error creating profile for ${user.id}:`, insertError);
            results.errors.push(`Failed to create profile for ${user.email}: ${insertError.message}`);
          } else {
            results.profilesFixed++;
          }
        } else {
          console.log(`FIX-AUTH: User ${user.id} already has a profile`);
        }
        
        // Ensure user exists in the users table
        const { data: userData, error: userError } = await supabaseAdmin
          .from('users')
          .select('id')
          .eq('id', user.id)
          .single();
          
        if (userError && userError.code !== 'PGRST116') {
          console.log(`FIX-AUTH: User record missing for ${user.id}, creating it`);
          
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
            console.error(`FIX-AUTH: Error creating user record for ${user.id}:`, insertUserError);
            results.errors.push(`Failed to create user record for ${user.email}: ${insertUserError.message}`);
          }
        }
      } catch (userError) {
        console.error(`FIX-AUTH: Error processing user ${user.id}:`, userError);
        results.errors.push(`Error processing user ${user.email}`);
      }
    }
    
    console.log("FIX-AUTH: Auth repair process completed");
    return NextResponse.json(results);
  } catch (error: any) {
    console.error("FIX-AUTH: Unexpected error:", error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error during auth repair',
      message: error.message
    }, { status: 500 });
  }
} 