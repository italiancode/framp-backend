'use client';

import {
  ConnectionProvider,
  WalletProvider,
  useWallet,
  Wallet as SolanaWallet
} from '@solana/wallet-adapter-react';
import { WalletAdapterNetwork } from '@solana/wallet-adapter-base';
import {
  PhantomWalletAdapter,
  SolflareWalletAdapter,
  TorusWalletAdapter,
  LedgerWalletAdapter,
  CoinbaseWalletAdapter,
} from '@solana/wallet-adapter-wallets';
import { WalletModalProvider } from '@solana/wallet-adapter-react-ui';
import { clusterApiUrl, Connection, PublicKey, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { FC, ReactNode, createContext, useContext, useMemo, useState, useEffect, useCallback } from 'react';
import { createBrowserClient } from '@supabase/ssr';
import { useAuth } from './AuthContext';

// Import wallet adapter CSS
import '@solana/wallet-adapter-react-ui/styles.css';

interface WalletContextState {
  balance: number | null;
  isConnecting: boolean;
  updateProfile: (walletAddress: string) => Promise<void>;
  disconnectWallet: () => Promise<void>;
  refreshBalance: () => Promise<void>;
}

const WalletContext = createContext<WalletContextState>({
  balance: null,
  isConnecting: false,
  updateProfile: async () => {},
  disconnectWallet: async () => {},
  refreshBalance: async () => {},
});

export const useWalletContext = () => useContext(WalletContext);

export const WalletContextProvider: FC<{ children: ReactNode }> = ({ children }) => {
  // You can also provide a custom RPC endpoint
  const network = WalletAdapterNetwork.Mainnet;
  const endpoint = useMemo(() => clusterApiUrl(network), [network]);

  // @solana/wallet-adapter-wallets includes all the adapters but supports tree shaking and lazy loading
  const wallets = useMemo(
    () => [
      new PhantomWalletAdapter(),
      new SolflareWalletAdapter(),
      new TorusWalletAdapter(),
      new LedgerWalletAdapter(),
      new CoinbaseWalletAdapter(),
    ],
    []
  );

  return (
    <ConnectionProvider endpoint={endpoint}>
      <WalletProvider wallets={wallets} autoConnect>
        <WalletModalProvider>
          <WalletContextContent>
            {children}
          </WalletContextContent>
        </WalletModalProvider>
      </WalletProvider>
    </ConnectionProvider>
  );
};

const WalletContextContent: FC<{ children: ReactNode }> = ({ children }) => {
  const { publicKey, connecting, disconnect, wallet } = useWallet();
  const [balance, setBalance] = useState<number | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const { user, refreshUser } = useAuth();

  const connection = useMemo(
    () => new Connection(clusterApiUrl(WalletAdapterNetwork.Mainnet)),
    []
  );

  // Function to fetch wallet balance
  const fetchBalance = useCallback(async (publicKey: PublicKey) => {
    try {
      const balance = await connection.getBalance(publicKey);
      setBalance(balance / LAMPORTS_PER_SOL);
    } catch (error) {
      console.error('Error fetching balance:', error);
      setBalance(null);
    }
  }, [connection]);

  // Refresh balance function
  const refreshBalance = useCallback(async () => {
    if (!publicKey) return;
    await fetchBalance(publicKey);
  }, [fetchBalance, publicKey]);

  // Update user profile with wallet address
  const updateProfile = useCallback(async (walletAddress: string) => {
    if (!user) return;
    
    setIsConnecting(true);
    try {
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      const { error } = await supabase
        .from('profiles')
        .update({ wallet_address: walletAddress })
        .eq('id', user.id);
      
      if (error) {
        console.error('Error updating profile:', error);
        throw error;
      }
      
      // Refresh user data
      await refreshUser();
    } catch (error) {
      console.error('Failed to update profile with wallet address:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [user, refreshUser]);

  // Disconnect wallet and update profile
  const disconnectWallet = useCallback(async () => {
    setIsConnecting(true);
    try {
      // Create Supabase client
      const supabase = createBrowserClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
      );
      
      if (user) {
        // Update profile to remove wallet address
        const { error } = await supabase
          .from('profiles')
          .update({ wallet_address: null })
          .eq('id', user.id);
        
        if (error) {
          console.error('Error updating profile:', error);
          throw error;
        }
      }
      
      // Disconnect wallet
      if (disconnect) {
        disconnect();
      }
      
      // Refresh user data
      await refreshUser();
      setBalance(null);
    } catch (error) {
      console.error('Failed to disconnect wallet:', error);
    } finally {
      setIsConnecting(false);
    }
  }, [user, disconnect, refreshUser]);

  // Update balance when publicKey changes
  useEffect(() => {
    if (publicKey) {
      fetchBalance(publicKey);
    } else {
      setBalance(null);
    }
  }, [publicKey, fetchBalance]);

  // Create memo of context value
  const contextValue = useMemo(() => ({
    balance,
    isConnecting: isConnecting || connecting,
    updateProfile,
    disconnectWallet,
    refreshBalance,
  }), [
    balance, 
    connecting, 
    isConnecting, 
    updateProfile, 
    disconnectWallet,
    refreshBalance
  ]);

  return (
    <WalletContext.Provider value={contextValue}>
      {children}
    </WalletContext.Provider>
  );
};
