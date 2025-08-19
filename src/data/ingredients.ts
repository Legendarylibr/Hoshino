import { Ingredient } from '../types/GameTypes';

// Centralized ingredient data with consistent naming and organized assets
// Only includes ingredients that have actual image assets
export const INGREDIENTS: Ingredient[] = [
    // Common ingredients (1-star recipes)
    {
        id: 'pink-sugar',
        name: 'Pink Sugar',
        description: 'Sweet crystalline sugar with a pink hue',
        image: 'pink-sugar.png',
        rarity: 'common',
        cost: 15,
        moodBonus: 1,
        hungerBonus: 1,
        energyBonus: 0
    },
    {
        id: 'nova-egg',
        name: 'Nova Egg',
        description: 'A mysterious egg that glows with stellar energy',
        image: 'nova-egg.png',
        rarity: 'common',
        cost: 20,
        moodBonus: 1,
        hungerBonus: 2,
        energyBonus: 1
    },
    {
        id: 'mira-berry',
        name: 'Mira Berry',
        description: 'A rare berry with stellar properties',
        image: 'mira-berry.png',
        rarity: 'common',
        cost: 25,
        moodBonus: 1,
        hungerBonus: 1,
        energyBonus: 1
    }
];

// Helper functions for ingredient management
export const getIngredientById = (id: string): Ingredient | undefined => {
    return INGREDIENTS.find(ingredient => ingredient.id === id);
};

export const getIngredientsByRarity = (rarity: Ingredient['rarity']): Ingredient[] => {
    return INGREDIENTS.filter(ingredient => ingredient.rarity === rarity);
};

export const getCommonIngredients = (): Ingredient[] => {
    return getIngredientsByRarity('common');
};

export const getUncommonIngredients = (): Ingredient[] => {
    return getIngredientsByRarity('uncommon');
};

export const getRareIngredients = (): Ingredient[] => {
    return getIngredientsByRarity('rare');
};

export const getEpicIngredients = (): Ingredient[] => {
    return getIngredientsByRarity('epic');
};

export const getLegendaryIngredients = (): Ingredient[] => {
    return getIngredientsByRarity('legendary');
};
