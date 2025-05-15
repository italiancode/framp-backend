'use client';

import { useState } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import Link from 'next/link';
import { ArrowRight, LogIn } from 'lucide-react';

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [debug, setDebug] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setDebug('Starting login process...');

    try {
      // Create Supabase browser client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      // Step 1: Direct authentication with Supabase
      setDebug('Authenticating with Supabase...');
      const { data, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (authError) {
        console.error('Auth error:', authError.message);
        setError(`Authentication failed: ${authError.message}`);
        setDebug(`Auth error: ${authError.message}`);
        setLoading(false);
        return;
      }
      
      if (!data.user || !data.session) {
        setError('Authentication failed: No user or session returned');
        setDebug('No user or session returned');
        setLoading(false);
      return;
    }

      setDebug(`Authenticated successfully. User ID: ${data.user.id}`);
      
      // Step 2: Get user profile
      setDebug('Fetching user profile...');
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', data.user.id)
        .single();
      
      // If profile doesn't exist, create it
      if (profileError || !profile) {
        setDebug('Creating user profile...');
        
        const { error: insertError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              email: data.user.email,
              role: 'user',
              created_at: new Date().toISOString(),
              updated_at: new Date().toISOString(),
            }
          ]);
          
        if (insertError) {
          console.error('Error creating profile:', insertError);
          setDebug(`Error creating profile: ${insertError.message}`);
          // Continue anyway
        } else {
          setDebug('Created user profile successfully');
        }
      }
      
      const role = profile?.role || 'user';
      setDebug(`User role: ${role}`);
      
      // Step 3: Set cookies server-side
      setDebug('Saving session to server...');
      
      try {
        const sessionResponse = await fetch('/api/auth/session', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            access_token: data.session.access_token,
            refresh_token: data.session.refresh_token,
          }),
        });
        
        if (!sessionResponse.ok) {
          const errorData = await sessionResponse.json();
          console.error('Session API error:', errorData);
          setDebug(`Session API error: ${errorData.error || 'Failed to set cookies'}`);
          // Continue anyway, the browser should still have cookies from Supabase
        } else {
          setDebug('Session saved successfully');
        }
      } catch (sessionError: any) {
        console.error('Session API error:', sessionError);
        setDebug(`Session API error: ${sessionError.message}`);
        // Continue anyway, the browser should still have cookies from Supabase
      }
      
      // Step 4: Redirect based on role with forced reload
      const redirectPath = role === 'admin' ? '/admin' : '/dashboard';
      setDebug(`Login successful! Redirecting to ${redirectPath}...`);
      
      // Force a full page reload by setting window.location
      window.location.href = redirectPath;
    } catch (error: any) {
      console.error('Login error:', error);
      setError(`An unexpected error occurred: ${error.message}`);
      setDebug(`Error: ${error.message}`);
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/frampapplogo.webp" alt="FRAMP Logo" className="h-12 w-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-2">Sign In</h1>
        <p className="text-center text-black/60 dark:text-white/60 mb-6">
          Welcome back to Framp
        </p>
        
        {error && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
            {error}
          </div>
        )}
        
        <form onSubmit={handleLogin} className="space-y-4">
          <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
            <LogIn className='w-[18px] h-[21px]' />
          <input
            type="email"
              placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
              className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 p-2"
          />
        </div>

          <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
            <LogIn className='w-[18px] h-[21px]' />
          <input
            type="password"
              placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
              className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 p-2"
          />
        </div>

          <div className="flex justify-end">
            <a href="#" className="text-sm text-[#7b77b9] hover:underline">Forgot password?</a>
          </div>

        <button
          type="submit"
            disabled={loading}
            className="w-full !py-3 bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium flex items-center justify-center gap-2 rounded-md"
          >
            {loading ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
                Signing in...
            </span>
          ) : (
              <span className="flex items-center gap-2">
                Sign in <ArrowRight size={18} />
            </span>
          )}
        </button>
        </form>
        
        <p className="text-center text-sm text-black/60 dark:text-white/60 mt-4">
          Don't have an account? <Link href="/signup" className="text-[#7b77b9] hover:underline">Sign up</Link>
        </p>
        
        {debug && (
          <div className="mt-6 p-3 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-lg overflow-auto max-h-48">
            <p className="text-xs text-black/70 dark:text-white/70 font-mono whitespace-pre-wrap">{debug}</p>
          </div>
        )}
        </div>
    </div>
  );
} 