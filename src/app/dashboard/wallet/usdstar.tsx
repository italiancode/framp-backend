"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";

import { perenaClient, getUSDStarExchangeRate } from "@/lib/perena/client";

export default function USDStarWallet({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const [balance, setBalance] = useState<number | null>(null);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("onramp");

  // On-ramp form state
  const [onRampAmount, setOnRampAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // Off-ramp form state
  const [offRampAmount, setOffRampAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankCode, setBankCode] = useState<string>("");
  const [currency, setCurrency] = useState<string>("USD");

  // Toast state for notifications
  const [toast, setToast] = useState<{
    visible: boolean;
    variant: "success" | "destructive";
    title: string;
    description: string;
    icon?: React.ReactNode;
  } | null>(null);

  // Sample bank list - this would typically come from an API
  const banks = [
    { code: "044", name: "Access Bank" },
    { code: "063", name: "Access Bank (Diamond)" },
    { code: "050", name: "EcoBank" },
    { code: "011", name: "First Bank of Nigeria" },
    { code: "214", name: "First City Monument Bank" },
    { code: "058", name: "Guaranty Trust Bank" },
    { code: "030", name: "Heritage Bank" },
    { code: "301", name: "Jaiz Bank" },
    { code: "082", name: "Keystone Bank" },
    { code: "526", name: "Parallex Bank" },
    { code: "076", name: "Polaris Bank" },
    { code: "221", name: "Stanbic IBTC Bank" },
    { code: "068", name: "Standard Chartered Bank" },
    { code: "232", name: "Sterling Bank" },
    { code: "100", name: "Suntrust Bank" },
    { code: "032", name: "Union Bank of Nigeria" },
    { code: "033", name: "United Bank For Africa" },
    { code: "215", name: "Unity Bank" },
    { code: "035", name: "Wema Bank" },
    { code: "057", name: "Zenith Bank" },
  ];

  useEffect(() => {
    loadWalletData();
  }, [walletAddress]);

  useEffect(() => {
    if (activeTab === "onramp") {
      getUSDStarExchangeRate("USD").then((rate) => setExchangeRate(rate));
    } else if (activeTab === "offramp") {
      getUSDStarExchangeRate(currency).then((rate) => setExchangeRate(rate));
    }
  }, [activeTab, currency]);

  // Custom toast function replacing the shadcn one
  const showToast = (toast: {
    variant: "success" | "destructive";
    title: string;
    description: string;
    icon?: React.ReactNode;
  }) => {
    setToast({ ...toast, visible: true });
    setTimeout(() => setToast(null), 5000);
  };

  async function loadWalletData() {
    if (!walletAddress) return;

    setIsLoading(true);
    try {
      // Fetch the balance
      const balanceResult = await perenaClient.getUSDStarBalance(walletAddress);
      setBalance(balanceResult);

      // Fetch pool info
      const poolInfoResult = await perenaClient.getPoolInfo();
      setPoolInfo(poolInfoResult);
    } catch (error) {
      console.error("Failed to load USD* wallet data:", error);
      showToast({
        variant: "destructive",
        title: "Error loading wallet data",
        description:
          "Could not retrieve your USD* balance. Please try again later.",
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleOnRamp(e: React.FormEvent) {
    e.preventDefault();
    if (!onRampAmount || parseFloat(onRampAmount) <= 0) {
      showToast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to deposit.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/perena/onramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(onRampAmount),
          userWallet: walletAddress,
          paymentMethod,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process on-ramp");
      }

      showToast({
        variant: "success",
        title: "On-ramp successful",
        description: `${result.amount.toFixed(2)} USD* has been added to your wallet.`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // Reset form and refresh data
      setOnRampAmount("");
      loadWalletData();
    } catch (error) {
      console.error("On-ramp error:", error);
      showToast({
        variant: "destructive",
        title: "On-ramp failed",
        description:
          error instanceof Error ? error.message : "Failed to deposit funds.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleOffRamp(e: React.FormEvent) {
    e.preventDefault();
    if (!offRampAmount || parseFloat(offRampAmount) <= 0) {
      showToast({
        variant: "destructive",
        title: "Invalid amount",
        description: "Please enter a valid amount to withdraw.",
      });
      return;
    }

    if (!accountNumber || !bankCode) {
      showToast({
        variant: "destructive",
        title: "Missing bank details",
        description: "Please provide complete bank account information.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      const response = await fetch("/api/perena/offramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          amount: parseFloat(offRampAmount),
          userWallet: walletAddress,
          accountNumber,
          bankCode,
          currency,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process off-ramp");
      }

      showToast({
        variant: "success",
        title: "Off-ramp initiated",
        description: `${result.fiatAmount.toFixed(2)} ${currency} will be sent to your bank account.`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // Reset form and refresh data
      setOffRampAmount("");
      loadWalletData();
    } catch (error) {
      console.error("Off-ramp error:", error);
      showToast({
        variant: "destructive",
        title: "Off-ramp failed",
        description:
          error instanceof Error ? error.message : "Failed to withdraw funds.",
      });
    } finally {
      setIsProcessing(false);
    }
  }

  return (
    <div className="bg-white dark:bg-background/50 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm rounded-xl overflow-hidden">
      {/* Toast notification */}
      {toast && toast.visible && (
        <div
          className={`fixed top-4 right-4 z-50 p-4 rounded-lg shadow-lg ${
            toast.variant === "destructive"
              ? "bg-red-100 dark:bg-red-900/30 text-red-800 dark:text-red-300"
              : "bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300"
          }`}
        >
          <div className="flex items-start gap-2">
            {toast.icon}
            <div>
              <h4 className="font-medium">{toast.title}</h4>
              <p className="text-sm">{toast.description}</p>
            </div>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="p-5 border-b border-black/10 dark:border-white/10">
        <div className="flex justify-between items-start">
          <div>
            <h3 className="text-xl font-bold text-black dark:text-white flex items-center gap-2">
              USD* Balance
              <button
                onClick={loadWalletData}
                className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
                disabled={isLoading}
              >
                <RefreshCw
                  className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`}
                />
                <span className="sr-only">Refresh balance</span>
              </button>
            </h3>
            <p className="text-black/60 dark:text-white/60 text-sm">
              Perena USD* Token (Interest-bearing)
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
              {poolInfo?.apr || "~5.2"}% APR
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5">
        <div className="space-y-4">
          <div className="text-3xl font-bold text-black dark:text-white">
            {isLoading ? (
              <span className="animate-pulse">Loading...</span>
            ) : (
              `${balance?.toFixed(6) || "0.00"} USD*`
            )}
          </div>

          {/* Custom tabs implementation */}
          <div className="w-full">
            <div className="grid grid-cols-2 mb-4 bg-black/5 dark:bg-white/5 rounded-lg p-1">
              <button
                onClick={() => setActiveTab("onramp")}
                className={`flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md ${
                  activeTab === "onramp"
                    ? "bg-white dark:bg-black/30 text-black dark:text-white shadow-sm"
                    : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
                }`}
              >
                <ArrowUpRight className="h-4 w-4" /> On-Ramp
              </button>
              <button
                onClick={() => setActiveTab("offramp")}
                className={`flex items-center justify-center gap-2 py-2 px-4 text-sm font-medium rounded-md ${
                  activeTab === "offramp"
                    ? "bg-white dark:bg-black/30 text-black dark:text-white shadow-sm"
                    : "text-black/70 dark:text-white/70 hover:text-black hover:dark:text-white"
                }`}
              >
                <ArrowDownLeft className="h-4 w-4" /> Off-Ramp
              </button>
            </div>

            {/* On-ramp tab */}
            {activeTab === "onramp" && (
              <form onSubmit={handleOnRamp}>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="onramp-amount"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Amount (USD)
                    </label>
                    <input
                      id="onramp-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={onRampAmount}
                      onChange={(e) => setOnRampAmount(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                      min="0"
                      step="0.01"
                      required
                    />
                    {onRampAmount && (
                      <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                        ≈{" "}
                        {(
                          parseFloat(onRampAmount) *
                          exchangeRate *
                          0.99
                        ).toFixed(6)}{" "}
                        USD* (after 1% fee)
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="payment-method"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Payment Method
                    </label>
                    <select
                      id="payment-method"
                      value={paymentMethod}
                      onChange={(e) => setPaymentMethod(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                    >
                      <option value="card">Credit/Debit Card</option>
                      <option value="bank">Bank Transfer</option>
                      {/* <option value="crypto">Crypto</option> */}
                    </select>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium flex items-center justify-center disabled:opacity-50"
                      disabled={isProcessing}
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Deposit Funds"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}

            {/* Off-ramp tab */}
            {activeTab === "offramp" && (
              <form onSubmit={handleOffRamp}>
                <div className="space-y-3">
                  <div>
                    <label
                      htmlFor="offramp-amount"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Amount (USD*)
                    </label>
                    <input
                      id="offramp-amount"
                      type="number"
                      placeholder="Enter amount"
                      value={offRampAmount}
                      onChange={(e) => setOffRampAmount(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                      min="0"
                      max={balance || 0}
                      step="0.01"
                      required
                    />
                    {offRampAmount && (
                      <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                        ≈{" "}
                        {(
                          (parseFloat(offRampAmount) / exchangeRate) *
                          0.99
                        ).toFixed(2)}{" "}
                        {currency} (after 1% fee)
                      </p>
                    )}
                  </div>

                  <div>
                    <label
                      htmlFor="currency"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Currency
                    </label>
                    <select
                      id="currency"
                      value={currency}
                      onChange={(e) => setCurrency(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                    >
                      <option value="NGN">NGN</option>
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="bank"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Bank
                    </label>
                    <select
                      id="bank"
                      value={bankCode}
                      onChange={(e) => setBankCode(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                    >
                      <option value="">Select your bank</option>
                      {banks.map((bank) => (
                        <option key={bank.code} value={bank.code}>
                          {bank.name}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label
                      htmlFor="account-number"
                      className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                    >
                      Account Number
                    </label>
                    <input
                      id="account-number"
                      type="text"
                      placeholder="Enter account number"
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                      required
                    />
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      className="w-full py-2 px-4 rounded-md bg-[#7b77b9] hover:bg-[#7b77b9]/90 text-white font-medium flex items-center justify-center disabled:opacity-50"
                      disabled={
                        isProcessing ||
                        !balance ||
                        parseFloat(offRampAmount) > (balance || 0)
                      }
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                          Processing...
                        </>
                      ) : (
                        "Withdraw Funds"
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex flex-col text-sm text-black/60 dark:text-white/60 border-t border-black/10 dark:border-white/10 p-5">
        <div className="flex items-start gap-2 mb-2">
          <AlertCircle className="h-4 w-4 mt-0.5 flex-shrink-0" />
          <p>
            USD* earns yield from Perena's DeFi pools. Current estimated APR is{" "}
            {poolInfo?.apr || "~5.2"}%.
          </p>
        </div>
        <a
          href="https://perena.org"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[#7b77b9] hover:underline text-xs ml-6"
        >
          Learn more about Perena USD*
        </a>
      </div>
    </div>
  );
}
