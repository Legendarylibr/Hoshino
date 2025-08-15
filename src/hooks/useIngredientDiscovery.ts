import { useState, useEffect, useCallback } from 'react';
import { IngredientDiscoveryService, DiscoveryEvent } from '../services/IngredientDiscoveryService';
import { useInventory } from './useInventory';

export const useIngredientDiscovery = () => {
    const [discoveries, setDiscoveries] = useState<DiscoveryEvent[]>([]);
    const [isChecking, setIsChecking] = useState(false);
    const [lastCheck, setLastCheck] = useState<Date | null>(null);
    const [stats, setStats] = useState<any>(null);
    
    const discoveryService = IngredientDiscoveryService.getInstance();
    const { addItemsToInventory } = useInventory();

    // Load discovery history on mount
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const history = await discoveryService.getDiscoveryHistory();
                setDiscoveries(history);
                
                const discoveryStats = await discoveryService.getDiscoveryStats();
                setStats(discoveryStats);
            } catch (error) {
                console.error('Failed to load discovery history:', error);
            }
        };

        loadHistory();
    }, [discoveryService]);

    // Check for new discoveries
    const checkForDiscoveries = useCallback(async () => {
        if (isChecking) return;
        
        try {
            setIsChecking(true);
            
            if (discoveryService.shouldDiscoverIngredients()) {
                const newDiscoveries = await discoveryService.discoverIngredients();
                
                if (newDiscoveries.length > 0) {
                    // Add discovered ingredients to inventory
                    const items = newDiscoveries.map(discovery => ({
                        id: discovery.ingredientId,
                        quantity: discovery.quantity,
                        source: 'discovery' as const
                    }));
                    
                    await addItemsToInventory(items);
                    
                    // Update local state
                    setDiscoveries(prev => [...newDiscoveries, ...prev]);
                    setLastCheck(new Date());
                    
                    // Reload stats
                    const discoveryStats = await discoveryService.getDiscoveryStats();
                    setStats(discoveryStats);
                    
                    return newDiscoveries;
                }
            }
            
            setLastCheck(new Date());
            return [];
        } catch (error) {
            console.error('Failed to check for discoveries:', error);
            return [];
        } finally {
            setIsChecking(false);
        }
    }, [discoveryService, addItemsToInventory, isChecking]);

    // Force a discovery (for testing)
    const forceDiscovery = useCallback(async (ingredientId: string, quantity: number = 1) => {
        try {
            const discovery = await discoveryService.forceDiscovery(ingredientId, quantity);
            
            // Update local state
            setDiscoveries(prev => [discovery, ...prev]);
            
            // Reload stats
            const discoveryStats = await discoveryService.getDiscoveryStats();
            setStats(discoveryStats);
            
            return discovery;
        } catch (error) {
            console.error('Failed to force discovery:', error);
            return null;
        }
    }, [discoveryService]);

    // Get recent discoveries
    const getRecentDiscoveries = useCallback(async () => {
        try {
            const recent = await discoveryService.getRecentDiscoveries();
            return recent;
        } catch (error) {
            console.error('Failed to get recent discoveries:', error);
            return [];
        }
    }, [discoveryService]);

    // Get discovery statistics
    const getDiscoveryStats = useCallback(async () => {
        try {
            const discoveryStats = await discoveryService.getDiscoveryStats();
            setStats(discoveryStats);
            return discoveryStats;
        } catch (error) {
            console.error('Failed to get discovery stats:', error);
            return null;
        }
    }, [discoveryService]);

    // Check if discoveries are available
    const canDiscover = discoveryService.shouldDiscoverIngredients();

    // Get time until next discovery
    const getTimeUntilNextDiscovery = useCallback(() => {
        // This would need to be implemented in the service
        // For now, return a placeholder
        return 0;
    }, []);

    // Reset discovery cooldown (for testing)
    const resetCooldown = useCallback(() => {
        discoveryService.resetDiscoveryCooldown();
    }, [discoveryService]);

    // Set custom discovery cooldown
    const setDiscoveryCooldown = useCallback((milliseconds: number) => {
        discoveryService.setDiscoveryCooldown(milliseconds);
    }, [discoveryService]);

    // Clear discovery history
    const clearHistory = useCallback(async () => {
        try {
            await discoveryService.clearDiscoveryHistory();
            setDiscoveries([]);
            setStats(null);
        } catch (error) {
            console.error('Failed to clear discovery history:', error);
        }
    }, [discoveryService]);

    return {
        // State
        discoveries,
        isChecking,
        lastCheck,
        stats,
        canDiscover,
        
        // Actions
        checkForDiscoveries,
        forceDiscovery,
        resetCooldown,
        setDiscoveryCooldown,
        clearHistory,
        
        // Getters
        getRecentDiscoveries,
        getDiscoveryStats,
        getTimeUntilNextDiscovery,
    };
};
