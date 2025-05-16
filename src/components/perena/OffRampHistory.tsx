import { useState, useEffect } from "react";
import { formatDistanceToNow } from "date-fns";
import { RefreshCw, AlertCircle, CheckCircle, XCircle, Clock } from "lucide-react";
import { getOffRampRequests, OffRampRequest, formatOffRampStatus } from "@/lib/perena/offramp-utils";

export default function OffRampHistory({ walletAddress }: { walletAddress: string }) {
  const [requests, setRequests] = useState<OffRampRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (walletAddress) {
      loadOffRampHistory();
    }
  }, [walletAddress]);

  const loadOffRampHistory = async () => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await getOffRampRequests(walletAddress);
      setRequests(data);
    } catch (err) {
      console.error("Failed to load off-ramp history:", err);
      setError("Failed to load off-ramp history. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  const formatDate = (date: string) => {
    try {
      return formatDistanceToNow(new Date(date), { addSuffix: true });
    } catch (e) {
      return "Unknown";
    }
  };

  const getStatusIcon = (request: OffRampRequest) => {
    if (request.status === "failed" || request.status === "rejected") {
      return <XCircle className="h-4 w-4 text-red-500" />;
    }
    if (request.status === "approved" && request.fiat_disbursement_status === "disbursed") {
      return <CheckCircle className="h-4 w-4 text-green-500" />;
    }
    if (request.status === "processing" || request.status === "approved") {
      return <Clock className="h-4 w-4 text-amber-500" />;
    }
    return <Clock className="h-4 w-4 text-gray-500" />;
  };

  return (
    <div className="bg-white dark:bg-background/50 backdrop-blur-md border border-black/10 dark:border-white/10 shadow-sm rounded-xl overflow-hidden">
      <div className="p-5 border-b border-black/10 dark:border-white/10">
        <div className="flex justify-between items-center">
          <h3 className="text-xl font-bold text-black dark:text-white">Off-Ramp History</h3>
          <button
            onClick={loadOffRampHistory}
            className="text-black/60 dark:text-white/60 hover:text-black dark:hover:text-white"
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? "animate-spin" : ""}`} />
            <span className="sr-only">Refresh history</span>
          </button>
        </div>
      </div>

      <div className="p-5">
        {isLoading ? (
          <div className="flex justify-center items-center py-8">
            <RefreshCw className="h-6 w-6 animate-spin text-black/40 dark:text-white/40" />
            <span className="ml-2 text-black/60 dark:text-white/60">Loading history...</span>
          </div>
        ) : error ? (
          <div className="flex justify-center items-center py-8 text-red-500 gap-2">
            <AlertCircle className="h-5 w-5" />
            <span>{error}</span>
          </div>
        ) : requests.length === 0 ? (
          <div className="text-center py-8 text-black/60 dark:text-white/60">
            <p>No off-ramp requests found.</p>
            <p className="text-sm mt-2">When you withdraw USD*, your transactions will appear here.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {requests.map((request) => (
              <div key={request.id} className="border border-black/10 dark:border-white/10 rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <div className="font-medium text-black dark:text-white">
                      {request.amount.toFixed(6)} {request.token}
                    </div>
                    <div className="text-sm text-black/60 dark:text-white/60">
                      ≈ {request.fiat_amount.toFixed(2)} NGN
                    </div>
                  </div>
                  <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-black/5 dark:bg-white/5 text-sm">
                    {getStatusIcon(request)}
                    <span className="text-black/80 dark:text-white/80">{formatOffRampStatus(request)}</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <div className="text-black/50 dark:text-white/50">Bank</div>
                    <div className="text-black dark:text-white font-medium">{request.bank_name}</div>
                  </div>
                  <div>
                    <div className="text-black/50 dark:text-white/50">Account</div>
                    <div className="text-black dark:text-white font-medium">
                      {/* Show partial account number for privacy */}
                      {"•".repeat(Math.max(0, request.bank_account_number.length - 4))}
                      {request.bank_account_number.slice(-4)}
                    </div>
                  </div>
                  <div>
                    <div className="text-black/50 dark:text-white/50">Created</div>
                    <div className="text-black dark:text-white">{formatDate(request.created_at)}</div>
                  </div>
                  {request.disbursed_at && (
                    <div>
                      <div className="text-black/50 dark:text-white/50">Disbursed</div>
                      <div className="text-black dark:text-white">{formatDate(request.disbursed_at)}</div>
                    </div>
                  )}
                </div>

                {request.admin_note && (
                  <div className="mt-3 p-2 bg-black/5 dark:bg-white/5 rounded text-sm text-black/70 dark:text-white/70">
                    <div className="font-medium">Note:</div>
                    <div>{request.admin_note}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
} 