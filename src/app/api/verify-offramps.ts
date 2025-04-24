// pages/api/verify-offramps.ts
import type { NextApiRequest, NextApiResponse } from "next";
import { createClient } from "@supabase/supabase-js";
import { checkSolPayment } from "@/utils/solana";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY! // Backend role needed to update
);

const FRAMP_RECEIVE_WALLET = process.env.FRAMP_RECEIVE_WALLET!; // Your treasury

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { data: requests, error } = await supabase
    .from("offramp_requests")
    .select("*")
    .eq("status", "pending");

  if (error) {
    console.error("Failed to fetch pending requests:", error);
    return res.status(500).json({ error: "Supabase fetch error" });
  }

  const confirmed: string[] = [];

  for (const req of requests) {
    const amountSol = req.token === "SOL" ? req.amount : 0;
    // You can add check for USDC in the future

    const success = await checkSolPayment({
      userWallet: req.wallet,
      toWallet: FRAMP_RECEIVE_WALLET,
      amountSol,
    });

    if (success) {
      await supabase
        .from("offramp_requests")
        .update({ status: "confirmed" })
        .eq("id", req.id);
      confirmed.push(req.id);
    }
  }

  return res.status(200).json({
    message: "Verification complete",
    confirmedRequests: confirmed,
  });
}
