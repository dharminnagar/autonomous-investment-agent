'use client';

import { useState } from 'react';
import { useWallet } from './lib/hooks/useWallet';
import InvestmentForm from './components/InvestmentForm';
import Portfolio from './components/Portfolio';
import TransactionHistory from './components/TransactionHistory';
import { InvestmentPlans } from './components/InvestmentPlans';

export default function Home() {
  const { connected, loading } = useWallet();
  const [activeTab, setActiveTab] = useState<'setup' | 'portfolio' | 'history' | 'plans'>('setup');

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[60vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!connected) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
        <h2 className="text-2xl font-bold mb-4">Welcome to Autonomous Investment Agent</h2>
        <p className="text-gray-600 dark:text-gray-400 max-w-md mb-8">
          Connect your Arweave wallet to start setting up automated investment plans.
        </p>
        <div className="p-6 bg-gray-100 dark:bg-gray-800 rounded-lg shadow-sm">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            This application allows you to set up automated investment plans on the Arweave network.
            Connect your wallet to get started.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div className="flex justify-center">
        <div className="inline-flex rounded-md shadow-sm" role="group">
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-l-lg ${
              activeTab === 'setup'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('setup')}
          >
            Setup Investment
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'plans'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('plans')}
          >
            Investment Plans
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium ${
              activeTab === 'portfolio'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('portfolio')}
          >
            Portfolio
          </button>
          <button
            type="button"
            className={`px-4 py-2 text-sm font-medium rounded-r-lg ${
              activeTab === 'history'
                ? 'bg-blue-600 text-white'
                : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700'
            }`}
            onClick={() => setActiveTab('history')}
          >
            Transaction History
          </button>
        </div>
      </div>

      <div className="mt-8">
        {activeTab === 'setup' && <InvestmentForm />}
        {activeTab === 'plans' && <InvestmentPlans />}
        {activeTab === 'portfolio' && <Portfolio />}
        {activeTab === 'history' && <TransactionHistory />}
      </div>
    </div>
  );
}
