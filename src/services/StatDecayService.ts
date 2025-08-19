import AsyncStorage from '@react-native-async-storage/async-storage';

export interface CharacterTimers {
    characterId: string;
    lastInteraction: number; // timestamp
    lastFeed: number;
    lastSleep: number;
    lastPlay: number;
    lastChat: number;
    currentMood: number;
    currentHunger: number;
    currentEnergy: number;
    moodActionsToday: number; // Track daily mood actions (max 1 per day)
    feedActionsToday: number; // Track daily feed actions (max 3-4 per day)
    lastMoodActionDate: string; // YYYY-MM-DD format
    lastFeedActionDate: string; // YYYY-MM-DD format
    energyDecayTimestamp: number; // For 6-hour energy decay
}

export interface MoodState {
    level: number; // 1-5 stars
    state: 'happy' | 'relaxed' | 'bored' | 'sad' | 'angry';
    hoursInState: number;
}

export class StatDecayService {
    private storageKey = 'hoshino_character_timers';

    constructor() { }

    // Get character timers from storage
    private async getCharacterTimers(characterId: string): Promise<CharacterTimers> {
        const allTimersStr = await AsyncStorage.getItem(this.storageKey);
        const allTimers = allTimersStr ? JSON.parse(allTimersStr) : {};
        const now = Date.now();

        return allTimers[characterId] || {
            characterId,
            lastInteraction: now,
            lastFeed: now,
            lastSleep: now,
            lastPlay: now,
            lastChat: now,
            currentMood: 3,
            currentHunger: 3,
            currentEnergy: 3,
            moodActionsToday: 0,
            lastMoodActionDate: new Date().toISOString().split('T')[0],
            energyDecayTimestamp: now
        };
    }

    // Save character timers to storage
    private async saveCharacterTimers(timers: CharacterTimers): Promise<void> {
        const allTimersStr = await AsyncStorage.getItem(this.storageKey);
        const allTimers = allTimersStr ? JSON.parse(allTimersStr) : {};
        allTimers[timers.characterId] = timers;
        await AsyncStorage.setItem(this.storageKey, JSON.stringify(allTimers));
    }

    // Calculate current mood state based on time since last interaction
    private calculateMoodState(timers: CharacterTimers): MoodState {
        const now = Date.now();
        const hoursSinceLastInteraction = (now - timers.lastInteraction) / (1000 * 60 * 60);

        let state: MoodState['state'] = 'happy';
        let moodLevel = timers.currentMood;

        // Time-based mood decay: happy → relaxed (3h) → bored (10h) → sad (15h) → angry (21h)
        if (hoursSinceLastInteraction >= 21) {
            state = 'angry';
            moodLevel = Math.max(1, moodLevel - 3); // Significant mood drop when angry
        } else if (hoursSinceLastInteraction >= 15) {
            state = 'sad';
            moodLevel = Math.max(1, moodLevel - 2);
        } else if (hoursSinceLastInteraction >= 10) {
            state = 'bored';
            moodLevel = Math.max(1, moodLevel - 1);
        } else if (hoursSinceLastInteraction >= 3) {
            state = 'relaxed';
            // No mood penalty for relaxed state
        } else {
            state = 'happy';
        }

        return {
            level: moodLevel,
            state,
            hoursInState: hoursSinceLastInteraction
        };
    }

    // Check for combo mood loss (hunger + sleep + play + talk timing)
    private calculateComboMoodLoss(timers: CharacterTimers): number {
        const now = Date.now();
        const hoursToMs = (hours: number) => hours * 60 * 60 * 1000;

        let comboLoss = 0;

        // Check each action's timing thresholds
        const timeSinceFeed = now - timers.lastFeed;
        const timeSinceSleep = now - timers.lastSleep;
        const timeSincePlay = now - timers.lastPlay;
        const timeSinceChat = now - timers.lastChat;

        // Mood loss at 3h, 9h, 15h, 21h intervals for each unmet need
        const intervals = [hoursToMs(3), hoursToMs(9), hoursToMs(15), hoursToMs(21)];

        intervals.forEach((interval, index) => {
            const lossAmount = index + 1; // 1 point at 3h, 2 points at 9h, etc.

            if (timeSinceFeed >= interval) comboLoss += lossAmount;
            if (timeSinceSleep >= interval) comboLoss += lossAmount;
            if (timeSincePlay >= interval) comboLoss += lossAmount;
            if (timeSinceChat >= interval) comboLoss += lossAmount;
        });

        return Math.min(comboLoss, 4); // Cap at 4 points total loss
    }

    // Calculate energy decay (every 6 hours 1 point less)
    private calculateEnergyDecay(timers: CharacterTimers): number {
        const now = Date.now();
        const hoursSinceLastEnergyDecay = (now - timers.energyDecayTimestamp) / (1000 * 60 * 60);

        const decayIntervals = Math.floor(hoursSinceLastEnergyDecay / 6);
        const energyLoss = decayIntervals;

        return Math.max(1, timers.currentEnergy - energyLoss);
    }

    // Update character stats with time-based decay
    async updateCharacterStats(characterId: string): Promise<{
        mood: number;
        hunger: number;
        energy: number;
        moodState: MoodState;
        decayInfo: {
            moodDecay: number;
            comboLoss: number;
            energyDecay: number;
        };
    }> {
        const timers = await this.getCharacterTimers(characterId);
        const moodState = this.calculateMoodState(timers);
        const comboLoss = this.calculateComboMoodLoss(timers);
        const newEnergy = this.calculateEnergyDecay(timers);

        // Apply all decay calculations
        const finalMood = Math.max(1, Math.min(5, moodState.level - comboLoss));
        const finalHunger = timers.currentHunger; // Hunger doesn't auto-decay in design doc
        const finalEnergy = newEnergy;

        // Update timers with new values
        const updatedTimers = {
            ...timers,
            currentMood: finalMood,
            currentHunger: finalHunger,
            currentEnergy: finalEnergy,
            energyDecayTimestamp: Date.now() // Reset energy decay timer
        };

        await this.saveCharacterTimers(updatedTimers);

        return {
            mood: finalMood,
            hunger: finalHunger,
            energy: finalEnergy,
            moodState,
            decayInfo: {
                moodDecay: timers.currentMood - finalMood,
                comboLoss,
                energyDecay: timers.currentEnergy - finalEnergy
            }
        };
    }

    // Record an action and update relevant timers
    async recordAction(
        characterId: string,
        actionType: 'feed' | 'sleep' | 'play' | 'chat',
        statBoost?: { mood?: number; hunger?: number; energy?: number }
    ): Promise<{
        success: boolean;
        canGainMood: boolean;
        message: string;
        newStats: { mood: number; hunger: number; energy: number };
    }> {
        const timers = await this.getCharacterTimers(characterId);
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];

        // Reset daily mood counter if it's a new day
        if (timers.lastMoodActionDate !== today) {
            timers.moodActionsToday = 0;
            timers.lastMoodActionDate = today;
        }

        // Reset daily feed counter if it's a new day
        if (timers.lastFeedActionDate !== today) {
            timers.feedActionsToday = 0;
            timers.lastFeedActionDate = today;
        }

        // Check if user can gain mood today (max 1 per day per action type)
        const canGainMood = timers.moodActionsToday < 1;
        let moodGained = 0;

        if (canGainMood && statBoost?.mood) {
            moodGained = Math.min(1, statBoost.mood); // Max 1 mood point per day
            timers.moodActionsToday++;
        }

        // Check feeding limit (max 4 feeds per day)
        const canFeed = actionType !== 'feed' || timers.feedActionsToday < 4;

        // Update timers and stats
        timers.lastInteraction = now;

        switch (actionType) {
            case 'feed':
                if (!canFeed) {
                    return {
                        success: false,
                        canGainMood: false,
                        message: 'Daily feeding limit reached (4 feeds per day)',
                        newStats: { mood: timers.currentMood, hunger: timers.currentHunger, energy: timers.currentEnergy }
                    };
                }
                timers.lastFeed = now;
                timers.feedActionsToday++;
                timers.currentHunger = Math.min(5, timers.currentHunger + (statBoost?.hunger || 0));
                break;
            case 'sleep':
                timers.lastSleep = now;
                timers.currentEnergy = Math.min(5, timers.currentEnergy + (statBoost?.energy || 0));
                break;
            case 'play':
                timers.lastPlay = now;
                break;
            case 'chat':
                timers.lastChat = now;
                break;
        }

        timers.currentMood = Math.min(5, timers.currentMood + moodGained);

        await this.saveCharacterTimers(timers);

        const message = canGainMood && moodGained > 0
            ? `✨ ${actionType} completed! +${moodGained} mood point gained today!`
            : `${actionType} completed! (Already earned today's mood bonus)`;

        return {
            success: true,
            canGainMood,
            message,
            newStats: {
                mood: timers.currentMood,
                hunger: timers.currentHunger,
                energy: timers.currentEnergy
            }
        };
    }

    // Get character's current state description
    async getCharacterStateDescription(characterId: string): Promise<string> {
        const stats = await this.updateCharacterStats(characterId);
        const { moodState } = stats;

        const stateDescriptions = {
            happy: "😊 Your character is happy and content!",
            relaxed: "😌 Your character is feeling relaxed after some time.",
            bored: "😐 Your character is getting bored and needs attention.",
            sad: "😢 Your character is feeling sad and neglected.",
            angry: "😠 Your character is angry from being ignored too long!"
        };

        return stateDescriptions[moodState.state];
    }

    // Initialize a new character
    async initializeCharacter(characterId: string, baseStats: { mood: number; hunger: number; energy: number }): Promise<void> {
        const now = Date.now();
        const today = new Date().toISOString().split('T')[0];

        const timers: CharacterTimers = {
            characterId,
            lastInteraction: now,
            lastFeed: now,
            lastSleep: now,
            lastPlay: now,
            lastChat: now,
            currentMood: baseStats.mood,
            currentHunger: baseStats.hunger,
            currentEnergy: baseStats.energy,
            moodActionsToday: 0,
            feedActionsToday: 0,
            lastMoodActionDate: today,
            lastFeedActionDate: today,
            energyDecayTimestamp: now
        };

        await this.saveCharacterTimers(timers);
    }
}