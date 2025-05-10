'use client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Eye, EyeClosed, Key, Lock, Mail, Users } from 'lucide-react'
import Image from 'next/image'
import React, { useState } from 'react'
import { BsTelephone } from 'react-icons/bs'
import { FaEyeSlash } from 'react-icons/fa'
import { GiEyeShield } from 'react-icons/gi'
import { GrGoogle } from 'react-icons/gr'
import { HiDesktopComputer } from 'react-icons/hi'
import { BackgroundElements } from '@/components/ui/BackgroundElements'
import Layout from '@/components/layout/Layout'

export default function LoginPage() {
  const [showPassword, setShowPassword ] = useState(false)
  
  return (
    <Layout>
      <section className="py-16 min-h-[90vh] relative bg-white dark:bg-background/90">
        <BackgroundElements />
        
        <div className="container mx-auto px-4">
          <div className="max-w-md mx-auto">
            <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
              <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-2">Sign In</h1>
              <p className="text-center text-black/60 dark:text-white/60 mb-6">
                Welcome back to Framp
              </p>

              <div className="space-y-4">
                <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
                  <Mail className='w-[18px] h-[21px]' />
                  <Input
                    type='email'
                    placeholder="Email"
                    className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
                  />
                </div>
                
                <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
                  <Lock className='w-[18px] h-[21px]' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
                  />
                  <button onClick={() => setShowPassword(!showPassword)}> 
                    { showPassword ? <Eye className='w-[18px] h-[21px] text-black dark:text-white' /> : <FaEyeSlash className='w-[18px] h-[21px] text-black dark:text-white' /> }
                  </button>
                </div>

                <div className="flex justify-end">
                  <a href="#" className="text-sm text-[#7b77b9] hover:underline">Forgot password?</a>
                </div>

                <Button className='w-full !py-6 bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium'>
                  Sign In
                </Button>
                
                <Button className='w-full !py-6 bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 text-black dark:text-white hover:bg-black/5 dark:hover:bg-white/10 font-medium flex items-center justify-center gap-2'>
                  <Image src="/images/google.svg" alt="Google" width={20} height={20} />
                  Sign in with Google
                </Button>
                
                <p className="text-center text-sm text-black/60 dark:text-white/60 mt-4">
                  Don't have an account? <a href="/waitlist" className="text-[#7b77b9] hover:underline">Join Waitlist</a>
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>
    </Layout>
  )
}
