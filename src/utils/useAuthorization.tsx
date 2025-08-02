import { useUnifiedWallet } from './useUnifiedWallet';

export interface Authorization {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  walletType: string;
}

export const useAuthorization = (): Authorization => {
  const wallet = useUnifiedWallet();

  return {
    connected: wallet.connected,
    connecting: wallet.connecting,
    publicKey: wallet.publicKey,
    connect: wallet.connect,
    disconnect: wallet.disconnect,
    walletType: wallet.walletType,
  };
}; 