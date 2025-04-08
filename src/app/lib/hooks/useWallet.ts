"use client"
import { useConnection, useActiveAddress } from '@arweave-wallet-kit/react';
import { useEffect, useState } from 'react';
import Arweave from 'arweave';
import BrowserWalletStrategy from '@arweave-wallet-kit/browser-wallet-strategy';
import ArConnectStrategy from '@arweave-wallet-kit/arconnect-strategy';

// Initialize Arweave
const arweave = new Arweave({
  host: 'arweave.net',
  port: 443,
  protocol: 'https',
});

// Initialize wallet strategies
const browserWalletStrategy = new BrowserWalletStrategy();
const arConnectStrategy = new ArConnectStrategy();

export function useWallet() {
  const { connected, connect, disconnect } = useConnection();
  const activeAddress = useActiveAddress();
  const [balance, setBalance] = useState<string>('0');
  const [loading, setLoading] = useState<boolean>(false);
  const [walletType, setWalletType] = useState<'browser' | 'arconnect' | null>(null);

  // Connect with browser wallet
  const connectBrowserWallet = async () => {
    try {
      setLoading(true);
      await browserWalletStrategy.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "ACCESS_PUBLIC_KEY",
      ]);
      setWalletType('browser');
    } catch (error) {
      console.error('Error connecting browser wallet:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Connect with ArConnect
  const connectArConnect = async () => {
    try {
      setLoading(true);
      await arConnectStrategy.connect([
        "ACCESS_ADDRESS",
        "SIGN_TRANSACTION",
        "ACCESS_PUBLIC_KEY",
      ]);
      setWalletType('arconnect');
    } catch (error) {
      console.error('Error connecting ArConnect:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  // Fetch wallet balance
  const fetchBalance = async () => {
    if (!activeAddress) return;
    
    try {
      setLoading(true);
      const balanceInWinston = await arweave.wallets.getBalance(activeAddress);
      const balanceInAR = arweave.ar.winstonToAr(balanceInWinston);
      setBalance(balanceInAR);
    } catch (error) {
      console.error('Error fetching balance:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch balance when connected and address changes
  useEffect(() => {
    if (connected && activeAddress) {
      fetchBalance();
    }
  }, [connected, activeAddress]);

  return {
    connected,
    address: activeAddress,
    balance,
    loading,
    connect,
    disconnect,
    connectBrowserWallet,
    connectArConnect,
    walletType,
    refreshBalance: fetchBalance,
  };
}
