import {
  transact,
} from "@solana-mobile/mobile-wallet-adapter-protocol";
import bs58 from 'bs58';
import { Buffer } from 'buffer';

// App identity for wallet authorization
const APP_IDENTITY = {
  name: 'Hoshino',
  uri: 'https://hoshino.com',
  icon: '/icon.png',
};

// Simple PublicKey class for React Native
class PublicKey {
    constructor(public readonly address: string) {}
    
    toString(): string {
        return this.address;
    }
    
    toBase58(): string {
        return this.address;
    }
}

// React Native compatible event emitter
class EventEmitter {
    private listeners: { [key: string]: Function[] } = {};

    on(event: string, callback: Function) {
        if (!this.listeners[event]) {
            this.listeners[event] = [];
        }
        this.listeners[event].push(callback);
    }

    emit(event: string, data?: any) {
        if (this.listeners[event]) {
            this.listeners[event].forEach(callback => callback(data));
        }
    }

    removeAllListeners() {
        this.listeners = {};
    }
}

export class MobileWalletService {
    private connected: boolean = false;
    private publicKey: PublicKey | null = null;
    private eventEmitter: EventEmitter;
    private authToken: string | null = null;
    private accounts: any[] = [];

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    async initialize(): Promise<any> {
        try {
            console.log('📱 Initializing React Native compatible wallet service...');
            
            // Check if we have a stored auth token
            // In a real implementation, you'd use AsyncStorage
            const storedAuthToken = null; // await AsyncStorage.getItem('wallet_auth_token');
            
            if (storedAuthToken) {
                this.authToken = storedAuthToken;
                // Try to reconnect with stored token
                await this.reconnectWithToken(storedAuthToken);
            }

            return {
                connected: this.connected,
                publicKey: this.publicKey,
                on: (event: string, callback: Function) => {
                    this.eventEmitter.on(event, callback);
                },
                removeAllListeners: () => {
                    this.eventEmitter.removeAllListeners();
                }
            };
        } catch (error) {
            console.error('📱 Failed to initialize wallet service:', error);
            throw error;
        }
    }

    private async reconnectWithToken(token: string): Promise<void> {
        try {
            // In a real implementation, you'd validate the token
            // For now, we'll simulate a successful reconnection
            console.log('📱 Attempting to reconnect with stored token...');
            // This would involve validating the token with the wallet
        } catch (error) {
            console.error('📱 Failed to reconnect with token:', error);
            this.authToken = null;
        }
    }

    async connect(): Promise<PublicKey | null> {
        try {
            console.log('📱 Attempting to connect mobile wallet...');
            
            // Follow the official example for wallet authorization
            const authorizationResult = await transact(async (wallet) => {
                const authorizationResult = await wallet.authorize({
                    cluster: 'devnet',
                    identity: APP_IDENTITY,
                });

                // Store the authorization result
                this.authToken = authorizationResult.auth_token;
                this.accounts = authorizationResult.accounts;
                
                // Get the first account's public key
                const account = authorizationResult.accounts[0];
                
                // Convert base64 address to base58 for proper Solana address format
                let base58Address;
                try {
                    console.log('📱 Raw account address:', account.address);
                    
                    // Decode base64 and convert to base58
                    const decoded = Buffer.from(account.address, 'base64');
                    console.log('📱 Decoded bytes length:', decoded.length);
                    base58Address = bs58.encode(decoded);
                    console.log('📱 Converted to base58:', base58Address);
                } catch (error) {
                    console.error('📱 Error converting address to base58:', error);
                    base58Address = account.address;
                }
                
                this.publicKey = new PublicKey(base58Address);
                this.connected = true;

                // Emit connect event
                this.eventEmitter.emit('connect', this.publicKey);

                console.log('📱 Wallet connected:', this.publicKey.toString());
                console.log('📱 Connected to:', base58Address);
                
                return this.publicKey;
            });

            return authorizationResult;
        } catch (error) {
            console.error('📱 Failed to connect mobile wallet:', error);
            this.eventEmitter.emit('error', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            console.log('📱 Disconnecting mobile wallet...');
            
            // Just clear the local state - no need to prompt the wallet
            this.connected = false;
            this.publicKey = null;
            this.authToken = null;
            this.accounts = [];
            
            // Emit disconnect event
            this.eventEmitter.emit('disconnect');
        } catch (error) {
            console.error('📱 Failed to disconnect mobile wallet:', error);
            throw error;
        }
    }

    async signTransaction(transaction: any): Promise<any> {
        try {
            console.log('📱 Signing transaction...');
            
            if (!this.authToken) {
                throw new Error('Not connected to wallet');
            }

            // For now, return the transaction as-is
            // In a real implementation, you would use the mobile wallet adapter
            // to sign the transaction with the connected wallet
            console.log('📱 Transaction signing not yet implemented');
            return transaction;
        } catch (error) {
            console.error('📱 Failed to sign transaction:', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: any[]): Promise<any[]> {
        try {
            console.log('📱 Signing all transactions...');
            
            if (!this.authToken) {
                throw new Error('Not connected to wallet');
            }

            // For now, return the transactions as-is
            // In a real implementation, you would use the mobile wallet adapter
            // to sign all transactions with the connected wallet
            console.log('📱 Transaction signing not yet implemented');
            return transactions;
        } catch (error) {
            console.error('📱 Failed to sign transactions:', error);
            throw error;
        }
    }

    isConnected(): boolean {
        return this.connected;
    }

    getPublicKey(): PublicKey | null {
        return this.publicKey;
    }

    getAdapter(): any {
        return {
            connected: this.connected,
            publicKey: this.publicKey,
            on: (event: string, callback: Function) => {
                this.eventEmitter.on(event, callback);
            },
            removeAllListeners: () => {
                this.eventEmitter.removeAllListeners();
            }
        };
    }
}

// Export a singleton instance
export const mobileWalletService = new MobileWalletService(); 