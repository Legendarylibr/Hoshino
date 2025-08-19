import AsyncStorage from '@react-native-async-storage/async-storage';
import { InventoryService } from './InventoryService';

export interface DiscoveryEvent {
    id: string;
    ingredientId: string;
    quantity: number;
    timestamp: number;
    location?: string;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
}

export interface DiscoverySettings {
    enabled: boolean;
    intervalHours: number;
    successRate: number;
    maxDiscoveriesPerDay: number;
    lastDiscoveryTime: number;
    dailyDiscoveries: number;
    lastDailyReset: string;
}

export class IngredientDiscoveryService {
    private static instance: IngredientDiscoveryService;
    private storageKey = 'ingredient_discoveries';
    private settingsKey = 'ingredient_discovery_settings';
    private lastDiscoveryCheck = 0;
    private discoveryCooldown = 300000; // 5 minutes
    private defaultIntervalHours = 6; // Default to 6 hours between discoveries
    private inventoryService: InventoryService;

    private constructor() {
        this.inventoryService = InventoryService.getInstance();
    }

    static getInstance(): IngredientDiscoveryService {
        if (!IngredientDiscoveryService.instance) {
            IngredientDiscoveryService.instance = new IngredientDiscoveryService();
        }
        return IngredientDiscoveryService.instance;
    }

    // Check if enough time has passed for new discoveries
    shouldDiscoverIngredients(): boolean {
        const now = Date.now();
        return now - this.lastDiscoveryCheck >= this.discoveryCooldown;
    }

    // Simulate ingredient discovery
    async discoverIngredients(): Promise<DiscoveryEvent[]> {
        if (!this.shouldDiscoverIngredients()) {
            return [];
        }

        this.lastDiscoveryCheck = Date.now();
        const discoveries: DiscoveryEvent[] = [];

        // Simulate random discoveries based on time and luck
        const discoveryChance = Math.random();
        
        if (discoveryChance > 0.7) { // 30% chance
            const discovery = this.generateRandomDiscovery();
            discoveries.push(discovery);
            
            // Add discovered ingredient to unified inventory
            await this.inventoryService.addToInventory([{
                id: discovery.ingredientId,
                quantity: discovery.quantity,
                source: 'discovery'
            }]);

            // Save discovery event
            await this.saveDiscoveryEvent(discovery);
        }

        return discoveries;
    }

    // Generate a random discovery event
    private generateRandomDiscovery(): DiscoveryEvent {
        const ingredients = ['pink-sugar', 'nova-egg', 'mira-berry'];
        const ingredientId = ingredients[Math.floor(Math.random() * ingredients.length)];
        const quantity = Math.floor(Math.random() * 2) + 1; // 1-2 items
        const rarity = this.getRandomRarity();

        return {
            id: `discovery_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            ingredientId,
            quantity,
            timestamp: Date.now(),
            location: 'Stellar Garden',
            rarity
        };
    }

    // Get random rarity with weighted distribution
    private getRandomRarity(): 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary' {
        const rand = Math.random();
        if (rand < 0.6) return 'common';
        if (rand < 0.8) return 'uncommon';
        if (rand < 0.9) return 'rare';
        if (rand < 0.95) return 'epic';
        return 'legendary';
    }

    // Save discovery event to storage
    private async saveDiscoveryEvent(discovery: DiscoveryEvent): Promise<void> {
        try {
            const existing = await this.getDiscoveryHistory();
            existing.push(discovery);
            
            // Keep only last 100 discoveries
            if (existing.length > 100) {
                existing.splice(0, existing.length - 100);
            }
            
            await AsyncStorage.setItem(this.storageKey, JSON.stringify(existing));
        } catch (error) {
            console.error('Failed to save discovery event:', error);
        }
    }

    // Get discovery history
    async getDiscoveryHistory(): Promise<DiscoveryEvent[]> {
        try {
            const stored = await AsyncStorage.getItem(this.storageKey);
            return stored ? JSON.parse(stored) : [];
        } catch (error) {
            console.error('Failed to load discovery history:', error);
            return [];
        }
    }

    // Get recent discoveries (last 24 hours)
    async getRecentDiscoveries(): Promise<DiscoveryEvent[]> {
        const history = await this.getDiscoveryHistory();
        const oneDayAgo = Date.now() - (24 * 60 * 60 * 1000);
        return history.filter(discovery => discovery.timestamp > oneDayAgo);
    }

    // Get discovery statistics
    async getDiscoveryStats(): Promise<{
        totalDiscoveries: number;
        todayDiscoveries: number;
        byRarity: Record<string, number>;
        byIngredient: Record<string, number>;
    }> {
        const history = await this.getDiscoveryHistory();
        const recent = await this.getRecentDiscoveries();
        
        const byRarity: Record<string, number> = {};
        const byIngredient: Record<string, number> = {};
        
        history.forEach(discovery => {
            byRarity[discovery.rarity] = (byRarity[discovery.rarity] || 0) + 1;
            byIngredient[discovery.ingredientId] = (byIngredient[discovery.ingredientId] || 0) + 1;
        });

        return {
            totalDiscoveries: history.length,
            todayDiscoveries: recent.length,
            byRarity,
            byIngredient
        };
    }

    // Force a discovery (for testing/debugging)
    async forceDiscovery(ingredientId: string, quantity: number = 1): Promise<DiscoveryEvent> {
        const discovery: DiscoveryEvent = {
            id: `forced_discovery_${Date.now()}`,
            ingredientId,
            quantity,
            timestamp: Date.now(),
            location: 'Test Garden',
            rarity: 'common'
        };

        // Add to unified inventory
        await this.inventoryService.addToInventory([{
            id: ingredientId,
            quantity,
            source: 'discovery'
        }]);

        // Save discovery event
        await this.saveDiscoveryEvent(discovery);
        
        return discovery;
    }

    // Reset discovery cooldown (for testing)
    resetDiscoveryCooldown(): void {
        this.lastDiscoveryCheck = 0;
    }

    // Set custom discovery cooldown
    setDiscoveryCooldown(milliseconds: number): void {
        this.discoveryCooldown = milliseconds;
    }

    // Clear discovery history
    async clearDiscoveryHistory(): Promise<void> {
        try {
            await AsyncStorage.removeItem(this.storageKey);
        } catch (error) {
            console.error('Failed to clear discovery history:', error);
        }
    }

    // Get current settings
    async getSettings(): Promise<DiscoverySettings> {
        try {
            const stored = await AsyncStorage.getItem(this.settingsKey);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error('Failed to load discovery settings:', error);
        }

        // Return default settings
        return {
            enabled: true,
            intervalHours: 6, // 6 hours between discoveries
            successRate: 75,
            maxDiscoveriesPerDay: 4, // 4 discoveries per day
            lastDiscoveryTime: 0,
            dailyDiscoveries: 0,
            lastDailyReset: new Date().toISOString().split('T')[0]
        };
    }

    // Update settings
    async updateSettings(newSettings: Partial<DiscoverySettings>): Promise<void> {
        try {
            const current = await this.getSettings();
            const updated = { ...current, ...newSettings };
            await AsyncStorage.setItem(this.settingsKey, JSON.stringify(updated));
        } catch (error) {
            console.error('Failed to update discovery settings:', error);
        }
    }

    // Get daily progress
    async getDailyProgress(): Promise<{ current: number; max: number; percentage: number }> {
        const settings = await this.getSettings();
        const today = new Date().toISOString().split('T')[0];
        
        // Reset daily count if it's a new day
        if (settings.lastDailyReset !== today) {
            await this.updateSettings({
                dailyDiscoveries: 0,
                lastDailyReset: today
            });
            return { current: 0, max: settings.maxDiscoveriesPerDay, percentage: 0 };
        }

        const percentage = Math.round((settings.dailyDiscoveries / settings.maxDiscoveriesPerDay) * 100);
        return {
            current: settings.dailyDiscoveries,
            max: settings.maxDiscoveriesPerDay,
            percentage: Math.min(percentage, 100)
        };
    }

    // Get time until next discovery
    async getTimeUntilNextDiscovery(): Promise<number> {
        const settings = await this.getSettings();
        const now = Date.now();
        const timeSinceLast = settings.lastDiscoveryTime;
        const intervalMs = settings.intervalHours * 60 * 60 * 1000;
        
        if (now - timeSinceLast >= intervalMs) {
            return 0; // Ready for discovery
        }
        
        return intervalMs - (now - timeSinceLast);
    }
}
