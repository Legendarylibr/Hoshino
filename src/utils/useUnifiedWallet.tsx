import { useMobileWallet } from './useMobileWallet';
import { useWebWallet } from './useWebWallet';
import { Platform } from 'react-native';

export type WalletType = 'phantom' | 'solflare' | 'mobile';

export interface UnifiedWallet {
  connected: boolean;
  connecting: boolean;
  publicKey: string | null;
  connect: () => Promise<void>;
  disconnect: () => Promise<void>;
  signTransaction: (transaction: any) => Promise<any>;
  signMessage: (message: Uint8Array) => Promise<{ signature: Uint8Array }>;
  walletType: WalletType;
}

export const useUnifiedWallet = (): UnifiedWallet => {
  const mobileWallet = useMobileWallet();
  const webWallet = useWebWallet();

  // Use mobile wallet on mobile platforms, web wallet on web
  const isMobile = Platform.OS !== 'web';
  const activeWallet = isMobile ? mobileWallet : webWallet;
  const walletType: WalletType = isMobile ? 'mobile' : 'phantom';

  return {
    ...activeWallet,
    walletType,
  };
}; 