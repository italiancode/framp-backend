'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';

export default function DashboardPage() {
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const [isLoggingOut, setIsLoggingOut] = useState(false);

  // If not logged in, redirect to login page
  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
    }
  }, [user, loading, router]);

  const handleLogout = async () => {
    setIsLoggingOut(true);
    try {
      await logout();
      router.push('/login');
    } catch (error) {
      console.error('Logout failed:', error);
    } finally {
      setIsLoggingOut(false);
    }
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="animate-spin h-10 w-10">
          <svg className="h-full w-full text-purple-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
          </svg>
        </div>
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
              <span className="font-bold text-xl tracking-tight">FRAMP</span>
            </div>
            
            <button
              onClick={handleLogout}
              disabled={isLoggingOut}
              className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg hover:bg-gray-700 transition-colors"
            >
              {isLoggingOut ? 'Logging out...' : 'Log out'}
            </button>
          </div>
        </div>
      </header>

      {/* Dashboard Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Welcome to your Dashboard</h1>
          
          <div className="mb-6">
            <h2 className="text-lg font-semibold mb-3 text-purple-400">Your Profile</h2>
            <div className="bg-gray-800/50 p-4 rounded-lg">
              <p><span className="text-gray-400">Email:</span> {user.email}</p>
              <p><span className="text-gray-400">Name:</span> {user.profile?.name || 'Not provided'}</p>
              <p><span className="text-gray-400">Wallet Address:</span> {user.profile?.wallet_address || 'Not provided'}</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <Link href="/dashboard/profile" className="block w-full text-center py-2 bg-purple-600 hover:bg-purple-700 rounded-md transition-colors">
                  Edit Profile
                </Link>
                <Link href="/dashboard/wallet" className="block w-full text-center py-2 bg-gray-700 hover:bg-gray-600 rounded-md transition-colors">
                  Connect Wallet
                </Link>
              </div>
            </div>

            <div className="bg-gray-800/50 p-6 rounded-lg border border-gray-700">
              <h3 className="text-lg font-medium mb-4">Activity</h3>
              <p className="text-gray-400 text-center py-8">No recent activity</p>
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