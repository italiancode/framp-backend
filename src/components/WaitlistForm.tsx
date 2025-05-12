"use client";

import type React from "react";
import { useState, useEffect } from "react";
import { Hexagon, ArrowRight, CheckCircle } from "lucide-react";
import { signUpWaitlist } from "../hooks/useWaitlist";
import { useTheme } from "next-themes";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BackgroundElements } from "@/components/ui/BackgroundElements";

export default function WaitlistForm() {
  const { theme } = useTheme();
  const [isSuccess, setIsSuccess] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [wallet, setWallet] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes("@")) return;

    setIsSubmitting(true);
    setError("");

    try {
      const result = await signUpWaitlist({
        email,
        name,
        wallet,
        referral: "" // Empty string since we removed the referral field
      });

      if (result.error) {
        setError(result.error);
        setIsSubmitting(false);
      } else {
        setIsSubmitting(false);
        setIsSuccess(true);
        setEmail("");

        // Reset success message after 3 seconds
        setTimeout(() => {
          setIsSuccess(false);
        }, 3000);
      }
    } catch (err: any) {
      setError(err.message || "Something went wrong. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[90vh] bg-white dark:bg-background/90 text-black dark:text-white overflow-hidden relative py-10 sm:py-16">
      <BackgroundElements />

      {/* Hero Section */}
      <section className="relative container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-8 sm:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold mb-4 sm:mb-6 leading-tight">
              Your{" "}
              <span className="text-[#7b77b9] dark:text-[#9f9ddb]">
                TurboCharged
              </span>{" "}
              Finance Buddy
            </h1>
            <p className="text-base sm:text-lg md:text-xl text-black/70 dark:text-white/70 max-w-2xl mx-auto">
              The all-in-one hub with a blend of TradFi and DeFi to enhance your
              Ramping Experience
            </p>
          </div>

          <div className="max-w-md mx-auto relative">
            {/* Signup Form */}
            <div className="bg-white/50 dark:bg-background/50 backdrop-blur-md p-6 sm:p-8 rounded-2xl border border-black/10 dark:border-white/10 shadow-xl relative z-10">
              <form onSubmit={handleSubmit} className="space-y-4 sm:space-y-5">
                <h3 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 text-black dark:text-white">
                  Join the Waitlist
                </h3>
                <p className="text-black/60 dark:text-white/60 text-sm mb-4 sm:mb-6">
                  Be among the first to experience the future of decentralized
                  finance
                </p>

                <div className="space-y-3 sm:space-y-4">
                <div className="relative">
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                      className="w-full px-4 py-3 bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b77b9] focus:border-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
              required
            />
                </div>

                  <div className="relative">
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name (optional)"
                      className="w-full px-4 py-3 bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b77b9] focus:border-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
                    />
                  </div>
                  
                  <div className="relative">
                    <input
                      type="text"
                      value={wallet}
                      onChange={(e) => setWallet(e.target.value)}
                      placeholder="Solana wallet address (optional)"
                      className="w-full px-4 py-3 bg-white dark:bg-black/30 border border-black/20 dark:border-white/20 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#7b77b9] focus:border-transparent text-black dark:text-white placeholder-black/50 dark:placeholder-white/50"
                    />
                  </div>
                </div>

                {error && <div className="text-red-500 dark:text-red-400 text-sm">{error}</div>}
                {isSuccess && (
                  <div className="flex items-center text-green-600 dark:text-green-400 text-sm">
                    <CheckCircle size={16} className="mr-2" />
                    Success! Check your email for confirmation.
                  </div>
                )}

                <Button
                  type="submit"
                  disabled={isSubmitting || !email}
                  className={`w-full py-5 sm:py-6 rounded-lg ${
                    isSubmitting
                      ? "bg-[#7b77b9]/70 cursor-wait"
                      : email
                        ? "bg-[#7b77b9] hover:bg-[#7b77b9]/90"
                        : "bg-gray-300 dark:bg-gray-700 cursor-not-allowed"
                  }`}
                >
                  {isSubmitting ? (
                    <span className="flex items-center">
                      <svg
                        className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        ></circle>
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        ></path>
                      </svg>
                      Processing...
                    </span>
                  ) : (
                    <span className="flex items-center justify-center">
                      Join Waitlist <ArrowRight className="ml-2 h-5 w-5" />
                    </span>
                  )}
                </Button>
                
                <p className="text-xs text-center text-black/60 dark:text-white/60 mt-4">
                  By joining, you agree to our{" "}
                  <Link href="/terms" className="text-[#7b77b9] hover:underline">
                    Terms of Service
                  </Link>{" "}
                  and{" "}
                  <Link href="/privacy" className="text-[#7b77b9] hover:underline">
                    Privacy Policy
                  </Link>
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
