import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { initiateFlutterwaveTransfer } from "@/lib/fiat/transfer";

// Initialize Supabase client with admin privileges
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

// Create Supabase client with admin privileges
const supabase = supabaseUrl && supabaseServiceKey 
  ? createClient(supabaseUrl, supabaseServiceKey)
  : null;

export async function POST(request: Request) {
  try {
    // Verify Supabase client is initialized
    if (!supabase) {
      return NextResponse.json(
        { error: "Supabase client not initialized. Check server configuration." },
        { status: 500 }
      );
    }
    
    const body = await request.json();
    const { requestId, adminNote } = body;
    
    if (!requestId) {
      return NextResponse.json(
        { error: "Missing request ID" },
        { status: 400 }
      );
    }

    // Get the off-ramp request
    const { data: offrampRequest, error: fetchError } = await supabase
      .from("offramp_requests")
      .select("*")
      .eq("id", requestId)
      .single();
      
    if (fetchError || !offrampRequest) {
      console.error("Error fetching offramp request:", fetchError);
      return NextResponse.json(
        { error: "Failed to fetch offramp request" },
        { status: 500 }
      );
    }
    
    // Check that the request is in a valid state to be approved
    if (offrampRequest.status !== "pending" && offrampRequest.status !== "processing") {
      return NextResponse.json(
        { error: `Cannot approve request with status: ${offrampRequest.status}` },
        { status: 400 }
      );
    }
    
    // Initiate the fiat transfer
    try {
      const transferResponse = await initiateFlutterwaveTransfer({
        amount: offrampRequest.fiat_amount,
        account_number: offrampRequest.bank_account_number,
        bank_code: offrampRequest.bank_code,
        currency: "NGN", // Using NGN as default currency for now
        narration: `FRAMP off-ramp payment for ${offrampRequest.wallet}`
      });
      
      if (!transferResponse || !transferResponse.data) {
        throw new Error("Failed to initiate transfer");
      }
      
      // Update the offramp request
      const { error: updateError } = await supabase
        .from("offramp_requests")
        .update({
          status: "approved",
          fiat_disbursement_status: "disbursed",
          disbursed_at: new Date().toISOString(),
          payout_reference: transferResponse.data.reference,
          admin_note: adminNote || `Approved and disbursed on ${new Date().toISOString()}`
        })
        .eq("id", requestId);
        
      if (updateError) {
        console.error("Error updating offramp request:", updateError);
        return NextResponse.json(
          { error: "Failed to update offramp request status" },
          { status: 500 }
        );
      }
      
      return NextResponse.json({
        success: true,
        message: "Off-ramp request approved and payout initiated",
        transferReference: transferResponse.data.reference,
        transferDetails: transferResponse.data
      });
      
    } catch (transferError) {
      console.error("Error initiating transfer:", transferError);
      
      // Update the request to reflect the error
      await supabase
        .from("offramp_requests")
        .update({
          admin_note: `Transfer failed: ${(transferError as Error).message}`
        })
        .eq("id", requestId);
        
      return NextResponse.json(
        { error: "Failed to initiate transfer", details: (transferError as Error).message },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error("Error in offramp approval API:", error);
    return NextResponse.json(
      { error: "An unexpected error occurred", details: (error as Error).message },
      { status: 500 }
    );
  }
} 