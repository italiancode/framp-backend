import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { cookies } from 'next/headers';
import type { NextRequest } from 'next/server';

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!;
const supabase = createClient(supabaseUrl, supabaseServiceKey);

export async function GET(request: NextRequest) {
  try {
    console.log("ME API: Checking user session");
    
    // Get session token from cookie
    const sessionToken = request.cookies.get('session')?.value;

    if (!sessionToken) {
      console.log("ME API: No session token found in cookies");
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      );
    }

    console.log("ME API: Session token found, verifying with Supabase");
    
    // Verify the token with Supabase
    const { data: { user }, error } = await supabase.auth.getUser(sessionToken);

    if (error || !user) {
      console.log("ME API: Invalid session token or user not found", error);
      return NextResponse.json(
        { error: 'Invalid session' },
        { status: 401 }
      );
    }

    console.log(`ME API: User verified: ${user.id}, ${user.email}`);
    
    // 1. Fetch role from profiles table
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single();

    if (profileError && profileError.code !== 'PGRST116') {
      console.error('ME API: Error fetching user profile:', profileError);
    }

    console.log(`ME API: Profile data:`, profileData);
    
    // 2. Fetch user data from users table
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single();

    if (userError && userError.code !== 'PGRST116') {
      console.error('ME API: Error fetching user data:', userError);
    }

    console.log(`ME API: User data:`, userData);
    
    // Prepare the response with complete user info
    const userInfo = {
      id: user.id,
      email: user.email,
      role: profileData?.role || 'user',
      profile: userData || null,
    };
    
    console.log(`ME API: Returning user with role: ${userInfo.role}`);
    
    // Add logging to examine database directly
    console.log("ME API: Running direct database check");

    // Add this debugging code to directly query the database
    try {
      // Direct test query of the profiles table to check structure
      const { data: allProfiles, error: profileQueryError } = await supabase
        .from('profiles')
        .select('*')
        .limit(10);
        
      console.log("DATABASE CHECK - All profiles:", allProfiles, "Error:", profileQueryError);
      
      // Check if any tables exist
      const { data: tableList, error: tableError } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', 'public');
        
      console.log("DATABASE CHECK - Tables:", tableList, "Error:", tableError);
    } catch (dbError) {
      console.error("DATABASE CHECK - Error:", dbError);
    }

    return NextResponse.json({
      user: userInfo,
    });
  } catch (error: any) {
    console.error('Unexpected error in /api/auth/me:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 