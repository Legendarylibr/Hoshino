import { useState, useEffect, useCallback } from 'react';
import { Achievement, AchievementProgress } from '../services/AchievementService';
import { AchievementService } from '../services/AchievementService';
import { useInventory } from './useInventory';

export const useAchievements = () => {
    const [achievements, setAchievements] = useState<Achievement[]>([]);
    const [completedAchievements, setCompletedAchievements] = useState<Achievement[]>([]);
    const [incompleteAchievements, setIncompleteAchievements] = useState<Achievement[]>([]);
    const [overallCompletion, setOverallCompletion] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    
    const achievementService = AchievementService.getInstance();
    const { inventory } = useInventory();

    // Load achievements on mount
    useEffect(() => {
        const loadAchievements = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                const allAchievements = achievementService.getAllAchievements();
                setAchievements(allAchievements);
                
                const completed = achievementService.getCompletedAchievements();
                setCompletedAchievements(completed);
                
                const incomplete = achievementService.getIncompleteAchievements();
                setIncompleteAchievements(incomplete);
                
                const completion = achievementService.getOverallCompletion();
                setOverallCompletion(completion);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load achievements');
                console.error('Failed to load achievements:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadAchievements();
    }, [achievementService]);

    // Subscribe to achievement changes
    useEffect(() => {
        const unsubscribe = achievementService.subscribe((updatedAchievements) => {
            setAchievements(updatedAchievements);
            
            const completed = achievementService.getCompletedAchievements();
            setCompletedAchievements(completed);
            
            const incomplete = achievementService.getIncompleteAchievements();
            setIncompleteAchievements(incomplete);
            
            const completion = achievementService.getOverallCompletion();
            setOverallCompletion(completion);
        });

        return unsubscribe;
    }, [achievementService]);

    // Check achievements when inventory changes
    useEffect(() => {
        const checkAchievements = async () => {
            try {
                await achievementService.checkInventoryAchievements();
            } catch (error) {
                console.error('Failed to check inventory achievements:', error);
            }
        };

        checkAchievements();
    }, [inventory, achievementService]);

    // Get achievements by category
    const getAchievementsByCategory = useCallback((category: Achievement['category']) => {
        return achievementService.getAchievementsByCategory(category);
    }, [achievementService]);

    // Get achievement progress
    const getAchievementProgress = useCallback((achievementId: string) => {
        return achievementService.getAchievementProgress(achievementId);
    }, [achievementService]);

    // Update achievement progress manually
    const updateProgress = useCallback(async (achievementId: string, progress: number) => {
        try {
            setError(null);
            const completed = await achievementService.updateProgress(achievementId, progress);
            return completed;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update achievement progress');
            console.error('Failed to update achievement progress:', err);
            return false;
        }
    }, [achievementService]);

    // Check inventory achievements
    const checkInventoryAchievements = useCallback(async () => {
        try {
            setError(null);
            await achievementService.checkInventoryAchievements();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check inventory achievements');
            console.error('Failed to check inventory achievements:', err);
        }
    }, [achievementService]);

    // Check crafting achievements
    const checkCraftingAchievements = useCallback(async (recipeCrafted: any) => {
        try {
            setError(null);
            await achievementService.checkCraftingAchievements(recipeCrafted);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check crafting achievements');
            console.error('Failed to check crafting achievements:', err);
        }
    }, [achievementService]);

    // Check discovery achievements
    const checkDiscoveryAchievements = useCallback(async (discoveryCount: number) => {
        try {
            setError(null);
            await achievementService.checkDiscoveryAchievements(discoveryCount);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check discovery achievements');
            console.error('Failed to check discovery achievements:', err);
        }
    }, [achievementService]);

    // Reset all achievements (for testing)
    const resetAchievements = useCallback(async () => {
        try {
            setError(null);
            await achievementService.resetAchievements();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to reset achievements');
            console.error('Failed to reset achievements:', err);
        }
    }, [achievementService]);

    // Add custom achievement
    const addCustomAchievement = useCallback(async (achievement: Omit<Achievement, 'id'>) => {
        try {
            setError(null);
            const id = await achievementService.addCustomAchievement(achievement);
            return id;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add custom achievement');
            console.error('Failed to add custom achievement:', err);
            return null;
        }
    }, [achievementService]);

    // Remove custom achievement
    const removeCustomAchievement = useCallback(async (achievementId: string) => {
        try {
            setError(null);
            const success = await achievementService.removeCustomAchievement(achievementId);
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove custom achievement');
            console.error('Failed to remove custom achievement:', err);
            return false;
        }
    }, [achievementService]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    return {
        // State
        achievements,
        completedAchievements,
        incompleteAchievements,
        overallCompletion,
        isLoading,
        error,
        
        // Actions
        updateProgress,
        checkInventoryAchievements,
        checkCraftingAchievements,
        checkDiscoveryAchievements,
        resetAchievements,
        addCustomAchievement,
        removeCustomAchievement,
        
        // Getters
        getAchievementsByCategory,
        getAchievementProgress,
        
        // Utilities
        clearError,
    };
};
