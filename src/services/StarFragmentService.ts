import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { InventoryService } from './InventoryService';

export interface StarFragmentTransaction {
    id: string;
    type: 'earn' | 'spend' | 'reward' | 'achievement' | 'discovery';
    amount: number;
    balance: number;
    timestamp: number;
    description: string;
    metadata?: {
        source?: string;
        itemId?: string;
        achievementId?: string;
        discoveryId?: string;
    };
}

export class StarFragmentService {
    private connection: Connection;
    private inventoryService: InventoryService;
    private transactions: StarFragmentTransaction[] = [];
    private currentBalance: number = 1000; // Starting balance
    private storageKey = 'star_fragments';
    private listeners: Array<(balance: number, transactions: StarFragmentTransaction[]) => void> = [];

    constructor(connection: Connection) {
        this.connection = connection;
        this.inventoryService = InventoryService.getInstance();
        this.loadData();
    }

    // Subscribe to balance and transaction changes
    subscribe(listener: (balance: number, transactions: StarFragmentTransaction[]) => void): () => void {
        this.listeners.push(listener);
        return () => {
            const index = this.listeners.indexOf(listener);
            if (index > -1) {
                this.listeners.splice(index, 1);
            }
        };
    }

    // Notify all listeners of changes
    private notifyListeners(): void {
        this.listeners.forEach(listener => listener(this.currentBalance, this.transactions));
    }

    // Get current balance
    getBalance(): number {
        return this.currentBalance;
    }

    // Get transaction history
    getTransactionHistory(): StarFragmentTransaction[] {
        return [...this.transactions];
    }

    // Get recent transactions (last N transactions)
    getRecentTransactions(count: number = 10): StarFragmentTransaction[] {
        return this.transactions.slice(0, count);
    }

    // Get transactions by type
    getTransactionsByType(type: StarFragmentTransaction['type']): StarFragmentTransaction[] {
        return this.transactions.filter(t => t.type === type);
    }

    // Get transactions by date range
    getTransactionsByDateRange(startDate: Date, endDate: Date): StarFragmentTransaction[] {
        const start = startDate.getTime();
        const end = endDate.getTime();
        
        return this.transactions.filter(t => t.timestamp >= start && t.timestamp <= end);
    }

    // Add star fragments (earn/reward)
    async addStarFragments(
        amount: number, 
        type: 'earn' | 'reward' | 'achievement' | 'discovery',
        description: string,
        metadata?: StarFragmentTransaction['metadata']
    ): Promise<boolean> {
        if (amount <= 0) return false;

        try {
            this.currentBalance += amount;
            
            const transaction: StarFragmentTransaction = {
                id: `sf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type,
                amount,
                balance: this.currentBalance,
                timestamp: Date.now(),
                description,
                metadata
            };

            this.transactions.unshift(transaction);
            
            // Keep only last 1000 transactions
            if (this.transactions.length > 1000) {
                this.transactions = this.transactions.slice(0, 1000);
            }

            await this.saveData();
            this.notifyListeners();
            
            return true;
        } catch (error) {
            console.error('Failed to add star fragments:', error);
            return false;
        }
    }

    // Spend star fragments
    async spendStarFragments(
        amount: number, 
        description: string,
        metadata?: StarFragmentTransaction['metadata']
    ): Promise<boolean> {
        if (amount <= 0 || amount > this.currentBalance) return false;

        try {
            this.currentBalance -= amount;
            
            const transaction: StarFragmentTransaction = {
                id: `sf_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
                type: 'spend',
                amount: -amount,
                balance: this.currentBalance,
                timestamp: Date.now(),
                description,
                metadata
            };

            this.transactions.unshift(transaction);
            
            // Keep only last 1000 transactions
            if (this.transactions.length > 1000) {
                this.transactions = this.transactions.slice(0, 1000);
            }

            await this.saveData();
            this.notifyListeners();
            
            return true;
        } catch (error) {
            console.error('Failed to spend star fragments:', error);
            return false;
        }
    }

    // Reward star fragments for inventory achievements
    async rewardForInventoryAchievement(achievementId: string, amount: number): Promise<boolean> {
        return await this.addStarFragments(
            amount,
            'achievement',
            `Achievement reward: ${amount} star fragments`,
            { achievementId }
        );
    }

    // Reward star fragments for discovery
    async rewardForDiscovery(discoveryId: string, amount: number): Promise<boolean> {
        return await this.addStarFragments(
            amount,
            'discovery',
            `Discovery reward: ${amount} star fragments`,
            { discoveryId }
        );
    }

    // Reward star fragments for crafting
    async rewardForCrafting(recipeId: string, amount: number): Promise<boolean> {
        return await this.addStarFragments(
            amount,
            'reward',
            `Crafting reward: ${amount} star fragments`,
            { itemId: recipeId }
        );
    }

    // Check if user can afford an item
    canAfford(cost: number): boolean {
        return this.currentBalance >= cost;
    }

    // Get spending statistics
    getSpendingStats(): {
        totalEarned: number;
        totalSpent: number;
        netChange: number;
        byType: Record<string, number>;
    } {
        const byType: Record<string, number> = {};
        let totalEarned = 0;
        let totalSpent = 0;

        this.transactions.forEach(transaction => {
            if (transaction.amount > 0) {
                totalEarned += transaction.amount;
            } else {
                totalSpent += Math.abs(transaction.amount);
            }

            byType[transaction.type] = (byType[transaction.type] || 0) + Math.abs(transaction.amount);
        });

        return {
            totalEarned,
            totalSpent,
            netChange: totalEarned - totalSpent,
            byType
        };
    }

    // Get daily earning/spending
    getDailyStats(): {
        todayEarned: number;
        todaySpent: number;
        weekEarned: number;
        weekSpent: number;
    } {
        const now = Date.now();
        const oneDay = 24 * 60 * 60 * 1000;
        const oneWeek = 7 * oneDay;
        
        const today = now - oneDay;
        const weekAgo = now - oneWeek;

        const todayTransactions = this.transactions.filter(t => t.timestamp >= today);
        const weekTransactions = this.transactions.filter(t => t.timestamp >= weekAgo);

        const todayEarned = todayTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const todaySpent = todayTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        const weekEarned = weekTransactions
            .filter(t => t.amount > 0)
            .reduce((sum, t) => sum + t.amount, 0);
        
        const weekSpent = weekTransactions
            .filter(t => t.amount < 0)
            .reduce((sum, t) => sum + Math.abs(t.amount), 0);

        return {
            todayEarned,
            todaySpent,
            weekEarned,
            weekSpent
        };
    }

    // Transfer star fragments to another wallet (future enhancement)
    async transferToWallet(
        recipientWallet: PublicKey, 
        amount: number,
        description: string
    ): Promise<{ success: boolean; transactionId?: string; error?: string }> {
        if (amount <= 0 || amount > this.currentBalance) {
            return { success: false, error: 'Invalid amount or insufficient balance' };
        }

        try {
            // This would implement actual blockchain transfer
            // For now, just simulate the transfer
            const success = await this.spendStarFragments(
                amount, 
                `Transfer to ${recipientWallet.toString()}: ${description}`
            );

            if (success) {
                return { 
                    success: true, 
                    transactionId: `transfer_${Date.now()}` 
                };
            } else {
                return { success: false, error: 'Failed to process transfer' };
            }
        } catch (error) {
            console.error('Transfer failed:', error);
            return { 
                success: false, 
                error: error instanceof Error ? error.message : 'Transfer failed' 
            };
        }
    }

    // Load data from storage
    private async loadData(): Promise<void> {
        try {
            const stored = await this.getStoredData();
            if (stored) {
                this.currentBalance = stored.balance;
                this.transactions = stored.transactions;
            }
        } catch (error) {
            console.error('Failed to load star fragment data:', error);
        }
    }

    // Save data to storage
    private async saveData(): Promise<void> {
        try {
            const data = {
                balance: this.currentBalance,
                transactions: this.transactions,
                lastUpdated: Date.now()
            };
            
            await this.saveStoredData(data);
        } catch (error) {
            console.error('Failed to save star fragment data:', error);
        }
    }

    // Get stored data (platform-specific implementation)
    private async getStoredData(): Promise<any> {
        // This would be implemented based on the platform
        // For React Native, use AsyncStorage
        // For web, use localStorage
        // For now, return null to use default values
        return null;
    }

    // Save stored data (platform-specific implementation)
    private async saveStoredData(data: any): Promise<void> {
        // This would be implemented based on the platform
        // For React Native, use AsyncStorage
        // For web, use localStorage
        // For now, do nothing
    }

    // Reset data (for testing)
    async resetData(): Promise<void> {
        this.currentBalance = 1000;
        this.transactions = [];
        await this.saveData();
        this.notifyListeners();
    }

    // Set custom balance (for testing)
    async setBalance(balance: number): Promise<void> {
        this.currentBalance = Math.max(0, balance);
        await this.saveData();
        this.notifyListeners();
    }
}