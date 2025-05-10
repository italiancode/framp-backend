"use client";

import { Button } from '@/components/ui/button';
import Image from 'next/image';
import Link from 'next/link';
import { useTheme } from 'next-themes';
import { FaMoon, FaSun } from 'react-icons/fa';
import { useState, useEffect } from 'react';

export default function Header() {
  const [mounted, setMounted] = useState(false);
  const { theme, setTheme } = useTheme();

  // Avoid hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  const toggleTheme = () => {
    setTheme(theme === 'dark' ? 'light' : 'dark');
  };

  return (
    <nav className="sticky top-0 z-50 w-full border-b border-black/10 dark:border-white/10 backdrop-blur-md bg-white/80 dark:bg-black/80">
      <div className="flex justify-between items-center w-full px-3 sm:px-6 lg:px-8 py-2 sm:py-3 max-w-7xl mx-auto">
        <div className="Logo flex items-center">
          <Link href="/">
            <Image 
              src={theme === 'dark' ? "/images/logo-dark.svg" : "/images/logo.svg"} 
              alt="Framp" 
              width={120} 
              height={40} 
              className="h-7 sm:h-8 md:h-10 w-auto"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation Links */}
        {/* <div className="hidden md:flex space-x-6 text-sm lg:text-base font-medium">
          <Link href="/" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>
            Home
          </Link>
          <Link href="/about" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>
            About
          </Link>
          <Link href="/product" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>
            Product
          </Link>
        </div> */}
        
        <div className="flex items-center gap-2 sm:gap-3">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full text-black dark:text-white h-8 w-8 sm:h-9 sm:w-9"
            >
              {theme === 'dark' ? <FaSun className="h-4 w-4 sm:h-5 sm:w-5" /> : <FaMoon className="h-4 w-4 sm:h-5 sm:w-5" />}
            </Button>
          )}
          
          <Button 
            asChild 
            className="text-xs sm:text-sm py-1 px-3 sm:px-4 h-8 sm:h-9 bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white"
          >
            <Link href="/waitlist">Join Waitlist</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
} 