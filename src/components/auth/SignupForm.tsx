"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { ArrowRight } from "lucide-react";

export default function SignupForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");
  
  const router = useRouter();
  const { signup, error, clearError } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError("");
    clearError();

    // Minimal validation
    if (!email || !email.includes("@")) {
      setFormError("Please enter a valid email address");
      return;
    }

    // Simple password check
    if (password.length < 6) {
      setFormError("Password must be at least 6 characters");
      return;
    }

    setIsSubmitting(true);

    try {
      // We'll just use email and password for signup - profile details can be added later
      await signup(email, password);
      router.push("/dashboard"); // Redirect to dashboard after successful signup
    } catch (err: any) {
      setFormError(err.message || "Failed to create account. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gray-900/60 backdrop-blur-md p-8 rounded-2xl border border-gray-800 shadow-xl max-w-md w-full mx-auto">
      <h2 className="text-2xl font-bold text-white mb-2">Get Started</h2>
      <p className="text-gray-400 text-sm mb-6">Create your account with just email and password. You can complete your profile later.</p>
      
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Email Input */}
        <div>
          <input
            id="email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="Your email address"
            required
          />
        </div>

        {/* Password Input */}
        <div>
          <input
            id="password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-4 py-3 bg-gray-800/70 border border-gray-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent text-white placeholder-gray-500"
            placeholder="Create a password"
            required
          />
        </div>

        {/* Error display */}
        {(formError || error) && (
          <div className="text-red-400 text-sm">
            {formError || error}
          </div>
        )}

        {/* Submit Button */}
        <button
          type="submit"
          disabled={isSubmitting}
          className={`w-full py-3 px-4 rounded-lg font-medium flex items-center justify-center transition-all duration-300 ${
            isSubmitting
              ? "bg-purple-700 cursor-wait"
              : "bg-gradient-to-r from-purple-600 to-violet-500 hover:opacity-90"
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
              Creating Account...
            </span>
          ) : (
            <span className="flex items-center">
              Create Account <ArrowRight className="ml-2 h-4 w-4" />
            </span>
          )}
        </button>

        <div className="text-center mt-6">
          <p className="text-gray-400">
            Already have an account?{" "}
            <Link href="/login" className="text-purple-400 hover:text-purple-300">
              Sign in
            </Link>
          </p>
        </div>
      </form>
    </div>
  );
} 