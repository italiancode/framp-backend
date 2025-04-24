import { NextResponse } from "next/server";
import { Resend } from "resend";
import crypto from "crypto";
import { createClient } from "@supabase/supabase-js";
import { headers } from "next/headers";

// Initialize services only when function is called
const getResend = () => {
  const resendApiKey = process.env.RESEND_API_KEY;

  if (!resendApiKey) {
    throw new Error("Resend API key must be provided");
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
    throw new Error("Supabase URL and key must be provided");
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
              @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
              
              :root {
                --framp-dark: #1E1D2F;
                --framp-white: #F6F6F6;
                --framp-gray-100: #E5E7EB;
                --framp-gray-200: #D1D5DB;
                --framp-gray-300: #9CA3AF;
                --framp-primary: #6366F1;
              }
              
              body {
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                line-height: 1.6;
                margin: 0;
                padding: 0;
                background-color: #f9f9f9;
                color: var(--framp-dark);
              }
              
              .email-container {
                max-width: 600px;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border-radius: 16px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
                background-color: var(--framp-white);
                border: 1px solid var(--framp-gray-200);
              }
              
              .email-body {
                padding: 40px 30px;
                position: relative;
              }
              
              .defi-graphic {
                width: 100%;
                height: auto;
                border-radius: 12px;
                margin-bottom: 30px;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.07);
                border: 1px solid var(--framp-gray-200);
              }
              
              h1 {
                font-size: 28px;
                font-weight: 800;
                color: var(--framp-dark);
                margin-top: 0;
                margin-bottom: 20px;
                letter-spacing: -0.02em;
              }
              
              p {
                margin-bottom: 20px;
                font-size: 16px;
                color: #4B5563;
                line-height: 1.6;
              }
              
              .highlight {
                color: var(--framp-primary);
                font-weight: 600;
              }
              
              .button-container {
                text-align: center;
                margin: 35px 0;
              }
              
              .button {
                display: inline-block;
                background: var(--framp-primary);
                color: white;
                font-weight: 600;
                font-size: 16px;
                padding: 14px 32px;
                border-radius: 8px;
                text-decoration: none;
                transition: all 0.2s ease;
                box-shadow: 0 4px 6px rgba(99, 102, 241, 0.25);
                margin: 0 auto;
                text-transform: uppercase;
                letter-spacing: 0.03em;
              }
              
              .button:hover {
                background: #4F46E5; /* Darker shade */
                transform: translateY(-2px);
                box-shadow: 0 6px 10px rgba(99, 102, 241, 0.3);
                color: white; /* Ensuring text remains white on hover */
              }
              
              .divider {
                height: 1px;
                background-color: var(--framp-gray-200);
                margin: 30px 0;
              }
              
              .link-box {
                background-color: var(--framp-gray-100);
                padding: 16px;
                border-radius: 8px;
                font-size: 14px;
                word-break: break-all;
                color: #4B5563;
                margin-bottom: 24px;
                border: 1px solid var(--framp-gray-200);
                font-family: monospace;
              }
              
              .email-footer {
                background: var(--framp-dark);
                padding: 30px 24px;
                text-align: center;
                color: var(--framp-white);
              }
              
              .social-links {
                margin: 20px 0;
              }
              
              .social-link {
                display: inline-block;
                margin: 0 8px;
                color: var(--framp-gray-300);
                text-decoration: none;
                font-weight: 500;
                transition: color 0.2s ease;
              }
              
              .social-link:hover {
                color: white;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
             
              
              <div class="email-body">
                <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/framp_cover.jpg" alt="Framp DeFi" class="defi-graphic">
                
                <h1>Welcome to Framp${name ? `, ${name}` : ""}</h1>
                
                <p>Thank you for joining our waitlist. We're building the next generation of financial tools to <span class="highlight">supercharge TradFi</span>.</p>
                
                 <p>To confirm your spot on our waitlist, please click the button below:</p>
                
                <div class="button-container">
                  <a href="${confirmUrl}" class="button">CONFIRM MY SPOT</a>
                </div>
                
                <div class="divider"></div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="link-box">${confirmUrl}</div>
                
                <p>We're excited to have you on board!</p>
                
                <p><strong>The Framp Team</strong></p>
                
                
              </div>
              
              <div class="email-footer">
                <p style="margin: 0 0 10px 0;">© ${new Date().getFullYear()} Framp · All rights reserved</p>
                <div class="social-links">
                  <a href="#" class="social-link">Twitter</a>
                  <a href="#" class="social-link">Discord</a>
                  <a href="#" class="social-link">Telegram</a>
                  <a href="#" class="social-link">Medium</a>
                </div>
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
