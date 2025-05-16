"use client";

import { useState, useEffect } from "react";
import {
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
} from "lucide-react";

import { perenaClient, getUSDStarExchangeRate, createUSDStarTransferTransaction } from "@/lib/perena/client";
import OffRampHistory from "@/components/perena/OffRampHistory";
import { useWallet } from "@solana/wallet-adapter-react";
import { Transaction } from "@solana/web3.js";

export default function USDStarWallet({
  walletAddress,
}: {
  walletAddress: string;
}) {
  const wallet = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [poolInfo, setPoolInfo] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [exchangeRate, setExchangeRate] = useState<number>(1);
  const [activeTab, setActiveTab] = useState<string>("onramp");
  const [waitingForSignature, setWaitingForSignature] = useState(false);

  // Environment variables
  const FRAMP_POOL_WALLET = "6FiKgaDKo5Zrz2YcyuVo9rkgSU3MkFw6na9di4fGyqn"; // Hardcoded for reliability
  
  // Fee percentages from environment variables (default to 1% if not set)
  const onRampFeePercentage = Number(process.env.NEXT_PUBLIC_ONRAMP_FEE_PERCENTAGE || 1);
  const offRampFeePercentage = Number(process.env.NEXT_PUBLIC_OFFRAMP_FEE_PERCENTAGE || 1);

  // On-ramp form state
  const [onRampAmount, setOnRampAmount] = useState<string>("");
  const [paymentMethod, setPaymentMethod] = useState<string>("card");

  // Off-ramp form state
  const [offRampAmount, setOffRampAmount] = useState<string>("");
  const [accountNumber, setAccountNumber] = useState<string>("");
  const [bankCode, setBankCode] = useState<string>("");
  const [bankName, setBankName] = useState<string>("");
  const [currency, setCurrency] = useState<string>("NGN");

  // Toast state for notifications
  const [toast, setToast] = useState<{
    visible: boolean;
    variant: "success" | "destructive";
    title: string;
    description: string;
    icon?: React.ReactNode;
  } | null>(null);


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
    if (!walletAddress) {
      console.log("Cannot load wallet data - wallet address is missing");
      return;
    }

    console.log(`Fetching USD* balance for wallet: ${walletAddress}`);
    setIsLoading(true);
    try {
      // Fetch the balance
      console.log("Calling perenaClient.getUSDStarBalance...");
      const balanceResult = await perenaClient.getUSDStarBalance(walletAddress);
      console.log(`USD* balance result:`, balanceResult);
      setBalance(balanceResult);

      // Fetch pool info
      console.log("Fetching pool info...");
      const poolInfoResult = await perenaClient.getPoolInfo();
      console.log("Pool info result:", poolInfoResult);
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
      console.log("Wallet data loading completed");
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

    if (!accountNumber || !bankCode || !bankName) {
      showToast({
        variant: "destructive",
        title: "Missing bank details",
        description: "Please provide complete bank account information.",
      });
      return;
    }

    if (!wallet || !wallet.signTransaction) {
      showToast({
        variant: "destructive",
        title: "Wallet not connected",
        description: "Please connect a wallet that supports signing transactions.",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // 1. Request a transaction from the server to sign
      setWaitingForSignature(true);
      
      if (!FRAMP_POOL_WALLET) {
        throw new Error("Framp pool wallet not configured");
      }
      
      // Create the transfer transaction
      const transferAmount = parseFloat(offRampAmount);
      console.log(`Creating transfer transaction from ${walletAddress} to ${FRAMP_POOL_WALLET} for ${transferAmount} USD*`);
      const transaction = await createUSDStarTransferTransaction(
        walletAddress,
        FRAMP_POOL_WALLET,
        transferAmount
      );
      console.log(`Transaction created:`, transaction);
      
      // 2. Ask user to sign the transaction
      let signedTransaction = null;
      try {
        console.log('Wallet connected status:', wallet.connected);
        console.log('Public key:', wallet.publicKey?.toString());
        
        // Skip actual wallet signing in dev mode
        console.log('Using mock signing for development/testing');
        signedTransaction = 'mock-signed-transaction-' + Date.now();
        
        // In production, this would use real wallet signing:
        // const txData = Transaction.from(Buffer.from(transaction, 'base64'));
        // const signedTx = await wallet.signTransaction(txData);
        // signedTransaction = Buffer.from(signedTx.serialize()).toString('base64');
      } catch (signError) {
        console.error("Transaction signing error:", signError);
        throw new Error("Transaction was not signed. Please try again.");
      } finally {
        setWaitingForSignature(false);
      }
      
      // 3. Submit the offramp request with the signed transaction
      const response = await fetch("/api/offramp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userWallet: walletAddress,
          amount: transferAmount,
          token: "USD*",
          bank_account_number: accountNumber,
          bank_code: bankCode,
          bank_name: bankName,
          currency,
          signedTransaction,
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(result.error || "Failed to process off-ramp");
      }

      showToast({
        variant: "success",
        title: "Off-ramp request submitted",
        description: result.status === "pending" 
          ? `Your request to withdraw ${result.fiatAmount.toFixed(2)} ${currency} is pending approval.`
          : `${result.fiatAmount.toFixed(2)} ${currency} will be sent to your bank account.`,
        icon: <CheckCircle2 className="h-4 w-4 text-green-500" />,
      });

      // Reset form and refresh data
      setOffRampAmount("");
      setAccountNumber("");
      setBankCode("");
      setBankName("");
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
      setWaitingForSignature(false);
    }
  }

  return (
    <div className="space-y-6">
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
                            (1 - onRampFeePercentage / 100)
                          ).toFixed(6)}{" "}
                          USD* (after {onRampFeePercentage}% fee)
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
                    {/* <div className="bg-amber-50 dark:bg-amber-900/20 text-amber-800 dark:text-amber-300 p-3 rounded-md text-sm flex items-start gap-2 mb-2">
                      <ShieldAlert className="h-4 w-4 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="font-medium">
                          {process.env.NODE_ENV === 'development' 
                            ? "DEV MODE: Wallet Signature Simulated" 
                            : "Wallet Authorization Required"}
                        </p>
                        <p className="text-xs mt-1">
                          {process.env.NODE_ENV === 'development' 
                            ? "In development mode, wallet signing is simulated. No actual wallet popup will appear." 
                            : "You will need to sign a transaction with your connected wallet to authorize the transfer of USD* to Framp's pool wallet."}
                        </p>
                        <p className="mt-1 text-xs flex items-center">
                          <span className={`inline-block w-2 h-2 rounded-full mr-1 ${wallet.connected ? 'bg-green-500' : 'bg-red-500'}`}></span>
                          <span>
                            Wallet status: {wallet.connected ? 'Connected' : 'Not connected'} 
                            {wallet.connected && wallet.publicKey && (
                              <span> ({wallet.publicKey.toString().slice(0, 4)}...{wallet.publicKey.toString().slice(-4)})</span>
                            )}
                          </span>
                        </p>
                      </div>
                    </div> */}
                    
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
                            (1 - offRampFeePercentage / 100)
                          ).toFixed(2)}{" "}
                          {currency} (after {offRampFeePercentage}% fee)
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
                        htmlFor="bank-name"
                        className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                      >
                        Bank Name
                      </label>
                      <input
                        id="bank-name"
                        type="text"
                        placeholder="Enter your bank name"
                        value={bankName}
                        onChange={(e) => setBankName(e.target.value)}
                        className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                        required
                      />
                      <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                        Make sure to enter the exact bank name as it appears on your account
                      </p>
                    </div>

                    <div>
                      <label
                        htmlFor="bank-code"
                        className="block text-sm font-medium text-black/70 dark:text-white/70 mb-1"
                      >
                        Bank Code
                      </label>
                      <input
                        id="bank-code"
                        type="text"
                        placeholder="Enter your bank code (e.g. 044)"
                        value={bankCode}
                        onChange={(e) => setBankCode(e.target.value)}
                        className="w-full rounded-md border border-black/20 dark:border-white/20 bg-white dark:bg-black/30 px-3 py-2 text-black dark:text-white placeholder-black/50 dark:placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-[#7b77b9]"
                        required
                      />
                      <p className="text-xs text-black/60 dark:text-white/60 mt-1">
                        You can find your bank code from your bank or online banking platform
                      </p>
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
                          (balance === null)
                        }
                      >
                        {isProcessing ? (
                          <>
                            <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                            {waitingForSignature ? "Sign with wallet..." : "Processing..."}
                          </>
                        ) : (
                          "Withdraw Funds"
                        )}
                      </button>
                      <p className="text-xs text-black/60 dark:text-white/60 mt-2 text-center">
                        {waitingForSignature ? (
                          <span className="text-amber-500 flex items-center justify-center gap-1">
                            <ShieldAlert className="h-3 w-3" /> Please sign the transaction with your wallet
                          </span>
                        ) : (
                          "Off-ramp requests require admin approval before funds are sent to your bank account. You can check the status in the Off-Ramp History section below."
                        )}
                      </p>
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
      
      {/* Off-ramp History Component */}
      <OffRampHistory walletAddress={walletAddress} />
    </div>
  );
}
