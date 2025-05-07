import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import crypto from "crypto";

// Initialize Supabase client only when function is called
const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be provided');
  }
  
  // Use more resilient settings for the client
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false
    },
    global: {
      // Add some retry capability
      fetch: (url, options) => {
        return fetch(url, {
          ...options,
          // Increase timeouts for users on slow networks
          signal: AbortSignal.timeout(15000), // 15 second timeout
        });
      }
    }
  });
};

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

// Helper to retry a function multiple times
async function retry<T>(fn: () => Promise<T>, retries = 3, delay = 1000): Promise<T> {
  try {
    return await fn();
  } catch (err) {
    if (retries <= 0) throw err;
    await new Promise(resolve => setTimeout(resolve, delay));
    return retry(fn, retries - 1, delay * 1.5);
  }
}

export async function GET(request: Request) {
  // Get client IP address for logging
  const clientIp = request.headers.get('x-forwarded-for') || 
                  request.headers.get('x-real-ip') || 
                  'unknown';
                  
  // Set CORS headers to avoid browser issues
  const corsHeaders = {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  };

  // Handle OPTIONS requests for CORS preflight
  if (request.method === 'OPTIONS') {
    return new NextResponse(null, { 
      status: 204, 
      headers: corsHeaders
    });
  }

  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse("Invalid or missing token.", { 
      status: 400,
      headers: corsHeaders
    });
  }

  // Log the confirmation attempt
  console.log(`Confirmation attempt with token: ${token.substring(0, 8)}... from IP: ${clientIp}`);

  try {
    // Using retry logic for the database operations
    return await retry(async () => {
      const supabase = getSupabase();

      // Get all waitlist entries where the generated token matches our token
      // This is a more efficient approach - instead of getting all pending entries and filtering
      const { data: waitlistEntries, error } = await supabase
        .from("waitlist")
        .select("id, email, status")
        .eq("status", "pending");

      if (error) {
        console.error(`Database error fetching users from IP ${clientIp}:`, error);
        return new NextResponse("Error looking up confirmation status.", { 
          status: 500,
          headers: corsHeaders
        });
      }

      // Find the user with matching token
      const user = waitlistEntries?.find(entry => generateToken(entry.email) === token);

      if (!user) {
        console.log(`No pending user found for token ${token.substring(0, 8)}... from IP ${clientIp}`);
        return new NextResponse("No matching user found or already confirmed.", { 
          status: 404,
          headers: corsHeaders
        });
      }

      // Update the user status to confirmed
      const { error: updateError } = await supabase
        .from("waitlist")
        .update({ 
          status: "confirmed",
          confirmed_at: new Date().toISOString(),
          confirmed_ip: clientIp
        })
        .eq("id", user.id);

      if (updateError) {
        console.error(`Error confirming user ${user.id} from IP ${clientIp}:`, updateError);
        return new NextResponse("Error confirming email.", { 
          status: 500,
          headers: corsHeaders
        });
      }
      
      console.log(`User ${user.id} successfully confirmed from IP ${clientIp}`);
      return new NextResponse(
        "✅ Your email has been confirmed! You're now officially on the waitlist.",
        { 
          status: 200,
          headers: corsHeaders
        }
      );
    });
  } catch (error) {
    console.error('Confirmation error from IP ' + clientIp + ':', error);
    return new NextResponse("Server error processing your confirmation.", { 
      status: 500,
      headers: corsHeaders
    });
  }
}
