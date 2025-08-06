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
  rarity?: string;
}

export interface MintResult {
  success: boolean;
  mintAddress?: string;
  error?: string;
  estimatedCost?: string;
}

export interface NFTServiceStatus {
  connected: boolean;
  walletPublicKey?: string;
  solanaConnection: boolean;
  backendHealth: boolean;
}

/**
 * Programmable NFT Service
 * Handles NFT minting operations using Firebase Functions backend with Thirdweb IPFS
 */
export class ProgrammableNFTService {
  private connection: Connection;
  private walletPublicKey?: string;
  private mobileWalletService: any;

  constructor(rpcEndpoint: string) {
    this.connection = new Connection(rpcEndpoint, 'confirmed');
    this.mobileWalletService = mobileWalletService;
  }

  /**
   * Set wallet signer for NFT operations
   */
  setWalletSigner(publicKey: PublicKey): void {
    this.walletPublicKey = publicKey.toString();
    console.log('🔧 NFT service wallet configured:', this.walletPublicKey);
  }

  /**
   * Get service status
   */
  getStatus(): NFTServiceStatus {
    return {
      connected: !!this.walletPublicKey,
      walletPublicKey: this.walletPublicKey,
      solanaConnection: true, // We'll check this in a real implementation
      backendHealth: true // We'll check this in a real implementation
    };
  }

  /**
   * Create metadata for NFT
   */
  private createMetadata(
    name: string,
    description: string,
    imageUrl: string,
    attributes: Array<{ trait_type: string; value: string }>
  ) {
    return {
      name: `Hoshino ${name}`,
      symbol: 'HOSH',
      description: description,
      image: imageUrl, // Use image URL directly
      attributes: attributes,
      properties: {
        files: [
          {
            type: 'image/png',
            uri: imageUrl // Use image URL directly
          }
        ],
        category: 'image',
        creators: [
          {
            address: this.walletPublicKey || 'HoshinoGame',
            share: 100
          }
        ]
      }
    };
  }

  /**
   * Upload metadata to IPFS via Thirdweb (handled by backend)
   * The backend handles IPFS uploads, frontend just passes the image URL
   */
  private async uploadMetadataToIPFS(metadata: any): Promise<string> {
    // The backend now handles IPFS uploads via Thirdweb
    // We just return the image URL as the backend will handle the full upload
    console.log('📤 Metadata upload handled by backend via Thirdweb');
    return metadata.image; // Return the image URL as the backend will handle the full upload
  }

  /**
   * Sign and send transaction using mobile wallet adapter
   */
  private async signAndSendTransaction(transactionData: any): Promise<{ signature: string }> {
    if (!this.mobileWalletService.isConnected()) {
      throw new Error('Mobile wallet not connected');
    }

    try {
      // Create transaction from backend data
      const transaction = new Transaction();
      
      // Add instructions from backend
      if (transactionData.instructions) {
        transaction.add(...transactionData.instructions);
      }

      // Set recent blockhash and fee payer
      transaction.recentBlockhash = transactionData.recentBlockhash;
      transaction.feePayer = new PublicKey(transactionData.feePayer);

      // Sign and send using mobile wallet adapter
      const signature = await this.mobileWalletService.signAndSendTransaction(transaction);
      
      console.log('✅ Transaction signed and sent:', signature);
      return { signature };
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      throw new Error(`Transaction failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  /**
   * Mint character as programmable NFT
   */
  async mintCharacterPNFT(
    character: GameCharacter,
    imageUrl: string, // Changed from imageCid to imageUrl
    recipient?: PublicKey,
    mood: string = 'Happy'
  ): Promise<MintResult> {
    if (!this.walletPublicKey) {
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

      // Create metadata attributes with mood trait only
      const attributes = [
        { trait_type: 'Mood', value: mood }
      ];

      // Create metadata using image URL directly
      const metadata = this.createMetadata(
        character.name,
        character.description || `A character in Hoshino with ${mood.toLowerCase()} mood.`,
        imageUrl, // Use image URL directly
        attributes
      );

      // The backend now handles IPFS uploads via Thirdweb
      const metadataUri = await this.uploadMetadataToIPFS(metadata);

      // Call backend to generate transaction
      console.log('📤 Calling backend for transaction generation...');
      
      const response = await fetch(getFunctionUrl('mintCharacter'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          characterId: character.id,
          ownerPublicKey: this.walletPublicKey,
          mood: mood
        })
      });

      const transactionData = await response.json();

      if (!transactionData.success) {
        throw new Error(transactionData.error || 'Backend transaction generation failed');
      }

      console.log('📥 Received transaction from backend');

      // Sign and send the transaction using mobile wallet adapter
      const result = await this.signAndSendTransaction(transactionData.transaction);
      
      console.log('✅ Character pNFT minted successfully!');
      console.log('📝 Transaction signature:', result.signature);
      console.log('🎨 Mint address:', transactionData.mintAddress);

      return {
        success: true,
        mintAddress: transactionData.mintAddress,
        estimatedCost: transactionData.estimatedCost || '~0.01 SOL'
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
   * Mint achievement as programmable NFT
   */
  async mintAchievementPNFT(
    achievement: GameAchievement,
    imageUrl: string, // Changed from imageCid to imageUrl
    recipient?: PublicKey,
    mood: string = 'Proud'
  ): Promise<MintResult> {
    if (!this.walletPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log('🏆 Minting achievement pNFT:', achievement.name);

      // Create metadata attributes with mood trait only
      const attributes = [
        { trait_type: 'Mood', value: mood }
      ];

      // Create metadata using image URL directly
      const metadata = this.createMetadata(
        achievement.name,
        achievement.description,
        imageUrl, // Use image URL directly
        attributes
      );

      // The backend now handles IPFS uploads via Thirdweb
      const metadataUri = await this.uploadMetadataToIPFS(metadata);

      // Call backend to generate transaction
      console.log('📤 Calling backend for achievement transaction generation...');
      
      const response = await fetch(getFunctionUrl('mintAchievement'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          achievementId: achievement.id,
          ownerPublicKey: this.walletPublicKey,
          mood: mood
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
      console.log('🏆 Mint address:', transactionData.mintAddress);

      return {
        success: true,
        mintAddress: transactionData.mintAddress,
        estimatedCost: transactionData.estimatedCost || '~0.01 SOL'
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
   * Mint marketplace item as programmable NFT
   */
  async mintMarketplaceItemPNFT(
    itemId: string,
    category: string,
    imageUrl: string, // Changed from imageCid to imageUrl
    recipient?: PublicKey,
    mood: string = 'Excited'
  ): Promise<MintResult> {
    if (!this.walletPublicKey) {
      return {
        success: false,
        error: 'Wallet not connected. Please connect your wallet first.'
      };
    }

    try {
      console.log('🛍️ Minting marketplace item pNFT:', itemId);

      // Create metadata attributes with mood trait only
      const attributes = [
        { trait_type: 'Mood', value: mood }
      ];

      // Create metadata using image URL directly
      const metadata = this.createMetadata(
        itemId,
        `A ${category} item from the Hoshino marketplace`,
        imageUrl, // Use image URL directly
        attributes
      );

      // The backend now handles IPFS uploads via Thirdweb
      const metadataUri = await this.uploadMetadataToIPFS(metadata);

      // Call backend to generate transaction
      console.log('📤 Calling backend for marketplace item transaction generation...');
      
      const response = await fetch(getFunctionUrl('mintMarketplaceItem'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          itemId: itemId,
          category: category,
          ownerPublicKey: this.walletPublicKey,
          mood: mood
        })
      });

      const transactionData = await response.json();

      if (!transactionData.success) {
        throw new Error(transactionData.error || 'Backend transaction generation failed');
      }

      console.log('📥 Received marketplace item transaction from backend');

      // Sign and send the transaction using mobile wallet adapter
      const result = await this.signAndSendTransaction(transactionData.transaction);
      
      console.log('✅ Marketplace item pNFT minted successfully!');
      console.log('📝 Transaction signature:', result.signature);
      console.log('🛍️ Mint address:', transactionData.mintAddress);

      return {
        success: true,
        mintAddress: transactionData.mintAddress,
        estimatedCost: transactionData.estimatedCost || '~0.01 SOL'
      };

    } catch (error) {
      console.error('❌ Marketplace item pNFT minting failed:', error);
      return {
        success: false,
        error: `Failed to mint marketplace item: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
} 