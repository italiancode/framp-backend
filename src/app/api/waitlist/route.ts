// app/api/waitlist/route.ts

import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Initialize services only when function is called
const getResend = () => {
  const resendApiKey = process.env.RESEND_API_KEY;
  
  if (!resendApiKey) {
    throw new Error('Resend API key must be provided');
  }
  
  return new Resend(resendApiKey);
};

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex");
}

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('Supabase URL and key must be provided');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

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

    const supabase = getSupabase();
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

      const resend = getResend();
      await resend.emails.send({
        from: "Framp <hello@framp.xyz>",
        // from: "Framp <noreply@framp.xyz>",
        to: email,
        subject: "Confirm your Framp waitlist signup",
        html: `
          <!DOCTYPE html>
          <html>
          <head>
            <meta charset="utf-8">
            <meta name="viewport" content="width=device-width, initial-scale=1">
            <title>Confirm your Framp waitlist signup</title>
            <style>
              body {
                font-family: 'Helvetica Neue', Arial, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
              }
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
              }
              .email-header {
                width: 100%;
                padding: 0;
                margin: 0;
                line-height: 0;
              }
              .email-header img {
                width: 100%;
                display: block;
                margin: 0;
                padding: 0;
              }
              .email-body {
                padding: 30px;
                background-color: #ffffff;
              }
              .email-footer {
                background-color: #f4f4f7;
                padding: 20px;
                text-align: center;
                font-size: 12px;
                color: #71717a;
              }
              h1 {
                color: #111827;
                font-size: 24px;
                margin-top: 0;
                margin-bottom: 20px;
              }
              p {
                margin-bottom: 20px;
                color: #4b5563;
              }
              .button {
                display: inline-block;
                background-color: #4F46E5;
                color: #ffffff !important;
                text-decoration: none;
                padding: 12px 30px;
                border-radius: 6px;
                font-weight: 600;
                margin: 20px 0;
                text-align: center;
                transition: background-color 0.3s;
              }
              .button:hover {
                background-color: #4338CA;
              }
              .highlight {
                color: #4F46E5;
                font-weight: bold;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/framp_cover.jpg" alt="Framp">
              </div>
              <div class="email-body">
                <h1>Welcome to Framp${name ? `, ${name}` : ''}!</h1>
                <p>Thank you for joining our waitlist. We're building the next generation of financial tools to <span class="highlight">supercharge TradFi</span>.</p>
                <p>To confirm your spot on our waitlist, please click the button below:</p>
                <div style="text-align: center;">
                  <a href="${confirmUrl}" class="button">Confirm My Spot</a>
                </div>
                <p>If the button doesn't work, you can also copy and paste this link into your browser:</p>
                <p style="font-size: 13px; word-break: break-all; background-color: #f9fafb; padding: 10px; border-radius: 4px;">${confirmUrl}</p>
                <p>We're excited to have you on board!</p>
                <p>Best regards,<br>The Framp Team</p>
              </div>
              <div class="email-footer">
                <p> ${new Date().getFullYear()} Framp. All rights reserved.</p>
                <p>If you didn't sign up for Framp, please ignore this email.</p>
              </div>
            </div>
          </body>
          </html>
        `,
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
