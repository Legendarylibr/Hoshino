import { PublicKey } from '@solana/web3.js';

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

    constructor() {
        this.eventEmitter = new EventEmitter();
    }

    async initialize(): Promise<any> {
        console.log('📱 Mobile wallet service initialized (React Native compatible)');
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

    async connect(): Promise<PublicKey | null> {
        try {
            console.log('📱 Attempting to connect mobile wallet...');
            
            // Simulate connection delay
            await new Promise(resolve => setTimeout(resolve, 1000));
            
            // Create a mock public key for now
            this.publicKey = new PublicKey('11111111111111111111111111111111');
            this.connected = true;
            
            // Emit connect event
            this.eventEmitter.emit('connect', this.publicKey);
            
            console.log('📱 Wallet connected:', this.publicKey.toString());
            return this.publicKey;
        } catch (error) {
            console.error('📱 Failed to connect mobile wallet:', error);
            this.eventEmitter.emit('error', error);
            throw error;
        }
    }

    async disconnect(): Promise<void> {
        try {
            console.log('📱 Disconnecting mobile wallet...');
            this.connected = false;
            this.publicKey = null;
            
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
            // For now, return the transaction as-is
            // In a real implementation, this would interact with the mobile wallet
            return transaction;
        } catch (error) {
            console.error('📱 Failed to sign transaction:', error);
            throw error;
        }
    }

    async signAllTransactions(transactions: any[]): Promise<any[]> {
        try {
            console.log('📱 Signing all transactions...');
            // For now, return the transactions as-is
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