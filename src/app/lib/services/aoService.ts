import { connect } from '@permaweb/aoconnect';

// Initialize AO connection
const ao = connect({
  MODE: 'mainnet',
  GATEWAY_URL: 'https://arweave.net',
  GRAPHQL_URL: 'https://arweave.net/graphql',
  GRAPHQL_MAX_RETRIES: 3,
  GRAPHQL_RETRY_BACKOFF: 1000,
});

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

  private constructor() {
    // This is where we'll store our AO process ID
    this.processId = process.env.NEXT_PUBLIC_AO_PROCESS_ID || '';
  }

  public static getInstance(): AOService {
    if (!AOService.instance) {
      AOService.instance = new AOService();
    }
    return AOService.instance;
  }

  async createInvestmentPlan(plan: InvestmentPlan): Promise<string> {
    try {
      // Create a message to schedule the investment
      const messageData = {
        action: 'createInvestmentPlan',
        ...plan,
        createdAt: new Date().toISOString(),
      };

      // Send the message to AO
      const result = await ao.message({
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
    try {
      // Query AO for investment plans associated with the wallet address
      const messageData = {
        action: 'getInvestmentPlans',
        walletAddress,
      };

      const result = await ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as InvestmentPlan[];
    } catch (error) {
      console.error('Error fetching investment plans:', error);
      throw error;
    }
  }

  async executeInvestment(planId: string): Promise<string> {
    try {
      // Execute a scheduled investment
      const messageData = {
        action: 'executeInvestment',
        planId,
        executedAt: new Date().toISOString(),
      };

      const result = await ao.message({
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
    try {
      // Query AO for transaction history
      const messageData = {
        action: 'getTransactionHistory',
        walletAddress,
      };

      const result = await ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as Transaction[];
    } catch (error) {
      console.error('Error fetching transaction history:', error);
      throw error;
    }
  }

  async getPortfolioValue(walletAddress: string): Promise<PortfolioData> {
    try {
      // Query AO for portfolio value
      const messageData = {
        action: 'getPortfolioValue',
        walletAddress,
      };

      const result = await ao.message({
        process: this.processId,
        data: JSON.stringify(messageData),
      });
      
      return JSON.parse(result) as PortfolioData;
    } catch (error) {
      console.error('Error fetching portfolio value:', error);
      throw error;
    }
  }
} 