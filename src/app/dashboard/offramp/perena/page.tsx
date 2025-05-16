"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";
import { useWallet } from "@solana/wallet-adapter-react";
import { ArrowLeft, ArrowRight, Shield, Coins, PlusCircle, Building } from "lucide-react";
import { Button } from "@/components/ui/button";
import { perenaClient } from "@/lib/perena/client";
import USDStarWallet from "../../ramp/usdstar";

export default function PerenaOffRampPage() {
  const { publicKey } = useWallet();
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchPoolInfo = async () => {
      try {
        const info = await perenaClient.getPoolInfo();
        setPoolInfo(info);
        setLoading(false);
      } catch (error) {
        console.error("Failed to fetch Perena pool info:", error);
        setLoading(false);
      }
    };

    fetchPoolInfo();
  }, []);

  return (
    <div className="min-h-screen bg-white dark:bg-background">
      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="mb-6">
          <Link 
            href="/dashboard/offramp" 
            className="inline-flex items-center text-sm text-black/70 dark:text-white/70 hover:text-black dark:hover:text-white"
          >
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Off-Ramp Options
          </Link>
        </div>

        <div className="mb-8">
          <h1 className="text-3xl font-bold text-black dark:text-white">Perena USD* Off-Ramp</h1>
          <p className="text-black/70 dark:text-white/70 mt-2">
            Convert your USD* tokens to fiat currency with ease
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {publicKey ? (
              <USDStarWallet walletAddress={publicKey.toString()} />
            ) : (
              <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-8 text-center">
                <h2 className="text-xl font-medium text-black dark:text-white mb-4">Connect Your Wallet</h2>
                <p className="text-black/70 dark:text-white/70 mb-4">
                  Please connect your Solana wallet to access USD* functionality
                </p>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-6">
              <h2 className="text-xl font-medium text-black dark:text-white mb-4">About USD*</h2>
              <p className="text-black/70 dark:text-white/70 mb-4">
                USD* is Perena's yield-bearing stablecoin LP token backed by USDC, USDT, and PYUSD.
              </p>
              <div className="space-y-4 mt-6">
                <div className="flex items-start gap-3">
                  <Coins className="w-5 h-5 text-[#7b77b9] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-black dark:text-white">Yield Generation</h3>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Earn ~{poolInfo?.apr || "5.2"}% APR from swap fees while holding
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Shield className="w-5 h-5 text-[#7b77b9] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-black dark:text-white">Asset Security</h3>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Backed by a diversified basket of trusted stablecoins
                    </p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <Building className="w-5 h-5 text-[#7b77b9] mt-0.5" />
                  <div>
                    <h3 className="font-medium text-black dark:text-white">Fiat Conversion</h3>
                    <p className="text-sm text-black/70 dark:text-white/70">
                      Seamlessly withdraw to multiple fiat currencies
                    </p>
                  </div>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t border-black/10 dark:border-white/10">
                <h3 className="font-medium text-black dark:text-white mb-2">Supported Offramp Methods</h3>
                <ul className="text-sm text-black/70 dark:text-white/70 space-y-1">
                  <li>• Bank transfers (USD, NGN, GHS, KES)</li>
                  <li>• Mobile money</li>
                  <li>• ACH transfers</li>
                </ul>
              </div>
              
              <div className="mt-6">
                <a 
                  href="https://perena.org" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center text-[#7b77b9] hover:underline text-sm"
                >
                  Learn more about Perena
                  <ArrowRight className="w-4 h-4 ml-1" />
                </a>
              </div>
            </div>

            <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-6">
              <h2 className="text-xl font-medium text-black dark:text-white mb-4">Need More USD*?</h2>
              <p className="text-black/70 dark:text-white/70 mb-4">
                You can easily convert your fiat to USD* or directly deposit stablecoins to the Seed Pool.
              </p>
              <Link href="/dashboard/wallet">
                <Button className="w-full bg-[#7b77b9] hover:bg-[#7b77b9]/90 flex items-center gap-2">
                  <PlusCircle className="w-4 h-4" />
                  Get More USD*
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 