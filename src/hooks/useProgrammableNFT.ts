import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { ProgrammableNFTService, GameCharacter, GameAchievement, MintResult } from '../services/ProgrammableNFTService';
import { useWallet } from '../contexts/WalletContext';

interface NFTHookState {
  service: ProgrammableNFTService | null;
  error: string | null;
}

/**
 * React hook for Programmable NFT operations
 * 
 * Features:
 * - Uses existing WalletContext for wallet connection
 * - Character and achievement pNFT minting
 * - Simple and clean error handling
 */
export const useProgrammableNFT = () => {
  const { connected, publicKey, connect, disconnect } = useWallet();
  
  const [state, setState] = useState<NFTHookState>({
    service: null,
    error: null
  });

  // Initialize the service
  useEffect(() => {
    const service = new ProgrammableNFTService('https://api.devnet.solana.com');
    setState(prev => ({ ...prev, service }));
  }, []);

  // Configure the service when wallet connects
  useEffect(() => {
    console.log('🔧 Configuring NFT service...', {
      connected,
      publicKey,
      serviceExists: !!state.service
    });
    
    if (connected && publicKey && state.service) {
      try {
        const solanaPublicKey = new PublicKey(publicKey);
        state.service.setWalletSigner(solanaPublicKey);
        console.log('✅ NFT service configured with wallet:', publicKey);
        setState(prev => ({ ...prev, error: null }));
      } catch (error) {
        console.error('❌ Failed to configure NFT service with wallet:', error);
        setState(prev => ({ ...prev, error: 'Failed to configure wallet for NFT operations' }));
      }
    } else {
      console.log('⚠️ Cannot configure NFT service:', {
        connected,
        hasPublicKey: !!publicKey,
        hasService: !!state.service
      });
    }
  }, [connected, publicKey]); // Removed state.service from dependencies

  /**
   * Mint a character as a programmable NFT
   */
  const mintCharacterNFT = useCallback(async (
    character: GameCharacter,
    imageCid: string
  ): Promise<MintResult> => {
    if (!connected || !state.service || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🎮 Minting character pNFT: ${character.name}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await state.service.mintCharacterPNFT(
        character,
        imageCid,
        solanaPublicKey
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
  }, [connected, state.service, publicKey]);

  /**
   * Mint an achievement as a programmable NFT
   */
  const mintAchievementNFT = useCallback(async (
    achievement: GameAchievement,
    imageCid: string
  ): Promise<MintResult> => {
    if (!connected || !state.service || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🏆 Minting achievement pNFT: ${achievement.name}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await state.service.mintAchievementPNFT(
        achievement,
        imageCid,
        solanaPublicKey
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
  }, [connected, state.service, publicKey]);

  /**
   * Get NFT service status
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
      wallet: {
        connected,
        publicKey: publicKey || null
      }
    };
  }, [state.service, connected, publicKey]);

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
    // Connection state (from WalletContext)
    connected,
    publicKey: publicKey ? new PublicKey(publicKey) : null,
    error: state.error,
    
    // Connection functions (from WalletContext)
    connectWallet: connect,
    disconnect,
    
    // Minting functions (with CID)
    mintCharacterNFT,
    mintAchievementNFT,
    
    // Quick minting functions (for game integration)
    quickMintCharacter,
    quickMintAchievement,
    
    // Utility functions
    getServiceStatus,
    
    // Service reference (for advanced usage)
    service: state.service
  };
}; 