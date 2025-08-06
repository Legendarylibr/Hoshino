import { useState, useEffect, useCallback } from 'react';
import { Connection, PublicKey } from '@solana/web3.js';
import { ProgrammableNFTService, GameCharacter, GameAchievement, MintResult } from '../services/ProgrammableNFTService';
import { useWallet } from '../contexts/WalletContext';

interface NFTHookState {
  service: ProgrammableNFTService | null;
  error: string | null;
}

/**
 * React hook for Programmable NFT operations with backend metadata handling
 * 
 * Features:
 * - Uses existing WalletContext for wallet connection
 * - Character and achievement pNFT minting
 * - Backend metadata handling for consistency
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
    characterId: string
  ): Promise<MintResult> => {
    if (!connected || !state.service || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`🎮 Minting character pNFT: ${characterId}`);
      
      const solanaPublicKey = new PublicKey(publicKey);
      const result = await state.service.mintCharacterPNFT(
        characterId,
        solanaPublicKey
      );

      if (result.success) {
        console.log('✅ Character pNFT minted successfully:', result.mintAddress);
        console.log('📝 Metadata URI:', result.metadataUri);
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
    achievement: GameAchievement
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
        solanaPublicKey
      );

      if (result.success) {
        console.log('✅ Achievement pNFT minted successfully:', result.mintAddress);
        console.log('📝 Metadata URI:', result.metadataUri);
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
   * Purchase in-game currency
   */
  const purchaseCoins = useCallback(async (
    amount: number,
    recipientAddress: string
  ): Promise<MintResult> => {
    if (!connected || !state.service || !publicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log(`💰 Purchasing coins: ${amount} SOL`);
      
      const result = await state.service.purchaseCoins(amount, recipientAddress);

      if (result.success) {
        console.log('✅ Coins purchased successfully:', result.signature);
      }

      return result;
    } catch (error) {
      console.error('❌ Coin purchase failed:', error);
      return {
        success: false,
        error: `Failed to purchase coins: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      },
      features: {
        backendMetadataHandling: true,
        characterMinting: true,
        achievementMinting: true,
        coinPurchase: true
      }
    };
  }, [state.service, connected, publicKey]);

  return {
    mintCharacterNFT,
    mintAchievementNFT,
    connected,
    connectWallet: connect,
    disconnect,
    getServiceStatus: state.service.getStatus,
  };
}; 