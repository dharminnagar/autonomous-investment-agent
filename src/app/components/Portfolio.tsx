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
const mockPortfolioData = {
  totalValue: 1250.75,
  totalInvested: 1000.00,
  profitLoss: 250.75,
  profitLossPercentage: 25.08,
  investments: [
    { id: '1', token: 'AR', amount: 500, value: 625.38, purchaseDate: '2023-01-15' },
    { id: '2', token: 'AR', amount: 300, value: 375.23, purchaseDate: '2023-02-20' },
    { id: '3', token: 'AR', amount: 200, value: 250.14, purchaseDate: '2023-03-10' },
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
  const [portfolioData] = useState(mockPortfolioData);
  const [chartData] = useState<ChartData<'line'>>(generateChartData());
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Simulate loading data
    const timer = setTimeout(() => {
      setLoading(false);
    }, 1000);

    return () => clearTimeout(timer);
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
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
          <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400">Return</h3>
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

      {/* Investment List */}
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
                  Current Value
                </th>
                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  Purchase Date
                </th>
              </tr>
            </thead>
            <tbody className="bg-white dark:bg-gray-800 divide-y divide-gray-200 dark:divide-gray-700">
              {portfolioData.investments.map((investment) => (
                <tr key={investment.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                    {investment.token}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {investment.amount.toFixed(2)}
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {investment.value.toFixed(2)} AR
                  </td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm">
                    {format(new Date(investment.purchaseDate), 'MMM d, yyyy')}
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