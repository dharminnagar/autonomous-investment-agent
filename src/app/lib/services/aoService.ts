'use client';

import { connect } from '@permaweb/aoconnect';
import { createDataItemSigner } from '@permaweb/aoconnect';
import Arweave from 'arweave';

// Initialize Arweave with browser-safe configuration
const arweave = typeof window !== 'undefined' 
  ? new Arweave({
      host: 'arweave.net',
      port: 443,
      protocol: 'https',
    })
  : null;

// Create a function to get the signer based on the connected wallet
export const getSigner = async (address: string) => {
  if (!address) {
    throw new Error('Wallet address is required for signing');
  }
  
  if (!arweave) {
    throw new Error('Arweave is not initialized');
  }
  
  // Create a data item signer using the connected wallet
  return createDataItemSigner(arweave);
};

// Initialize AO connection
export const createAOConnection = () => {
  return connect({
    MODE: "mainnet",
    MU_URL: "https://mu.ao-testnet.xyz",
    CU_URL: "https://cu.ao-testnet.xyz",
    GATEWAY_URL: "https://arweave.net",
  });
};

export type InvestmentPlan = {
  id: string;
  token: string;
  amount: number;
  interval: 'daily' | 'weekly' | 'monthly';
  startDate: string;
  walletAddress: string;
};

export type Transaction = {
  id: string;
  planId: string;
  type: 'buy' | 'sell';
  token: string;
  amount: number;
  walletAddress: string;
  timestamp: number;
  status: 'completed' | 'pending' | 'failed';
};

export type Investment = {
  token: string;
  amount: number;
  timestamp: number;
};

export type PortfolioData = {
  totalValue: number;
  totalInvested: number;
  profitLoss: number;
  profitLossPercentage: number;
  investments: Investment[];
};

export class AOService {
  private static instance: AOService;
  private readonly processId: string;
  private ao: ReturnType<typeof connect> | null = null;

  private constructor() {
    // This is where we'll store our AO process ID
    this.processId = process.env.NEXT_PUBLIC_AO_PROCESS_ID || '';
    console.log("Process ID: ", this.processId);
  }

  public static getInstance(): AOService {
    if (!AOService.instance) {
      AOService.instance = new AOService();
    }
    return AOService.instance;
  }

  // Initialize AO connection
  public initializeAO() {
    this.ao = createAOConnection();
  }

  async createInvestmentPlan(plan: InvestmentPlan): Promise<string> {
    if (!this.ao) {
      throw new Error('AO connection not initialized. Call initializeAO first.');
    }

    try {
      // Create a message to schedule the investment
      const messageData = {
        action: 'createInvestmentPlan',
        ...plan,
        createdAt: new Date().toISOString(),
      };

      // Send the message to AO
      const result = await this.ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return result;
    } catch (error) {
      console.error('Error creating investment plan:', error);
      throw error;
    }
  }

  async getInvestmentPlans(walletAddress: string): Promise<InvestmentPlan[]> {
    if (!this.ao) {
      throw new Error('AO connection not initialized. Call initializeAO first.');
    }

    try {
      // Query AO for investment plans associated with the wallet address
      const messageData = {
        action: 'getInvestmentPlans',
        walletAddress,
      };

      const result = await this.ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as InvestmentPlan[];
    } catch (error) {
      console.error('Error getting investment plans:', error);
      throw error;
    }
  }

  async executeInvestment(planId: string): Promise<string> {
    if (!this.ao) {
      throw new Error('AO connection not initialized. Call initializeAO first.');
    }

    try {
      // Create a message to execute the investment
      const messageData = {
        action: 'executeInvestment',
        planId,
        timestamp: new Date().toISOString(),
      };

      // Send the message to AO
      const result = await this.ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return result;
    } catch (error) {
      console.error('Error executing investment:', error);
      throw error;
    }
  }

  async getTransactionHistory(walletAddress: string): Promise<Transaction[]> {
    if (!this.ao) {
      throw new Error('AO connection not initialized. Call initializeAO first.');
    }

    try {
      // Query AO for transaction history associated with the wallet address
      const messageData = {
        action: 'getTransactionHistory',
        walletAddress,
      };

      const result = await this.ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as Transaction[];
    } catch (error) {
      console.error('Error getting transaction history:', error);
      throw error;
    }
  }

  async getPortfolioValue(walletAddress: string): Promise<PortfolioData> {
    if (!this.ao) {
      throw new Error('AO connection not initialized. Call initializeAO first.');
    }

    try {
      // Query AO for portfolio value associated with the wallet address
      const messageData = {
        action: 'getPortfolioValue',
        walletAddress,
      };

      const result = await this.ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as PortfolioData;
    } catch (error) {
      console.error('Error getting portfolio value:', error);
      throw error;
    }
  }
} 