import { Connection, PublicKey, Transaction, SystemProgram, LAMPORTS_PER_SOL } from '@solana/web3.js';
import { Metaplex, keypairIdentity, bundlrStorage } from '@metaplex-foundation/js';
import { createMint, getOrCreateAssociatedTokenAccount, mintTo } from '@solana/spl-token';
import { Character } from './LocalGameEngine';

export interface NFTMetadata {
  name: string;
  symbol: string;
  description: string;
  image: string;
  attributes: Array<{
    trait_type: string;
    value: string;
  }>;
}

export class SimpleNFTMinter {
  private connection: Connection;
  private metaplex: Metaplex | null = null;

  constructor(connection: Connection) {
    this.connection = connection;
  }

  private initializeMetaplex(wallet: any) {
    if (!this.metaplex) {
      this.metaplex = Metaplex.make(this.connection)
        .use(keypairIdentity(wallet))
        .use(bundlrStorage());
    }
    return this.metaplex;
  }

  public async mintCharacterNFT(
    character: Character,
    wallet: any
  ): Promise<{ success: boolean; mintAddress?: string; error?: string }> {
    try {
      const metaplex = this.initializeMetaplex(wallet);
      
      // Create NFT metadata
      const metadata: NFTMetadata = {
        name: `${character.name} - Hoshino Pet`,
        symbol: 'HOSHINO',
        description: character.description,
        image: character.image,
        attributes: [
          { trait_type: 'Element', value: character.element },
          { trait_type: 'Rarity', value: character.rarity },
          { trait_type: 'Special Ability', value: character.specialAbility },
          { trait_type: 'Base Mood', value: character.baseStats.mood.toString() },
          { trait_type: 'Base Hunger', value: character.baseStats.hunger.toString() },
          { trait_type: 'Base Energy', value: character.baseStats.energy.toString() }
        ]
      };

      // Upload metadata to Arweave
      const { uri } = await metaplex.nfts().uploadMetadata(metadata);

      // Create NFT
      const { nft } = await metaplex.nfts().create({
        name: metadata.name,
        symbol: metadata.symbol,
        uri: uri,
        sellerFeeBasisPoints: 500, // 5% royalty
        maxSupply: 1,
        isMutable: true
      });

      return {
        success: true,
        mintAddress: nft.address.toString()
      };
    } catch (error: any) {
      console.error('Failed to mint NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to mint NFT'
      };
    }
  }

  public async getNFTMetadata(mintAddress: string, wallet?: any): Promise<NFTMetadata | null> {
    try {
      const metaplex = wallet ? this.initializeMetaplex(wallet) : this.metaplex;
      if (!metaplex) {
        throw new Error('Metaplex not initialized');
      }
      
      const mint = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
      
      if (nft.json) {
        return nft.json as NFTMetadata;
      }
      
      return null;
    } catch (error) {
      console.error('Failed to get NFT metadata:', error);
      return null;
    }
  }

  public async getUserNFTs(walletAddress: string, wallet?: any): Promise<Array<{ mint: string; metadata: NFTMetadata }>> {
    try {
      const metaplex = wallet ? this.initializeMetaplex(wallet) : this.metaplex;
      if (!metaplex) {
        throw new Error('Metaplex not initialized');
      }
      
      const publicKey = new PublicKey(walletAddress);
      const nfts = await metaplex.nfts().findAllByOwner({ owner: publicKey });
      
      const nftData = await Promise.all(
        nfts.map(async (nft) => {
          const metadata = await this.getNFTMetadata(nft.address.toString(), wallet);
          return {
            mint: nft.address.toString(),
            metadata: metadata
          };
        })
      );

      return nftData.filter(nft => nft.metadata !== null) as Array<{ mint: string; metadata: NFTMetadata }>;
    } catch (error) {
      console.error('Failed to get user NFTs:', error);
      return [];
    }
  }

  public async transferNFT(
    mintAddress: string,
    fromWallet: any,
    toWalletAddress: string
  ): Promise<{ success: boolean; error?: string }> {
    try {
      const metaplex = this.initializeMetaplex(fromWallet);
      
      const mint = new PublicKey(mintAddress);
      const toPublicKey = new PublicKey(toWalletAddress);
      
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
      
      if (!nft) {
        return { success: false, error: 'NFT not found' };
      }

      // Transfer the NFT
      await metaplex.nfts().transfer({
        nftOrSft: nft,
        toOwner: toPublicKey
      });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to transfer NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to transfer NFT'
      };
    }
  }

  public async burnNFT(mintAddress: string, wallet: any): Promise<{ success: boolean; error?: string }> {
    try {
      const metaplex = this.initializeMetaplex(wallet);
      
      const mint = new PublicKey(mintAddress);
      const nft = await metaplex.nfts().findByMint({ mintAddress: mint });
      
      if (!nft) {
        return { success: false, error: 'NFT not found' };
      }

      // Burn the NFT
      await metaplex.nfts().delete({ nftOrSft: nft });

      return { success: true };
    } catch (error: any) {
      console.error('Failed to burn NFT:', error);
      return {
        success: false,
        error: error.message || 'Failed to burn NFT'
      };
    }
  }
} 