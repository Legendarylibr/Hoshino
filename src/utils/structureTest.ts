// Test file to verify unified structure consistency
import { INGREDIENTS, getIngredientById, getIngredientsByRarity } from '../data/ingredients';
import { RECIPES, getRecipeById, getRecipesByStarRating, canCraftRecipe } from '../data/recipes';
import { requireIngredientImage, requireMoonlingImage, requireAsset } from './assetPaths';

// Test function to verify structure consistency
export const testUnifiedStructure = () => {
    console.log('🧪 Testing Unified Structure Consistency...');
    
    // Test 1: Verify all ingredients have valid images
    console.log('\n📸 Testing ingredient image consistency...');
    INGREDIENTS.forEach(ingredient => {
        try {
            const image = requireIngredientImage(ingredient.image);
            console.log(`✅ ${ingredient.name}: Image loaded successfully`);
        } catch (error) {
            console.error(`❌ ${ingredient.name}: Image failed to load - ${ingredient.image}`);
        }
    });
    
    // Test 2: Verify all recipes use valid ingredients
    console.log('\n🍳 Testing recipe ingredient consistency...');
    RECIPES.forEach(recipe => {
        const validIngredients = recipe.ingredients.every(ingredient => {
            const found = getIngredientById(ingredient.id);
            if (!found) {
                console.error(`❌ Recipe ${recipe.name}: Missing ingredient ${ingredient.id}`);
                return false;
            }
            return true;
        });
        
        if (validIngredients) {
            console.log(`✅ ${recipe.name}: All ingredients valid`);
        }
    });
    
    // Test 3: Verify star rating progression
    console.log('\n⭐ Testing star rating progression...');
    [1, 2, 3, 4].forEach(starRating => {
        const recipes = getRecipesByStarRating(starRating);
        console.log(`⭐ ${starRating}-star recipes: ${recipes.length} found`);
        
        recipes.forEach(recipe => {
            const totalIngredients = recipe.ingredients.reduce((sum, ing) => sum + ing.quantity, 0);
            console.log(`  - ${recipe.name}: ${totalIngredients} total ingredients`);
        });
    });
    
    // Test 4: Test recipe crafting validation
    console.log('\n🔧 Testing recipe crafting validation...');
    const testIngredients = [
        { id: 'pink-sugar', quantity: 5 },
        { id: 'nova-egg', quantity: 5 },
        { id: 'mira-berry', quantity: 5 }
    ];
    
    RECIPES.forEach(recipe => {
        const canCraft = canCraftRecipe(recipe, testIngredients);
        console.log(`${canCraft ? '✅' : '❌'} ${recipe.name}: ${canCraft ? 'Can craft' : 'Cannot craft'}`);
    });
    
    // Test 5: Verify asset loading utilities
    console.log('\n🖼️ Testing asset loading utilities...');
    try {
        const moonlingImage = requireMoonlingImage('LYRA.gif');
        console.log('✅ Moonling image loading: Working');
    } catch (error) {
        console.error('❌ Moonling image loading: Failed');
    }
    
    try {
        const ingredientImage = requireIngredientImage('pink-sugar.png');
        console.log('✅ Ingredient image loading: Working');
    } catch (error) {
        console.error('❌ Ingredient image loading: Failed');
    }
    
    // Test 6: Verify data structure consistency
    console.log('\n📊 Testing data structure consistency...');
    
    // Check ingredient rarity distribution
    const rarityCounts = {
        common: getIngredientsByRarity('common').length,
        uncommon: getIngredientsByRarity('uncommon').length,
        rare: getIngredientsByRarity('rare').length,
        epic: getIngredientsByRarity('epic').length,
        legendary: getIngredientsByRarity('legendary').length
    };
    
    console.log('📈 Ingredient rarity distribution:');
    Object.entries(rarityCounts).forEach(([rarity, count]) => {
        console.log(`  - ${rarity}: ${count} ingredients`);
    });
    
    // Check recipe difficulty distribution
    const difficultyCounts = {
        easy: RECIPES.filter(r => r.difficulty === 'easy').length,
        medium: RECIPES.filter(r => r.difficulty === 'medium').length,
        hard: RECIPES.filter(r => r.difficulty === 'hard').length,
        expert: RECIPES.filter(r => r.difficulty === 'expert').length
    };
    
    console.log('📈 Recipe difficulty distribution:');
    Object.entries(difficultyCounts).forEach(([difficulty, count]) => {
        console.log(`  - ${difficulty}: ${count} recipes`);
    });
    
    console.log('\n🎉 Unified structure test completed!');
    
    // Return summary
    return {
        totalIngredients: INGREDIENTS.length,
        totalRecipes: RECIPES.length,
        ingredientRarityDistribution: rarityCounts,
        recipeDifficultyDistribution: difficultyCounts,
        starRatingDistribution: {
            1: getRecipesByStarRating(1).length,
            2: getRecipesByStarRating(2).length,
            3: getRecipesByStarRating(3).length,
            4: getRecipesByStarRating(4).length
        }
    };
};

// Export for use in development
export default testUnifiedStructure;
