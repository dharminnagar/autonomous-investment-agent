import { useState, useEffect } from 'react';
import { AOService, InvestmentPlan } from '../lib/services/aoService';
import { useWallet } from '@/app/lib/hooks/useWallet';

export function useInvestmentPlans() {
  const { address } = useWallet();
  const [plans, setPlans] = useState<InvestmentPlan[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const aoService = AOService.getInstance();

  useEffect(() => {
    if (address) {
      fetchPlans();
    }
  }, [address]);

  const fetchPlans = async () => {
    if (!address) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const fetchedPlans = await aoService.getInvestmentPlans(address);
      setPlans(fetchedPlans);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch investment plans');
    } finally {
      setLoading(false);
    }
  };

  const createPlan = async (plan: Omit<InvestmentPlan, 'id' | 'walletAddress'>) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      const newPlan: InvestmentPlan = {
        ...plan,
        id: crypto.randomUUID(),
        walletAddress: address,
      };
      
      await aoService.createInvestmentPlan(newPlan);
      await fetchPlans(); // Refresh plans after creating a new one
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create investment plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const executePlan = async (planId: string) => {
    if (!address) throw new Error('Wallet not connected');
    
    setLoading(true);
    setError(null);
    
    try {
      await aoService.executeInvestment(planId);
      await fetchPlans(); // Refresh plans after execution
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to execute investment plan');
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return {
    plans,
    loading,
    error,
    createPlan,
    executePlan,
    refreshPlans: fetchPlans,
  };
} 