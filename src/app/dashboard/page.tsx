"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import Link from "next/link";
import { createBrowserClient } from "@supabase/ssr";

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userData, setUserData] = useState<any>(null);

  // Directly check Supabase session
  useEffect(() => {
    const checkSession = async () => {
      try {
        setIsLoading(true);

        // Create Supabase client
        const supabase = createBrowserClient(
          process.env.NEXT_PUBLIC_SUPABASE_URL!,
          process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
        );

        // Check if we have a session
        const {
          data: { session },
          error: sessionError,
        } = await supabase.auth.getSession();

        if (sessionError) {
          console.error("Session error:", sessionError);
          setError("Failed to verify your session");
          router.push("/login");
          return;
        }

        if (!session) {
          console.log("No session found");
          setError("No active session found");
          router.push("/login");
          return;
        }

        console.log("Session found, user ID:", session.user.id);

        // Get user data from profile
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("*")
          .eq("id", session.user.id)
          .single();

        if (profileError) {
          console.error("Error fetching profile:", profileError);
        }

        setUserData({
          id: session.user.id,
          email: session.user.email,
          profile: profileData || null,
        });

        setIsLoading(false);
      } catch (err) {
        console.error("Error checking session:", err);
        setError("Authentication error");
        setIsLoading(false);
      }
    };

    checkSession();
  }, [router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );

      // Sign out directly with Supabase
      await supabase.auth.signOut();

      // Also call our logout API to clear cookies
      await fetch("/api/auth/logout", {
        method: "POST",
      });

      // Force page refresh for clean state
      window.location.href = "/login";
    } catch (error) {
      console.error("Logout failed:", error);
      setIsLoggingOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="animate-spin h-10 w-10 mb-4">
          <svg
            className="h-full w-full text-purple-500"
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
        </div>
        <p className="text-white/70">Loading dashboard...</p>
      </div>
    );
  }

  if (error || !userData) {
    return (
      <div className="min-h-screen bg-black text-white flex flex-col items-center justify-center">
        <div className="text-red-500 mb-4">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-10 w-10"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
        </div>
        <p className="text-white/70 mb-4">
          {error || "Authentication required"}
        </p>
        <button
          onClick={() => router.push("/login")}
          className="px-4 py-2 bg-purple-600 rounded hover:bg-purple-700"
        >
          Go to Login
        </button>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="bg-gray-900 border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-2">
              <div className="h-10 flex items-center">
                <img
                  src="/frampapplogo.webp"
                  alt="FRAMP Logo"
                  className="h-8 w-auto"
                />
              </div>
            </div>

            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isLoggingOut ? "Logging out..." : "Log out"}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Welcome to your Dashboard</h1>

          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-purple-400">
              Your Profile
            </h2>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p>
                <span className="text-gray-400">Email:</span> {userData.email}
              </p>
              <p>
                <span className="text-gray-400">Name:</span>{" "}
                {userData.profile?.name || "Not provided"}
              </p>
              <p>
                <span className="text-gray-400">Wallet Address:</span>{" "}
                {userData.profile?.wallet_address || "Not provided"}
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link
                  href="/dashboard/profile"
                  className="block w-full text-center py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors"
                >
                  Edit Profile
                </Link>
                <Link
                  href="/dashboard/wallet"
                  className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors"
                >
                  Connect Wallet
                </Link>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Activity</h3>
              <p className="text-gray-400 text-center py-8">
                No recent activity
              </p>
            </div>
          </div>

          <div className="mt-8 pt-8 border-t border-gray-800">
            <p className="text-sm text-gray-500 text-center">
              This is a simple dashboard example. More features coming soon.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
