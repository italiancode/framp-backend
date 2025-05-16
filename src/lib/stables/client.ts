import { Connection, PublicKey, Transaction } from "@solana/web3.js";

// Configuration for supported stablecoins
export interface StablecoinConfig {
  symbol: string;
  name: string;
  tokenAddress: string;
  decimals: number;
  logoUrl?: string;
}

// Define supported stablecoins
export const SUPPORTED_STABLECOINS: Record<string, StablecoinConfig> = {
  USD_STAR: {
    symbol: "USD*",
    name: "Perena USD*",
    tokenAddress: "BenJy1n3WTx9mTjEvy63e8Q1j4RqUc6E4VBMz3ir4Wo6", // USD* token address
    decimals: 6,
    logoUrl: "/tokens/usdstar.png",
  },
  USDC: {
    symbol: "USDC",
    name: "USD Coin",
    tokenAddress: "EPjFWdd5AufqSSqeM2qN1xzybapC8G4wEGGkZwyTDt1v", // Solana USDC token address
    decimals: 6,
    logoUrl: "/tokens/usdc.png",
  },
  USDT: {
    symbol: "USDT",
    name: "Tether USD",
    tokenAddress: "Es9vMFrzaCERmJfrF4H2FYD4KCoNkY11McCe8BenwNYB", // Solana USDT token address
    decimals: 6,
    logoUrl: "/tokens/usdt.png",
  },
};

// Numeraire program ID
const PERENA_PROGRAM_ID = "NUMERUNsFCP3kuNmWZuXtm1AaQCPj9uw6Guv2Ekoi5P";

// Interface for the stables client
export interface StablesClient {
  getPoolInfo: () => Promise<any>;
  deposit: (
    walletAddress: string,
    amount: number,
    tokenSymbol: string
  ) => Promise<any>;
  withdraw: (
    walletAddress: string,
    amount: number,
    tokenSymbol: string
  ) => Promise<any>;
  getBalance: (walletAddress: string, tokenSymbol: string) => Promise<number>;
  createTransferTransaction: (
    fromWallet: string,
    toWallet: string,
    amount: number,
    tokenSymbol: string
  ) => Promise<string>;
}

// Initialize a connection to Solana
const getConnection = () => {
  return new Connection(
    process.env.NEXT_PUBLIC_SOLANA_RPC_URL ||
      "https://api.mainnet-beta.solana.com",
    "confirmed"
  );
};

// Get token public key for a given stablecoin
export const getTokenPublicKey = (tokenSymbol: string): PublicKey => {
  const token = SUPPORTED_STABLECOINS[tokenSymbol];
  if (!token) {
    throw new Error(`Unsupported token: ${tokenSymbol}`);
  }
  return new PublicKey(token.tokenAddress);
};

// Function to get token balance for a specific stablecoin
export async function getTokenBalance(
  walletAddress: string,
  tokenSymbol: string
): Promise<number> {
  console.log(
    `Starting getTokenBalance for wallet: ${walletAddress}, token: ${tokenSymbol}`
  );


  try {
    const rpcUrl = process.env.NEXT_PUBLIC_SOLANA_RPC_URL;
    console.log(
      `Using Solana RPC URL: ${rpcUrl ? "Configured" : "Not configured"}`
    );

    if (!rpcUrl) {
      console.error("NEXT_PUBLIC_SOLANA_RPC_URL is not set in environment");
      return 0;
    }

    const connection = getConnection();

    if (!walletAddress) {
      console.error("No wallet address provided");
      return 0;
    }

    const token = SUPPORTED_STABLECOINS[tokenSymbol];
    if (!token) {
      console.error(`Unsupported token: ${tokenSymbol}`);
      return 0;
    }

    // Validate wallet address format
    try {
      console.log(`Creating PublicKey from wallet address: ${walletAddress}`);
      const wallet = new PublicKey(walletAddress);

      console.log(
        `Looking for token accounts with ${tokenSymbol} mint: ${token.tokenAddress}`
      );
      const tokenMint = new PublicKey(token.tokenAddress);
      const tokenAccounts = await connection.getParsedTokenAccountsByOwner(
        wallet,
        { mint: tokenMint }
      );

      console.log(
        `Found ${tokenAccounts.value.length} token accounts for this wallet`
      );

      if (tokenAccounts.value.length === 0) {
        console.log(
          `No ${tokenSymbol} token accounts found, returning balance of 0`
        );
        return 0;
      }

      // Get the balance from the first token account found
      const accountInfo = tokenAccounts.value[0].account.data.parsed.info;
      console.log("Token account info:", JSON.stringify(accountInfo, null, 2));

      const balance = accountInfo.tokenAmount.uiAmount;
      console.log(`Retrieved ${tokenSymbol} balance: ${balance}`);
      return balance;
    } catch (error) {
      if (
        error instanceof Error &&
        error.message.includes("Invalid public key input")
      ) {
        console.error("Invalid wallet address format:", walletAddress);
        return 0;
      }
      throw error; // Re-throw other errors
    }
  } catch (error) {
    console.error(`Error getting ${tokenSymbol} balance:`, error);
    console.log(`Stack trace: ${(error as Error).stack}`);
    return 0;
  }
}

// Function to deposit stablecoins (onramp)
export async function mintToken(
  walletAddress: string,
  amount: number,
  tokenSymbol: string
) {
  try {
    // This would use the appropriate SDK in a real implementation
    // For now, it's a placeholder to demonstrate the flow
    console.log(
      `Minting/Depositing ${amount} ${tokenSymbol} for ${walletAddress}`
    );

    // In a real implementation, this would:
    // 1. Connect to the user's wallet
    // 2. Call the appropriate SDK deposit function
    // 3. Handle transaction confirmation

    // Mock response
    return {
      success: true,
      txId: "mock-transaction-id",
      amount,
      token: tokenSymbol,
    };
  } catch (error) {
    console.error(`Error minting/depositing ${tokenSymbol}:`, error);
    throw new Error(`Failed to mint/deposit ${tokenSymbol}`);
  }
}

// Function to withdraw stablecoins (offramp)
export async function redeemToken(
  walletAddress: string,
  amount: number,
  tokenSymbol: string
) {
  try {
    // This would use the appropriate SDK in a real implementation
    console.log(
      `Withdrawing/Redeeming ${amount} ${tokenSymbol} from ${walletAddress}`
    );

    // Mock response
    return {
      success: true,
      txId: "mock-transaction-id",
      amount,
      token: tokenSymbol,
    };
  } catch (error) {
    console.error(`Error withdrawing/redeeming ${tokenSymbol}:`, error);
    throw new Error(`Failed to withdraw/redeem ${tokenSymbol}`);
  }
}

// Get stablecoin exchange rate
export async function getExchangeRate(
  tokenSymbol: string,
  targetCurrency: string = "USD"
): Promise<number> {
  // In a real implementation, this would query an API for current exchange rates
  // For now, we return fixed rates close to 1:1
  const rates: Record<string, Record<string, number>> = {
    USDC: {
      USD: 1.0001,
      NGN: 1497.2,
      EUR: 0.925,
      GBP: 0.789,
    },
    USDT: {
      USD: 1.0002,
      NGN: 1498.1,
      EUR: 0.924,
      GBP: 0.788,
    },
    USDH: {
      USD: 0.999,
      NGN: 1495.5,
      EUR: 0.923,
      GBP: 0.787,
    },
    UXD: {
      USD: 0.998,
      NGN: 1493.1,
      EUR: 0.922,
      GBP: 0.785,
    },
    USD_STAR: {
      USD: 1.005,
      NGN: 1500.4,
      EUR: 0.927,
      GBP: 0.791,
    },
  };

  if (!rates[tokenSymbol]) {
    return 1.0; // Default if token not found
  }

  return rates[tokenSymbol][targetCurrency] || 1.0;
}

/**
 * Creates a token transfer transaction that must be signed by the user
 * @param fromWallet The wallet address to transfer from
 * @param toWallet The wallet address to transfer to
 * @param amount The amount to transfer
 * @param tokenSymbol The token symbol to transfer
 * @returns A serialized transaction that needs to be signed
 */
export async function createTokenTransferTransaction(
  fromWallet: string,
  toWallet: string,
  amount: number,
  tokenSymbol: string
): Promise<string> {
  try {
    console.log(
      `Creating transfer transaction from ${fromWallet} to ${toWallet} for ${amount} ${tokenSymbol}`
    );

    // In DEV_MODE, return a mock transaction
    const DEV_MODE = true;
    if (DEV_MODE) {
      console.log("DEV MODE: Returning mock transaction");
      return "mock-transaction-" + Date.now();
    }

    // In production, this would:
    // 1. Create a Solana transaction to transfer SPL tokens
    // 2. Serialize the transaction to be sent to the client
    // 3. The client would then sign it with their wallet and send it back

    const connection = getConnection();
    const fromPubkey = new PublicKey(fromWallet);
    const toPubkey = new PublicKey(toWallet);

    const token = SUPPORTED_STABLECOINS[tokenSymbol];
    if (!token) {
      throw new Error(`Unsupported token: ${tokenSymbol}`);
    }

    // Create a new transaction
    const transaction = new Transaction();

    // Add instructions to transfer SPL tokens
    // This is simplified - in a real implementation you would use proper SPL token transfer
    // transaction.add(createSPLTransferInstruction(fromPubkey, toPubkey, new PublicKey(token.tokenAddress), amount));

    // Serialize the transaction
    const serializedTransaction = transaction
      .serialize({
        verifySignatures: false,
        requireAllSignatures: false,
      })
      .toString("base64");

    return serializedTransaction;
  } catch (error) {
    console.error(`Error creating ${tokenSymbol} transfer transaction:`, error);
    throw new Error(`Failed to create ${tokenSymbol} transfer transaction`);
  }
}

// Initialized stables client
export const stablesClient: StablesClient = {
  getPoolInfo: async () => {
    return {
      tvl: 10000000, // Example TVL in USD
      apr: 5.2, // Example APR in %
      supportedStablecoins: Object.keys(SUPPORTED_STABLECOINS),
    };
  },
  deposit: mintToken,
  withdraw: redeemToken,
  getBalance: getTokenBalance,
  createTransferTransaction: createTokenTransferTransaction,
};

export default stablesClient;
