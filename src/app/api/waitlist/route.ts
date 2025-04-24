import { NextResponse } from "next/server"
import { Resend } from "resend"
import crypto from "crypto"
import { createClient } from "@supabase/supabase-js"
import { headers } from "next/headers"

// Initialize services only when function is called
const getResend = () => {
  const resendApiKey = process.env.RESEND_API_KEY

  if (!resendApiKey) {
    throw new Error("Resend API key must be provided")
  }

  return new Resend(resendApiKey)
}

function generateToken(email: string) {
  return crypto.createHash("sha256").update(email).digest("hex")
}

const getSupabase = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseKey) {
    throw new Error("Supabase URL and key must be provided")
  }

  return createClient(supabaseUrl, supabaseKey)
}

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { email, name, wallet, referral } = body
    const headersList = await headers()

    // Input validation
    if (!email || typeof email !== "string" || !email.includes("@")) {
      return NextResponse.json({ error: "A valid email is required" }, { status: 400 })
    }

    const ip_address = headersList.get("x-forwarded-for") || null
    const user_agent = headersList.get("user-agent") || null

    const supabase = getSupabase()
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
    ])

    if (error) {
      console.error(error)
      return NextResponse.json({ error: "Failed to save waitlist data" }, { status: 500 })
    }

    // Send confirmation email
    try {
      const token = generateToken(email)
      const confirmUrl = `${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/api/confirm?token=${token}`

      const resend = getResend()
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
                margin: 0 auto;
                font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
                border-radius: 8px;
                overflow: hidden;
                box-shadow: 0 4px 6px rgba(0, 0, 0, 0.05);
                background-color: var(--framp-white);
              }
              
              .email-header {
                background-color: var(--framp-dark);
                padding: 32px 24px;
                text-align: center;
              }
              
              .logo {
                width: 180px;
                margin: 0 auto;
              }
              
              .email-body {
                padding: 32px 24px;
                background-color: var(--framp-white);
                color: var(--framp-dark);
              }
              
              .button {
                display: inline-block;
                padding: 14px 28px;
                background-color: var(--framp-dark);
                color: var(--framp-white);
                text-decoration: none;
                border-radius: 6px;
                font-weight: 600;
                margin: 24px 0;
                font-size: 16px;
                border: none;
                text-align: center;
                letter-spacing: 0.01em;
                transition: all 0.2s ease;
              }
              
              .button:hover {
                background-color: #2a2942;
              }
              
              .highlight {
                color: var(--framp-dark);
                font-weight: 700;
              }
              
              h1 {
                font-size: 24px;
                margin-top: 0;
                margin-bottom: 16px;
                color: var(--framp-dark);
                font-weight: 700;
                letter-spacing: -0.01em;
              }
              
              p {
                margin-bottom: 16px;
                font-size: 16px;
                color: var(--framp-dark);
                line-height: 1.6;
              }
              
              .email-footer {
                background-color: var(--framp-dark);
                padding: 24px;
                text-align: center;
                font-size: 14px;
                color: var(--framp-white);
              }
              
              .link-box {
                background-color: rgba(30, 29, 47, 0.05);
                padding: 12px;
                border-radius: 6px;
                font-size: 14px;
                word-break: break-all;
                color: var(--framp-dark);
                margin-bottom: 24px;
                border: 1px solid rgba(30, 29, 47, 0.1);
                font-family: monospace;
              }
              
              .tagline {
                font-size: 14px;
                color: var(--framp-gray-300);
                margin-top: 8px;
                letter-spacing: 0.05em;
              }
              
              .divider {
                height: 1px;
                background-color: rgba(30, 29, 47, 0.1);
                margin: 24px 0;
              }
              
              .cover-image {
                width: 100%;
                height: auto;
                margin-bottom: 24px;
                border-radius: 6px;
                overflow: hidden;
              }
              
              .social-links {
                margin-top: 16px;
              }
              
              .social-link {
                display: inline-block;
                margin: 0 8px;
                color: var(--framp-white);
                text-decoration: none;
                font-weight: 500;
              }
            </style>
          </head>
          <body>
            <div class="email-container">
              <div class="email-header">
                <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/logo.svg" alt="Framp" class="logo">
                <div class="tagline">▼ RAMP ▼ PAY ▼ SAVE</div>
              </div>
              
              <div class="email-body">
                <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/framp_cover.jpg" alt="Framp" class="cover-image">
                
                <h1>Welcome to Framp${name ? `, ${name}` : ""}</h1>
                
                <p>Thank you for joining our waitlist. We're building advanced financial tools to <span class="highlight">supercharge your investments</span> and help you achieve your financial goals.</p>
                
                <div style="text-align: center;">
                  <a href="${confirmUrl}" class="button">CONFIRM MY SPOT</a>
                </div>
                
                <div class="divider"></div>
                
                <p>If the button doesn't work, copy and paste this link into your browser:</p>
                <div class="link-box">${confirmUrl}</div>
                
                <p>We're excited to have you on board and can't wait to share our platform with you soon.</p>
                
                <p>The Framp Team</p>
              </div>
              
              <div class="email-footer">
                <p style="margin: 0;">© ${new Date().getFullYear()} Framp · All rights reserved</p>
                <div class="social-links">
                  <a href="#" class="social-link">Twitter</a>
                  <a href="#" class="social-link">LinkedIn</a>
                  <a href="#" class="social-link">Discord</a>
                </div>
              </div>
            </div>
          </body>
          </html>
        `,
      })
    } catch (emailError) {
      console.error("Failed to send confirmation email", emailError)
      // Continue with success response even if email fails
    }

    return NextResponse.json({
      message: "Waitlist signup received. Please check your email!",
      success: true,
    })
  } catch (error) {
    console.error("Waitlist API error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
