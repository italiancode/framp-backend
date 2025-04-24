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
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                color: #333;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
              }
              .email-container {
                max-width: 600px;
                margin: 0 auto;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border-radius: 6px;
                overflow: hidden;
                box-shadow: 0 2px 4px rgba(0, 0, 0, 0.06);
                background-color: #FFFFFF;
              }
              .email-header {
                width: 100%;
                padding: 0;
                margin: 0;
                line-height: 0;
                max-height: 120px;
                overflow: hidden;
                position: relative;
                display: flex;
                align-items: center;
                justify-content: center;
              }
              .email-header img {
                width: 100%;
                display: block;
                margin: 0;
                padding: 0;
                object-fit: cover;
                object-position: center;
                transform: scale(1.1);
              }
              .email-body {
                padding: 24px;
                background-color: #FFFFFF;
                color: #1F2937;
              }
              .button {
                display: inline-block;
                padding: 12px 24px;
                background-color: #3B82F6;
                color: white;
                text-decoration: none;
                border-radius: 4px;
                font-weight: 500;
                margin: 16px 0;
                font-size: 14px;
                border: none;
                text-align: center;
              }
              .highlight {
                color: #3B82F6;
                font-weight: bold;
              }
              h1 {
                font-size: 20px;
                margin-top: 0;
                margin-bottom: 16px;
                color: #111827;
                font-weight: 600;
              }
              p {
                margin-bottom: 16px;
                font-size: 14px;
                color: #4B5563;
              }
              .email-footer {
                background-color: #F9FAFB;
                padding: 16px;
                text-align: center;
                font-size: 12px;
                color: #6B7280;
                border-top: 1px solid #E5E7EB;
              }
              .link-box {
                background-color: #F3F4F6;
                padding: 8px;
                border-radius: 4px;
                font-size: 12px;
                word-break: break-all;
                color: #4B5563;
                margin-bottom: 16px;
                border: 1px solid #E5E7EB;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/framp_cover.jpg" alt="Framp" style="transform: scale(1.1);">
              </div>
              <div class="email-body">
                <h1>Welcome to Framp${name ? `, ${name}` : ''}</h1>
                <p>Thank you for joining our waitlist. We're building advanced financial tools to <span class="highlight">supercharge your investments</span>.</p>
                <p>Please confirm your spot on our waitlist:</p>
                <div style="text-align: center;">
                  <a href="${confirmUrl}" class="button">Confirm My Spot</a>
                </div>
                <p>Or copy this link:</p>
                <div class="link-box">${confirmUrl}</div>
                <p>The Framp Team</p>
              </div>
              <div class="email-footer">
                <p style="margin: 0;">${new Date().getFullYear()} Framp · All rights reserved</p>
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
