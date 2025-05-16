// Configuration for ramp functionality
export interface RampConfig {
  // Default token for onramp/offramp
  defaultToken: string;
  
  // Fee percentages
  onRampFeePercentage: number;
  offRampFeePercentage: number;
  
  // Supported countries for fiat
  supportedCountries: string[];
  
  // Supported fiat currencies for offramp
  supportedFiatCurrencies: {
    code: string;
    name: string;
    symbol: string;
  }[];
  
  // Bank information by country for offramp
  banksByCountry: Record<string, {
    code: string;
    name: string;
  }[]>;
  
  // Pool wallet for deposits
  poolWalletAddress: string;
  
  // Is dev mode - set to true for mock responses
  devMode: boolean;
}

// Default configuration
const defaultConfig: RampConfig = {
  defaultToken: 'USDC',
  onRampFeePercentage: 1,
  offRampFeePercentage: 1,
  supportedCountries: ['Nigeria', 'Ghana', 'Kenya', 'South Africa'],
  supportedFiatCurrencies: [
    { code: 'NGN', name: 'Nigerian Naira', symbol: '₦' },
    { code: 'GHS', name: 'Ghanaian Cedi', symbol: '₵' },
    { code: 'KES', name: 'Kenyan Shilling', symbol: 'KSh' },
    { code: 'ZAR', name: 'South African Rand', symbol: 'R' },
    { code: 'USD', name: 'US Dollar', symbol: '$' },
  ],
  banksByCountry: {
    'Nigeria': [
      { code: '044', name: 'Access Bank' },
      { code: '063', name: 'Access Bank (Diamond)' },
      { code: '050', name: 'EcoBank' },
      { code: '011', name: 'First Bank of Nigeria' },
      { code: '214', name: 'First City Monument Bank' },
      { code: '058', name: 'Guaranty Trust Bank' },
      { code: '030', name: 'Heritage Bank' },
      { code: '082', name: 'Keystone Bank' },
      { code: '526', name: 'Parallex Bank' },
      { code: '076', name: 'Polaris Bank' },
      { code: '221', name: 'Stanbic IBTC Bank' },
      { code: '068', name: 'Standard Chartered Bank' },
      { code: '232', name: 'Sterling Bank' },
      { code: '032', name: 'Union Bank of Nigeria' },
      { code: '033', name: 'United Bank For Africa' },
      { code: '215', name: 'Unity Bank' },
      { code: '035', name: 'Wema Bank' },
      { code: '057', name: 'Zenith Bank' },
    ],
    'Ghana': [
      { code: 'GH001', name: 'GCB Bank' },
      { code: 'GH002', name: 'Ecobank Ghana' },
      { code: 'GH003', name: 'Cal Bank' },
    ],
    'Kenya': [
      { code: 'KE001', name: 'Equity Bank' },
      { code: 'KE002', name: 'KCB Bank' },
      { code: 'KE003', name: 'Co-operative Bank' },
    ],
    'South Africa': [
      { code: 'ZA001', name: 'Standard Bank' },
      { code: 'ZA002', name: 'First National Bank' },
      { code: 'ZA003', name: 'ABSA' },
      { code: 'ZA004', name: 'Nedbank' },
    ],
  },
  poolWalletAddress: '6FiKgaDKo5Zrz2YcyuVo9rkgSU3MkFw6na9di4fGyqn',
  devMode: true,
};

// Get configuration with optional overrides
export function getRampConfig(overrides?: Partial<RampConfig>): RampConfig {
  // Apply environment variables if available
  const envConfig: Partial<RampConfig> = {
    onRampFeePercentage: process.env.NEXT_PUBLIC_ONRAMP_FEE_PERCENTAGE 
      ? Number(process.env.NEXT_PUBLIC_ONRAMP_FEE_PERCENTAGE) 
      : undefined,
    offRampFeePercentage: process.env.NEXT_PUBLIC_OFFRAMP_FEE_PERCENTAGE 
      ? Number(process.env.NEXT_PUBLIC_OFFRAMP_FEE_PERCENTAGE) 
      : undefined,
    poolWalletAddress: process.env.NEXT_PUBLIC_FRAMP_POOL_WALLET || undefined,
    devMode: process.env.NEXT_PUBLIC_DEV_MODE === 'true',
  };

  // Remove undefined values
  Object.keys(envConfig).forEach(key => {
    if (envConfig[key as keyof RampConfig] === undefined) {
      delete envConfig[key as keyof RampConfig];
    }
  });

  // Merge default config with environment variables and provided overrides
  return {
    ...defaultConfig,
    ...envConfig,
    ...overrides,
  };
}

export default getRampConfig();
