"use client"
import { useWallet } from '../lib/hooks/useWallet';
import { useState } from 'react';

export default function WalletConnect() {
  const { 
    connected, 
    address, 
    balance, 
    loading, 
    connectBrowserWallet, 
    connectArConnect, 
    disconnect,
    walletType 
  } = useWallet();
  
  const [showOptions, setShowOptions] = useState(false);

  const handleConnect = async (type: 'browser' | 'arconnect') => {
    try {
      if (type === 'browser') {
        await connectBrowserWallet();
      } else {
        await connectArConnect();
      }
      setShowOptions(false);
    } catch (error) {
      console.error('Connection error:', error);
    }
  };

  return (
    <div className="flex items-center justify-end p-4">
      {connected ? (
        <div className="flex items-center gap-4">
          <div className="flex flex-col items-end">
            <span className="text-sm font-mono">
              {address?.slice(0, 6)}...{address?.slice(-4)}
            </span>
            <span className="text-xs text-gray-500">
              {loading ? 'Loading...' : `${balance} AR`}
            </span>
            <span className="text-xs text-gray-400">
              {walletType === 'browser' ? 'Browser Wallet' : 'ArConnect'}
            </span>
          </div>
          <button
            onClick={() => disconnect()}
            className="px-3 py-1 text-sm bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
          >
            Disconnect
          </button>
        </div>
      ) : (
        <div className="relative">
          <button
            onClick={() => setShowOptions(!showOptions)}
            className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 transition-colors"
          >
            Connect Wallet
          </button>
          
          {showOptions && (
            <div className="absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-md shadow-lg z-10 border border-gray-200 dark:border-gray-700">
              <div className="py-1">
                <button
                  onClick={() => handleConnect('browser')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  Browser Wallet
                </button>
                <button
                  onClick={() => handleConnect('arconnect')}
                  className="block w-full text-left px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  ArConnect
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
