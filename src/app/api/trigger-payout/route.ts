import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { initiateFlutterwaveTransfer } from "@/lib/fiat/transfer";

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { request_id } = body;

  // 1. Fetch the offramp request
  const { data, error } = await supabase
    .from("offramp_requests")
    .select("*")
    .eq("id", request_id)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: "Request not found." }, { status: 404 });
  }

  if (data.fiat_disbursement_status === "success") {
    return NextResponse.json({ error: "Already disbursed." }, { status: 400 });
  }

  try {
    // 2. Trigger transfer via Flutterwave
    const transfer = await initiateFlutterwaveTransfer({
      amount: data.fiat_amount,
      account_number: data.bank_account_number,
      bank_code: data.bank_code,
      currency: "NGN",
      narration: "Framp Offramp",
    });

    if (transfer.status === "success") {
      // 3. Update status
      await supabase
        .from("offramp_requests")
        .update({
          fiat_disbursement_status: "success",
          disbursed_at: new Date().toISOString(),
          payout_reference: transfer.reference,
        })
        .eq("id", request_id);
    } else {
      // If Flutterwave transfer fails, update with error status and log
      await supabase
        .from("offramp_requests")
        .update({
          fiat_disbursement_status: "failed",
          admin_note: "Transfer failed. Please check Flutterwave response.",
        })
        .eq("id", request_id);

      return NextResponse.json({ error: "Transfer failed. Please check Flutterwave response." }, { status: 500 });
    }

    return NextResponse.json({ success: true, reference: transfer.reference });
  } catch (e: any) {
    // Catch any unexpected error and update the request status
    await supabase
      .from("offramp_requests")
      .update({
        fiat_disbursement_status: "failed",
        admin_note: e.message || "Unexpected error occurred.",
      })
      .eq("id", request_id);

    return NextResponse.json({ error: e.message || "Unexpected error occurred." }, { status: 500 });
  }
}
