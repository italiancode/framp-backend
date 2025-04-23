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
  
  return createClient(supabaseUrl, supabaseKey);
};

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get('token');

  if (!token) {
    return new NextResponse("Invalid or missing token.", { status: 400 });
  }

  // Fetch all pending emails to find match
  try {
    const supabase = getSupabase();
    const { data: users, error } = await supabase
      .from("waitlist")
      .select("*")
      .eq("status", "pending");

    if (error || !users) {
      return new NextResponse("Error looking up users.", { status: 500 });
    }

    const user = users.find((user) => generateToken(user.email) === token);

    if (!user) {
      return new NextResponse("No matching user found or already confirmed.", { status: 404 });
    }

    const { error: updateError } = await supabase
      .from("waitlist")
      .update({ status: "confirmed" })
      .eq("id", user.id);

    if (updateError) {
      return new NextResponse("Error confirming email.", { status: 500 });
    }
    
    return new NextResponse(
      "✅ Your email has been confirmed! You're now officially on the waitlist.",
      { status: 200 }
    );
  } catch (error) {
    console.error('Confirmation error:', error);
    return new NextResponse("Server error processing your confirmation.", { status: 500 });
  }
}
