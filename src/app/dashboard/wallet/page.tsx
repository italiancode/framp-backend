"use client";

import { useState, useEffect } from "react";
import { useWallet } from "@solana/wallet-adapter-react";
import { WalletMultiButton } from "@solana/wallet-adapter-react-ui";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { useWalletContext } from "@/contexts/WalletContext";
import Link from "next/link";
import {
  ArrowLeft,
  Copy,
  RefreshCw,
  Unlink,
  CreditCard,
  Wallet,
  ExternalLink,
} from "lucide-react";
import USDStarWallet from "./usdstar";

export default function WalletPage() {
  const { publicKey, connected } = useWallet();
  const {
    balance,
    updateProfile,
    disconnectWallet,
    refreshBalance,
    isConnecting,
  } = useWalletContext();
  const { user } = useAuth();
  const router = useRouter();
  const [copied, setCopied] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);

  // Connect wallet to user profile
  useEffect(() => {
    const linkWalletToProfile = async () => {
      if (connected && publicKey && user && !user.profile?.wallet_address) {
        await updateProfile(publicKey.toString());
      }
    };

    linkWalletToProfile();
  }, [connected, publicKey, user, updateProfile]);

  // Function to copy wallet address
  const copyAddress = () => {
    if (publicKey) {
      navigator.clipboard.writeText(publicKey.toString());
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  // Function to refresh balance
  const handleRefreshBalance = async () => {
    setIsRefreshing(true);
    await refreshBalance();
    setIsRefreshing(false);
  };

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-900 to-black text-white">
      {/* Header */}
      <header className="sticky top-0 z-10 bg-gray-900/80 backdrop-blur-md border-b border-gray-800">
        <div className="container mx-auto px-4 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center gap-3">
              <div className="h-10 flex items-center">
                <img
                  src="/frampapplogo.webp"
                  alt="FRAMP Logo"
                  className="h-8 w-auto"
                />
              </div>
            </div>

            <Link
              href="/dashboard"
              className="flex items-center text-gray-300 hover:text-white transition-colors px-3 py-1.5 rounded-lg hover:bg-gray-800"
            >
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Wallet Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2 bg-clip-text text-transparent bg-gradient-to-r from-purple-400 to-pink-500">
            Wallet Dashboard
          </h1>
          <p className="text-gray-400">
            Manage your crypto assets and transactions
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-1">
            <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg transition-all hover:border-purple-900/50 h-full">
              <h2 className="text-xl font-bold mb-6 flex items-center">
                <Wallet className="h-5 w-5 mr-2 text-purple-400" />
                Connect Wallet
              </h2>

              <div className="mb-6">
                <p className="text-gray-400 mb-4">
                  Connect your Solana wallet to enable FRAMP's financial
                  services and access USD* features.
                </p>

                <div className="flex flex-col gap-4 mt-6">
                  <div className="wallet-adapter-dropdown w-full">
                    <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-auto !py-3 !px-4 !w-full !transition-all !font-semibold" />
                  </div>

                  {connected && publicKey && (
                    <button
                      onClick={disconnectWallet}
                      disabled={isConnecting}
                      className="flex items-center justify-center px-4 py-3 bg-red-900/50 hover:bg-red-900/80 text-white rounded-lg border border-red-800/50 transition-all"
                    >
                      <Unlink className="h-4 w-4 mr-2" />
                      Disconnect Wallet
                    </button>
                  )}
                </div>
              </div>

              {connected && publicKey && (
                <div className="mt-8 space-y-6">
                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <CreditCard className="h-4 w-4 mr-2 text-purple-400" />
                      Wallet Address
                    </h3>
                    <div className="flex items-center p-1 bg-gray-800/70 rounded-lg border border-gray-700">
                      <span className="text-white font-mono text-xs bg-gray-900/60 py-2 px-3 rounded-lg mr-2 overflow-hidden overflow-ellipsis w-full">
                        {publicKey.toString()}
                      </span>
                      <button
                        onClick={copyAddress}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-purple-900/60 transition-colors flex-shrink-0 group"
                        title="Copy address"
                      >
                        {copied ? (
                          <span className="text-green-400 text-xs">
                            Copied!
                          </span>
                        ) : (
                          <Copy className="h-4 w-4 group-hover:text-purple-400" />
                        )}
                      </button>
                    </div>
                  </div>

                  <div>
                    <h3 className="text-sm font-medium text-gray-400 mb-2 flex items-center">
                      <ExternalLink className="h-4 w-4 mr-2 text-purple-400" />
                      Solana Balance
                    </h3>
                    <div className="flex items-center p-1 bg-gray-800/70 rounded-lg border border-gray-700">
                      <div className="text-white font-mono text-sm bg-gray-900/60 py-2 px-3 rounded-lg mr-2 w-full flex items-center">
                        {balance !== null ? (
                          <span className="font-bold">
                            {balance.toFixed(4)}{" "}
                            <span className="text-purple-400">SOL</span>
                          </span>
                        ) : (
                          <span className="animate-pulse">Loading...</span>
                        )}
                      </div>
                      <button
                        onClick={handleRefreshBalance}
                        disabled={isRefreshing}
                        className="p-2 bg-gray-700 rounded-lg hover:bg-purple-900/60 transition-colors flex-shrink-0 group"
                        title="Refresh balance"
                      >
                        <RefreshCw
                          className={`h-4 w-4 group-hover:text-purple-400 ${isRefreshing ? "animate-spin text-purple-400" : ""}`}
                        />
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div className="lg:col-span-2">
            {connected && publicKey ? (
              <div className="space-y-8">
                <USDStarWallet walletAddress={publicKey?.toString() || ""} />
                <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg">
                  <h2 className="text-xl font-bold mb-6 text-purple-400">
                    Transaction History
                  </h2>
                  <div className="p-8 text-center text-gray-500">
                    <p>Transaction history will appear here</p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-gray-900/60 backdrop-blur-md p-8 rounded-xl border border-gray-800 shadow-lg flex flex-col items-center justify-center text-center h-full">
                <Wallet className="h-12 w-12 text-purple-500 mb-4 opacity-50" />
                <h2 className="text-xl font-semibold mb-2">
                  No Wallet Connected
                </h2>
                <p className="text-gray-400 max-w-md mb-6">
                  Connect your Solana wallet to view your balances and access
                  the USD* features
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}
