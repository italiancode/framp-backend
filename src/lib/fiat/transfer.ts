/**
 * Mock implementation of Flutterwave transfer API
 * In a production app, this would integrate with the actual Flutterwave API
 */

export interface FlutterwaveTransferParams {
  amount: number;
  account_number: string;
  bank_code: string;
  currency: string;
  narration?: string;
  reference?: string;
}

export interface FlutterwaveTransferResponse {
  status: 'success' | 'error';
  message: string;
  data?: {
    id: number;
    reference: string;
    amount: number;
    status: string;
    narration: string;
    complete_message: string;
    bank_name: string;
    account_number: string;
    created_at: string;
  };
  error?: any;
}

/**
 * Initiates a bank transfer using Flutterwave
 * This is a mock implementation for demonstration purposes
 */
export async function initiateFlutterwaveTransfer(
  params: FlutterwaveTransferParams
): Promise<FlutterwaveTransferResponse> {
  // In a real implementation, this would make an API call to Flutterwave
  
  console.log('Initiating Flutterwave transfer:', params);
  
  // Generate a random reference if not provided
  const reference = params.reference || `FLW-${Date.now()}-${Math.floor(Math.random() * 1000000)}`;
  
  // Simulate API delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  // Return mock successful response
  return {
    status: 'success',
    message: 'Transfer has been queued for processing',
    data: {
      id: Math.floor(Math.random() * 1000000),
      reference,
      amount: params.amount,
      status: 'NEW',
      narration: params.narration || 'Framp withdrawal',
      complete_message: 'Transfer queued successfully',
      bank_name: getBankName(params.bank_code),
      account_number: params.account_number,
      created_at: new Date().toISOString(),
    }
  };
}

/**
 * Helper function to get bank name from code
 */
function getBankName(bankCode: string): string {
  const banks: Record<string, string> = {
    '044': 'Access Bank',
    '063': 'Access Bank (Diamond)',
    '050': 'EcoBank',
    '011': 'First Bank of Nigeria',
    '214': 'First City Monument Bank',
    '058': 'Guaranty Trust Bank',
    '030': 'Heritage Bank',
    '301': 'Jaiz Bank',
    '082': 'Keystone Bank',
    '526': 'Parallex Bank',
    '076': 'Polaris Bank',
    '221': 'Stanbic IBTC Bank',
    '068': 'Standard Chartered Bank',
    '232': 'Sterling Bank',
    '100': 'Suntrust Bank',
    '032': 'Union Bank of Nigeria',
    '033': 'United Bank For Africa',
    '215': 'Unity Bank',
    '035': 'Wema Bank',
    '057': 'Zenith Bank',
  };
  
  return banks[bankCode] || 'Unknown Bank';
}
