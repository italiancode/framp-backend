// First load environment variables
require('dotenv').config();

// Import the Supabase client directly with require
const { createClient } = require("@supabase/supabase-js");

// Initialize Supabase client
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceRoleKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceRoleKey) {
  console.error("Error: Supabase URL or service role key is missing.");
  console.error("Make sure your environment variables are properly set:");
  console.error("- NEXT_PUBLIC_SUPABASE_URL");
  console.error("- NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY");
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceRoleKey);

// Admin user details
const ADMIN_EMAIL = "admin@framp.xyz";
const ADMIN_PASSWORD = "12345678";
const ADMIN_NAME = "Admin User";
const ADMIN_ID = "admin-user-id-12345"; // We'll use a predictable ID for easy reference

async function setupAdmin() {
  try {
    console.log("Setting up admin user...");
    
    // STEP 1: Create or get user in Supabase Auth
    console.log("Creating admin user in Auth...");
    let userId;
    
    // Try to create the user
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: ADMIN_EMAIL,
      password: ADMIN_PASSWORD,
      options: {
        emailRedirectTo: `${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/login`
      }
    });
    
    if (authError) {
      if (authError.message?.includes("already exists")) {
        console.log("User already exists in Auth. Getting user ID...");
        
        // Try to sign in to get the user ID
        const { data: signInData, error: signInError } = await supabase.auth.signInWithPassword({
          email: ADMIN_EMAIL,
          password: ADMIN_PASSWORD
        });
        
        if (signInError) {
          throw new Error(`Failed to sign in: ${signInError.message}`);
        }
        
        userId = signInData.user.id;
        console.log("Retrieved user ID from Auth:", userId);
      } else {
        throw authError;
      }
    } else {
      userId = authData.user.id;
      console.log("Created new user in Auth:", userId);
    }
    
    // STEP 2: Add or update record in the users table
    console.log("Adding admin to users table...");
    
    const { data: userData, error: userError } = await supabase
      .from("users")
      .upsert({
        id: userId, // Using the Auth user ID
        name: ADMIN_NAME,
        email: ADMIN_EMAIL,
        status: "active",
        ip_address: "127.0.0.1",
        user_agent: "Admin Script",
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'id'
      })
      .select();
    
    if (userError) {
      throw new Error(`Failed to create/update user: ${userError.message}`);
    }
    
    console.log("Admin user added to users table:", userData);
    
    // STEP 3: Generate SQL for creating the profiles table and adding admin role
    console.log("\n===========================================");
    console.log("SQL TO RUN IN SUPABASE SQL EDITOR FOR ADMIN ACCESS:");
    console.log("===========================================");
    console.log(`
-- Create the profiles table (for admin role)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id),
  email TEXT NOT NULL,
  role TEXT NOT NULL DEFAULT 'user',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc', now())
);

-- Add admin role to the user
INSERT INTO profiles (id, email, role)
VALUES ('${userId}', '${ADMIN_EMAIL}', 'admin')
ON CONFLICT (id) DO UPDATE SET role = 'admin';
    `);
    console.log("===========================================");
    
    console.log("\nAdmin user setup complete!");
    console.log("Email:", ADMIN_EMAIL);
    console.log("Password:", ADMIN_PASSWORD);
    console.log("User ID:", userId);
    console.log("\nRun the SQL above in the Supabase SQL editor to grant admin privileges.");
    
  } catch (error) {
    console.error("Error setting up admin user:", error);
  }
}

setupAdmin(); 