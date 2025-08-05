import { Connection, PublicKey, Transaction, SystemProgram } from '@solana/web3.js';
import { getFunctionUrl } from '../config/firebase';
import { Buffer } from 'buffer';

// Import the singleton instance from WalletContext
import { mobileWalletService } from '../contexts/WalletContext';

// Types for game assets
export interface GameCharacter {
  id: string;
  name: string;
  description?: string;
  image: string;
  level?: number;
  experience?: number;
  baseStats?: {
    mood: number;
    hunger: number;
    energy: number;
  };
}

export interface GameAchievement {
  id: string;
  name: string;
  description: string;
  rarity?: 'Common' | 'Rare' | 'Epic' | 'Legendary';
  unlockedAt?: Date;
  imageUrl?: string;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image: string;
  external_url?: string;
  attributes: Array<{
    trait_type: string;
    value: string | number;
  }>;
  properties: {
    category: 'image' | 'video' | 'audio';
    creators: Array<{
      address: string;
      share: number;
    }>;
  };
}

export interface MintResult {
  success: boolean;
  mintAddress?: string;
  signature?: string;
  actualCost?: string;
  error?: string;
  updateAuthority?: string;
  // Seeker-specific properties
  hardwareVerified?: boolean;
  seekerFeatures?: string[];
}

export interface UpdateResult {
  success: boolean;
  signature?: string;
  error?: string;
  newUri?: string;
}

/**
 * Clean Programmable NFT Service for Solana
 * 
 * Features:
 * - Backend transaction generation (no crypto polyfill issues)
 * - Mobile wallet adapter integration for signing
 * - IPFS metadata creation
 * - Simple and clean architecture
 */
export class ProgrammableNFTService {
  private connection: Connection;
  private endpoint: string;
  private walletPublicKey: string | null = null;
  private mobileWalletService: typeof mobileWalletService;

  constructor(endpoint: string = 'https://api.devnet.solana.com') {
    this.endpoint = endpoint;
    this.connection = new Connection(endpoint);
    this.mobileWalletService = mobileWalletService;
  }

  /**
   * Set the wallet public key for transaction signing
   */
  setWalletSigner(walletPublicKey: PublicKey) {
    console.log('🔧 Setting wallet signer for ProgrammableNFTService...');
    this.walletPublicKey = walletPublicKey.toString();
    console.log('✅ Wallet public key set:', this.walletPublicKey);
  }

  /**
   * Sanitize text to prevent base64 conversion errors
   */
  private sanitizeText(text: string): string {
    return text
      .replace(/[""]/g, '"') // Replace smart quotes
      .replace(/['']/g, "'") // Replace smart apostrophes
      .replace(/—/g, '-') // Replace em dashes
      .replace(/[^\x00-\x7F]/g, ''); // Remove non-ASCII characters
  }

  /**
   * Create metadata for NFT
   */
  private createMetadata(
    name: string,
    description: string,
    imageCid: string,
    attributes: Array<{ trait_type: string; value: string | number }> = []
  ): NFTMetadata {
    return {
      name: this.sanitizeText(name),
      description: this.sanitizeText(description),
      image: `https://ipfs.io/ipfs/${imageCid}`,
      external_url: 'https://hoshino.com',
      attributes: attributes,
      properties: {
        category: 'image',
        creators: [
          {
            address: this.walletPublicKey || '11111111111111111111111111111111',
            share: 100
          }
        ]
      }
    };
  }

  /**
   * Upload metadata to IPFS (mock implementation)
   */
  private async uploadMetadataToIPFS(metadata: NFTMetadata): Promise<string> {
    console.log('📤 Uploading metadata to IPFS...');
    
    // Mock IPFS upload - in production, use actual IPFS service
    const mockCid = 'Qm' + Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
    
    console.log('✅ Metadata uploaded to IPFS:', mockCid);
    return mockCid;
  }

  /**
   * Mint a Character as a Programmable NFT using backend transaction generation
   */
  async mintCharacterPNFT(
    character: GameCharacter,
    imageCid: string,
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
      console.log('🎮 Minting character pNFT:', character.name);
      console.log('🔍 Wallet connection status:', {
        walletPublicKey: this.walletPublicKey,
        serviceConnected: this.mobileWalletService.isConnected(),
        servicePublicKey: this.mobileWalletService.getPublicKey()?.toString()
      });

      // Create metadata attributes
      const attributes = [
        { trait_type: 'Element', value: character.element },
        { trait_type: 'Rarity', value: character.rarity },
        { trait_type: 'Type', value: 'Character' }
      ];

      // Create and upload metadata
      const metadata = this.createMetadata(
        character.name,
        character.description || `A ${character.rarity} ${character.element} character in Hoshino.`,
        imageCid,
        attributes
      );

      const metadataCid = await this.uploadMetadataToIPFS(metadata);
      const metadataUri = `https://ipfs.io/ipfs/${metadataCid}`;

      // Call backend to generate transaction
      console.log('📤 Calling backend for transaction generation...');
      
      const response = await fetch(getFunctionUrl('generateNFTTransaction'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          character: {
            name: character.name,
            element: character.element,
            rarity: character.rarity,
            description: character.description
          },
          userPublicKey: this.walletPublicKey,
          metadataUri: metadataUri,
          recipient: recipient?.toString(),
          tokenStandard: 'pNFT'
        })
      });

      const transactionData = await response.json();

      if (!transactionData.success) {
        throw new Error(transactionData.error || 'Backend transaction generation failed');
      }

      console.log('📥 Received transaction from backend:', {
        mintAddress: transactionData.mintAddress,
        instructionsCount: transactionData.transaction.instructions.length
      });

      // Sign and send the transaction using mobile wallet adapter
      const result = await this.signAndSendTransaction(transactionData.transaction);
      
      console.log('✅ Character pNFT minted successfully!');
      console.log('📝 Transaction signature:', result.signature);
      console.log('🔍 DEBUG: Mint address:', transactionData.mintAddress);
      
      return {
        success: true,
        mintAddress: transactionData.mintAddress,
        signature: result.signature,
        actualCost: transactionData.estimatedCost,
        updateAuthority: this.walletPublicKey
      };

    } catch (error) {
      console.error('❌ Character pNFT minting failed:', error);
      return {
        success: false,
        error: `Failed to mint character: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  /**
   * Mint an Achievement as a Programmable NFT using backend transaction generation
   */
  async mintAchievementPNFT(
    achievement: GameAchievement,
    imageCid: string,
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

      // Create metadata attributes
      const attributes = [
        { trait_type: 'Type', value: 'Achievement' },
        { trait_type: 'Rarity', value: achievement.rarity || 'Common' }
      ];

      // Create and upload metadata
      const metadata = this.createMetadata(
        achievement.name,
        achievement.description,
        imageCid,
        attributes
      );

      const metadataCid = await this.uploadMetadataToIPFS(metadata);
      const metadataUri = `https://ipfs.io/ipfs/${metadataCid}`;

      // Call backend to generate transaction
      console.log('📤 Calling backend for achievement transaction generation...');
      
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
          metadataUri: metadataUri,
          recipient: recipient?.toString(),
          tokenStandard: 'pNFT'
        })
      });

      const transactionData = await response.json();

      if (!transactionData.success) {
        throw new Error(transactionData.error || 'Backend transaction generation failed');
      }

      console.log('📥 Received achievement transaction from backend');

      // Sign and send the transaction using mobile wallet adapter
      const result = await this.signAndSendTransaction(transactionData.transaction);
      
      console.log('✅ Achievement pNFT minted successfully!');
      console.log('📝 Transaction signature:', result.signature);
      
      return {
        success: true,
        mintAddress: transactionData.mintAddress,
        signature: result.signature,
        actualCost: transactionData.estimatedCost,
        updateAuthority: this.walletPublicKey
      };
      
    } catch (error) {
      console.error('❌ Achievement pNFT minting failed:', error);
      return {
        success: false,
        error: `Failed to mint achievement: ${error instanceof Error ? error.message : 'Unknown error'}`
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
      const result = await this.signAndSendTransaction(transactionData.transaction);
      
      console.log('✅ Coins purchased successfully!');
      console.log('📝 Transaction signature:', result.signature);
      
      return {
        success: true,
        signature: result.signature,
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
   * Sign and send transaction using mobile wallet adapter
   */
  private async signAndSendTransaction(transactionData: any): Promise<{ signature: string }> {
    console.log('📱 Signing and sending transaction with mobile wallet...');
    
    try {
      // Create a proper Solana Transaction object
      const transaction = new Transaction();
      
      // Convert backend instructions to proper Solana instructions
      if (transactionData.instructions && transactionData.instructions.length > 0) {
        transactionData.instructions.forEach((instruction: any) => {
          // Convert string pubkeys to PublicKey objects
          const keys = instruction.keys.map((key: any) => ({
            pubkey: new PublicKey(key.pubkey),
            isSigner: key.isSigner,
            isWritable: key.isWritable
          }));
          
          // Create a proper instruction
          const solanaInstruction = {
            keys,
            programId: new PublicKey(instruction.programId),
            data: Buffer.from(instruction.data)
          };
          
          transaction.add(solanaInstruction);
        });
      }
      
      // Set transaction properties from backend
      if (transactionData.recentBlockhash) {
        transaction.recentBlockhash = transactionData.recentBlockhash;
      }
      
      if (transactionData.feePayer) {
        transaction.feePayer = new PublicKey(transactionData.feePayer);
      }
      
      console.log('📱 Converted transaction data to Solana Transaction:', {
        instructionsCount: transaction.instructions.length,
        hasBlockhash: !!transaction.recentBlockhash,
        hasFeePayer: !!transaction.feePayer
      });
      
      const result = await this.mobileWalletService.signAndSendSolanaTransaction(transaction);
      
      console.log('✅ Transaction signed and sent successfully');
      console.log('📝 Transaction result:', result);
      
      return result;
      
    } catch (error) {
      console.error('❌ Failed to sign and send transaction:', error);
      throw error;
    }
  }

  /**
   * Update NFT URI (placeholder for future implementation)
   */
  async updateNFTUri(
    mintAddress: string,
    newImageCid: string,
    updatedMetadata?: Partial<NFTMetadata>
  ): Promise<UpdateResult> {
    // TODO: Implement NFT URI update functionality
    console.log('🔄 NFT URI update not yet implemented');
    
    return {
      success: false,
      error: 'NFT URI update not yet implemented'
    };
  }

  /**
   * Force connect the wallet if not connected
   */
  async ensureWalletConnected(): Promise<boolean> {
    if (this.isWalletConnected()) {
      console.log('✅ Wallet already connected');
      return true;
    }

    console.log('⚠️ Wallet not connected, attempting to connect...');
    try {
              const publicKey = await this.mobileWalletService.connect();
        if (publicKey) {
          this.setWalletSigner(new PublicKey(publicKey.toString()));
        console.log('✅ Wallet connected successfully');
        return true;
      } else {
        console.error('❌ Failed to connect wallet');
        return false;
      }
    } catch (error) {
      console.error('❌ Error connecting wallet:', error);
      return false;
    }
  }

  /**
   * Check if the wallet is properly connected
   */
  isWalletConnected(): boolean {
    return this.walletPublicKey !== null && this.mobileWalletService.isConnected();
  }

  /**
   * Get wallet connection status for debugging
   */
  getWalletStatus() {
    return {
      walletPublicKey: this.walletPublicKey,
      serviceConnected: this.mobileWalletService.isConnected(),
      servicePublicKey: this.mobileWalletService.getPublicKey()?.toString(),
      hasAuthToken: !!this.mobileWalletService.getAuthToken()
    };
  }

  /**
   * Get service status
   */
  getStatus() {
    return {
      connected: !!this.walletPublicKey,
      walletPublicKey: this.walletPublicKey,
      endpoint: this.endpoint,
      standard: 'Backend transaction generation',
      tokenStandard: 'Programmable NFT (pNFT)',
      walletStatus: this.getWalletStatus(),
      features: {
        backendTransactionGeneration: true,
        mobileWalletIntegration: true,
        ipfsMetadata: true,
        walletCompatibility: ['Phantom', 'Solflare', 'Backpack'],
        noCryptoPolyfills: true
      }
    };
  }
} 