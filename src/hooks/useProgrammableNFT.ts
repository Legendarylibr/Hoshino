import { useState, useEffect, useCallback, useRef } from 'react';
import { PublicKey } from '@solana/web3.js';
import { useWallet } from '../contexts/WalletContext';
import { ProgrammableNFTService, GameCharacter, GameAchievement, MintResult } from '../services/ProgrammableNFTService';

interface NFTHookState {
  service: ProgrammableNFTService | null;
  error: string | null;
}

/**
 * React hook for Programmable NFT operations
 * 
 * Features:
 * - Uses existing WalletContext for wallet connection
 * - Character and achievement pNFT minting with mood trait
 * - Simple and clean error handling
 */
export const useProgrammableNFT = () => {
  const { connected, publicKey, connect, disconnect } = useWallet();
  const serviceRef = useRef<ProgrammableNFTService | null>(null);
  
  const [state, setState] = useState<NFTHookState>({
    service: null,
    error: null
  });

  // Initialize the service only once
  useEffect(() => {
    if (!serviceRef.current) {
      const service = new ProgrammableNFTService('https://api.devnet.solana.com');
      serviceRef.current = service;
      setState(prev => ({ ...prev, service }));
      console.log('🔧 NFT service initialized');
    }
  }, []);

  // Configure the service when wallet connects
  useEffect(() => {
    console.log('🔧 Configuring NFT service...', {
      connected,
      publicKey,
      serviceExists: !!serviceRef.current
    });
    
    if (connected && publicKey && serviceRef.current) {
      try {
        const solanaPublicKey = new PublicKey(publicKey);
        serviceRef.current.setWalletSigner(solanaPublicKey);
        console.log('✅ NFT service configured with wallet:', publicKey);
        setState(prev => ({ ...prev, error: null, service: serviceRef.current }));
      } catch (error) {
        console.error('❌ Failed to configure NFT service with wallet:', error);
        setState(prev => ({ ...prev, error: 'Failed to configure wallet for NFT operations' }));
      }
    } else {
      console.log('⚠️ Cannot configure NFT service:', {
        connected,
        hasPublicKey: !!publicKey,
        hasService: !!serviceRef.current
      });
    }
  }, [connected, publicKey]);

  /**
   * Mint a character as a programmable NFT
   */
  const mintCharacterNFT = useCallback(async (
    character: GameCharacter,
    imageUrl: string, // Changed from imageCid to imageUrl
    mood: string = 'Happy'
  ): Promise<MintResult> => {
    if (!connected || !serviceRef.current || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🎮 Minting character pNFT: ${character.name} with mood: ${mood}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await serviceRef.current.mintCharacterPNFT(
        character,
        imageUrl, // Use imageUrl instead of imageCid
        solanaPublicKey,
        mood
      );

      if (result.success) {
        console.log('✅ Character pNFT minted successfully:', result.mintAddress);
      }

      return result;
    } catch (error) {
      console.error('❌ Character minting failed:', error);
      return {
        success: false,
        error: `Failed to mint character: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [connected, publicKey]);

  /**
   * Mint an achievement as a programmable NFT
   */
  const mintAchievementNFT = useCallback(async (
    achievement: GameAchievement,
    imageUrl: string, // Changed from imageCid to imageUrl
    mood: string = 'Proud'
  ): Promise<MintResult> => {
    if (!connected || !serviceRef.current || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🏆 Minting achievement pNFT: ${achievement.name} with mood: ${mood}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await serviceRef.current.mintAchievementPNFT(
        achievement,
        imageUrl, // Use imageUrl instead of imageCid
        solanaPublicKey,
        mood
      );

      if (result.success) {
        console.log('✅ Achievement pNFT minted successfully:', result.mintAddress);
      }

      return result;
    } catch (error) {
      console.error('❌ Achievement minting failed:', error);
      return {
        success: false,
        error: `Failed to mint achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [connected, publicKey]);

  /**
   * Mint a marketplace item as a programmable NFT
   */
  const mintMarketplaceItemNFT = useCallback(async (
    itemId: string,
    category: string,
    imageUrl: string, // Changed from imageCid to imageUrl
    mood: string = 'Excited'
  ): Promise<MintResult> => {
    if (!connected || !serviceRef.current || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🛍️ Minting marketplace item pNFT: ${itemId} with mood: ${mood}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await serviceRef.current.mintMarketplaceItemPNFT(
        itemId,
        category,
        imageUrl, // Use imageUrl instead of imageCid
        solanaPublicKey,
        mood
      );

      if (result.success) {
        console.log('✅ Marketplace item pNFT minted successfully:', result.mintAddress);
      }

      return result;
    } catch (error) {
      console.error('❌ Marketplace item minting failed:', error);
      return {
        success: false,
        error: `Failed to mint marketplace item: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }, [connected, publicKey]);

  /**
   * Get NFT service status
   */
  const getServiceStatus = useCallback(() => {
    if (!serviceRef.current) {
      return {
        available: false,
        error: 'Service not initialized'
      };
    }

    const baseStatus = serviceRef.current.getStatus();
    
    return {
      available: true,
      ...baseStatus,
      wallet: {
        connected,
        publicKey: publicKey || null
      }
    };
  }, [connected, publicKey]);

  return {
    mintCharacterNFT,
    mintAchievementNFT,
    mintMarketplaceItemNFT,
    getServiceStatus,
    error: state.error,
    connected,
    publicKey
  };
}; 