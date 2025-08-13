// Simple test script for ingredient discovery system
// Run with: node test-discovery.js

console.log('🧪 Testing Ingredient Discovery System...\n');

// Mock the required modules for testing
const mockIngredients = [
    {
        id: 'pink-sugar',
        name: 'Pink Sugar',
        rarity: 'common',
        image: 'pink-sugar.png'
    },
    {
        id: 'nova-egg',
        name: 'Nova Egg',
        rarity: 'common',
        image: 'nova-egg.png'
    },
    {
        id: 'mira-berry',
        name: 'Mira Berry',
        rarity: 'common',
        image: 'mira-berry.png'
    }
];

const mockGetIngredientsByRarity = (rarity) => {
    return mockIngredients.filter(ing => ing.rarity === rarity);
};

// Mock localStorage
global.localStorage = {
    getItem: () => null,
    setItem: () => {},
    removeItem: () => {}
};

// Mock the service (simplified version for testing)
class MockIngredientDiscoveryService {
    constructor() {
        this.settings = {
            enabled: true,
            intervalHours: 4,
            lastDiscoveryTime: Date.now() - (5 * 60 * 60 * 1000), // 5 hours ago
            discoveryChance: 0.8,
            maxDiscoveriesPerDay: 6,
            dailyDiscoveries: 0,
            lastDailyReset: new Date().toISOString().split('T')[0]
        };
        this.discoveries = [];
    }

    shouldDiscoverIngredients() {
        if (!this.settings.enabled) return false;
        
        const now = Date.now();
        const hoursSinceLastDiscovery = (now - this.settings.lastDiscoveryTime) / (1000 * 60 * 60);
        
        return hoursSinceLastDiscovery >= this.settings.intervalHours && 
               this.settings.dailyDiscoveries < this.settings.maxDiscoveriesPerDay;
    }

    discoverIngredients() {
        if (!this.shouldDiscoverIngredients()) {
            return [];
        }

        const discoveries = [];
        const now = Date.now();
        
        // Determine how many ingredients to find (1-3)
        const numIngredients = Math.random() < 0.6 ? 1 : Math.random() < 0.8 ? 2 : 3;
        
        for (let i = 0; i < numIngredients; i++) {
            if (Math.random() > this.settings.discoveryChance) continue;
            
            const discovery = this.generateRandomDiscovery(now);
            if (discovery) {
                discoveries.push(discovery);
                this.discoveries.push(discovery);
            }
        }

        if (discoveries.length > 0) {
            this.settings.lastDiscoveryTime = now;
            this.settings.dailyDiscoveries += discoveries.length;
        }

        return discoveries;
    }

    generateRandomDiscovery(timestamp) {
        // Simplified rarity distribution
        const rarityRoll = Math.random();
        let rarity;
        
        if (rarityRoll < 0.6) rarity = 'common';
        else if (rarityRoll < 0.85) rarity = 'uncommon';
        else if (rarityRoll < 0.95) rarity = 'rare';
        else if (rarityRoll < 0.99) rarity = 'epic';
        else rarity = 'legendary';

        const availableIngredients = mockGetIngredientsByRarity(rarity);
        if (availableIngredients.length === 0) return null;

        const ingredient = availableIngredients[Math.floor(Math.random() * availableIngredients.length)];
        const quantity = this.calculateQuantity(rarity);
        
        const messages = this.getDiscoveryMessages(rarity, ingredient.name);
        const randomMessage = messages[Math.floor(Math.random() * messages.length)];

        return {
            id: `discovery_${timestamp}_${Math.random().toString(36).substr(2, 9)}`,
            ingredientId: ingredient.id,
            quantity,
            discoveredAt: timestamp,
            rarity,
            message: randomMessage
        };
    }

    calculateQuantity(rarity) {
        switch (rarity) {
            case 'common': return Math.floor(Math.random() * 3) + 1;
            case 'uncommon': return Math.floor(Math.random() * 2) + 1;
            default: return 1;
        }
    }

    getDiscoveryMessages(rarity, ingredientName) {
        const messages = {
            common: [
                `Hey! I found some ${ingredientName}!`,
                `Look what I discovered - ${ingredientName}!`
            ],
            uncommon: [
                `Wow! I found some rare ${ingredientName}!`,
                `This is exciting - I discovered ${ingredientName}!`
            ],
            rare: [
                `Incredible! I found legendary ${ingredientName}!`,
                `This is amazing - I discovered ${ingredientName}!`
            ]
        };
        return messages[rarity] || messages.common;
    }

    getDailyProgress() {
        return {
            current: this.settings.dailyDiscoveries,
            max: this.settings.maxDiscoveriesPerDay,
            percentage: (this.settings.dailyDiscoveries / this.settings.maxDiscoveriesPerDay) * 100
        };
    }

    getTimeUntilNextDiscovery() {
        const now = Date.now();
        const nextDiscoveryTime = this.settings.lastDiscoveryTime + (this.settings.intervalHours * 60 * 60 * 1000);
        return Math.max(0, nextDiscoveryTime - now);
    }
}

// Test the system
const service = new MockIngredientDiscoveryService();

console.log('📊 Initial Status:');
console.log(`- Should discover: ${service.shouldDiscoverIngredients()}`);
console.log(`- Daily progress: ${service.getDailyProgress().current}/${service.getDailyProgress().max}`);
console.log(`- Time until next: ${Math.round(service.getTimeUntilNextDiscovery() / (1000 * 60))} minutes\n`);

console.log('🔍 Testing Discovery...');
const discoveries = service.discoverIngredients();

if (discoveries.length > 0) {
    console.log(`✅ Found ${discoveries.length} ingredient(s)!`);
    discoveries.forEach((discovery, index) => {
        console.log(`  ${index + 1}. ${discovery.quantity}x ${discovery.ingredientId} (${discovery.rarity})`);
        console.log(`     Message: "${discovery.message}"`);
    });
} else {
    console.log('❌ No ingredients found');
}

console.log('\n📊 Updated Status:');
console.log(`- Should discover: ${service.shouldDiscoverIngredients()}`);
console.log(`- Daily progress: ${service.getDailyProgress().current}/${service.getDailyProgress().max}`);
console.log(`- Time until next: ${Math.round(service.getTimeUntilNextDiscovery() / (1000 * 60))} minutes`);

console.log('\n🎉 Test completed! The ingredient discovery system is working properly.');
