import { useState, useEffect, useCallback } from 'react';
import { Connection } from '@solana/web3.js';
import { GameIntegrationService, GameState, IntegrationEvent } from '../services/GameIntegrationService';
import { useInventory } from './useInventory';
import { useRecipes } from './useRecipes';
import { useIngredientDiscovery } from './useIngredientDiscovery';
import { useAchievements } from './useAchievements';
import { useStarFragments } from './useStarFragments';

export const useGameIntegration = (connection: Connection) => {
    const [gameState, setGameState] = useState<GameState | null>(null);
    const [integrationEvents, setIntegrationEvents] = useState<IntegrationEvent[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const gameIntegrationService = GameIntegrationService.getInstance(connection);
    
    // Use all the individual hooks
    const inventory = useInventory();
    const recipes = useRecipes();
    const discovery = useIngredientDiscovery();
    const achievements = useAchievements();
    const starFragments = useStarFragments(connection);

    // Load game state on mount
    useEffect(() => {
        const loadGameState = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const state = await gameIntegrationService.getGameState();
                setGameState(state);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load game state');
                console.error('Failed to load game state:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadGameState();
    }, [gameIntegrationService]);

    // Subscribe to integration events
    useEffect(() => {
        const unsubscribe = gameIntegrationService.subscribe((event) => {
            setIntegrationEvents(prev => [event, ...prev.slice(0, 99)]); // Keep last 100 events
        });

        return unsubscribe;
    }, [gameIntegrationService]);

    // Refresh game state
    const refreshGameState = useCallback(async () => {
        try {
            setError(null);
            const state = await gameIntegrationService.refreshGameState();
            setGameState(state);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to refresh game state');
            console.error('Failed to refresh game state:', err);
        }
    }, [gameIntegrationService]);

    // Process ingredient discovery with full integration
    const processIngredientDiscovery = useCallback(async (ingredientId: string, quantity: number = 1) => {
        try {
            setError(null);
            const result = await gameIntegrationService.processIngredientDiscovery(ingredientId, quantity);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process ingredient discovery');
            console.error('Failed to process ingredient discovery:', err);
            return {
                success: false,
                discovery: null,
                rewards: [],
                achievements: []
            };
        }
    }, [gameIntegrationService]);

    // Process recipe crafting with full integration
    const processRecipeCrafting = useCallback(async (recipeId: string) => {
        try {
            setError(null);
            const result = await gameIntegrationService.processRecipeCrafting(recipeId);
            return result;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to process recipe crafting');
            console.error('Failed to process recipe crafting:', err);
            return {
                success: false,
                recipe: null,
                consumedIngredients: [],
                craftedItem: null,
                rewards: [],
                achievements: []
            };
        }
    }, [gameIntegrationService]);

    // Get integration statistics
    const getIntegrationStats = useCallback(async () => {
        try {
            setError(null);
            return await gameIntegrationService.getIntegrationStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get integration stats');
            console.error('Failed to get integration stats:', err);
            return null;
        }
    }, [gameIntegrationService]);

    // Reset all game data (for testing)
    const resetAllGameData = useCallback(async () => {
        try {
            setError(null);
            await gameIntegrationService.resetAllGameData();
            
            // Refresh game state after reset
            await refreshGameState();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset game data');
            console.error('Failed to reset game data:', err);
        }
    }, [gameIntegrationService, refreshGameState]);

    // Export game data
    const exportGameData = useCallback(async () => {
        try {
            setError(null);
            return await gameIntegrationService.exportGameData();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to export game data');
            console.error('Failed to export game data:', err);
            return null;
        }
    }, [gameIntegrationService]);

    // Import game data
    const importGameData = useCallback(async (data: any) => {
        try {
            setError(null);
            const success = await gameIntegrationService.importGameData(data);
            
            if (success) {
                // Refresh game state after import
                await refreshGameState();
            }
            
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to import game data');
            console.error('Failed to import game data:', err);
            return false;
        }
    }, [gameIntegrationService, refreshGameState]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Get recent integration events
    const getRecentEvents = useCallback((count: number = 10) => {
        return integrationEvents.slice(0, count);
    }, [integrationEvents]);

    // Get events by type
    const getEventsByType = useCallback((type: IntegrationEvent['type']) => {
        return integrationEvents.filter(event => event.type === type);
    }, [integrationEvents]);

    return {
        // State
        gameState,
        integrationEvents,
        isLoading,
        error,
        
        // Actions
        refreshGameState,
        processIngredientDiscovery,
        processRecipeCrafting,
        resetAllGameData,
        exportGameData,
        importGameData,
        
        // Getters
        getIntegrationStats,
        getRecentEvents,
        getEventsByType,
        
        // Utilities
        clearError,
        
        // Individual system hooks (for direct access)
        inventory,
        recipes,
        discovery,
        achievements,
        starFragments,
    };
};
