import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { NextRequest, NextResponse } from 'next/server'

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get('code')
  const redirect = requestUrl.searchParams.get('redirect') || '/dashboard'
  
  if (code) {
    // Create Supabase client
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          async get(name: string) {
            const cookieStore = await cookies()
            const cookie = cookieStore.get(name)
            return cookie?.value
          },
          async set(name: string, value: string, options: any) {
            const cookieStore = await cookies()
            cookieStore.set({ name, value, ...options })
          },
          async remove(name: string, options: any) {
            const cookieStore = await cookies()
            cookieStore.set({ name, value: '', ...options })
          },
        },
      }
    )
    
    // Exchange the code for a session
    await supabase.auth.exchangeCodeForSession(code)
  }
  
  // URL to redirect to after sign in
  return NextResponse.redirect(new URL(redirect, requestUrl.origin))
} 