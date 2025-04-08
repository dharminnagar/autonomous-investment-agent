'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useWallet } from '@/app/lib/hooks/useWallet';
import { AOService, Transaction } from '@/app/lib/services/aoService';

// Mock transaction data
const mockTransactions: Transaction[] = [
  {
    id: '1',
    planId: 'plan1',
    type: 'buy',
    token: 'AR',
    amount: 500,
    walletAddress: '0x123...abc',
    timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000,
    status: 'completed',
  },
  {
    id: '2',
    planId: 'plan2',
    type: 'buy',
    token: 'AR',
    amount: 300,
    walletAddress: '0x123...abc',
    timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000,
    status: 'completed',
  },
  {
    id: '3',
    planId: 'plan3',
    type: 'buy',
    token: 'AR',
    amount: 200,
    walletAddress: '0x123...abc',
    timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000,
    status: 'completed',
  },
];

export default function TransactionHistory() {
  const { address } = useWallet();
  const [transactions, setTransactions] = useState<Transaction[]>(mockTransactions);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const aoService = AOService.getInstance();

  useEffect(() => {
    if (address) {
      try {
        // Initialize AO connection
        aoService.initializeAO();
        fetchTransactions();
      } catch (err) {
        console.error('Error initializing AO:', err);
        setError('Failed to initialize AO connection');
        setLoading(false);
      }
    }
  }, [address]);

  const fetchTransactions = async () => {
    if (!address) return;
    
    try {
      const data = await aoService.getTransactionHistory(address);
      setTransactions(data);
    } catch (err) {
      console.error('Error fetching transactions:', err);
      setError('Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  if (!address) {
    return (
      <div className="text-center py-12">
        <p className="text-gray-500">Please connect your wallet to view transaction history</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <p className="text-red-500">{error}</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg shadow-md">
      <div className="p-6">
        <h2 className="text-xl font-bold mb-6">Transaction History</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Date
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Type
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Status
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Transaction ID
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {transactions.map((tx) => (
                <tr key={tx.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(tx.timestamp), 'MMM d, yyyy HH:mm')}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.type === 'buy' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {tx.type.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tx.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tx.amount.toFixed(2)} AR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                      tx.status === 'completed' 
                        ? 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200' 
                        : tx.status === 'pending'
                        ? 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200'
                        : 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {tx.id.substring(0, 8)}...{tx.id.substring(tx.id.length - 4)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
} 