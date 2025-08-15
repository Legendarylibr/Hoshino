// Save this as: src/hooks/useInventory.ts
import { useState, useEffect, useCallback } from 'react';
import { MarketplaceItem } from '../services/MarketplaceService';
import { InventoryService, UnifiedInventoryItem } from '../services/InventoryService';

// Maintain backward compatibility with existing interface
export interface InventoryItem {
    item: MarketplaceItem;
    quantity: number;
    dateAdded: Date;
}

export const useInventory = () => {
    const [inventory, setInventory] = useState<UnifiedInventoryItem[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Get the singleton instance of InventoryService
    const inventoryService = InventoryService.getInstance();

    // Load inventory on mount and subscribe to changes
    useEffect(() => {
        const loadInventory = async () => {
            try {
                setIsLoading(true);
                setError(null);
                
                // Initialize with default ingredients if empty
                await inventoryService.initializeWithDefaultIngredients();
                
                // Get current inventory
                const currentInventory = await inventoryService.getInventory();
                setInventory(currentInventory);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to load inventory');
                console.error('Failed to load inventory:', err);
            } finally {
                setIsLoading(false);
            }
        };

        loadInventory();

        // Subscribe to inventory changes
        const unsubscribe = inventoryService.subscribe((newInventory) => {
            setInventory(newInventory);
        });

        return unsubscribe;
    }, [inventoryService]);

    // Add items to inventory (unified method)
    const addItemsToInventory = useCallback(async (items: Array<{
        id: string;
        quantity: number;
        source: 'purchase' | 'discovery' | 'crafting' | 'reward';
    }>) => {
        try {
            await inventoryService.addToInventory(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add items to inventory');
            console.error('Failed to add items to inventory:', err);
        }
    }, [inventoryService]);

    // Add marketplace items (backward compatibility)
    const addMarketplaceItemsToInventory = useCallback(async (purchasedItems: MarketplaceItem[]) => {
        try {
            const items = purchasedItems.map(item => ({
                id: item.id,
                quantity: 1,
                source: 'purchase' as const
            }));
            
            await inventoryService.addToInventory(items);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to add marketplace items to inventory');
            console.error('Failed to add marketplace items to inventory:', err);
        }
    }, [inventoryService]);

    // Remove items from inventory
    const removeItemFromInventory = useCallback(async (itemId: string, quantity: number = 1) => {
        try {
            const success = await inventoryService.removeFromInventory(itemId, quantity);
            if (!success) {
                setError('Failed to remove item from inventory');
            }
            return success;
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to remove item from inventory');
            console.error('Failed to remove item from inventory:', err);
            return false;
        }
    }, [inventoryService]);

    // Get inventory as ingredients (for IngredientSelection component)
    const getInventoryAsIngredients = useCallback(async () => {
        try {
            return await inventoryService.getInventoryAsIngredients();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get inventory as ingredients');
            console.error('Failed to get inventory as ingredients:', err);
            return [];
        }
    }, [inventoryService]);

    // Get inventory as marketplace items (for Shop component)
    const getInventoryAsMarketplaceItems = useCallback(async () => {
        try {
            return await inventoryService.getInventoryAsMarketplaceItems();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get inventory as marketplace items');
            console.error('Failed to get inventory as marketplace items:', err);
            return [];
        }
    }, [inventoryService]);

    // Get inventory as GameTypes InventoryItem (for compatibility)
    const getInventoryAsGameTypes = useCallback(async () => {
        try {
            return await inventoryService.getInventoryAsGameTypes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get inventory as game types');
            console.error('Failed to get inventory as game types:', err);
            return [];
        }
    }, [inventoryService]);

    // Check if recipe can be crafted
    const canCraftRecipe = useCallback(async (recipe: any) => {
        try {
            return await inventoryService.canCraftRecipe(recipe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to check recipe crafting');
            console.error('Failed to check recipe crafting:', err);
            return false;
        }
    }, [inventoryService]);

    // Get craftable recipes
    const getCraftableRecipes = useCallback(async () => {
        try {
            return await inventoryService.getCraftableRecipes();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get craftable recipes');
            console.error('Failed to get craftable recipes:', err);
            return [];
        }
    }, [inventoryService]);

    // Craft a recipe
    const craftRecipe = useCallback(async (recipe: any) => {
        try {
            return await inventoryService.craftRecipe(recipe);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to craft recipe');
            console.error('Failed to craft recipe:', err);
            return false;
        }
    }, [inventoryService]);

    // Search inventory
    const searchInventory = useCallback(async (query: string) => {
        try {
            return await inventoryService.searchInventory(query);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to search inventory');
            console.error('Failed to search inventory:', err);
            return [];
        }
    }, [inventoryService]);

    // Get inventory statistics
    const getInventoryStats = useCallback(async () => {
        try {
            return await inventoryService.getInventoryStats();
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to get inventory stats');
            console.error('Failed to get inventory stats:', err);
            return null;
        }
    }, [inventoryService]);

    // Clear error
    const clearError = useCallback(() => {
        setError(null);
    }, []);

    // Get total item count
    const totalItems = inventory.reduce((total, item) => total + item.quantity, 0);

    return {
        // State
        inventory,
        isLoading,
        error,
        
        // Actions
        addItemsToInventory,
        addMarketplaceItemsToInventory, // Backward compatibility
        removeItemFromInventory,
        
        // Getters
        getInventoryAsIngredients,
        getInventoryAsMarketplaceItems,
        getInventoryAsGameTypes,
        canCraftRecipe,
        getCraftableRecipes,
        craftRecipe,
        searchInventory,
        getInventoryStats,
        
        // Utilities
        totalItems,
        clearError,
        
        // Backward compatibility aliases
        addItemsToInventory: addMarketplaceItemsToInventory, // Alias for existing components
    };
};