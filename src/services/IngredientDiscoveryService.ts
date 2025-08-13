import { Ingredient } from '../types/GameTypes';
import { INGREDIENTS, getIngredientsByRarity } from '../data/ingredients';

export interface IngredientDiscovery {
    id: string;
    ingredientId: string;
    quantity: number;
    discoveredAt: number;
    rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
    message: string;
}

export interface DiscoverySettings {
    enabled: boolean;
    intervalHours: number; // How often the pet finds ingredients
    lastDiscoveryTime: number;
    discoveryChance: number; // 0-1, chance of finding something
    maxDiscoveriesPerDay: number;
    dailyDiscoveries: number;
    lastDailyReset: string; // YYYY-MM-DD format
}

export interface DiscoveryNotification {
    type: 'ingredient_found';
    title: string;
    message: string;
    ingredient: Ingredient;
    quantity: number;
    timestamp: number;
}

export class IngredientDiscoveryService {
    private settings: DiscoverySettings;
    private discoveries: IngredientDiscovery[] = [];
    private readonly STORAGE_KEY = 'ingredient_discovery_settings';
    private readonly DISCOVERIES_KEY = 'ingredient_discoveries';

    constructor() {
        this.settings = this.getDefaultSettings();
        this.loadSettings();
        this.loadDiscoveries();
        this.checkDailyReset();
    }

    private getDefaultSettings(): DiscoverySettings {
        return {
            enabled: true,
            intervalHours: 4, // Pet finds ingredients every 4 hours
            lastDiscoveryTime: Date.now(),
            discoveryChance: 0.8, // 80% chance of finding something
            maxDiscoveriesPerDay: 6, // Max 6 discoveries per day
            dailyDiscoveries: 0,
            lastDailyReset: this.getTodayString()
        };
    }

    // Check if it's time for the pet to find ingredients
    public shouldDiscoverIngredients(): boolean {
        if (!this.settings.enabled) return false;
        
        const now = Date.now();
        const hoursSinceLastDiscovery = (now - this.settings.lastDiscoveryTime) / (1000 * 60 * 60);
        
        // Check if enough time has passed and we haven't hit daily limit
        return hoursSinceLastDiscovery >= this.settings.intervalHours && 
               this.settings.dailyDiscoveries < this.settings.maxDiscoveriesPerDay;
    }

    // Pet discovers ingredients
    public discoverIngredients(): IngredientDiscovery[] {
        if (!this.shouldDiscoverIngredients()) {
            return [];
        }

        const discoveries: IngredientDiscovery[] = [];
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
            // Update settings
            this.settings.lastDiscoveryTime = now;
            this.settings.dailyDiscoveries += discoveries.length;
            
            // Save state
            this.saveSettings();
            this.saveDiscoveries();
        }

        return discoveries;
    }

    // Generate a random ingredient discovery
    private generateRandomDiscovery(timestamp: number): IngredientDiscovery | null {
        // Rarity distribution: 60% common, 25% uncommon, 10% rare, 4% epic, 1% legendary
        const rarityRoll = Math.random();
        let rarity: DiscoverySettings['rarity'];
        
        if (rarityRoll < 0.6) rarity = 'common';
        else if (rarityRoll < 0.85) rarity = 'uncommon';
        else if (rarityRoll < 0.95) rarity = 'rare';
        else if (rarityRoll < 0.99) rarity = 'epic';
        else rarity = 'legendary';

        const availableIngredients = getIngredientsByRarity(rarity);
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

    // Calculate quantity based on rarity
    private calculateQuantity(rarity: DiscoverySettings['rarity']): number {
        switch (rarity) {
            case 'common':
                return Math.floor(Math.random() * 3) + 1; // 1-3
            case 'uncommon':
                return Math.floor(Math.random() * 2) + 1; // 1-2
            case 'rare':
                return 1; // Always 1
            case 'epic':
                return 1; // Always 1
            case 'legendary':
                return 1; // Always 1
            default:
                return 1;
        }
    }

    // Get discovery messages based on rarity and ingredient
    private getDiscoveryMessages(rarity: DiscoverySettings['rarity'], ingredientName: string): string[] {
        const baseMessages = {
            common: [
                `Hey! I found some ${ingredientName}!`,
                `Look what I discovered - ${ingredientName}!`,
                `I stumbled upon some ${ingredientName}!`,
                `Found ${ingredientName} while exploring!`
            ],
            uncommon: [
                `Wow! I found some rare ${ingredientName}!`,
                `This is exciting - I discovered ${ingredientName}!`,
                `I can't believe I found ${ingredientName}!`,
                `What a lucky find - ${ingredientName}!`
            ],
            rare: [
                `Incredible! I found legendary ${ingredientName}!`,
                `This is amazing - I discovered ${ingredientName}!`,
                `I'm so excited - I found ${ingredientName}!`,
                `What a treasure - ${ingredientName}!`
            ],
            epic: [
                `MAGNIFICENT! I found epic ${ingredientName}!`,
                `This is extraordinary - ${ingredientName}!`,
                `I'm speechless - I found ${ingredientName}!`,
                `What an incredible discovery - ${ingredientName}!`
            ],
            legendary: [
                `LEGENDARY DISCOVERY! I found ${ingredientName}!`,
                `This is the find of a lifetime - ${ingredientName}!`,
                `I'm in awe - I found ${ingredientName}!`,
                `What a mythical discovery - ${ingredientName}!`
            ]
        };

        return baseMessages[rarity] || baseMessages.common;
    }

    // Get discovery notifications for UI
    public getDiscoveryNotifications(): DiscoveryNotification[] {
        const recentDiscoveries = this.discoveries.filter(d => 
            Date.now() - d.discoveredAt < 24 * 60 * 60 * 1000 // Last 24 hours
        );

        return recentDiscoveries.map(discovery => {
            const ingredient = INGREDIENTS.find(i => i.id === discovery.ingredientId);
            if (!ingredient) return null;

            return {
                type: 'ingredient_found',
                title: 'Ingredient Found!',
                message: discovery.message,
                ingredient,
                quantity: discovery.quantity,
                timestamp: discovery.discoveredAt
            };
        }).filter(Boolean) as DiscoveryNotification[];
    }

    // Get time until next discovery
    public getTimeUntilNextDiscovery(): number {
        if (!this.settings.enabled) return 0;
        
        const now = Date.now();
        const nextDiscoveryTime = this.settings.lastDiscoveryTime + (this.settings.intervalHours * 60 * 60 * 1000);
        return Math.max(0, nextDiscoveryTime - now);
    }

    // Get discovery progress for today
    public getDailyProgress(): { current: number; max: number; percentage: number } {
        const current = this.settings.dailyDiscoveries;
        const max = this.settings.maxDiscoveriesPerDay;
        const percentage = (current / max) * 100;
        
        return { current, max, percentage };
    }

    // Update discovery settings
    public updateSettings(newSettings: Partial<DiscoverySettings>): void {
        this.settings = { ...this.settings, ...newSettings };
        this.saveSettings();
    }

    // Check if daily reset is needed
    private checkDailyReset(): void {
        const today = this.getTodayString();
        if (this.settings.lastDailyReset !== today) {
            this.settings.dailyDiscoveries = 0;
            this.settings.lastDailyReset = today;
            this.saveSettings();
        }
    }

    // Get today's date string
    private getTodayString(): string {
        return new Date().toISOString().split('T')[0];
    }

    // Save/load methods
    private saveSettings(): void {
        try {
            localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.settings));
        } catch (error) {
            console.error('Failed to save discovery settings:', error);
        }
    }

    private loadSettings(): void {
        try {
            const saved = localStorage.getItem(this.STORAGE_KEY);
            if (saved) {
                this.settings = { ...this.settings, ...JSON.parse(saved) };
            }
        } catch (error) {
            console.error('Failed to load discovery settings:', error);
        }
    }

    private saveDiscoveries(): void {
        try {
            localStorage.setItem(this.DISCOVERIES_KEY, JSON.stringify(this.discoveries));
        } catch (error) {
            console.error('Failed to save discoveries:', error);
        }
    }

    private loadDiscoveries(): void {
        try {
            const saved = localStorage.getItem(this.DISCOVERIES_KEY);
            if (saved) {
                this.discoveries = JSON.parse(saved);
            }
        } catch (error) {
            console.error('Failed to load discoveries:', error);
        }
    }

    // Public getters
    public getSettings(): DiscoverySettings {
        return { ...this.settings };
    }

    public getDiscoveries(): IngredientDiscovery[] {
        return [...this.discoveries];
    }

    // Clear old discoveries (keep only last 7 days)
    public cleanupOldDiscoveries(): void {
        const weekAgo = Date.now() - (7 * 24 * 60 * 60 * 1000);
        this.discoveries = this.discoveries.filter(d => d.discoveredAt > weekAgo);
        this.saveDiscoveries();
    }
}

// Export singleton instance
export const ingredientDiscoveryService = new IngredientDiscoveryService();
