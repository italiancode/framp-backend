import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Check if required environment variables are available
if (!supabaseUrl || !supabaseServiceKey) {
  console.error("Missing required environment variables for Supabase");
}

// Create Supabase client only if environment variables are available
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function GET(request: Request) {
  try {
    // Verify Supabase client is initialized
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check server configuration." },
        { status: 500 }
      );
    }
    
    const { searchParams } = new URL(request.url);
    
    // Extract query parameters
    const status = searchParams.get("status");
    const search = searchParams.get("search");
    const sortField = searchParams.get("sortField") || "created_at";
    const sortOrder = searchParams.get("sortOrder") || "desc";
    const page = parseInt(searchParams.get("page") || "1");
    const pageSize = parseInt(searchParams.get("pageSize") || "50");
    
    // Start building the query
    let query = supabase.from("offramp_requests").select(`
      *,
      users (id, email, wallet_address)
    `);
    
    // Apply filters
    if (status && status !== "all") {
      query = query.eq("status", status);
    }
    
    if (search) {
      query = query.or(`
        users.email.ilike.%${search}%,
        users.wallet_address.ilike.%${search}%,
        bank_info->bank_name.ilike.%${search}%,
        bank_info->account_number.ilike.%${search}%
      `);
    }
    
    // Apply sorting
    query = query.order(sortField, { ascending: sortOrder === "asc" });
    
    // Apply pagination
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;
    query = query.range(from, to);
    
    // Execute the query
    const { data, error, count } = await query;
    
    if (error) {
      console.error("Error fetching offramp requests:", error);
      return NextResponse.json(
        { error: "Failed to fetch offramp requests" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      data,
      pagination: {
        page,
        pageSize,
        total: count
      }
    });
    
  } catch (error) {
    console.error("Error in offramp GET API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}

export async function PATCH(request: Request) {
  try {
    // Verify Supabase client is initialized
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check server configuration." },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { ids, status } = body;
    
    // Validate request body
    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "Invalid request: ids must be a non-empty array" },
        { status: 400 }
      );
    }
    
    if (!status || !["pending", "approved", "completed", "rejected"].includes(status)) {
      return NextResponse.json(
        { error: "Invalid request: status must be one of pending, approved, completed, or rejected" },
        { status: 400 }
      );
    }
    
    // Update the status of the specified offramp requests
    const { data, error } = await supabase
      .from("offramp_requests")
      .update({ 
        status: status,
        updated_at: new Date().toISOString()
      })
      .in("id", ids)
      .select();
    
    if (error) {
      console.error("Error updating offramp requests:", error);
      return NextResponse.json(
        { error: "Failed to update offramp requests" },
        { status: 500 }
      );
    }
    
    return NextResponse.json({
      message: `Successfully updated ${data?.length || 0} offramp requests`,
      data
    });
    
  } catch (error) {
    console.error("Error in offramp PATCH API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
} 