import { Wallet } from '@api/model/wallet.model';

export interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  viewMode: 'cards' | 'list';
  
  // Global loading state
  isLoading: boolean;
  
  // Operation-specific loading states
  loadingStates: {
    loadWallets: boolean;
    loadWalletById: boolean;
    createWallet: boolean;
    updateWallet: boolean;
    deleteWallet: boolean;
    setDefaultWallet: boolean;
    moveWalletUp: boolean;
    moveWalletDown: boolean;
  };
  
  // Error handling
  error: string | null;
  operationErrors: {
    loadWallets: string | null;
    loadWalletById: string | null;
    createWallet: string | null;
    updateWallet: string | null;
    deleteWallet: string | null;
    setDefaultWallet: string | null;
    moveWalletUp: string | null;
    moveWalletDown: string | null;
  };
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: string | null;
    timestamp: number | null;
  };
}

export const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  viewMode: 'cards',
  
  // Global loading state
  isLoading: false,
  
  // Operation-specific loading states
  loadingStates: {
    loadWallets: false,
    loadWalletById: false,
    createWallet: false,
    updateWallet: false,
    deleteWallet: false,
    setDefaultWallet: false,
    moveWalletUp: false,
    moveWalletDown: false,
  },
  
  // Error handling
  error: null,
  operationErrors: {
    loadWallets: null,
    loadWalletById: null,
    createWallet: null,
    updateWallet: null,
    deleteWallet: null,
    setDefaultWallet: null,
    moveWalletUp: null,
    moveWalletDown: null,
  },
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: null,
    timestamp: null,
  },
};
