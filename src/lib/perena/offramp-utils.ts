import { createClient } from "@supabase/supabase-js";

// Initialize Supabase client with environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create Supabase client for client-side operations
const supabase = supabaseUrl && supabaseAnonKey 
  ? createClient(supabaseUrl, supabaseAnonKey)
  : null;

export interface OffRampRequest {
  id: string;
  user_id: string | null;
  wallet: string;
  token: string;
  amount: number;
  fiat_amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_code: string;
  status: 'pending' | 'processing' | 'approved' | 'rejected' | 'failed';
  created_at: string;
  fiat_disbursement_status: 'pending' | 'disbursed' | 'failed';
  disbursed_at: string | null;
  payout_reference: string | null;
  admin_note: string | null;
}

/**
 * Get a list of off-ramp requests for a specific wallet address
 * @param walletAddress The wallet address to get off-ramp requests for
 * @returns A list of off-ramp requests
 */
export async function getOffRampRequests(walletAddress: string): Promise<OffRampRequest[]> {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  
  const { data, error } = await supabase
    .from("offramp_requests")
    .select("*")
    .eq("wallet", walletAddress)
    .order("created_at", { ascending: false });
    
  if (error) {
    console.error("Error fetching off-ramp requests:", error);
    throw new Error("Failed to fetch off-ramp requests");
  }
  
  return data || [];
}

/**
 * Get a specific off-ramp request by ID
 * @param requestId The ID of the off-ramp request
 * @returns The off-ramp request
 */
export async function getOffRampRequestById(requestId: string): Promise<OffRampRequest> {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  
  const { data, error } = await supabase
    .from("offramp_requests")
    .select("*")
    .eq("id", requestId)
    .single();
    
  if (error) {
    console.error("Error fetching off-ramp request:", error);
    throw new Error("Failed to fetch off-ramp request");
  }
  
  return data;
}

/**
 * Check if an off-ramp request is still pending
 * @param requestId The ID of the off-ramp request
 * @returns True if the request is still pending
 */
export async function isOffRampPending(requestId: string): Promise<boolean> {
  try {
    const request = await getOffRampRequestById(requestId);
    return request.status === 'pending' || request.status === 'processing';
  } catch (error) {
    console.error("Error checking off-ramp status:", error);
    return false;
  }
}

/**
 * Create a new off-ramp request
 * @param requestData The off-ramp request data
 * @returns The created off-ramp request
 */
export async function createOffRampRequest(requestData: {
  wallet: string;
  token: string;
  amount: number;
  fiat_amount: number;
  bank_name: string;
  bank_account_number: string;
  bank_code: string;
  user_id?: string;
}): Promise<OffRampRequest> {
  if (!supabase) {
    throw new Error("Supabase client not initialized");
  }
  
  const { data, error } = await supabase
    .from("offramp_requests")
    .insert({
      ...requestData,
      status: 'pending',
      fiat_disbursement_status: 'pending',
      created_at: new Date().toISOString()
    })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating off-ramp request:", error);
    throw new Error("Failed to create off-ramp request");
  }
  
  return data;
}

/**
 * Format the status of an off-ramp request into a human-readable string
 * @param request The off-ramp request
 * @returns A human-readable status string
 */
export function formatOffRampStatus(request: OffRampRequest): string {
  if (request.status === 'failed') {
    return 'Failed';
  }
  
  if (request.status === 'rejected') {
    return 'Rejected';
  }
  
  if (request.status === 'approved') {
    if (request.fiat_disbursement_status === 'disbursed') {
      return 'Disbursed';
    }
    if (request.fiat_disbursement_status === 'failed') {
      return 'Disbursement failed';
    }
    return 'Approved, pending disbursement';
  }
  
  if (request.status === 'processing') {
    return 'Processing';
  }
  
  return 'Pending';
} 