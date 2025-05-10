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

{/* <div className="hidden lg:block lg:relative -bottom-0.5 w-1/2 h-[100vh] bg-[#7a80d6]"> */}
export default function loginPage() {
  const [showPassword, setShowPassword ] = useState(false)
  return (
    <section>
      <main className="flex h-screen bg-[#7B77B9] overflow-hidden">
        {/* Left side: Image */}
        <div className="hidden lg:block lg:relative -bottom-0.5 w-1/2 h-[100vh] left-0">
        {/* <div className="hidden lg:block lg:relative -bottom-0.5 w-1/2 h-[100vh] bg-[#787cb7]"> */}
          <Image
            src="/images/loginBg2.svg"
            alt="Framp"
            fill
            className="object-fill w-screen"
          />
        </div>

{/* <div className="relative w-1/2 h-full">
    <Image
      src="/images/loginBg.svg"
      alt="Framp"
      fill
      className="object-contain"
      priority // optional: ensures fast loading
    />
  </div> */}

        {/* Right side: Placeholder for your content */}
        {/* <div className="w-full lg:w-1/2 h-screen bg-[#7e84c4]"> */}
        <div className="w-full lg:w-1/2 h-screen">
          <div className="mx-6 md:mx-auto my-6 md:my-16 lg:my-8">
            <div className="pt-6 pb-12 md:pb-24 lg:pb-12 px-8 md:px-28 md:mx-12 flex items-center flex-col bg-white rounded-lg border border-gray-200 shadow">
              <h1 className="text-3xl lg:text-6xl font-bold md:font-black text-center">Sign up</h1>
              <p className="mt-2 md:mt-4 text-center font-normal md:font-medium text-base md:text-[20px] text-black/[42%]">
                Fill in your details
              </p>

              <div className="mt-8 w-full grid gap-4">
                <div className="flex items-center grid-cols-1 bg-white text-black/[42%] gap-2 border border-gray-300 px-3 py-1 rounded-md">
                  <Users className='w-[18px] h-[21px] ' />
                  <Input
                  type='text'
                    placeholder=" Full Name"
                    className="flex-1 border-none outline-none focus-visible:!ring-0"
                  />
                </div>
                <div className="flex items-center grid-cols-1 bg-white text-black/[42%] gap-2 border border-gray-300 px-3 py-1 rounded-md">
                  <Mail className='w-[18px] h-[21px] ' />
                  <Input
                  type='email'
                    placeholder="Email"
                    className="flex-1 border-none outline-none focus-visible:!ring-0"
                  />
                </div>
                <div className="flex items-center grid-cols-1 bg-white text-black/[42%] gap-2 border border-gray-300 px-3 py-1 rounded-md">
                  <BsTelephone className='w-[18px] h-[21px] ' />
                  <Input
                    type='text'
                    placeholder="Phone number"
                    className="flex-1 border-none outline-none focus-visible:!ring-0"
                  />
                </div>
                <div className="flex items-center grid-cols-1 bg-white text-black/[42%] gap-2 border border-gray-300 px-3 py-1 rounded-md">
                  <Lock className='w-[18px] h-[21px] ' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Password"
                    // placeholder="Password ••••••••••"
                    className="flex-1 border-none outline-none focus-visible:!ring-0"
                  />
                  <button onClick={() => setShowPassword(!showPassword)}> 
                    { showPassword ? <Eye className='w-[18px] h-[21px] ' /> : <FaEyeSlash className='w-[18px] h-[21px] ' /> } </button>
                </div>
                <div className="flex items-center grid-cols-1 bg-white text-black/[42%] gap-2 border border-gray-300 px-3 py-1 rounded-md">
                  <Lock className='w-[18px] h-[21px] ' />
                  <Input
                    type={showPassword ? 'text' : 'password'}
                    placeholder="Confirm password"
                    // placeholder="Password ••••••••••"
                    className="flex-1 border-none outline-none focus-visible:!ring-0"
                  />
                  <button onClick={() => setShowPassword(!showPassword)}> 
                    { showPassword ? <Eye className='w-[18px] h-[21px] ' /> : <FaEyeSlash className='w-[18px] h-[21px] ' /> } </button>
                </div>

                <div className="mt-7 w-full grid gap-4">
                  <Button className='text-center text-[14px] font-bold !py-6 grid-cols-1 border border-black/[30%] bg-transparent hover:bg-black text-black hover:text-white transition-all duration-300'>Sign up</Button>
                  <Button className='text-center text-[14px] font-bold !py-6 grid-cols-1 border border-black/[30%] bg-transparent hover:bg-black text-black hover:text-white transition-all duration-300 flex items-center'> <span> <Image src="/images/google.svg" alt="Google" width={24} height={24} /> </span> Sign up with google</Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

    </section>
  )
}
