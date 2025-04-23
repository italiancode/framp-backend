// pages/api/confirm.ts

import { createClient } from "@supabase/supabase-js";
import { NextApiRequest, NextApiResponse } from "next";
import crypto from "crypto";

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_SERVICE_ROLE_KEY!
);

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  const { token } = req.query;

  if (!token || typeof token !== "string") {
    return res.status(400).send("Invalid or missing token.");
  }

  // Fetch all pending emails to find match
  const { data: users, error } = await supabase
    .from("waitlist")
    .select("*")
    .eq("status", "pending");

  if (error || !users) {
    return res.status(500).send("Error looking up users.");
  }

  const user = users.find((user) => generateToken(user.email) === token);

  if (!user) {
    return res.status(404).send("No matching user found or already confirmed.");
  }

  const { error: updateError } = await supabase
    .from("waitlist")
    .update({ status: "confirmed" })
    .eq("id", user.id);

  if (updateError) {
    return res.status(500).send("Error confirming email.");
  }

  return res
    .status(200)
    .send(
      "✅ Your email has been confirmed! You’re now officially on the waitlist."
    );
}
