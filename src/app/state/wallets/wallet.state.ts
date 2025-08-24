import { createReducer, on } from '@ngrx/store';
import { Wallet } from '@shared/models';
import * as WalletActions from './wallet.actions';

export interface WalletState {
  wallets: Wallet[];
  selectedWallet: Wallet | null;
  loading: boolean;
  error: string | null;
  creating: boolean;
  updating: boolean;
  archiving: boolean;
  settingDefault: boolean;
}

export const initialState: WalletState = {
  wallets: [],
  selectedWallet: null,
  loading: false,
  error: null,
  creating: false,
  updating: false,
  archiving: false,
  settingDefault: false
};

export const walletReducer = createReducer(
  initialState,
  
  // Load wallets
  on(WalletActions.loadWallets, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(WalletActions.loadWalletsSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    loading: false,
    error: null
  })),
  
  on(WalletActions.loadWalletsFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Load single wallet
  on(WalletActions.loadWallet, (state) => ({
    ...state,
    loading: true,
    error: null
  })),
  
  on(WalletActions.loadWalletSuccess, (state, { wallet }) => ({
    ...state,
    selectedWallet: wallet,
    loading: false,
    error: null
  })),
  
  on(WalletActions.loadWalletFailure, (state, { error }) => ({
    ...state,
    loading: false,
    error
  })),
  
  // Create wallet
  on(WalletActions.createWallet, (state) => ({
    ...state,
    creating: true,
    error: null
  })),
  
  on(WalletActions.createWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: [...state.wallets, wallet],
    creating: false,
    error: null
  })),
  
  on(WalletActions.createWalletFailure, (state, { error }) => ({
    ...state,
    creating: false,
    error
  })),
  
  // Update wallet
  on(WalletActions.updateWallet, (state) => ({
    ...state,
    updating: true,
    error: null
  })),
  
  on(WalletActions.updateWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.map(w => w.id === wallet.id ? wallet : w),
    selectedWallet: state.selectedWallet?.id === wallet.id ? wallet : state.selectedWallet,
    updating: false,
    error: null
  })),
  
  on(WalletActions.updateWalletFailure, (state, { error }) => ({
    ...state,
    updating: false,
    error
  })),
  
  // Archive wallet
  on(WalletActions.archiveWallet, (state) => ({
    ...state,
    archiving: true,
    error: null
  })),
  
  on(WalletActions.archiveWalletSuccess, (state, { walletId }) => ({
    ...state,
    wallets: state.wallets.filter(w => w.id !== walletId),
    selectedWallet: state.selectedWallet?.id === walletId ? null : state.selectedWallet,
    archiving: false,
    error: null
  })),
  
  on(WalletActions.archiveWalletFailure, (state, { error }) => ({
    ...state,
    archiving: false,
    error
  })),
  
  // Set default wallet
  on(WalletActions.setDefaultWallet, (state) => ({
    ...state,
    settingDefault: true,
    error: null
  })),
  
  on(WalletActions.setDefaultWalletSuccess, (state, { walletId }) => ({
    ...state,
    wallets: state.wallets.map(w => ({
      ...w,
      isDefault: w.id === walletId
    })),
    selectedWallet: state.selectedWallet ? {
      ...state.selectedWallet,
      isDefault: state.selectedWallet.id === walletId
    } : null,
    settingDefault: false,
    error: null
  })),
  
  on(WalletActions.setDefaultWalletFailure, (state, { error }) => ({
    ...state,
    settingDefault: false,
    error
  })),

  // Reorder wallet
  on(WalletActions.reorderWallet, (state) => ({
    ...state,
    error: null
  })),
  
  on(WalletActions.reorderWalletSuccess, (state, { walletId, newOrder }) => {
    console.log(`State: Processing reorder success for wallet ${walletId} to position ${newOrder}`);
    console.log(`State: Current wallets before update:`, state.wallets.map(w => ({ id: w.id, name: w.name, displayOrder: w.displayOrder })));
    
    // Update the display order of the reordered wallet
    const updatedWallets = state.wallets.map(wallet => {
      if (wallet.id === walletId) {
        return { ...wallet, displayOrder: newOrder };
      }
      return wallet;
    });

    // Sort wallets by display order to maintain proper sequence
    updatedWallets.sort((a, b) => (a.displayOrder || 0) - (b.displayOrder || 0));
    
    console.log(`State: Updated wallets after reorder:`, updatedWallets.map(w => ({ id: w.id, name: w.name, displayOrder: w.displayOrder })));

    return {
      ...state,
      wallets: updatedWallets,
      loading: false,
      error: null
    };
  }),
  
  on(WalletActions.reorderWalletFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false
  })),

  // Normalize display orders
  on(WalletActions.normalizeDisplayOrders, (state) => ({
    ...state,
    loading: true,
    error: null
  })),

  on(WalletActions.normalizeDisplayOrdersSuccess, (state) => ({
    ...state,
    loading: false,
    error: null
  })),

  on(WalletActions.normalizeDisplayOrdersFailure, (state, { error }) => ({
    ...state,
    error: error,
    loading: false
  })),

  // Clear error
  on(WalletActions.clearWalletError, (state) => ({
    ...state,
    error: null
  })),
  
  // Clear selected wallet
  on(WalletActions.clearSelectedWallet, (state) => ({
    ...state,
    selectedWallet: null
  }))
);
