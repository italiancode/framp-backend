// app/api/offramp/request/route.ts

import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(supabaseUrl, supabaseKey);
};

export async function POST(request: Request) {
  const body = await request.json();
  const { wallet, token, amount, bankName, accountNumber, accountName } = body;

  if (!wallet || !token || !amount || !bankName || !accountNumber) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const supabase = getSupabase();
  const { data, error } = await supabase.from("offramp_requests").insert([
    {
      wallet,
      token,
      amount,
      bank_name: bankName,
      account_number: accountNumber,
      account_name: accountName || null,
      status: "pending",
      created_at: new Date().toISOString(),
    },
  ]);

  if (error) {
    console.error("Insert error:", error);
    return NextResponse.json({ error: "Failed to log offramp request" }, { status: 500 });
  }

  return NextResponse.json({ message: "Offramp request received", data }, { status: 200 });
}
