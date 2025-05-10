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
      <div className="flex justify-between items-center w-full px-4 sm:px-6 lg:px-8 py-3 max-w-7xl mx-auto">
        <div className="Logo flex items-center">
          <Link href="/">
            <Image 
              src={theme === 'dark' ? "/images/logo-dark.svg" : "/images/logo.svg"} 
              alt="Framp" 
              width={120} 
              height={40} 
              className="h-10 w-auto"
            />
          </Link>
        </div>
        
        {/* Desktop Navigation */}
        {/* <div className="nav-links hidden md:flex space-x-8 text-base font-medium">
          <Link href="/" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>Home</Link>
          <Link href="/about" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>About us</Link>
          <Link href="/product" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>Product</Link>
          <Link href="/socials" className='text-black/80 dark:text-white/80 hover:text-[#7b77b9] dark:hover:text-[#9f9ddb] transition-colors'>Socials</Link>
        </div> */}
        
        <div className="flex items-center gap-3">
          {mounted && (
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={toggleTheme}
              className="rounded-full text-black dark:text-white"
            >
              {theme === 'dark' ? <FaSun className="h-5 w-5" /> : <FaMoon className="h-5 w-5" />}
            </Button>
          )}
          
          <Button asChild className="md:inline-flex bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white">
            <Link href="/login">Join Waitlist</Link>
          </Button>
        </div>
      </div>
    </nav>
  );
} 