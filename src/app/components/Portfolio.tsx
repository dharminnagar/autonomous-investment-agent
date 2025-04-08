'use client';

import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { Line } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend,
  ChartData,
} from 'chart.js';
import { useWallet } from '@/app/lib/hooks/useWallet';
import { AOService, PortfolioData } from '@/app/lib/services/aoService';

// Register ChartJS components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  Title,
  Tooltip,
  Legend
);

// Mock data for demonstration
const mockPortfolioData: PortfolioData = {
  totalValue: 1250.75,
  totalInvested: 1000.00,
  profitLoss: 250.75,
  profitLossPercentage: 25.08,
  investments: [
    { token: 'AR', amount: 500, timestamp: Date.now() - 30 * 24 * 60 * 60 * 1000 },
    { token: 'AR', amount: 300, timestamp: Date.now() - 20 * 24 * 60 * 60 * 1000 },
    { token: 'AR', amount: 200, timestamp: Date.now() - 10 * 24 * 60 * 60 * 1000 },
  ],
};

// Mock chart data
const generateChartData = (): ChartData<'line'> => {
  const labels = Array.from({ length: 12 }, (_, i) => {
    const date = new Date();
    date.setMonth(date.getMonth() - (11 - i));
    return format(date, 'MMM');
  });

  const data = Array.from({ length: 12 }, (_, i) => {
    // Generate a somewhat realistic looking portfolio value
    return 1000 + Math.random() * 500 + i * 50;
  });

  return {
    labels,
    datasets: [
      {
        label: 'Portfolio Value (AR)',
        data,
        borderColor: 'rgb(59, 130, 246)',
        backgroundColor: 'rgba(59, 130, 246, 0.5)',
        tension: 0.3,
      },
    ],
  };
};

export default function Portfolio() {
  const { address } = useWallet();
  const [portfolioData, setPortfolioData] = useState<PortfolioData>(mockPortfolioData);
  const [chartData, setChartData] = useState<ChartData<'line'>>(generateChartData());
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const aoService = AOService.getInstance();

  useEffect(() => {
    if (address) {
      try {
        // Initialize AO connection
        aoService.initializeAO();
        fetchPortfolioData();
      } catch (err) {
        console.error('Error initializing AO:', err);
        setError('Failed to initialize AO connection');
        setLoading(false);
      }
    }
  }, [address]);

  const fetchPortfolioData = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await aoService.getPortfolioValue(address);
      setPortfolioData(data);
      
      // Generate chart data based on the portfolio data
      // This is a simplified version - in a real app, you'd use actual historical data
      setChartData(generateChartData());
    } catch (err) {
      console.error('Error fetching portfolio data:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch portfolio data');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-lg">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Portfolio Summary */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Value</h3>
          <p className="text-2xl font-bold">{portfolioData.totalValue.toFixed(2)} AR</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Total Invested</h3>
          <p className="text-2xl font-bold">{portfolioData.totalInvested.toFixed(2)} AR</p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit/Loss</h3>
          <p className={`text-2xl font-bold ${portfolioData.profitLoss >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioData.profitLoss >= 0 ? '+' : ''}{portfolioData.profitLoss.toFixed(2)} AR
          </p>
        </div>
        <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Profit/Loss %</h3>
          <p className={`text-2xl font-bold ${portfolioData.profitLossPercentage >= 0 ? 'text-green-500' : 'text-red-500'}`}>
            {portfolioData.profitLossPercentage >= 0 ? '+' : ''}{portfolioData.profitLossPercentage.toFixed(2)}%
          </p>
        </div>
      </div>

      {/* Portfolio Chart */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Portfolio Performance</h3>
        <div className="h-64">
          <Line 
            data={chartData} 
            options={{
              responsive: true,
              maintainAspectRatio: false,
              plugins: {
                legend: {
                  position: 'top' as const,
                },
              },
              scales: {
                y: {
                  beginAtZero: false,
                },
              },
            }} 
          />
        </div>
      </div>

      {/* Investments List */}
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
        <h3 className="text-lg font-medium mb-4">Your Investments</h3>
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-700">
            <thead className="bg-gray-50 dark:bg-gray-900">
              <tr>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Token
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Amount
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purchase Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolioData.investments.map((investment, index) => (
                <tr key={index}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900 dark:text-white">
                    {investment.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {investment.amount.toFixed(2)} AR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                    {format(new Date(investment.timestamp), 'MMM d, yyyy')}
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