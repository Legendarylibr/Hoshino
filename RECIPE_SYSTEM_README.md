# Recipe System - New Structure

## Overview
This document outlines the new recipe system that follows specific requirements for different rarity tiers and star ratings, using only the 3 actual ingredients available in the assets.

## Available Ingredients
**Note**: Only these 3 ingredients have actual image assets and are used in recipes:

### Common Ingredients
- **Pink Sugar** (cost: 15) - Sweet crystalline sugar with a pink hue
- **Nova Egg** (cost: 20) - A mysterious egg that glows with stellar energy  
- **Mira Berry** (cost: 25) - A rare berry with stellar properties

## Recipe Categories

### 2-Star Recipes (Common)
**Requirements**: 2-3 common ingredients only
**Reward**: 2 stars

1. **Sweet Berry Delight**
   - Ingredients: Pink Sugar (2), Mira Berry (1)
   - Total: 2 ingredients
   - Description: A delightful treat combining pink sugar and mira berries

2. **Stellar Egg Bowl**
   - Ingredients: Nova Egg (2), Mira Berry (1), Pink Sugar (1)
   - Total: 3 ingredients
   - Description: A cosmic breakfast bowl that provides balanced nutrition

### 3-Star Recipes (Uncommon)
**Requirements**: 3 ingredients, mix of common ingredients with higher quantities
**Reward**: 3 stars

1. **Cosmic Sugar Feast**
   - Ingredients: Pink Sugar (3), Mira Berry (1), Nova Egg (1)
   - Mix: High quantity of pink sugar + other ingredients
   - Description: An exquisite treat that provides exceptional mood and energy boosts

2. **Nova Berry Soup**
   - Ingredients: Nova Egg (2), Mira Berry (2), Pink Sugar (1)
   - Mix: High quantities of eggs and berries + sugar
   - Description: A mystical soup that provides incredible energy and satisfaction

### 4-Star Recipes (Rare)
**Requirements**: 4-5 ingredients, high quantities of common ingredients
**Reward**: 4 stars

1. **Stellar Mega Feast**
   - Ingredients: Pink Sugar (3), Nova Egg (3), Mira Berry (3)
   - Total: 3 ingredients with maximum quantities
   - Mix: Maximum quantities of all ingredients
   - Description: A legendary feast that provides maximum satisfaction and rare bonuses

2. **Cosmic Ultimate Elixir**
   - Ingredients: Pink Sugar (3), Nova Egg (2), Mira Berry (2)
   - Total: 3 ingredients with high quantities
   - Mix: High quantities of all ingredients
   - Description: A powerful elixir that provides legendary energy and hunger satisfaction

## Recipe Difficulty Levels

- **Easy**: 2-star recipes (common)
- **Medium**: 3-star recipes (uncommon)
- **Expert**: 4-star recipes (rare)

## Strategy Notes

Since we only have 3 common ingredients, the recipe progression works as follows:
- **2-star recipes**: Use 2-3 ingredients in small quantities
- **3-star recipes**: Use 3 ingredients with higher quantities of one ingredient
- **4-star recipes**: Use 3 ingredients with maximum quantities

The rarity system is achieved through ingredient quantity rather than ingredient rarity, making the recipes progressively more expensive and resource-intensive.

## Helper Functions

The system provides helper functions to:
- Get recipes by star rating (2, 3, 4)
- Get recipes by difficulty level
- Get recipes by rarity tier (common, uncommon, rare)
- Validate if a recipe can be crafted with available ingredients
- Get all craftable recipes based on available ingredients

## Usage

```typescript
import { 
    getCommonRecipes, 
    getUncommonRecipes, 
    getRareRecipes,
    canCraftRecipe,
    getCraftableRecipes 
} from './src/data/recipes';

// Get recipes by tier
const commonRecipes = getCommonRecipes();      // 2-star recipes
const uncommonRecipes = getUncommonRecipes();  // 3-star recipes
const rareRecipes = getRareRecipes();          // 4-star recipes

// Check if recipe can be crafted
const canCraft = canCraftRecipe(recipe, availableIngredients);

// Get all craftable recipes
const craftableRecipes = getCraftableRecipes(availableIngredients);
```
