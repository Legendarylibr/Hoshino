import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Image } from 'react-native';
import InnerScreen from './InnerScreen';

interface IngredientSelectionProps {
    onBack: () => void;
    onCraftFood: (foodId: string, foodName: string) => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    walletAddress?: string;
    purchasedIngredients: any[]; // Add this prop
}

interface Ingredient {
    id: string;
    name: string;
    description: string;
    image: string;
    rarity: 'Common' | 'Uncommon' | 'Rare' | 'Epic';
    cost: number;
    owned: number;
}

interface Recipe {
    id: string;
    name: string;
    description: string;
    ingredients: { id: string; quantity: number }[];
    result: { id: string; name: string; description: string };
    difficulty: 'Easy' | 'Medium' | 'Hard';
}

const IngredientSelection: React.FC<IngredientSelectionProps> = ({
    onBack,
    onCraftFood,
    onNotification,
    walletAddress,
    purchasedIngredients
}) => {
    const [selectedIngredients, setSelectedIngredients] = useState<string[]>([]);
    const [availableRecipes, setAvailableRecipes] = useState<Recipe[]>([]);
    const [currentTab, setCurrentTab] = useState<'ingredients' | 'recipes'>('ingredients');

    // Convert purchasedIngredients to the format expected by this component
    const ingredients: Ingredient[] = purchasedIngredients.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description,
        image: item.image,
        rarity: item.rarity === 'common' ? 'Common' : item.rarity === 'uncommon' ? 'Uncommon' : item.rarity === 'rare' ? 'Rare' : 'Epic',
        cost: item.cost,
        owned: item.quantity
    }));

    // Debug logging
    console.log('IngredientSelection - purchasedIngredients:', purchasedIngredients);
    console.log('IngredientSelection - converted ingredients:', ingredients);

    // Helper function to get ingredient images
    const getIngredientImage = (id: string) => {
        switch (id) {
            case 'pink-sugar':
                return require('../../assets/ingredients/pink-sugar.png');
            case 'nova-egg':
                return require('../../assets/ingredients/nova-egg.png');
            case 'mira-berry':
                return require('../../assets/ingredients/mira-berry.png');
            default:
                return require('../../assets/ingredients/pink-sugar.png'); // fallback
        }
    };

    // Mock recipes data
    const recipes: Recipe[] = [
        {
            id: 'dream-dessert',
            name: 'Dream Dessert',
            description: 'A sweet treat that makes moonlings happy',
            ingredients: [
                { id: 'dream-bean', quantity: 2 },
                { id: 'pink-sugar', quantity: 1 }
            ],
            result: {
                id: 'dream-dessert',
                name: 'Dream Dessert',
                description: 'A magical dessert that boosts mood'
            },
            difficulty: 'Easy'
        },
        {
            id: 'nebula-delight',
            name: 'Nebula Delight',
            description: 'A colorful dish that energizes moonlings',
            ingredients: [
                { id: 'nebula-plum', quantity: 1 },
                { id: 'cosmic-honey', quantity: 1 }
            ],
            result: {
                id: 'nebula-delight',
                name: 'Nebula Delight',
                description: 'A vibrant dish that restores energy'
            },
            difficulty: 'Medium'
        },
        {
            id: 'stellar-feast',
            name: 'Stellar Feast',
            description: 'A luxurious meal fit for cosmic royalty',
            ingredients: [
                { id: 'cloud-cake', quantity: 1 },
                { id: 'starberry', quantity: 1 },
                { id: 'cosmic-honey', quantity: 2 }
            ],
            result: {
                id: 'stellar-feast',
                name: 'Stellar Feast',
                description: 'An extravagant meal that fully satisfies hunger'
            },
            difficulty: 'Hard'
        }
    ];

    useEffect(() => {
        // Calculate available recipes based on owned ingredients
        const available = recipes.filter(recipe => {
            return recipe.ingredients.every(ingredient => {
                const ownedIngredient = ingredients.find(i => i.id === ingredient.id);
                return ownedIngredient && ownedIngredient.owned >= ingredient.quantity;
            });
        });
        setAvailableRecipes(available);
    }, [ingredients]);

    const toggleIngredient = (ingredientId: string) => {
        setSelectedIngredients(prev => 
            prev.includes(ingredientId) 
                ? prev.filter(id => id !== ingredientId)
                : [...prev, ingredientId]
        );
    };

    const craftRecipe = (recipe: Recipe) => {
        // Check if we have enough ingredients
        const canCraft = recipe.ingredients.every(ingredient => {
            const ownedIngredient = ingredients.find(i => i.id === ingredient.id);
            return ownedIngredient && ownedIngredient.owned >= ingredient.quantity;
        });

        if (!canCraft) {
            onNotification?.('❌ Not enough ingredients to craft this recipe', 'error');
            return;
        }

        // Craft the food
        onCraftFood(recipe.result.id, recipe.result.name);
        onNotification?.(`🍳 Successfully crafted ${recipe.result.name}!`, 'success');
    };

    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return '#6b7280';
            case 'Uncommon': return '#10b981';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    const getDifficultyColor = (difficulty: string): string => {
        switch (difficulty) {
            case 'Easy': return '#10b981';
            case 'Medium': return '#f59e0b';
            case 'Hard': return '#ef4444';
            default: return '#6b7280';
        }
    };

    return (
        <InnerScreen
            onLeftButtonPress={onBack}
            onCenterButtonPress={() => onNotification?.('🍳 Cooking Help: Select ingredients and craft delicious meals for your moonlings!', 'info')}
            onRightButtonPress={() => onNotification?.('🍳 Cooking Tips: Combine ingredients to create special recipes that boost your moonling\'s stats!', 'info')}
            leftButtonText=""
            centerButtonText=""
            rightButtonText=""
        >
            <ScrollView style={[styles.mainDisplayArea, styles.ingredientSelection]}>
                {/* Tab Navigation */}
                <View style={styles.tabNavigation}>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'ingredients' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('ingredients')}
                    >
                        <Text style={styles.tabButtonText}>Ingredients</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                        style={[styles.tabButton, currentTab === 'recipes' ? styles.activeTab : null]}
                        onPress={() => setCurrentTab('recipes')}
                    >
                        <Text style={styles.tabButtonText}>Recipes</Text>
                    </TouchableOpacity>
                </View>

                {currentTab === 'ingredients' && (
                    <View style={styles.ingredientsSection}>
                        <Text style={styles.sectionTitle}>Available Ingredients</Text>
                        <View style={styles.ingredientsGrid}>
                            {ingredients.map((ingredient) => (
                                <TouchableOpacity
                                    key={ingredient.id}
                                    style={[
                                        styles.ingredientCard,
                                        selectedIngredients.includes(ingredient.id) && styles.selectedIngredient
                                    ]}
                                    onPress={() => toggleIngredient(ingredient.id)}
                                >
                                    <Image
                                        source={getIngredientImage(ingredient.id)}
                                        style={styles.ingredientImage}
                                        resizeMode="contain"
                                        onLoad={() => console.log('Image loaded successfully for:', ingredient.id)}
                                        onError={(error) => console.log('Image load error for:', ingredient.id, error)}
                                    />
                                    <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                    <Text style={styles.ingredientDescription}>{ingredient.description}</Text>
                                    <Text style={[styles.ingredientRarity, { color: getRarityColor(ingredient.rarity) }]}>
                                        {ingredient.rarity}
                                    </Text>
                                    <Text style={styles.ingredientOwned}>Owned: {ingredient.owned}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}

                {currentTab === 'recipes' && (
                    <View style={styles.recipesSection}>
                        <Text style={styles.sectionTitle}>Available Recipes</Text>
                        <View style={styles.recipesList}>
                            {availableRecipes.map((recipe) => (
                                <TouchableOpacity
                                    key={recipe.id}
                                    style={styles.recipeCard}
                                    onPress={() => craftRecipe(recipe)}
                                >
                                    <View style={styles.recipeHeader}>
                                        <Text style={styles.recipeName}>{recipe.name}</Text>
                                        <Text style={[styles.recipeDifficulty, { color: getDifficultyColor(recipe.difficulty) }]}>
                                            {recipe.difficulty}
                                        </Text>
                                    </View>
                                    <Text style={styles.recipeDescription}>{recipe.description}</Text>
                                    <View style={styles.recipeIngredients}>
                                        <Text style={styles.recipeIngredientsTitle}>Ingredients:</Text>
                                        {recipe.ingredients.map((ingredient) => {
                                            const ownedIngredient = ingredients.find(i => i.id === ingredient.id);
                                            return (
                                                <Text key={ingredient.id} style={styles.recipeIngredient}>
                                                    • {ingredient.quantity}x {ownedIngredient?.name || ingredient.id}
                                                </Text>
                                            );
                                        })}
                                    </View>
                                    <Text style={styles.recipeResult}>Result: {recipe.result.name}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>
                    </View>
                )}
            </ScrollView>
        </InnerScreen>
    );
};

const styles = StyleSheet.create({
    mainDisplayArea: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    ingredientSelection: {
        padding: 10,
    },
    tabNavigation: {
        flexDirection: 'row',
        backgroundColor: 'rgba(0, 0, 0, 0.1)',
        borderRadius: 10,
        padding: 5,
        marginBottom: 15,
    },
    tabButton: {
        flex: 1,
        padding: 10,
        alignItems: 'center',
        borderRadius: 8,
        marginHorizontal: 2,
    },
    activeTab: {
        backgroundColor: 'rgba(0, 123, 255, 0.8)',
    },
    tabButtonText: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    ingredientsSection: {
        flex: 1,
        width: '100%',
    },
    recipesSection: {
        flex: 1,
        width: '100%',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 15,
        textAlign: 'center',
    },
    ingredientsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-around',
        gap: 10,
    },
    ingredientCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        minWidth: 120,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    selectedIngredient: {
        borderColor: 'rgba(0, 123, 255, 0.8)',
        borderWidth: 2,
        backgroundColor: 'rgba(0, 123, 255, 0.1)',
    },
    ingredientIcon: {
        fontSize: 24,
        marginBottom: 5,
    },
    ingredientImage: {
        width: 40,
        height: 40,
        marginBottom: 5,
    },
    ingredientName: {
        fontSize: 14,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 5,
    },
    ingredientDescription: {
        fontSize: 10,
        color: '#666',
        textAlign: 'center',
        marginBottom: 5,
    },
    ingredientRarity: {
        fontSize: 10,
        fontWeight: 'bold',
        marginBottom: 2,
    },
    ingredientOwned: {
        fontSize: 10,
        color: '#999',
    },
    recipesList: {
        gap: 10,
    },
    recipeCard: {
        backgroundColor: 'rgba(255, 255, 255, 0.9)',
        padding: 15,
        borderRadius: 10,
        borderWidth: 1,
        borderColor: 'rgba(0, 0, 0, 0.1)',
    },
    recipeHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    recipeDifficulty: {
        fontSize: 12,
        fontWeight: 'bold',
    },
    recipeDescription: {
        fontSize: 12,
        color: '#666',
        marginBottom: 10,
    },
    recipeIngredients: {
        marginBottom: 10,
    },
    recipeIngredientsTitle: {
        fontSize: 12,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    recipeIngredient: {
        fontSize: 10,
        color: '#666',
        marginLeft: 10,
    },
    recipeResult: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#10b981',
    },
});

export default IngredientSelection;