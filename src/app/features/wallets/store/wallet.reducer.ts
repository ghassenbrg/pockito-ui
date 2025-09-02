import { createReducer, on } from '@ngrx/store';
import { WalletState, initialState } from './wallet.state';
import * as WalletActions from './wallet.actions';

export const walletReducer = createReducer(
  initialState,
  
  // Load Wallets
  on(WalletActions.loadWallets, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.loadWalletsSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.loadWalletsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Create Wallet
  on(WalletActions.createWallet, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.createWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: [...state.wallets, wallet],
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.createWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Update Wallet
  on(WalletActions.updateWallet, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.updateWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.map(w => w.id === wallet.id ? wallet : w),
    selectedWallet: state.selectedWallet?.id === wallet.id ? wallet : state.selectedWallet,
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.updateWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Delete Wallet
  on(WalletActions.deleteWallet, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.deleteWalletSuccess, (state, { walletId }) => ({
    ...state,
    wallets: state.wallets.filter(w => w.id !== walletId),
    selectedWallet: state.selectedWallet?.id === walletId ? null : state.selectedWallet,
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.deleteWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Set Default Wallet
  on(WalletActions.setDefaultWallet, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.setDefaultWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.map(w => ({
      ...w,
      isDefault: w.id === wallet.id
    })),
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.setDefaultWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // Move Wallet
  on(WalletActions.moveWalletUp, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.moveWalletUpSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.moveWalletUpFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  on(WalletActions.moveWalletDown, (state) => ({
    ...state,
    isLoading: true,
    error: null
  })),
  
  on(WalletActions.moveWalletDownSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    error: null
  })),
  
  on(WalletActions.moveWalletDownFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    error
  })),
  
  // UI State
  on(WalletActions.setSelectedWallet, (state, { wallet }) => ({
    ...state,
    selectedWallet: wallet
  })),
  
  on(WalletActions.setViewMode, (state, { viewMode }) => ({
    ...state,
    viewMode
  })),
  
  on(WalletActions.clearError, (state) => ({
    ...state,
    error: null
  }))
);
