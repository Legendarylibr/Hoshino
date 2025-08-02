import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Character {
  id: string;
  name: string;
  description: string;
  image: string;
  animatedImage?: string;
  element: string;
  baseStats: {
    mood: number;
    hunger: number;
    energy: number;
  };
  rarity: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  specialAbility: string;
  nftMint?: string | null;
}

export interface GameState {
  playerName: string;
  selectedCharacter: Character | null;
  ownedCharacters: Character[];
  starFragments: number;
  solBalance: number;
  achievements: string[];
  moonPhase: number;
  lastUpdated: Date;
}

export class LocalGameEngine {
  private gameState: GameState;
  private listeners: Array<(state: GameState) => void> = [];

  constructor() {
    this.gameState = {
      playerName: '',
      selectedCharacter: null,
      ownedCharacters: [],
      starFragments: 0,
      solBalance: 0.1, // Starting SOL balance
      achievements: [],
      moonPhase: 1,
      lastUpdated: new Date()
    };
    this.loadGameState();
  }

  private async loadGameState() {
    try {
      const savedState = await AsyncStorage.getItem('hoshino_game_state');
      if (savedState) {
        const parsed = JSON.parse(savedState);
        this.gameState = { ...this.gameState, ...parsed };
        this.notifyListeners();
      }
    } catch (error) {
      console.error('Failed to load game state:', error);
    }
  }

  private async saveGameState() {
    try {
      await AsyncStorage.setItem('hoshino_game_state', JSON.stringify(this.gameState));
    } catch (error) {
      console.error('Failed to save game state:', error);
    }
  }

  private notifyListeners() {
    this.listeners.forEach(listener => listener(this.gameState));
  }

  public subscribe(listener: (state: GameState) => void) {
    this.listeners.push(listener);
    return () => {
      const index = this.listeners.indexOf(listener);
      if (index > -1) {
        this.listeners.splice(index, 1);
      }
    };
  }

  public getGameState(): GameState {
    return { ...this.gameState };
  }

  public setPlayerName(name: string) {
    this.gameState.playerName = name;
    this.saveGameState();
    this.notifyListeners();
  }

  public selectCharacter(character: Character) {
    this.gameState.selectedCharacter = character;
    this.gameState.characterStats = { ...character.baseStats };
    this.gameState.lastFed = Date.now();
    this.gameState.lastSlept = Date.now();
    this.gameState.lastPlayed = Date.now();
    
    if (!this.gameState.ownedCharacters.includes(character.id)) {
      this.gameState.ownedCharacters.push(character.id);
    }
    
    this.saveGameState();
    this.notifyListeners();
  }

  public feedCharacter() {
    const now = Date.now();
    const timeSinceLastFed = now - this.gameState.lastFed;
    
    // Prevent overfeeding (max once per 30 minutes)
    if (timeSinceLastFed < 30 * 60 * 1000) {
      return { success: false, message: 'Character is not hungry yet!' };
    }

    this.gameState.characterStats.hunger = Math.min(5, this.gameState.characterStats.hunger + 2);
    this.gameState.characterStats.mood = Math.min(5, this.gameState.characterStats.mood + 1);
    this.gameState.lastFed = now;
    
    this.saveGameState();
    this.notifyListeners();
    
    return { success: true, message: 'Character fed successfully!' };
  }

  public putCharacterToSleep() {
    const now = Date.now();
    const timeSinceLastSlept = now - this.gameState.lastSlept;
    
    // Prevent oversleeping (max once per 2 hours)
    if (timeSinceLastSlept < 2 * 60 * 60 * 1000) {
      return { success: false, message: 'Character is not tired yet!' };
    }

    this.gameState.characterStats.energy = Math.min(5, this.gameState.characterStats.energy + 3);
    this.gameState.characterStats.mood = Math.min(5, this.gameState.characterStats.mood + 1);
    this.gameState.lastSlept = now;
    
    this.saveGameState();
    this.notifyListeners();
    
    return { success: true, message: 'Character is now well-rested!' };
  }

  public playWithCharacter() {
    const now = Date.now();
    const timeSinceLastPlayed = now - this.gameState.lastPlayed;
    
    // Prevent overplaying (max once per 15 minutes)
    if (timeSinceLastPlayed < 15 * 60 * 1000) {
      return { success: false, message: 'Character needs a break!' };
    }

    this.gameState.characterStats.mood = Math.min(5, this.gameState.characterStats.mood + 2);
    this.gameState.characterStats.energy = Math.max(1, this.gameState.characterStats.energy - 1);
    this.gameState.lastPlayed = now;
    
    this.saveGameState();
    this.notifyListeners();
    
    return { success: true, message: 'Character had a great time playing!' };
  }

  public updateStats() {
    const now = Date.now();
    const timeSinceLastFed = now - this.gameState.lastFed;
    const timeSinceLastSlept = now - this.gameState.lastSlept;
    const timeSinceLastPlayed = now - this.gameState.lastPlayed;

    // Natural stat decay
    if (timeSinceLastFed > 4 * 60 * 60 * 1000) { // 4 hours
      this.gameState.characterStats.hunger = Math.max(1, this.gameState.characterStats.hunger - 1);
    }
    
    if (timeSinceLastSlept > 8 * 60 * 60 * 1000) { // 8 hours
      this.gameState.characterStats.energy = Math.max(1, this.gameState.characterStats.energy - 1);
    }
    
    if (timeSinceLastPlayed > 6 * 60 * 60 * 1000) { // 6 hours
      this.gameState.characterStats.mood = Math.max(1, this.gameState.characterStats.mood - 1);
    }

    this.saveGameState();
    this.notifyListeners();
  }

  public addAchievement(achievement: string) {
    if (!this.gameState.achievements.includes(achievement)) {
      this.gameState.achievements.push(achievement);
      this.saveGameState();
      this.notifyListeners();
    }
  }

  public addStarFragments(amount: number) {
    this.gameState.starFragments = Math.max(0, this.gameState.starFragments + amount);
    this.saveGameState();
    this.notifyListeners();
  }

  public getStarFragments(): number {
    return this.gameState.starFragments;
  }

  public addSolBalance(amount: number) {
    this.gameState.solBalance = Math.max(0, this.gameState.solBalance + amount);
    this.saveGameState();
    this.notifyListeners();
  }

  public getSolBalance(): number {
    return this.gameState.solBalance;
  }

  public setMoonPhase(phase: number) {
    this.gameState.moonPhase = phase;
    this.saveGameState();
    this.notifyListeners();
  }

  public resetGame() {
    this.gameState = {
      selectedCharacter: null,
      characterStats: { mood: 3, hunger: 5, energy: 2 },
      lastFed: Date.now(),
      lastSlept: Date.now(),
      lastPlayed: Date.now(),
      achievements: [],
      ownedCharacters: [],
      playerName: '',
      totalPlayTime: 0,
      moonPhase: 0,
      starFragments: 0
    };
    this.saveGameState();
    this.notifyListeners();
  }
} 