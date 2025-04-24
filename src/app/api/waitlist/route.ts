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
        html: `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Confirm your Framp waitlist signup</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
    
    body {
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      line-height: 1.6;
      margin: 0;
      padding: 0;
      background-color: #f9f9f9;
      color: #1E1D2F;
    }
    
    .email-container {
      max-width: 600px;
      font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
      border-radius: 16px;
      overflow: hidden;
      background-color: #F6F6F6;
      border: 1px solid #D1D5DB;
    }
    
    .email-body {
      padding: 30px;
      position: relative;
    }
    
    .defi-graphic {
      width: 100%;
      height: 200px; /* Reduced height */
      object-fit: cover; /* Show full image content from center */
      object-position: center; /* Center the image */
      border-radius: 12px;
      margin-bottom: 20px;
      border: 1px solid #D1D5DB;
    }
    
    h1 {
      font-size: 24px;
      font-weight: 700;
      margin-top: 0;
      margin-bottom: 16px;
    }
    
    p {
      margin-bottom: 16px;
      font-size: 16px;
      color: #4B5563;
    }
    
    .button-container {
      text-align: center;
      margin: 24px 0;
    }
    
    .button {
      display: inline-block;
      background: #6366F1;
      color: white;
      font-weight: 600;
      font-size: 16px;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      text-transform: uppercase;
      letter-spacing: 0.03em;
    }
    
    .divider {
      height: 1px;
      background-color: #D1D5DB;
      margin: 24px 0;
    }
    
    .link-box {
      background-color: #E5E7EB;
      padding: 12px;
      border-radius: 8px;
      font-size: 14px;
      word-break: break-all;
      color: #4B5563;
      margin-bottom: 20px;
      border: 1px solid #D1D5DB;
      font-family: monospace;
    }
    
    .email-footer {
      background: #1E1D2F;
      padding: 24px;
      text-align: center;
      color: #F6F6F6;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-link {
      display: inline-block;
      margin: 0 8px;
      color: #9CA3AF;
      text-decoration: none;
      font-weight: 500;
    }
  </style>
</head>
<body>
  <div class="email-container">
    <div class="email-body">
      <img src="${process.env.NEXT_PUBLIC_FRAMP_BASE_URL}/framp_cover.jpg" alt="Framp DeFi" class="defi-graphic">
      
      <h1>Welcome to Framp${name ? `, ${name}` : ""}</h1>
      
      <p>Thank you for joining our waitlist. We're building the next generation of financial tools to supercharge TradFi.</p>
      
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
