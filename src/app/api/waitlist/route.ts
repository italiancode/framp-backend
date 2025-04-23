// app/api/waitlist/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

const resend = new Resend(process.env.RESEND_API_KEY!);

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { email, name, wallet, referral } = body;
    const headersList = await headers();

    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json(
        { error: "A valid email is required" },
        { status: 400 }
      );
    }

    const ip_address = headersList.get("x-forwarded-for") || null;
    const user_agent = headersList.get("user-agent") || null;

    const { data, error } = await supabase.from("waitlist").insert([
      {
        email,
        name: name || null,
        wallet: wallet || null,
        referral: referral || null,
        ip_address,
        user_agent,
        status: "pending",
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.error(error);
      return NextResponse.json(
        { error: "Failed to save waitlist data" },
        { status: 500 }
      );
    }

    // Send confirmation email
    try {
      const token = generateToken(email);
      const confirmUrl = `${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/api/confirm?token=${token}`;

      await resend.emails.send({
        from: "Framp <hello@framp.xyz>",
        // from: "Framp <noreply@framp.xyz>",
        to: email,
        subject: "Confirm your Framp waitlist signup",
        html: `<p>Hey${name ? ` ${name}` : ""}!</p>
              <p>Thanks for signing up for Framp. Please <a href="${confirmUrl}">click here to confirm</a> your email.</p>
              <p>Let's supercharge TradFi together!</p>`,
      });
    } catch (emailError) {
      console.error("Failed to send confirmation email", emailError);
      // Continue with success response even if email fails
    }

    return NextResponse.json({
      message: "Waitlist signup received. Please check your email!",
      success: true,
    });
  } catch (error) {
    console.error("Waitlist API error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
