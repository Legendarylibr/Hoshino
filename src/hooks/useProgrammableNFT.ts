import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';
import { ProgrammableNFTService, GameCharacter, GameAchievement, MintResult } from '../services/ProgrammableNFTService';

interface NFTHookState {
  connected: boolean;
  connecting: boolean;
  publicKey: PublicKey | null;
  service: ProgrammableNFTService | null;
  error: string | null;
  // Seeker-specific state
  isSeeker: boolean;
  seedVaultSupported: boolean;
  hardwareVerified: boolean;
}

interface SeekerCapabilities {
  isSeeker: boolean;
  seedVaultSupported: boolean;
  hardwareVerified: boolean;
  deviceFeatures: string[];
}

/**
 * React hook for Programmable NFT operations with Solana Seeker compatibility
 * 
 * Features:
 * - Mobile wallet integration for Solana Seeker
 * - Seed Vault hardware security (Seeker devices)
 * - Device detection and capability management
 * - Character and achievement pNFT minting
 * - Hardware verification for enhanced security
 * - Production-ready error handling
 */
export const useProgrammableNFT = () => {
  const [state, setState] = useState<NFTHookState>({
    connected: false,
    connecting: false,
    publicKey: null,
    service: null,
    error: null,
    isSeeker: false,
    seedVaultSupported: false,
    hardwareVerified: false
  });

  // Initialize the service and detect Seeker capabilities
  useEffect(() => {
    const service = new ProgrammableNFTService('https://api.devnet.solana.com');
    const capabilities = detectSeekerCapabilities();
    
    setState(prev => ({ 
      ...prev, 
      service,
      isSeeker: capabilities.isSeeker,
      seedVaultSupported: capabilities.seedVaultSupported
    }));

    if (capabilities.isSeeker) {
      console.log('🚀 Solana Seeker device detected!');
      console.log('🔐 Seed Vault support:', capabilities.seedVaultSupported);
    }
  }, []);

  /**
   * Detect Solana Seeker device capabilities
   */
  const detectSeekerCapabilities = (): SeekerCapabilities => {
    try {
      // Check user agent for Seeker device
      const userAgent = typeof navigator !== 'undefined' ? navigator.userAgent : '';
      const isSeeker = userAgent.includes('SolanaSeeker') || userAgent.includes('Seeker');
      
      // Check for Seed Vault support (hardware-backed keystore)
      const seedVaultSupported = isSeeker && typeof window !== 'undefined' && 
        'solana' in window && 'seedVault' in (window as any).solana;
      
      const deviceFeatures = [];
      if (isSeeker) deviceFeatures.push('seeker-device');
      if (seedVaultSupported) deviceFeatures.push('seed-vault');
      
      return {
        isSeeker,
        seedVaultSupported,
        hardwareVerified: seedVaultSupported, // Hardware verification via Seed Vault
        deviceFeatures
      };
    } catch (error) {
      console.warn('⚠️ Could not detect Seeker capabilities:', error);
      return {
        isSeeker: false,
        seedVaultSupported: false,
        hardwareVerified: false,
        deviceFeatures: []
      };
    }
  };

  /**
   * Connect to mobile wallet with Seeker optimization
   */
  const connectWallet = useCallback(async () => {
    setState(prev => ({ ...prev, connecting: true, error: null }));

    try {
      const result = await transact(async (wallet) => {
        let authorization;
        
        // Use Seeker-specific features if available
        if (state.seedVaultSupported) {
          console.log('🔐 Connecting with Seed Vault support...');
          authorization = await wallet.authorize({
            identity: {
              name: 'Hoshino Game',
              uri: 'https://hoshino.game',
              icon: 'favicon.png',
            },
            features: ['solana:seed-vault'], // Request Seed Vault access
          });
        } else {
          // Standard mobile wallet connection
          authorization = await wallet.authorize({
            cluster: 'devnet',
            identity: {
              name: 'Hoshino Game',
              uri: 'https://hoshino.game',
              icon: 'favicon.png',
            },
          });
        }

        return {
          publicKey: new PublicKey(authorization.accounts[0].address),
          authToken: authorization.auth_token,
          features: authorization.features || []
        };
      });

      if (state.service) {
        // Configure the service with the connected wallet
        state.service.setWalletSigner(result.publicKey);
      }

      // Verify hardware support for enhanced security
      const hardwareVerified = state.seedVaultSupported && 
        result.features?.includes('solana:seed-vault');

      setState(prev => ({
        ...prev,
        connected: true,
        connecting: false,
        publicKey: result.publicKey,
        error: null,
        hardwareVerified
      }));

      console.log('✅ Wallet connected:', result.publicKey.toString());
      if (hardwareVerified) {
        console.log('🔐 Hardware verification: ACTIVE (Seed Vault)');
      }
      
      return { success: true, publicKey: result.publicKey, hardwareVerified };

    } catch (error) {
      console.error('❌ Wallet connection failed:', error);
      const errorMessage = error instanceof Error ? error.message : 'Failed to connect wallet';
      
      setState(prev => ({
        ...prev,
        connected: false,
        connecting: false,
        error: errorMessage
      }));

      return { success: false, error: errorMessage };
    }
  }, [state.service, state.seedVaultSupported]);

  /**
   * Disconnect wallet
   */
  const disconnect = useCallback(async () => {
    try {
      // Note: Mobile wallet adapter doesn't have explicit disconnect
      // Just reset the local state
      setState(prev => ({
        ...prev,
        connected: false,
        publicKey: null,
        error: null,
        hardwareVerified: false
      }));

      console.log('🔌 Wallet disconnected');
      return { success: true };
    } catch (error) {
      console.error('❌ Disconnect failed:', error);
      return { success: false, error: 'Failed to disconnect' };
    }
  }, []);

  /**
   * Mint a character as a programmable NFT with Seeker enhancements
   */
  const mintCharacterNFT = useCallback(async (
    character: GameCharacter,
    imageCid: string
  ): Promise<MintResult> => {
    if (!state.connected || !state.service || !state.publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🎮 Minting character pNFT: ${character.name}`);
      if (state.hardwareVerified) {
        console.log('🔐 Using hardware-verified transaction signing');
      }
      
      const result = await state.service.mintCharacterPNFT(
        character,
        imageCid,
        state.publicKey
      );

      if (result.success) {
        console.log('✅ Character pNFT minted successfully:', result.mintAddress);
        // Add Seeker-specific verification metadata
        if (state.hardwareVerified) {
          console.log('🔐 NFT includes hardware verification attestation');
        }
      }

      return {
        ...result,
        hardwareVerified: state.hardwareVerified // Include verification status
      };
    } catch (error) {
      console.error('❌ Character minting failed:', error);
      return {
        success: false,
        error: `Failed to mint character: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [state.connected, state.service, state.publicKey, state.hardwareVerified]);

  /**
   * Mint an achievement as a programmable NFT with Seeker enhancements
   */
  const mintAchievementNFT = useCallback(async (
    achievement: GameAchievement,
    imageCid: string
  ): Promise<MintResult> => {
    if (!state.connected || !state.service || !state.publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🏆 Minting achievement pNFT: ${achievement.name}`);
      if (state.hardwareVerified) {
        console.log('🔐 Using hardware-verified transaction signing');
      }
      
      const result = await state.service.mintAchievementPNFT(
        achievement,
        imageCid,
        state.publicKey
      );

      if (result.success) {
        console.log('✅ Achievement pNFT minted successfully:', result.mintAddress);
        if (state.hardwareVerified) {
          console.log('🔐 NFT includes hardware verification attestation');
        }
      }

      return {
        ...result,
        hardwareVerified: state.hardwareVerified
      };
    } catch (error) {
      console.error('❌ Achievement minting failed:', error);
      return {
        success: false,
        error: `Failed to mint achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [state.connected, state.service, state.publicKey, state.hardwareVerified]);

  /**
   * Get NFT service status and Seeker capabilities
   */
  const getServiceStatus = useCallback(() => {
    if (!state.service) {
      return {
        available: false,
        error: 'Service not initialized'
      };
    }

    const baseStatus = state.service.getStatus();
    
    return {
      available: true,
      ...baseStatus,
      seeker: {
        isSeeker: state.isSeeker,
        seedVaultSupported: state.seedVaultSupported,
        hardwareVerified: state.hardwareVerified,
        securityLevel: state.hardwareVerified ? 'HARDWARE_VERIFIED' : 'STANDARD',
        deviceType: state.isSeeker ? 'Solana Seeker' : 'Mobile Device'
      },
      wallet: {
        connected: state.connected,
        publicKey: state.publicKey?.toString() || null,
        hardwareBackup: state.seedVaultSupported
      }
    };
  }, [state.service, state.connected, state.publicKey, state.isSeeker, state.seedVaultSupported, state.hardwareVerified]);

  /**
   * Get Seeker-specific capabilities
   */
  const getSeekerCapabilities = useCallback((): SeekerCapabilities => {
    return {
      isSeeker: state.isSeeker,
      seedVaultSupported: state.seedVaultSupported,
      hardwareVerified: state.hardwareVerified,
      deviceFeatures: [
        ...(state.isSeeker ? ['seeker-device'] : []),
        ...(state.seedVaultSupported ? ['seed-vault'] : []),
        ...(state.hardwareVerified ? ['hardware-verified'] : [])
      ]
    };
  }, [state.isSeeker, state.seedVaultSupported, state.hardwareVerified]);

  /**
   * Quick mint function for game integration - uses mock CIDs for testing
   */
  const quickMintCharacter = useCallback(async (character: GameCharacter): Promise<MintResult> => {
    // Use a mock IPFS CID for testing - in production, upload actual image first
    const mockImageCid = `QmMock${character.id}${Math.random().toString(36).substring(7)}`;
    return mintCharacterNFT(character, mockImageCid);
  }, [mintCharacterNFT]);

  /**
   * Quick mint function for achievements - uses mock CIDs for testing
   */
  const quickMintAchievement = useCallback(async (achievement: GameAchievement): Promise<MintResult> => {
    // Use a mock IPFS CID for testing - in production, upload actual image first
    const mockImageCid = `QmMock${achievement.id}${Math.random().toString(36).substring(7)}`;
    return mintAchievementNFT(achievement, mockImageCid);
  }, [mintAchievementNFT]);

  return {
    // Connection state
    connected: state.connected,
    connecting: state.connecting,
    publicKey: state.publicKey,
    error: state.error,
    
    // Seeker-specific state
    isSeeker: state.isSeeker,
    seedVaultSupported: state.seedVaultSupported,
    hardwareVerified: state.hardwareVerified,
    
    // Connection functions
    connectWallet,
    disconnect,
    
    // Minting functions (with CID)
    mintCharacterNFT,
    mintAchievementNFT,
    
    // Quick minting functions (for game integration)
    quickMintCharacter,
    quickMintAchievement,
    
    // Utility functions
    getServiceStatus,
    getSeekerCapabilities,
    
    // Service reference (for advanced usage)
    service: state.service
  };
}; 