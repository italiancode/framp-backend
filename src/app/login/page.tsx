'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeClosed, Key, Lock, Mail, Users } from 'lucide-react'
import Image from 'next/image'
import React, { useState, Suspense } from 'react'
import { BsTelephone } from 'react-icons/bs'
import { FaEyeSlash } from 'react-icons/fa'
import { GiEyeShield } from 'react-icons/gi'
import { GrGoogle } from 'react-icons/gr'
import { HiDesktopComputer } from 'react-icons/hi'
import { BackgroundElements } from '@/components/ui/BackgroundElements'
import Layout from '@/components/layout/Layout'
import { createBrowserClient } from '@supabase/ssr'
import { useRouter, useSearchParams } from 'next/navigation'

// Create a component that uses useSearchParams
function LoginForm() {
  const [showPassword, setShowPassword] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  
  const router = useRouter()
  const searchParams = useSearchParams()
  const redirectPath = searchParams.get('redirect') || '/dashboard'
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
  
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })
      
      if (error) {
        throw error
      }
      
      // Check if user is an admin when trying to access admin routes
      if (redirectPath.startsWith('/admin')) {
        const { data: profileData, error: profileError } = await supabase
          .from('profiles')
          .select('role')
          .eq('id', data.user.id)
          .single()
          
        if (profileError || !profileData || profileData.role !== 'admin') {
          setError('You do not have permission to access the admin area')
          await supabase.auth.signOut()
          setIsLoading(false)
          return
        }
      }
      
      // Successful login, redirect
      router.push(redirectPath)
      router.refresh()
    } catch (error: any) {
      setError(error.message || 'Failed to sign in')
    } finally {
      setIsLoading(false)
    }
  }
  
  const handleGoogleSignIn = async () => {
    setError(null)
    setIsLoading(true)
    
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: `${window.location.origin}/auth/callback?redirect=${redirectPath}`
        }
      })
      
      if (error) {
        throw error
      }
    } catch (error: any) {
      setError(error.message || 'Failed to sign in with Google')
      setIsLoading(false)
    }
  }
  
  return (
    <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
      <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-2">Sign In</h1>
      <p className="text-center text-black/60 dark:text-white/60 mb-6">
        Welcome back to Framp
      </p>

      {error && (
        <div className="mb-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
          {error}
        </div>
      )}

      <form onSubmit={handleSignIn} className="space-y-4">
        <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
          <Mail className='w-[18px] h-[21px]' />
          <Input
            type='email'
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
          />
        </div>
        
        <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
          <Lock className='w-[18px] h-[21px]' />
          <Input
            type={showPassword ? 'text' : 'password'}
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
          />
          <button type="button" onClick={() => setShowPassword(!showPassword)}> 
            {showPassword ? <Eye className='w-[18px] h-[21px] text-black dark:text-white' /> : <FaEyeSlash className='w-[18px] h-[21px] text-black dark:text-white' />}
          </button>
        </div>

        <div className="flex justify-end">
          <a href="#" className="text-sm text-[#7b77b9] hover:underline">Forgot password?</a>
        </div>

        <Button 
          type="submit" 
          disabled={isLoading}
          className='w-full !py-6 bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium'
        >
          {isLoading ? 'Signing In...' : 'Sign In'}
        </Button>
      </form>
        
      <Button 
        onClick={handleGoogleSignIn}
        disabled={isLoading}
        className='w-full !py-6 mt-4 bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium flex items-center justify-center gap-2'
      >
        <Image src="/images/google.svg" alt="Google" width={20} height={20} />
        Sign in with Google
      </Button>
      
      <p className="text-center text-sm text-black/60 dark:text-white/60 mt-4">
        Don't have an account? <a href="/waitlist" className="text-[#7b77b9] hover:underline">Join Waitlist</a>
      </p>
    </div>
  )
}

// Loading fallback for suspense
function LoadingForm() {
  return (
    <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
      <div className="animate-pulse space-y-4">
        <div className="h-8 bg-black/10 dark:bg-white/10 rounded w-3/4 mx-auto"></div>
        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-2/3 mx-auto"></div>
        <div className="h-12 bg-black/10 dark:bg-white/10 rounded"></div>
        <div className="h-12 bg-black/10 dark:bg-white/10 rounded"></div>
        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-1/3 ml-auto"></div>
        <div className="h-12 bg-black/10 dark:bg-white/10 rounded"></div>
        <div className="h-12 bg-black/10 dark:bg-white/10 rounded"></div>
        <div className="h-4 bg-black/10 dark:bg-white/10 rounded w-2/3 mx-auto"></div>
      </div>
    </div>
  )
}

export default function LoginPage() {
  return (
    <Layout>
      <section className="py-16 min-h-[90vh] relative bg-white dark:bg-background/90">
        <BackgroundElements />
        
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <Suspense fallback={<LoadingForm />}>
              <LoginForm />
            </Suspense>
          </div>
        </div>
      </section>
    </Layout>
  )
}
