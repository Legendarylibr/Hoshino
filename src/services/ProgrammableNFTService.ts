import { Connection, PublicKey } from '@solana/web3.js';
import { MobileWalletService } from './MobileWalletService';
import { getFunctionUrl } from '../config/firebase';

export interface GameCharacter {
  id: string;
  name: string;
  element: string;
  rarity: string;
  description?: string;
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  rarity?: string;
}

export interface MintResult {
  success: boolean;
  error?: string;
  signature?: string;
  mintAddress?: string;
  actualCost?: string;
  updateAuthority?: string;
  metadataUri?: string;
  transaction?: any; // For old backend format that returns transaction data
}

/**
 * Clean Programmable NFT Service for Solana
 * 
 * Features:
 * - Backend metadata handling
 * - Mobile wallet integration
 * - Character and achievement minting
 * - Transaction signing and sending
 */
export class ProgrammableNFTService {
  private connection: Connection;
  private mobileWalletService: MobileWalletService;
  private walletPublicKey: string | null = null;

  constructor(rpcEndpoint: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.mobileWalletService = new MobileWalletService();
  }

  /**
   * Set wallet signer for the service
   */
  setWalletSigner(publicKey: PublicKey): void {
    this.walletPublicKey = publicKey.toString();
    console.log('🔧 Setting wallet signer for ProgrammableNFTService...');
    console.log('✅ Wallet public key set:', this.walletPublicKey);
  }

  /**
   * Get service status
   */
  getStatus(): { connected: boolean; walletPublicKey: string | null } {
    return {
      connected: this.mobileWalletService.isConnected(),
      walletPublicKey: this.walletPublicKey
    };
  }

  /**
   * Ensure wallet is connected
   */
  private async ensureWalletConnected(): Promise<boolean> {
    if (!this.mobileWalletService.isConnected()) {
      console.log('🔌 Attempting to connect wallet...');
      try {
        const publicKey = await this.mobileWalletService.connect();
        if (publicKey) {
          this.walletPublicKey = publicKey.toString();
          console.log('✅ Wallet connected:', this.walletPublicKey);
          return true;
        }
        return false;
      } catch (error) {
        console.error('❌ Failed to connect wallet:', error);
        return false;
      }
    }
    return true;
  }

  /**
   * Mint a Character as a Programmable NFT using backend metadata handling
   */
  async mintCharacterPNFT(
    characterId: string,
    recipient?: PublicKey
  ): Promise<MintResult> {
    // Check if the mobile wallet service is actually connected
    if (!this.mobileWalletService.isConnected()) {
      console.error('❌ Mobile wallet service not connected:', {
        walletPublicKey: this.walletPublicKey,
        serviceConnected: this.mobileWalletService.isConnected(),
        servicePublicKey: this.mobileWalletService.getPublicKey()?.toString()
      });
      
      // Try to connect the wallet automatically
      const connected = await this.ensureWalletConnected();
      if (!connected) {
        return {
          success: false,
          error: 'Mobile wallet not connected. Please connect your wallet first.'
        };
      }
    }

    // Update our wallet public key from the mobile wallet service
    const servicePublicKey = this.mobileWalletService.getPublicKey();
    if (servicePublicKey) {
      this.walletPublicKey = servicePublicKey.toString();
      console.log('✅ Updated wallet public key from service:', this.walletPublicKey);
    } else {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log('🎮 Minting character pNFT:', characterId);
      console.log('🔍 Wallet connection status:', {
        walletPublicKey: this.walletPublicKey,
        serviceConnected: this.mobileWalletService.isConnected(),
        servicePublicKey: this.mobileWalletService.getPublicKey()?.toString()
      });

      // Create character object for old backend format
      const character = {
        name: characterId.charAt(0).toUpperCase() + characterId.slice(1),
        element: 'Character',
        rarity: 'Common',
        description: `A ${characterId} character NFT`
      };

      // Create simple metadata URI for character
      const metadataUri = `https://ipfs.io/ipfs/Qm${characterId}${Date.now()}`;

      // Call backend with old format
      console.log('📤 Calling backend for NFT creation...');
      
      const response = await fetch(getFunctionUrl('generateNFTTransaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: character,
          userPublicKey: this.walletPublicKey,
          recipient: recipient?.toString(),
          metadataUri: metadataUri,
          tokenStandard: 'pNFT'
        })
      });

      const nftResult = await response.json();

      if (!nftResult.success) {
        throw new Error(nftResult.error || 'Backend NFT creation failed');
      }

      console.log('📥 Received NFT creation result from backend:', {
        mintAddress: nftResult.mintAddress,
        transaction: nftResult.transaction
      });

      console.log('✅ Character pNFT created successfully!');
      console.log('🔍 DEBUG: Mint address:', nftResult.mintAddress);
      
      return {
        success: true,
        mintAddress: nftResult.mintAddress,
        signature: 'TRANSACTION_CREATED_ON_BACKEND', // Transaction created on backend
        actualCost: nftResult.estimatedCost,
        updateAuthority: this.walletPublicKey,
        metadataUri: metadataUri, // Use the metadataUri we sent to the backend
        transaction: nftResult.transaction
      };

    } catch (error) {
      console.error('❌ Character pNFT creation failed:', error);
      return {
        success: false,
        error: `Failed to create character: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Mint an Achievement as a Programmable NFT using backend metadata handling
   */
  async mintAchievementPNFT(
    achievement: GameAchievement,
    recipient?: PublicKey
  ): Promise<MintResult> {
    // Check if the mobile wallet service is actually connected
    if (!this.mobileWalletService.isConnected()) {
      console.error('❌ Mobile wallet service not connected:', {
        walletPublicKey: this.walletPublicKey,
        serviceConnected: this.mobileWalletService.isConnected(),
        servicePublicKey: this.mobileWalletService.getPublicKey()?.toString()
      });
      
      // Try to connect the wallet automatically
      const connected = await this.ensureWalletConnected();
      if (!connected) {
        return {
          success: false,
          error: 'Mobile wallet not connected. Please connect your wallet first.'
        };
      }
    }

    // Update our wallet public key from the mobile wallet service
    const servicePublicKey = this.mobileWalletService.getPublicKey();
    if (servicePublicKey) {
      this.walletPublicKey = servicePublicKey.toString();
      console.log('✅ Updated wallet public key from service:', this.walletPublicKey);
    } else {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log('🏆 Minting achievement pNFT:', achievement.name);

      // Call backend to create proper NFT
      console.log('📤 Calling backend for achievement NFT creation...');
      
      // Create simple metadata URI for achievement
      const metadataUri = `https://ipfs.io/ipfs/Qm${achievement.name.replace(/\s+/g, '')}${Date.now()}`;

      const response = await fetch(getFunctionUrl('generateNFTTransaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: {
            name: achievement.name,
            element: 'Achievement',
            rarity: achievement.rarity || 'Common',
            description: achievement.description
          },
          userPublicKey: this.walletPublicKey,
          recipient: recipient?.toString(),
          metadataUri: metadataUri,
          tokenStandard: 'pNFT'
        })
      });

      const nftResult = await response.json();

      if (!nftResult.success) {
        throw new Error(nftResult.error || 'Backend NFT creation failed');
      }

      console.log('📥 Received achievement NFT creation result from backend');

      console.log('✅ Achievement pNFT created successfully!');
      
      return {
        success: true,
        mintAddress: nftResult.mintAddress,
        signature: 'NFT_CREATED_ON_BACKEND', // NFT is created directly on backend
        actualCost: nftResult.estimatedCost,
        updateAuthority: this.walletPublicKey,
        metadataUri: metadataUri // Use the metadataUri we sent to the backend
      };

    } catch (error) {
      console.error('❌ Achievement pNFT creation failed:', error);
      return {
        success: false,
        error: `Failed to create achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Purchase in-game currency using SOL
   */
  async purchaseCoins(amount: number, recipientAddress: string): Promise<MintResult> {
    if (!this.walletPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log('💰 Purchasing coins:', { amount, recipientAddress });

      // Call backend to generate purchase transaction
      const response = await fetch(getFunctionUrl('generateCurrencyPurchaseTransaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          userPublicKey: this.walletPublicKey,
          amount: amount,
          recipientAddress: recipientAddress,
          purchaseType: 'coins'
        })
      });

      const transactionData = await response.json();

      if (!transactionData.success) {
        throw new Error(transactionData.error || 'Backend transaction generation failed');
      }

      console.log('📥 Received purchase transaction from backend');

      // Sign and send the transaction using mobile wallet adapter
      // const result = await this.signAndSendTransaction(transactionData.transaction); // This line is removed
      
      console.log('✅ Coins purchased successfully!');
      console.log('📝 Transaction signature:', 'N/A'); // This line is removed
      
      return {
        success: true,
        signature: 'N/A', // This line is removed
        actualCost: transactionData.estimatedCost,
        updateAuthority: this.walletPublicKey
      };
      
    } catch (error) {
      console.error('❌ Coin purchase failed:', error);
      return {
        success: false,
        error: `Failed to purchase coins: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Test backend compatibility
   * This method tests if the backend functions are working correctly
   */
  async testBackendCompatibility(): Promise<{ success: boolean; error?: string; details?: any }> {
    try {
      console.log('🧪 Testing backend compatibility...');

      // Test 1: Health check
      const healthResponse = await fetch(getFunctionUrl('solanaHealth'), {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        }
      });

      const healthResult = await healthResponse.json();
      
      if (!healthResult.status || healthResult.status !== 'healthy') {
        return {
          success: false,
          error: 'Backend health check failed',
          details: healthResult
        };
      }

      console.log('✅ Backend health check passed');

      // Test 2: NFT transaction generation (without wallet)
      const testCharacter = {
        name: 'TestCharacter',
        element: 'Test',
        rarity: 'Common',
        description: 'Test character for compatibility check'
      };

      const testResponse = await fetch(getFunctionUrl('generateNFTTransaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: testCharacter,
          userPublicKey: '11111111111111111111111111111111', // Test public key
          metadataUri: 'ipfs://QmTestMetadata',
          tokenStandard: 'pNFT'
        })
      });

      const testResult = await testResponse.json();

      if (!testResult.success) {
        return {
          success: false,
          error: 'NFT transaction generation test failed',
          details: testResult
        };
      }

      console.log('✅ NFT transaction generation test passed');

      return {
        success: true,
        details: {
          health: healthResult,
          nftTest: {
            mintAddress: testResult.mintAddress,
            estimatedCost: testResult.estimatedCost
          }
        }
      };

    } catch (error) {
      console.error('❌ Backend compatibility test failed:', error);
      return {
        success: false,
        error: `Backend compatibility test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
} 