import { Connection, PublicKey, Transaction } from '@solana/web3.js';
import { transact } from '@solana-mobile/mobile-wallet-adapter-protocol-web3js';

/**
 * Seeker Wallet Service - Optimized for Solana Seeker mobile device
 * Integrates with Seed Vault for hardware-backed security
 */
export class SeekerWalletService {
  private connection: Connection;
  private publicKey: PublicKey | null = null;
  private authorization: any = null;
  private isConnected: boolean = false;
  private seedVaultSupported: boolean = false;

  constructor(connection: Connection) {
    this.connection = connection;
    // Initialize synchronously to avoid async constructor issues
    this.initializeSeekerFeatures();
  }

  /**
   * Initialize Seeker features - synchronous version
   */
  private initializeSeekerFeatures() {
    try {
      this.checkSeekerFeatures();
    } catch (error) {
      console.error('Failed to initialize Seeker features:', error);
      this.seedVaultSupported = false;
    }
  }

  /**
   * Check if running on Solana Seeker device with enhanced features
   */
  private checkSeekerFeatures() {
    try {
      // Check for Seed Vault availability
      // This would detect if we're running on a Seeker device
      const userAgent = navigator.userAgent || '';
      const isSeekerDevice = userAgent.includes('SolanaSeeker') || userAgent.includes('Seeker');
      
      this.seedVaultSupported = isSeekerDevice;
      console.log('🔍 Seeker device detected:', isSeekerDevice);
      console.log('🔐 Seed Vault supported:', this.seedVaultSupported);
    } catch (error) {
      console.warn('Could not detect Seeker features:', error);
      this.seedVaultSupported = false;
    }
  }

  /**
   * Connect wallet with Seeker-optimized authorization
   */
  async connect(): Promise<{ success: boolean; publicKey?: PublicKey; error?: string }> {
    try {
      console.log('📱 Connecting to Seeker wallet...');

      const authResult = await transact(async (wallet) => {
        // Use feature-based auth for Seeker capabilities
        if (this.seedVaultSupported) {
          return await wallet.authorize({
            identity: {
              name: 'Hoshino Game',
              uri: 'https://hoshino.game',
              icon: 'favicon.png',
            },
            features: ['solana:seed-vault'],
          });
        } else {
          // Standard cluster-based auth
          return await wallet.authorize({
            cluster: 'devnet',
            identity: {
              name: 'Hoshino Game',
              uri: 'https://hoshino.game',
              icon: 'favicon.png',
            },
          });
        }
      });

      if (authResult.accounts && authResult.accounts.length > 0) {
        this.publicKey = new PublicKey(authResult.accounts[0].address);
        this.authorization = authResult;
        this.isConnected = true;

        console.log('✅ Seeker wallet connected:', this.publicKey.toString());
        
        if (this.seedVaultSupported) {
          console.log('🔐 Seed Vault integration active');
        }

        return {
          success: true,
          publicKey: this.publicKey
        };
      } else {
        throw new Error('No accounts returned from authorization');
      }
    } catch (error) {
      console.error('❌ Seeker wallet connection failed:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Connection failed'
      };
    }
  }

  /**
   * Disconnect wallet
   */
  async disconnect(): Promise<void> {
    try {
      if (this.authorization) {
        await transact(async (wallet) => {
          await wallet.deauthorize({ auth_token: this.authorization.auth_token });
        });
      }
    } catch (error) {
      console.warn('Warning during disconnect:', error);
    } finally {
      this.publicKey = null;
      this.authorization = null;
      this.isConnected = false;
      console.log('📱 Seeker wallet disconnected');
    }
  }

  /**
   * Sign transaction with Seed Vault integration if available
   */
  async signTransaction(transaction: Transaction): Promise<Transaction> {
    if (!this.isConnected || !this.authorization) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTransaction = await transact(async (wallet) => {
        // Reauthorize for security
        await wallet.reauthorize({ 
          auth_token: this.authorization.auth_token,
          identity: {
            name: 'Hoshino Game',
            uri: 'https://hoshino.game',
            icon: 'favicon.png',
          }
        });

        const signedTransactions = await wallet.signTransactions({ 
          transactions: [transaction] 
        });
        
        return signedTransactions[0];
      });

      if (this.seedVaultSupported) {
        console.log('🔐 Transaction signed with Seed Vault');
      }

      return signedTransaction;
    } catch (error) {
      console.error('❌ Transaction signing failed:', error);
      throw error;
    }
  }

  /**
   * Sign multiple transactions
   */
  async signAllTransactions(transactions: Transaction[]): Promise<Transaction[]> {
    if (!this.isConnected || !this.authorization) {
      throw new Error('Wallet not connected');
    }

    try {
      const signedTransactions = await transact(async (wallet) => {
        await wallet.reauthorize({ 
          auth_token: this.authorization.auth_token,
          identity: {
            name: 'Hoshino Game',
            uri: 'https://hoshino.game',
            icon: 'favicon.png',
          }
        });

        return await wallet.signTransactions({ transactions });
      });

      if (this.seedVaultSupported) {
        console.log('🔐 Multiple transactions signed with Seed Vault');
      }

      return signedTransactions;
    } catch (error) {
      console.error('❌ Multiple transaction signing failed:', error);
      throw error;
    }
  }

  /**
   * Send and confirm transaction
   */
  async sendAndConfirmTransaction(transaction: Transaction): Promise<string> {
    try {
      const signedTransaction = await this.signTransaction(transaction);
      
      const signature = await this.connection.sendRawTransaction(
        signedTransaction.serialize(),
        {
          skipPreflight: false,
          preflightCommitment: 'confirmed',
        }
      );

      await this.connection.confirmTransaction(signature, 'confirmed');
      
      console.log('✅ Transaction confirmed:', signature);
      return signature;
    } catch (error) {
      console.error('❌ Transaction failed:', error);
      throw error;
    }
  }

  /**
   * Get wallet adapter interface for Metaplex
   */
  getWalletAdapter() {
    return {
      publicKey: this.publicKey,
      connected: this.isConnected,
      signTransaction: this.signTransaction.bind(this),
      signAllTransactions: this.signAllTransactions.bind(this),
    };
  }

  /**
   * Check if running on Seeker device
   */
  isSeekerDevice(): boolean {
    return this.seedVaultSupported;
  }

  /**
   * Get connection info
   */
  getConnectionInfo() {
    return {
      connected: this.isConnected,
      publicKey: this.publicKey?.toString() || null,
      seedVaultSupported: this.seedVaultSupported,
      cluster: 'devnet'
    };
  }
} 