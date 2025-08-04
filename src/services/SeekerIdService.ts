import { PublicKey } from '@solana/web3.js';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface SeekerIdProfile {
  username: string; // .skr username
  publicKey: string;
  deviceId: string;
  createdAt: number;
  isVerified: boolean;
}

/**
 * Seeker ID Service - Manages .skr usernames and Seeker device identity
 * Part of Solana Seeker ecosystem for decentralized identity
 */
export class SeekerIdService {
  private static readonly STORAGE_KEY = 'seeker_id_profile';
  private static readonly USERNAME_REGISTRY_KEY = 'seeker_username_registry';
  
  private profile: SeekerIdProfile | null = null;
  private isInitialized: boolean = false;

  constructor() {
    this.initialize();
  }

  /**
   * Initialize the Seeker ID service
   */
  private async initialize(): Promise<void> {
    try {
      await this.loadProfile();
      this.isInitialized = true;
      console.log('🆔 Seeker ID service initialized');
    } catch (error) {
      console.error('❌ Failed to initialize Seeker ID service:', error);
    }
  }

  /**
   * Create or claim a .skr username
   */
  async claimUsername(
    username: string, 
    publicKey: PublicKey,
    deviceId?: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      // Validate username format
      if (!this.isValidUsername(username)) {
        return {
          success: false,
          error: 'Invalid username format. Must be 3-20 characters, alphanumeric and hyphens only.'
        };
      }

      // Check if username is available
      const isAvailable = await this.isUsernameAvailable(username);
      if (!isAvailable) {
        return {
          success: false,
          error: 'Username is already taken.'
        };
      }

      // Create Seeker ID profile
      const profile: SeekerIdProfile = {
        username: username.toLowerCase(),
        publicKey: publicKey.toString(),
        deviceId: deviceId || this.generateDeviceId(),
        createdAt: Date.now(),
        isVerified: this.isRunningOnSeeker()
      };

      // Save profile
      await this.saveProfile(profile);
      await this.registerUsername(username.toLowerCase(), profile);

      this.profile = profile;

      console.log(`✅ Seeker ID claimed: ${username}.skr -> ${publicKey.toString()}`);
      
      return { success: true };
    } catch (error) {
      console.error('❌ Failed to claim username:', error);
      return {
        success: false,
        error: 'Failed to claim username. Please try again.'
      };
    }
  }

  /**
   * Get current Seeker ID profile
   */
  getProfile(): SeekerIdProfile | null {
    return this.profile;
  }

  /**
   * Get formatted Seeker ID (username.skr)
   */
  getSeekerId(): string | null {
    return this.profile ? `${this.profile.username}.skr` : null;
  }

  /**
   * Check if username is valid format
   */
  private isValidUsername(username: string): boolean {
    // Username rules: 3-20 characters, alphanumeric and hyphens, no consecutive hyphens
    const regex = /^[a-zA-Z0-9]([a-zA-Z0-9-]*[a-zA-Z0-9])?$/;
    return username.length >= 3 && 
           username.length <= 20 && 
           regex.test(username) &&
           !username.includes('--');
  }

  /**
   * Check if username is available
   */
  private async isUsernameAvailable(username: string): Promise<boolean> {
    try {
      const registry = await this.loadUsernameRegistry();
      return !registry[username.toLowerCase()];
    } catch (error) {
      console.error('Error checking username availability:', error);
      return false;
    }
  }

  /**
   * Register username in local registry
   */
  private async registerUsername(username: string, profile: SeekerIdProfile): Promise<void> {
    try {
      const registry = await this.loadUsernameRegistry();
      registry[username] = {
        publicKey: profile.publicKey,
        deviceId: profile.deviceId,
        createdAt: profile.createdAt
      };
      
      await AsyncStorage.setItem(
        SeekerIdService.USERNAME_REGISTRY_KEY, 
        JSON.stringify(registry)
      );
    } catch (error) {
      console.error('Error registering username:', error);
      throw error;
    }
  }

  /**
   * Load username registry
   */
  private async loadUsernameRegistry(): Promise<Record<string, any>> {
    try {
      const registryData = await AsyncStorage.getItem(SeekerIdService.USERNAME_REGISTRY_KEY);
      return registryData ? JSON.parse(registryData) : {};
    } catch (error) {
      console.error('Error loading username registry:', error);
      return {};
    }
  }

  /**
   * Load saved profile
   */
  private async loadProfile(): Promise<void> {
    try {
      const profileData = await AsyncStorage.getItem(SeekerIdService.STORAGE_KEY);
      if (profileData) {
        this.profile = JSON.parse(profileData);
        console.log(`🆔 Loaded Seeker ID: ${this.getSeekerId()}`);
      }
    } catch (error) {
      console.error('Error loading Seeker ID profile:', error);
    }
  }

  /**
   * Save profile to storage
   */
  private async saveProfile(profile: SeekerIdProfile): Promise<void> {
    try {
      await AsyncStorage.setItem(SeekerIdService.STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      console.error('Error saving Seeker ID profile:', error);
      throw error;
    }
  }

  /**
   * Generate unique device ID
   */
  private generateDeviceId(): string {
    return `device_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Check if running on Seeker device
   */
  private isRunningOnSeeker(): boolean {
    try {
      const userAgent = navigator.userAgent || '';
      return userAgent.includes('SolanaSeeker') || userAgent.includes('Seeker');
    } catch (error) {
      return false;
    }
  }

  /**
   * Resolve .skr username to public key
   */
  async resolveUsername(username: string): Promise<string | null> {
    try {
      const cleanUsername = username.replace('.skr', '').toLowerCase();
      const registry = await this.loadUsernameRegistry();
      const entry = registry[cleanUsername];
      return entry ? entry.publicKey : null;
    } catch (error) {
      console.error('Error resolving username:', error);
      return null;
    }
  }

  /**
   * Get all registered usernames (for development/debugging)
   */
  async getAllUsernames(): Promise<string[]> {
    try {
      const registry = await this.loadUsernameRegistry();
      return Object.keys(registry).map(username => `${username}.skr`);
    } catch (error) {
      console.error('Error getting usernames:', error);
      return [];
    }
  }

  /**
   * Clear Seeker ID (for testing or account reset)
   */
  async clearProfile(): Promise<void> {
    try {
      await AsyncStorage.removeItem(SeekerIdService.STORAGE_KEY);
      this.profile = null;
      console.log('🗑️ Seeker ID profile cleared');
    } catch (error) {
      console.error('Error clearing profile:', error);
    }
  }

  /**
   * Check if service is ready
   */
  isReady(): boolean {
    return this.isInitialized;
  }

  /**
   * Get device verification status
   */
  getDeviceInfo() {
    return {
      isSeeker: this.isRunningOnSeeker(),
      deviceId: this.profile?.deviceId || null,
      isVerified: this.profile?.isVerified || false
    };
  }
} 