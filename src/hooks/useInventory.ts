// Save this as: src/hooks/useInventory.ts
import { useState } from 'react';
import { MarketplaceItem } from '../services/MarketplaceService';

export interface InventoryItem {
    item: MarketplaceItem;
    quantity: number;
    dateAdded: Date;
}

export const useInventory = () => {
    const [inventory, setInventory] = useState<InventoryItem[]>([]);

    const addItemsToInventory = (purchasedItems: MarketplaceItem[]) => {
        setInventory(prevInventory => {
            const newInventory = [...prevInventory];

            purchasedItems.forEach(purchasedItem => {
                const existingIndex = newInventory.findIndex(invItem => invItem.item.id === purchasedItem.id);

                if (existingIndex >= 0) {
                    // Increase quantity if item already exists
                    newInventory[existingIndex].quantity += 1;
                } else {
                    // Add new item to inventory
                    newInventory.push({
                        item: purchasedItem,
                        quantity: 1,
                        dateAdded: new Date()
                    });
                }
            });

            return newInventory;
        });
    };

    const removeItemFromInventory = (itemId: string, quantity: number = 1) => {
        setInventory(prevInventory => {
            return prevInventory.map(invItem => {
                if (invItem.item.id === itemId) {
                    const newQuantity = Math.max(0, invItem.quantity - quantity);
                    return { ...invItem, quantity: newQuantity };
                }
                return invItem;
            }).filter(invItem => invItem.quantity > 0);
        });
    };

    // Convert inventory to format that IngredientSelection expects
    const getInventoryAsIngredients = () => {
        return inventory.map(invItem => ({
            id: invItem.item.id,
            name: invItem.item.name,
            description: invItem.item.description,
            image: invItem.item.id + '.png', // You might need to adjust this
            rarity: convertRarityToIngredientFormat(invItem.item.rarity),
            cost: invItem.item.priceStarFragments,
            owned: invItem.quantity
        }));
    };

    // Helper function to convert MarketplaceItem rarity to IngredientSelection format
    const convertRarityToIngredientFormat = (rarity: any): 'Common' | 'Uncommon' | 'Rare' | 'Epic' => {
        switch (rarity.toString()) {
            case 'COMMON': return 'Common';
            case 'UNCOMMON': return 'Uncommon';
            case 'RARE': return 'Rare';
            case 'EPIC': return 'Epic';
            default: return 'Common';
        }
    };

    return {
        inventory,
        addItemsToInventory,
        removeItemFromInventory,
        getInventoryAsIngredients,
        totalItems: inventory.reduce((total, item) => total + item.quantity, 0)
    };
};