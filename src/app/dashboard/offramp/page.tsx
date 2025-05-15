'use client';

import { useState, useEffect } from 'react';
import { useWallet } from '@solana/wallet-adapter-react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { useWalletContext } from '@/contexts/WalletContext';
import Link from 'next/link';
import { 
  ArrowLeft, 
  AlertCircle, 
  ExternalLink, 
  DollarSign,
  CheckCircle2,
  ArrowRightCircle,
  Coins
} from 'lucide-react';
import { Spinner } from 'reactstrap';
import { WalletMultiButton } from '@solana/wallet-adapter-react-ui';

// Exchange rates (for demonstration purposes)
const EXCHANGE_RATES = {
  USD: 66.23,
  EUR: 61.50,
  GBP: 51.88,
};

// Bank options
const BANK_OPTIONS = [
  { id: 'bank_transfer', name: 'Bank Transfer', fee: 0.5 },
  { id: 'paypal', name: 'PayPal', fee: 1.0 },
  { id: 'wise', name: 'Wise', fee: 0.75 },
];

export default function OfframpPage() {
  const { publicKey, connected } = useWallet();
  const { balance, refreshBalance } = useWalletContext();
  const { user } = useAuth();
  const router = useRouter();

  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [receiving, setReceiving] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<string>('bank_transfer');
  const [bankDetails, setBankDetails] = useState<{
    accountName: string;
    accountNumber: string;
    routingNumber: string;
    bankName: string;
  }>({
    accountName: '',
    accountNumber: '',
    routingNumber: '',
    bankName: '',
  });
  const [step, setStep] = useState<number>(1);
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [transactionId, setTransactionId] = useState<string>('');
  const [error, setError] = useState<string | null>(null);

  // Refresh balance when the component loads
  useEffect(() => {
    if (connected && publicKey) {
      refreshBalance();
    }
  }, [connected, publicKey, refreshBalance]);

  // Calculate receiving amount when input changes
  useEffect(() => {
    if (amount && !isNaN(parseFloat(amount))) {
      const solAmount = parseFloat(amount);
      const selectedPaymentMethod = BANK_OPTIONS.find(option => option.id === paymentMethod);
      const feePercentage = selectedPaymentMethod ? selectedPaymentMethod.fee : 0;
      
      // Calculate fiat amount after fees
      const exchangeRate = EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES] || 0;
      const rawAmount = solAmount * exchangeRate;
      const feeAmount = (rawAmount * feePercentage) / 100;
      const finalAmount = rawAmount - feeAmount;
      
      setReceiving(finalAmount);
    } else {
      setReceiving(0);
    }
  }, [amount, currency, paymentMethod]);

  // Form validation
  const validateForm = () => {
    if (!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0) {
      setError('Please enter a valid amount');
      return false;
    }
    
    if (parseFloat(amount) > (balance || 0)) {
      setError('Insufficient balance');
      return false;
    }

    if (step === 2) {
      if (!bankDetails.accountName || !bankDetails.accountNumber || !bankDetails.routingNumber || !bankDetails.bankName) {
        setError('Please fill in all bank details');
        return false;
      }
    }

    setError(null);
    return true;
  };

  // Handle next step
  const handleNext = () => {
    if (validateForm()) {
      setStep(step + 1);
    }
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;
    
    setIsSubmitting(true);
    setError(null);
    
    try {
      // In a real app, you would integrate with a payment processor API here
      // For demo purposes, we'll simulate a successful transaction
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Generate a random transaction ID
      const mockTransactionId = 'TX-' + Math.random().toString(36).substring(2, 10).toUpperCase();
      setTransactionId(mockTransactionId);
      
      // Move to confirmation step
      setStep(4);
    } catch (err: any) {
      setError(err.message || 'Transaction failed. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

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
            
            <Link href="/dashboard" className="flex items-center text-gray-300 hover:text-white">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Dashboard
            </Link>
          </div>
        </div>
      </header>

      {/* Offramp Content */}
      <div className="container mx-auto px-4 py-8">
        <div className="bg-gray-900/60 backdrop-blur-md p-6 rounded-xl border border-gray-800 shadow-lg">
          <h1 className="text-2xl font-bold mb-6">Offramp SOL to Fiat</h1>

          {!connected && (
            <div className="text-center py-8">
              <p className="text-gray-400 mb-6">Connect your wallet to proceed with the offramp</p>
              <div className="wallet-adapter-dropdown inline-block">
                <WalletMultiButton className="!bg-purple-600 hover:!bg-purple-700 !rounded-lg !h-auto !py-3 !px-4" />
              </div>
            </div>
          )}

          {connected && publicKey && (
            <>
              {/* Progress Indicator */}
              <div className="mb-8">
                <div className="flex items-center justify-between max-w-lg mx-auto">
                  <div className={`flex flex-col items-center ${step >= 1 ? 'text-purple-500' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 1 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}>
                      <span className="text-white">1</span>
                    </div>
                    <span className="text-xs mt-1">Details</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${step >= 2 ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                  
                  <div className={`flex flex-col items-center ${step >= 2 ? 'text-purple-500' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 2 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}>
                      <span className="text-white">2</span>
                    </div>
                    <span className="text-xs mt-1">Bank Info</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${step >= 3 ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                  
                  <div className={`flex flex-col items-center ${step >= 3 ? 'text-purple-500' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 3 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}>
                      <span className="text-white">3</span>
                    </div>
                    <span className="text-xs mt-1">Review</span>
                  </div>
                  <div className={`h-1 flex-1 mx-2 ${step >= 4 ? 'bg-purple-500' : 'bg-gray-700'}`}></div>
                  
                  <div className={`flex flex-col items-center ${step >= 4 ? 'text-purple-500' : 'text-gray-500'}`}>
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      step >= 4 ? 'bg-purple-500' : 'bg-gray-700'
                    }`}>
                      <span className="text-white">4</span>
                    </div>
                    <span className="text-xs mt-1">Complete</span>
                  </div>
                </div>
              </div>

              {/* Form Content */}
              <div className="max-w-xl mx-auto">
                {/* Step 1: Amount and Currency */}
                {step === 1 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Enter Amount</h2>
                    <div className="bg-gray-800/50 p-5 rounded-lg mb-6">
                      <div className="mb-4">
                        <p className="text-sm text-gray-400 mb-1">Available Balance</p>
                        <p className="text-lg font-medium">{balance !== null ? `${balance.toFixed(4)} SOL` : 'Loading...'}</p>
                      </div>
                      
                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Amount (SOL)
                        </label>
                        <input
                          type="number"
                          step="0.01"
                          min="0.01"
                          max={balance || 0}
                          value={amount}
                          onChange={(e) => setAmount(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                          placeholder="0.00"
                        />
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Receiving Currency
                        </label>
                        <select
                          value={currency}
                          onChange={(e) => setCurrency(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                          <option value="USD">USD - US Dollar</option>
                          <option value="EUR">EUR - Euro</option>
                          <option value="GBP">GBP - British Pound</option>
                        </select>
                      </div>

                      <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-400 mb-2">
                          Payment Method
                        </label>
                        <select
                          value={paymentMethod}
                          onChange={(e) => setPaymentMethod(e.target.value)}
                          className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                        >
                          {BANK_OPTIONS.map(option => (
                            <option key={option.id} value={option.id}>
                              {option.name} (Fee: {option.fee}%)
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="mt-6 pt-4 border-t border-gray-700">
                        <div className="flex justify-between items-center">
                          <span className="text-gray-400">You will receive approximately:</span>
                          <span className="text-lg font-medium">
                            {receiving.toFixed(2)} {currency}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Final amount may vary based on network fees and exchange rate fluctuations
                        </p>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <Link
                        href="/dashboard/wallet"
                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                      >
                        Back
                      </Link>
                      <button
                        onClick={handleNext}
                        disabled={!amount || isNaN(parseFloat(amount)) || parseFloat(amount) <= 0}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 2: Bank Information */}
                {step === 2 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Bank Information</h2>
                    <div className="bg-gray-800/50 p-5 rounded-lg mb-6">
                      <div className="space-y-4">
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Bank Name
                          </label>
                          <input
                            type="text"
                            value={bankDetails.bankName}
                            onChange={(e) => setBankDetails({...bankDetails, bankName: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="Bank Name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Account Holder Name
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountName}
                            onChange={(e) => setBankDetails({...bankDetails, accountName: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="Account Holder Name"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Account Number
                          </label>
                          <input
                            type="text"
                            value={bankDetails.accountNumber}
                            onChange={(e) => setBankDetails({...bankDetails, accountNumber: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="Account Number"
                          />
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-400 mb-2">
                            Routing Number
                          </label>
                          <input
                            type="text"
                            value={bankDetails.routingNumber}
                            onChange={(e) => setBankDetails({...bankDetails, routingNumber: e.target.value})}
                            className="w-full px-4 py-3 bg-gray-700/80 border border-gray-600 rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 text-white"
                            placeholder="Routing Number"
                          />
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(1)}
                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleNext}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                      >
                        Continue
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 3: Review */}
                {step === 3 && (
                  <div>
                    <h2 className="text-xl font-semibold mb-4">Review & Confirm</h2>
                    <div className="bg-gray-800/50 p-5 rounded-lg mb-6">
                      <div className="space-y-6">
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Transaction Details</h3>
                          <div className="bg-gray-700/50 p-4 rounded-lg">
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Amount</span>
                              <span>{amount} SOL</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Exchange Rate</span>
                              <span>1 SOL = {EXCHANGE_RATES[currency as keyof typeof EXCHANGE_RATES]} {currency}</span>
                            </div>
                            <div className="flex justify-between mb-2">
                              <span className="text-gray-400">Fee</span>
                              <span>
                                {BANK_OPTIONS.find(option => option.id === paymentMethod)?.fee || 0}%
                              </span>
                            </div>
                            <div className="flex justify-between pt-2 border-t border-gray-600">
                              <span className="text-gray-300 font-medium">Total Receiving</span>
                              <span className="text-white font-medium">
                                {receiving.toFixed(2)} {currency}
                              </span>
                            </div>
                          </div>
                        </div>
                        
                        <div>
                          <h3 className="text-sm font-medium text-gray-400 mb-2">Payment Method</h3>
                          <div className="bg-gray-700/50 p-4 rounded-lg">
                            <p className="mb-1">{BANK_OPTIONS.find(option => option.id === paymentMethod)?.name}</p>
                            <p className="text-gray-400 text-sm">{bankDetails.bankName}</p>
                            <p className="text-gray-400 text-sm">Account: {bankDetails.accountNumber}</p>
                          </div>
                        </div>
                        
                        <div className="bg-yellow-900/20 border border-yellow-800/50 rounded-lg p-4">
                          <p className="text-yellow-400 text-sm flex items-start">
                            <AlertCircle className="h-5 w-5 mr-2 flex-shrink-0 mt-0.5" />
                            By continuing, you agree to our terms of service. Once submitted, this transaction cannot be reversed.
                          </p>
                        </div>
                      </div>
                    </div>

                    {error && (
                      <div className="mb-4 p-3 bg-red-900/40 border border-red-800 rounded-lg flex items-start">
                        <AlertCircle className="h-5 w-5 text-red-500 mr-2 flex-shrink-0 mt-0.5" />
                        <p className="text-red-400 text-sm">{error}</p>
                      </div>
                    )}

                    <div className="flex justify-between">
                      <button
                        onClick={() => setStep(2)}
                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                      >
                        Back
                      </button>
                      <button
                        onClick={handleSubmit}
                        disabled={isSubmitting}
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white flex items-center"
                      >
                        {isSubmitting ? (
                          <>
                            <Spinner size="sm" className="mr-2" /> Processing...
                          </>
                        ) : (
                          'Confirm & Submit'
                        )}
                      </button>
                    </div>
                  </div>
                )}

                {/* Step 4: Confirmation */}
                {step === 4 && (
                  <div className="text-center py-4">
                    <div className="mb-6">
                      <div className="mx-auto w-16 h-16 bg-green-900/30 rounded-full flex items-center justify-center mb-4">
                        <CheckCircle2 className="h-8 w-8 text-green-500" />
                      </div>
                      <h2 className="text-xl font-semibold">Transaction Successful!</h2>
                      <p className="text-gray-400 mt-2">
                        Your offramp transaction has been processed successfully.
                      </p>
                    </div>
                    
                    <div className="bg-gray-800/50 p-5 rounded-lg mb-6 text-left">
                      <div className="space-y-4">
                        <div>
                          <p className="text-sm text-gray-400">Transaction ID</p>
                          <p className="font-mono bg-gray-700/50 p-2 rounded mt-1 text-sm">{transactionId}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Amount</p>
                          <p className="font-medium">{amount} SOL ≈ {receiving.toFixed(2)} {currency}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Destination</p>
                          <p className="font-medium">{bankDetails.bankName} - {bankDetails.accountNumber}</p>
                        </div>
                        
                        <div>
                          <p className="text-sm text-gray-400">Status</p>
                          <p className="font-medium text-green-500">Processing</p>
                        </div>
                        
                        <div className="pt-4 border-t border-gray-700">
                          <p className="text-sm text-gray-400">
                            Funds should appear in your bank account within 1-3 business days.
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex justify-center space-x-4">
                      <Link
                        href="/dashboard"
                        className="px-5 py-2.5 bg-gray-800 hover:bg-gray-700 rounded-lg text-white"
                      >
                        Back to Dashboard
                      </Link>
                      <Link
                        href="/dashboard/wallet"
                        className="px-5 py-2.5 bg-purple-600 hover:bg-purple-700 rounded-lg text-white"
                      >
                        View Wallet
                      </Link>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* Additional Information */}
          <div className="mt-12 pt-6 border-t border-gray-800">
            <h3 className="text-lg font-semibold mb-4">About Offramp</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-800/50 p-5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center mb-3">
                  <DollarSign className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="font-medium mb-2">Competitive Rates</h4>
                <p className="text-sm text-gray-400">
                  Our exchange rates are updated in real-time to provide you with the best value.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center mb-3">
                  <ArrowRightCircle className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="font-medium mb-2">Fast Transfers</h4>
                <p className="text-sm text-gray-400">
                  Most transactions process within 1-3 business days to your bank account.
                </p>
              </div>
              
              <div className="bg-gray-800/50 p-5 rounded-lg">
                <div className="w-10 h-10 rounded-full bg-purple-900/50 flex items-center justify-center mb-3">
                  <ExternalLink className="h-5 w-5 text-purple-400" />
                </div>
                <h4 className="font-medium mb-2">Global Support</h4>
                <p className="text-sm text-gray-400">
                  Support for multiple currencies and payment methods across different regions.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container max-w-7xl mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Add Perena USD* off-ramp option */}
          <Link href="/dashboard/offramp/perena">
            <div className="bg-white dark:bg-background/50 backdrop-blur-md rounded-xl border border-black/10 dark:border-white/10 shadow-sm p-6 hover:shadow-md transition-all">
              <div className="flex justify-between items-start">
                <div className="text-white p-3 rounded-full bg-[#7b77b9]">
                  <Coins className="h-6 w-6" />
                </div>
                <div className="flex items-center px-2 py-1 rounded-full bg-green-100 dark:bg-green-900/30 text-green-800 dark:text-green-300 text-xs font-medium">
                  ~5.2% APR
                </div>
              </div>
              <h3 className="text-xl font-bold mt-4 text-black dark:text-white">Perena USD*</h3>
              <p className="text-black/70 dark:text-white/70 mt-2">
                Convert yield-bearing USD* to fiat with our premium banking partner
              </p>
              <div className="mt-4 pt-4 border-t border-black/10 dark:border-white/10">
                <p className="text-sm text-black/60 dark:text-white/60">
                  Supported: Bank transfers, Mobile money
                </p>
              </div>
            </div>
          </Link>
        </div>
      </div>
    </main>
  );
}
