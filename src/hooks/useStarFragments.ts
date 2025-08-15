import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { StarFragmentService, StarFragmentTransaction } from '../services/StarFragmentService';
import { useInventory } from './useInventory';

export const useStarFragments = (connection: Connection) => {
    const [balance, setBalance] = useState(1000);
    const [transactions, setTransactions] = useState<StarFragmentTransaction[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const starFragmentService = new StarFragmentService(connection);
    const { inventory } = useInventory();

    // Subscribe to star fragment changes
    useEffect(() => {
        const unsubscribe = starFragmentService.subscribe((newBalance, newTransactions) => {
            setBalance(newBalance);
            setTransactions(newTransactions);
        });

        return unsubscribe;
    }, [starFragmentService]);

    // Load initial data
    useEffect(() => {
        const loadData = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const currentBalance = starFragmentService.getBalance();
                const transactionHistory = starFragmentService.getTransactionHistory();
                
                setBalance(currentBalance);
                setTransactions(transactionHistory);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load star fragment data');
                console.error('Failed to load star fragment data:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadData();
    }, [starFragmentService]);

    // Add star fragments
    const addStarFragments = useCallback(async (
        amount: number, 
        type: 'earn' | 'reward' | 'achievement' | 'discovery',
        description: string,
        metadata?: StarFragmentTransaction['metadata']
    ) => {
        try {
            setError(null);
            const success = await starFragmentService.addStarFragments(amount, type, description, metadata);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add star fragments');
            console.error('Failed to add star fragments:', err);
            return false;
        }
    }, [starFragmentService]);

    // Spend star fragments
    const spendStarFragments = useCallback(async (
        amount: number, 
        description: string,
        metadata?: StarFragmentTransaction['metadata']
    ) => {
        try {
            setError(null);
            const success = await starFragmentService.spendStarFragments(amount, description, metadata);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to spend star fragments');
            console.error('Failed to spend star fragments:', err);
            return false;
        }
    }, [starFragmentService]);

    // Reward for inventory achievement
    const rewardForInventoryAchievement = useCallback(async (achievementId: string, amount: number) => {
        try {
            setError(null);
            const success = await starFragmentService.rewardForInventoryAchievement(achievementId, amount);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reward for achievement');
            console.error('Failed to reward for achievement:', err);
            return false;
        }
    }, [starFragmentService]);

    // Reward for discovery
    const rewardForDiscovery = useCallback(async (discoveryId: string, amount: number) => {
        try {
            setError(null);
            const success = await starFragmentService.rewardForDiscovery(discoveryId, amount);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reward for discovery');
            console.error('Failed to reward for discovery:', err);
            return false;
        }
    }, [starFragmentService]);

    // Reward for crafting
    const rewardForCrafting = useCallback(async (recipeId: string, amount: number) => {
        try {
            setError(null);
            const success = await starFragmentService.rewardForCrafting(recipeId, amount);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reward for crafting');
            console.error('Failed to reward for crafting:', err);
            return false;
        }
    }, [starFragmentService]);

    // Check if user can afford an item
    const canAfford = useCallback((cost: number) => {
        return starFragmentService.canAfford(cost);
    }, [starFragmentService]);

    // Get recent transactions
    const getRecentTransactions = useCallback((count: number = 10) => {
        return starFragmentService.getRecentTransactions(count);
    }, [starFragmentService]);

    // Get transactions by type
    const getTransactionsByType = useCallback((type: StarFragmentTransaction['type']) => {
        return starFragmentService.getTransactionsByType(type);
    }, [starFragmentService]);

    // Get transactions by date range
    const getTransactionsByDateRange = useCallback((startDate: Date, endDate: Date) => {
        return starFragmentService.getTransactionsByDateRange(startDate, endDate);
    }, [starFragmentService]);

    // Get spending statistics
    const getSpendingStats = useCallback(() => {
        return starFragmentService.getSpendingStats();
    }, [starFragmentService]);

    // Get daily statistics
    const getDailyStats = useCallback(() => {
        return starFragmentService.getDailyStats();
    }, [starFragmentService]);

    // Transfer to wallet
    const transferToWallet = useCallback(async (
        recipientWallet: PublicKey, 
        amount: number,
        description: string
    ) => {
        try {
            setError(null);
            const result = await starFragmentService.transferToWallet(recipientWallet, amount, description);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to transfer star fragments');
            console.error('Failed to transfer star fragments:', err);
            return { success: false, error: 'Transfer failed' };
        }
    }, [starFragmentService]);

    // Reset data (for testing)
    const resetData = useCallback(async () => {
        try {
            setError(null);
            await starFragmentService.resetData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset data');
            console.error('Failed to reset data:', err);
        }
    }, [starFragmentService]);

    // Set custom balance (for testing)
    const setCustomBalance = useCallback(async (newBalance: number) => {
        try {
            setError(null);
            await starFragmentService.setBalance(newBalance);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to set balance');
            console.error('Failed to set balance:', err);
        }
    }, [starFragmentService]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        balance,
        transactions,
        isLoading,
        error,
        
        // Actions
        addStarFragments,
        spendStarFragments,
        rewardForInventoryAchievement,
        rewardForDiscovery,
        rewardForCrafting,
        transferToWallet,
        resetData,
        setCustomBalance,
        
        // Getters
        canAfford,
        getRecentTransactions,
        getTransactionsByType,
        getTransactionsByDateRange,
        getSpendingStats,
        getDailyStats,
        
        // Utilities
        clearError,
    };
};
