"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { ArrowRight, Mail, Lock } from "lucide-react";
import { createBrowserClient } from '@supabase/ssr'

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  const [debug, setDebug] = useState<string | null>(null);
  
  const router = useRouter();
  
  // Create supabase browser client directly for better control
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    setIsSubmitting(true);
    setDebug("Starting signup process...");

    // Minimal validation
    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address");
      setIsSubmitting(false);
      return;
    }

    // Simple password check
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      setIsSubmitting(false);
      return;
    }

    try {
      setDebug("Starting signup process for: " + email);
      
      // Direct API call to signup endpoint for better control
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });
      
      const data = await response.json();
      
      if (!response.ok) {
        throw new Error(data.error || 'Signup failed');
      }
      
      setDebug("Signup successful, now signing in");
      
      // Sign in the user immediately after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      
      if (signInError) {
        console.error("Error signing in after registration:", signInError);
        setDebug("Error signing in: " + signInError.message);
        throw new Error('Account created but login failed. Please go to the login page.');
      }
      
      setDebug("Login successful, redirecting to dashboard");
      
      // Use window.location for a full page refresh to ensure state is reset
      window.location.href = "/dashboard";
    } catch (err: any) {
      console.error("Signup error:", err);
      setFormError(err.message || "Failed to create account. Please try again.");
      setDebug("Error: " + err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl">
        <div className="flex justify-center mb-6">
          <img src="/frampapplogo.webp" alt="FRAMP Logo" className="h-12 w-auto" />
        </div>
        
        <h1 className="text-3xl font-bold text-center text-black dark:text-white mb-2">Sign Up</h1>
        <p className="text-center text-black/60 dark:text-white/60 mb-6">
          Create your account to get started
        </p>
        
        {formError && (
          <div className="mb-4 p-3 border border-red-300 bg-red-50 dark:bg-red-900/20 dark:border-red-800 text-red-700 dark:text-red-300 rounded-md text-sm">
            {formError}
          </div>
        )}
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="flex items-center bg-white dark:bg-black/30 text-black/70 dark:text-white/70 gap-2 border border-black/20 dark:border-white/20 px-3 py-1 rounded-md">
            <Mail className="w-[18px] h-[21px]" />
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
            <Lock className="w-[18px] h-[21px]" />
          <input
            type="password"
              placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
              className="flex-1 border-none outline-none focus-visible:!ring-0 bg-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 p-2"
          />
        </div>

        <button
          type="submit"
          disabled={isSubmitting}
            className="w-full !py-3 bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium flex items-center justify-center gap-2 rounded-md"
        >
          {isSubmitting ? (
              <span className="flex items-center gap-2">
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Creating Account...
            </span>
          ) : (
              <span className="flex items-center gap-2">
                Create Account <ArrowRight size={18} />
            </span>
          )}
        </button>
        </form>

        <p className="text-center text-sm text-black/60 dark:text-white/60 mt-4">
          Already have an account? <Link href="/login" className="text-[#7b77b9] hover:underline">Sign in</Link>
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