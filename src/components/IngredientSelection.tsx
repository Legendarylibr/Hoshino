import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from 'react-native';

interface Ingredient {
    id: string;
    name: string;
    emoji: string;
    quantity: number;
    rarity: 'Common' | 'Rare' | 'Epic';
}

interface Recipe {
    id: string;
    name: string;
    result: string; // The food item ID that gets created
    ingredients: { id: string; quantity: number }[];
    description: string;
    hungerValue: number;
}

interface Props {
    onBack: () => void;
    onCraftFood: (foodId: string, foodName: string) => void;
    onNotification?: (message: string, type: 'success' | 'error' | 'info' | 'warning') => void;
    walletAddress?: string;
}

const IngredientSelection: React.FC<Props> = ({
    onBack,
    onCraftFood,
    onNotification,
    walletAddress
}) => {
    const [selectedRecipe, setSelectedRecipe] = useState<string | null>(null);
    const [selectedIngredients, setSelectedIngredients] = useState<{ [key: string]: number }>({});
    const [userInventory, setUserInventory] = useState<Ingredient[]>([]);

    // Mock ingredient inventory (in real app, would fetch from blockchain/database)
    useEffect(() => {
        // Initialize or load user's ingredient inventory
        const mockInventory: Ingredient[] = [
            { id: 'pink-sugar', name: 'Pink Sugar', emoji: '🌸', quantity: 3, rarity: 'Common' },
            { id: 'nova-egg', name: 'Nova Egg', emoji: '🥚', quantity: 2, rarity: 'Rare' },
            { id: 'mira-berry', name: 'Mira Berry', emoji: '🫐', quantity: 4, rarity: 'Common' },
            { id: 'star-dust', name: 'Star Dust', emoji: '✨', quantity: 1, rarity: 'Epic' },
            { id: 'cosmic-flour', name: 'Cosmic Flour', emoji: '🌾', quantity: 5, rarity: 'Common' },
            { id: 'dream-essence', name: 'Dream Essence', emoji: '💭', quantity: 2, rarity: 'Rare' },
            { id: 'nebula-spice', name: 'Nebula Spice', emoji: '🌌', quantity: 3, rarity: 'Rare' },
        ];
        setUserInventory(mockInventory);
    }, [walletAddress]);

    // Available recipes
    const recipes: Recipe[] = [
        {
            id: 'cloud-cake',
            name: 'Cloud Cake',
            result: 'cloud-cake',
            ingredients: [
                { id: 'pink-sugar', quantity: 1 },
                { id: 'nova-egg', quantity: 1 },
                { id: 'mira-berry', quantity: 1 }
            ],
            description: 'A fluffy cosmic dessert that satisfies hunger',
            hungerValue: 3
        },
        {
            id: 'starberry-delight',
            name: 'Starberry Delight',
            result: 'starberry',
            ingredients: [
                { id: 'mira-berry', quantity: 2 },
                { id: 'star-dust', quantity: 1 }
            ],
            description: 'A berry treat infused with stellar energy',
            hungerValue: 5
        },
        {
            id: 'dream-bean-soup',
            name: 'Dream Bean Soup',
            result: 'dream-bean',
            ingredients: [
                { id: 'cosmic-flour', quantity: 1 },
                { id: 'dream-essence', quantity: 1 }
            ],
            description: 'A comforting soup that restores energy',
            hungerValue: 2
        },
        {
            id: 'nebula-plum-tart',
            name: 'Nebula Plum Tart',
            result: 'nebula-plum',
            ingredients: [
                { id: 'cosmic-flour', quantity: 2 },
                { id: 'nebula-spice', quantity: 1 },
                { id: 'nova-egg', quantity: 1 }
            ],
            description: 'An exotic tart with cosmic flavors',
            hungerValue: 4
        }
    ];

    // Check if user can craft a recipe
    const canCraftRecipe = (recipe: Recipe): boolean => {
        return recipe.ingredients.every(ingredient => {
            const userIngredient = userInventory.find(item => item.id === ingredient.id);
            return userIngredient && userIngredient.quantity >= ingredient.quantity;
        });
    };

    // Handle crafting
    const handleCraft = (recipe: Recipe) => {
        if (!canCraftRecipe(recipe)) {
            onNotification?.('❌ Insufficient ingredients!', 'error');
            return;
        }

        // Deduct ingredients from inventory
        const newInventory = userInventory.map(item => {
            const requiredIngredient = recipe.ingredients.find(ing => ing.id === item.id);
            if (requiredIngredient) {
                return { ...item, quantity: item.quantity - requiredIngredient.quantity };
            }
            return item;
        });

        setUserInventory(newInventory);
        onNotification?.(`✨ Successfully crafted ${recipe.name}!`, 'success');

        // Return to moonling interface with crafted food
        onCraftFood(recipe.result, recipe.name);
    };

    // Get rarity color
    const getRarityColor = (rarity: string): string => {
        switch (rarity) {
            case 'Common': return '#9ca3af';
            case 'Rare': return '#3b82f6';
            case 'Epic': return '#8b5cf6';
            default: return '#6b7280';
        }
    };

    return (
        <View style={styles.tamagotchiScreenContainer}>
            {/* Top Status Bar */}
            <View style={styles.tamagotchiTopStatus}>
                <Text style={styles.gearIcon}>🥄</Text>
                <Text style={styles.walletStatusText}>
                    Cosmic Kitchen - Craft Food
                </Text>
            </View>

            {/* Main LCD Screen */}
            <View style={styles.tamagotchiMainScreen}>
                {/* Stats Bar */}
                <View style={styles.statsBar}>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Recipes</Text>
                        <Text style={styles.statStars}>
                            {recipes.length}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Ingredients</Text>
                        <Text style={styles.statStars}>
                            {userInventory.reduce((sum, item) => sum + item.quantity, 0)}
                        </Text>
                    </View>
                    <View style={styles.statItem}>
                        <Text style={styles.statLabel}>Can Craft</Text>
                        <Text style={styles.statStars}>
                            {recipes.filter(canCraftRecipe).length}
                        </Text>
                    </View>
                </View>

                {/* Main Display Area */}
                <ScrollView style={[styles.mainDisplayArea, styles.ingredientSelection]}>
                    {selectedRecipe ? (
                        // Recipe detail view
                        <View style={styles.recipeDetail}>
                            {(() => {
                                const recipe = recipes.find(r => r.id === selectedRecipe);
                                if (!recipe) return null;

                                return (
                                    <>
                                        <View style={styles.recipeHeader}>
                                            <Text style={styles.recipeHeaderTitle}>{recipe.name}</Text>
                                            <Text>{recipe.description}</Text>
                                            <Text style={styles.hungerValue}>Hunger: +{recipe.hungerValue} ★</Text>
                                        </View>

                                        <View style={styles.requiredIngredients}>
                                            <Text style={styles.requiredIngredientsTitle}>Required Ingredients:</Text>
                                            {recipe.ingredients.map(ingredient => {
                                                const userIngredient = userInventory.find(item => item.id === ingredient.id);
                                                const hasEnough = userIngredient && userIngredient.quantity >= ingredient.quantity;

                                                return (
                                                    <View key={ingredient.id} style={[styles.ingredientRequirement, hasEnough ? styles.available : styles.missing]}>
                                                        <Text style={styles.ingredientEmoji}>{userIngredient?.emoji || '❓'}</Text>
                                                        <Text style={styles.ingredientName}>{userIngredient?.name || 'Unknown'}</Text>
                                                        <Text style={styles.ingredientCount}>
                                                            {userIngredient?.quantity || 0}/{ingredient.quantity}
                                                        </Text>
                                                    </View>
                                                );
                                            })}
                                        </View>

                                        <View style={styles.craftActions}>
                                            <TouchableOpacity
                                                onPress={() => setSelectedRecipe(null)}
                                                style={styles.backButton}
                                            >
                                                <Text>← Back</Text>
                                            </TouchableOpacity>
                                            <TouchableOpacity
                                                onPress={() => handleCraft(recipe)}
                                                disabled={!canCraftRecipe(recipe)}
                                                style={[styles.craftButton, canCraftRecipe(recipe) ? styles.available : styles.disabled]}
                                            >
                                                <Text>{canCraftRecipe(recipe) ? '🍳 Craft!' : '❌ Missing Items'}</Text>
                                            </TouchableOpacity>
                                        </View>
                                    </>
                                );
                            })()}
                        </View>
                    ) : (
                        // Recipe list view
                        <View style={styles.recipeList}>
                            <Text style={styles.recipeListTitle}>Available Recipes</Text>
                            <View style={styles.recipesGrid}>
                                {recipes.map(recipe => (
                                    <TouchableOpacity
                                        key={recipe.id}
                                        style={[styles.recipeCard, canCraftRecipe(recipe) ? styles.craftable : styles.locked]}
                                        onPress={() => setSelectedRecipe(recipe.id)}
                                    >
                                        <Text style={styles.recipeIcon}>
                                            {recipe.result === 'cloud-cake' ? '☁️' :
                                                recipe.result === 'starberry' ? '⭐' :
                                                    recipe.result === 'dream-bean' ? '☁️' :
                                                        recipe.result === 'nebula-plum' ? '🌌' : '🍎'}
                                        </Text>
                                        <Text style={styles.recipeName}>{recipe.name}</Text>
                                        <Text style={styles.recipeStatus}>
                                            {canCraftRecipe(recipe) ? '✅ Ready' : '❌ Missing'}
                                        </Text>
                                    </TouchableOpacity>
                                ))}
                            </View>

                            <View style={styles.inventorySection}>
                                <Text style={styles.inventorySectionTitle}>Your Ingredients</Text>
                                <View style={styles.ingredientsGrid}>
                                    {userInventory.filter(item => item.quantity > 0).map(ingredient => (
                                        <View key={ingredient.id} style={styles.ingredientCard}>
                                            <Text style={styles.ingredientEmoji}>{ingredient.emoji}</Text>
                                            <Text style={styles.ingredientName}>{ingredient.name}</Text>
                                            <Text style={styles.ingredientQuantity}>x{ingredient.quantity}</Text>
                                            <Text
                                                style={[styles.ingredientRarity, { color: getRarityColor(ingredient.rarity) }]}
                                            >
                                                {ingredient.rarity}
                                            </Text>
                                        </View>
                                    ))}
                                </View>
                            </View>
                        </View>
                    )}
                </ScrollView>
            </View>

            {/* Bottom Navigation Buttons */}
            <TouchableOpacity style={[styles.bottomButton, styles.left]} onPress={onBack}>
                <Text>←</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.center]}
                onPress={() => setSelectedRecipe(null)}
            >
                <Text>📋</Text>
            </TouchableOpacity>
            <TouchableOpacity
                style={[styles.bottomButton, styles.right]}
                onPress={() => {
                    onNotification?.('🥄 Cooking Help: Select a recipe, gather ingredients, and craft delicious food for your moonling!', 'info');
                }}
            >
                <Text>?</Text>
            </TouchableOpacity>

            {/* Physical Device Buttons - overlaid on background image */}
            <TouchableOpacity
                style={[styles.deviceButton, styles.leftPhysical]}
                onPress={onBack}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.centerPhysical]}
                onPress={() => setSelectedRecipe(null)}
            />
            <TouchableOpacity
                style={[styles.deviceButton, styles.rightPhysical]}
                onPress={() => {
                    onNotification?.('🥄 Cooking Help: Select a recipe, gather ingredients, and craft delicious food for your moonling!', 'info');
                }}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    tamagotchiScreenContainer: {
        flex: 1,
        backgroundColor: '#fff',
    },
    tamagotchiTopStatus: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        padding: 10,
        backgroundColor: '#f0f0f0',
    },
    gearIcon: {
        fontSize: 20,
    },
    walletStatusText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    tamagotchiMainScreen: {
        flex: 1,
        padding: 10,
    },
    statsBar: {
        flexDirection: 'row',
        justifyContent: 'space-around',
        marginBottom: 10,
    },
    statItem: {
        alignItems: 'center',
    },
    statLabel: {
        fontSize: 12,
        color: '#666',
    },
    statStars: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    mainDisplayArea: {
        flex: 1,
    },
    ingredientSelection: {},
    recipeDetail: {
        padding: 10,
    },
    recipeHeader: {
        alignItems: 'center',
        marginBottom: 10,
    },
    recipeHeaderTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    hungerValue: {
        fontSize: 14,
        color: '#888',
    },
    requiredIngredients: {
        marginBottom: 10,
    },
    requiredIngredientsTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    ingredientRequirement: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        borderRadius: 5,
        marginBottom: 5,
    },
    available: {
        backgroundColor: '#d4edda',
    },
    missing: {
        backgroundColor: '#f8d7da',
    },
    ingredientEmoji: {
        fontSize: 18,
        marginRight: 10,
    },
    ingredientName: {
        flex: 1,
        fontSize: 14,
    },
    ingredientCount: {
        fontSize: 14,
        color: '#666',
    },
    craftActions: {
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
    backButton: {
        padding: 10,
        backgroundColor: '#6c757d',
        borderRadius: 5,
    },
    craftButton: {
        padding: 10,
        borderRadius: 5,
    },
    disabled: {
        backgroundColor: '#e9ecef',
    },
    recipeList: {
        padding: 10,
    },
    recipeListTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    recipesGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    recipeCard: {
        width: '48%',
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    craftable: {
        backgroundColor: '#d4edda',
    },
    locked: {
        backgroundColor: '#f8f9fa',
    },
    recipeIcon: {
        fontSize: 30,
        marginBottom: 5,
    },
    recipeName: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 5,
    },
    recipeStatus: {
        fontSize: 12,
        color: '#666',
    },
    inventorySection: {
        marginTop: 20,
    },
    inventorySectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginBottom: 10,
    },
    ingredientsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    ingredientCard: {
        width: '48%',
        padding: 10,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#ddd',
        borderRadius: 5,
        marginBottom: 10,
    },
    ingredientQuantity: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    ingredientRarity: {
        fontSize: 12,
    },
    bottomButton: {
        position: 'absolute',
        bottom: 20,
        padding: 10,
        backgroundColor: '#007bff',
        borderRadius: 50,
        width: 50,
        height: 50,
        justifyContent: 'center',
        alignItems: 'center',
    },
    left: {
        left: 20,
    },
    center: {
        left: '50%',
        marginLeft: -25,
    },
    right: {
        right: 20,
    },
    deviceButton: {
        position: 'absolute',
        bottom: 0,
        width: 60,
        height: 60,
        // Transparent for overlay
        backgroundColor: 'transparent',
    },
    leftPhysical: {
        left: 0,
    },
    centerPhysical: {
        left: '50%',
        marginLeft: -30,
    },
    rightPhysical: {
        right: 0,
    },
});

export default IngredientSelection;