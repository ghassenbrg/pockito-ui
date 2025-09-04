import { createReducer, on } from '@ngrx/store';
import * as WalletActions from './wallet.actions';
import { initialState } from './wallet.state';

export const walletReducer = createReducer(
  initialState,

  // Load Wallets
  on(WalletActions.loadWallets, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadWallets: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadWallets: null },
  })),

  on(WalletActions.loadWalletsSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadWallets: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadWallets: null },
    lastSuccessfulOperation: { type: 'loadWallets', timestamp: Date.now() },
  })),

  on(WalletActions.loadWalletsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadWallets: false },
    error,
    operationErrors: { ...state.operationErrors, loadWallets: error },
  })),

  // Load Single Wallet by ID
  on(WalletActions.loadWalletById, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadWalletById: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadWalletById: null },
  })),

  on(WalletActions.loadWalletByIdSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.some((w) => w.id === wallet.id)
      ? state.wallets.map((w) => (w.id === wallet.id ? wallet : w))
      : [...state.wallets, wallet],
    selectedWallet: wallet,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadWalletById: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadWalletById: null },
    lastSuccessfulOperation: { type: 'loadWalletById', timestamp: Date.now() },
  })),

  on(WalletActions.loadWalletByIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadWalletById: false },
    error,
    operationErrors: { ...state.operationErrors, loadWalletById: error },
  })),

  // Create Wallet
  on(WalletActions.createWallet, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, createWallet: true },
    error: null,
    operationErrors: { ...state.operationErrors, createWallet: null },
  })),

  on(WalletActions.createWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: [...state.wallets, wallet],
    isLoading: false,
    loadingStates: { ...state.loadingStates, createWallet: false },
    error: null,
    operationErrors: { ...state.operationErrors, createWallet: null },
    lastSuccessfulOperation: { type: 'createWallet', timestamp: Date.now() },
  })),

  on(WalletActions.createWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, createWallet: false },
    error,
    operationErrors: { ...state.operationErrors, createWallet: error },
  })),

  // Update Wallet
  on(WalletActions.updateWallet, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, updateWallet: true },
    error: null,
    operationErrors: { ...state.operationErrors, updateWallet: null },
  })),

  on(WalletActions.updateWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.map((w) => (w.id === wallet.id ? wallet : w)),
    selectedWallet:
      state.selectedWallet?.id === wallet.id ? wallet : state.selectedWallet,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateWallet: false },
    error: null,
    operationErrors: { ...state.operationErrors, updateWallet: null },
    lastSuccessfulOperation: { type: 'updateWallet', timestamp: Date.now() },
  })),

  on(WalletActions.updateWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateWallet: false },
    error,
    operationErrors: { ...state.operationErrors, updateWallet: error },
  })),

  // Delete Wallet
  on(WalletActions.deleteWallet, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, deleteWallet: true },
    error: null,
    operationErrors: { ...state.operationErrors, deleteWallet: null },
  })),

  on(WalletActions.deleteWalletSuccess, (state, { walletId }) => ({
    ...state,
    wallets: state.wallets.filter((w) => w.id !== walletId),
    selectedWallet:
      state.selectedWallet?.id === walletId ? null : state.selectedWallet,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteWallet: false },
    error: null,
    operationErrors: { ...state.operationErrors, deleteWallet: null },
    lastSuccessfulOperation: { type: 'deleteWallet', timestamp: Date.now() },
  })),

  on(WalletActions.deleteWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteWallet: false },
    error,
    operationErrors: { ...state.operationErrors, deleteWallet: error },
  })),

  // Set Default Wallet
  on(WalletActions.setDefaultWallet, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, setDefaultWallet: true },
    error: null,
    operationErrors: { ...state.operationErrors, setDefaultWallet: null },
  })),

  on(WalletActions.setDefaultWalletSuccess, (state, { wallet }) => ({
    ...state,
    wallets: state.wallets.map((w) => ({
      ...w,
      isDefault: w.id === wallet.id,
    })),
    isLoading: false,
    loadingStates: { ...state.loadingStates, setDefaultWallet: false },
    error: null,
    operationErrors: { ...state.operationErrors, setDefaultWallet: null },
    lastSuccessfulOperation: { type: 'setDefaultWallet', timestamp: Date.now() },
  })),

  on(WalletActions.setDefaultWalletFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, setDefaultWallet: false },
    error,
    operationErrors: { ...state.operationErrors, setDefaultWallet: error },
  })),

  // Move Wallet
  on(WalletActions.moveWalletUp, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, moveWalletUp: true },
    error: null,
    operationErrors: { ...state.operationErrors, moveWalletUp: null },
  })),

  on(WalletActions.moveWalletUpSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    loadingStates: { ...state.loadingStates, moveWalletUp: false },
    error: null,
    operationErrors: { ...state.operationErrors, moveWalletUp: null },
    lastSuccessfulOperation: { type: 'moveWalletUp', timestamp: Date.now() },
  })),

  on(WalletActions.moveWalletUpFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, moveWalletUp: false },
    error,
    operationErrors: { ...state.operationErrors, moveWalletUp: error },
  })),

  on(WalletActions.moveWalletDown, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, moveWalletDown: true },
    error: null,
    operationErrors: { ...state.operationErrors, moveWalletDown: null },
  })),

  on(WalletActions.moveWalletDownSuccess, (state, { wallets }) => ({
    ...state,
    wallets,
    isLoading: false,
    loadingStates: { ...state.loadingStates, moveWalletDown: false },
    error: null,
    operationErrors: { ...state.operationErrors, moveWalletDown: null },
    lastSuccessfulOperation: { type: 'moveWalletDown', timestamp: Date.now() },
  })),

  on(WalletActions.moveWalletDownFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, moveWalletDown: false },
    error,
    operationErrors: { ...state.operationErrors, moveWalletDown: error },
  })),

  // UI State
  on(WalletActions.setSelectedWallet, (state, { wallet }) => ({
    ...state,
    selectedWallet: wallet,
  })),

  on(WalletActions.setViewMode, (state, { viewMode }) => {
    // Save view mode to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('wallet-view-mode', viewMode);
      }
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
    
    return {
      ...state,
      viewMode,
    };
  }),

  // Enhanced error handling
  on(WalletActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(WalletActions.clearOperationError, (state, { operation }) => ({
    ...state,
    operationErrors: { ...state.operationErrors, [operation]: null },
  })),

  on(WalletActions.clearAllErrors, (state) => ({
    ...state,
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
  })),

  // Success state management
  on(WalletActions.clearSuccessState, (state) => ({
    ...state,
    lastSuccessfulOperation: { type: null, timestamp: null },
  })),

  // Loading state management
  on(WalletActions.setGlobalLoading, (state, { isLoading }) => ({
    ...state,
    isLoading,
  })),

  on(WalletActions.setOperationLoading, (state, { operation, isLoading }) => ({
    ...state,
    loadingStates: { ...state.loadingStates, [operation]: isLoading },
  })),
);
