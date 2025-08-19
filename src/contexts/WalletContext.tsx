import React, { createContext, useContext, useState, ReactNode, useCallback, useEffect } from 'react';
import { MobileWalletService } from '../services/MobileWalletService';

// Create a singleton instance
export const mobileWalletService = new MobileWalletService();

interface WalletContextType {
    connected: boolean;
    publicKey: string | null;
    connect: () => Promise<void>;
    disconnect: () => void;
    signAndSendTransaction: (transaction: any) => Promise<{ signature: string }>;
}

const WalletContext = createContext<WalletContextType | undefined>(undefined);

interface WalletProviderProps {
    children: ReactNode;
}

export const WalletProvider: React.FC<WalletProviderProps> = ({ children }) => {
    const [connected, setConnected] = useState(false);
    const [publicKey, setPublicKey] = useState<string | null>(null);

    // Initialize the mobile wallet service
    useEffect(() => {
        const initializeWallet = async () => {
            try {
                const adapter = await mobileWalletService.initialize();
                
                // Set up event listeners for the real adapter
                adapter.on('connect', (publicKey) => {
                    console.log('📱 Mobile wallet connected:', publicKey.toString());
                    setConnected(true);
                    setPublicKey(publicKey.toString());
                });

                adapter.on('disconnect', () => {
                    console.log('📱 Mobile wallet disconnected');
                    setConnected(false);
                    setPublicKey(null);
                });

                adapter.on('error', (error: Error) => {
                    console.error('📱 Mobile wallet error:', error);
                });

                // Check if already connected
                if (adapter.connected && adapter.publicKey) {
                    setConnected(true);
                    setPublicKey(adapter.publicKey.toString());
                }
            } catch (error) {
                console.error('📱 Failed to initialize mobile wallet service:', error);
            }
        };

        initializeWallet();
    }, []);

    const connect = useCallback(async () => {
        try {
            console.log('📱 Attempting to connect mobile wallet...');
            const publicKey = await mobileWalletService.connect();
            if (publicKey) {
                setConnected(true);
                setPublicKey(publicKey.toString());
            }
        } catch (error) {
            console.error('📱 Failed to connect mobile wallet:', error);
            // Show user-friendly error message
            alert('Failed to connect wallet. Please make sure you have Solflare or another mobile wallet installed.');
        }
    }, []);

    const disconnect = useCallback(async () => {
        try {
            await mobileWalletService.disconnect();
            setConnected(false);
            setPublicKey(null);
        } catch (error) {
            console.error('📱 Failed to disconnect mobile wallet:', error);
            setConnected(false);
            setPublicKey(null);
        }
    }, []);

    const signAndSendTransaction = useCallback(async (transaction: any) => {
        try {
            console.log('📱 Signing and sending transaction...');
            const result = await mobileWalletService.signAndSendSolanaTransaction(transaction);
            return result;
        } catch (error) {
            console.error('📱 Failed to sign and send transaction:', error);
            throw error;
        }
    }, []);

    return (
        <WalletContext.Provider value={{ 
            connected, 
            publicKey, 
            connect, 
            disconnect,
            signAndSendTransaction
        }}>
            {children}
        </WalletContext.Provider>
    );
};

export const useWallet = () => {
    const context = useContext(WalletContext);
    if (context === undefined) {
        throw new Error('useWallet must be used within a WalletProvider');
    }
    return context;
}; 