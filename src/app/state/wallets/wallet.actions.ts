import { createAction, props } from '@ngrx/store';
import { Wallet, CreateWalletRequest, UpdateWalletRequest } from '@shared/models';

// Load wallets
export const loadWallets = createAction('[Wallet] Load Wallets');

export const loadWalletsSuccess = createAction(
  '[Wallet] Load Wallets Success',
  props<{ wallets: Wallet[] }>()
);

export const loadWalletsFailure = createAction(
  '[Wallet] Load Wallets Failure',
  props<{ error: string }>()
);

// Load single wallet
export const loadWallet = createAction(
  '[Wallet] Load Wallet',
  props<{ id: string }>()
);

export const loadWalletSuccess = createAction(
  '[Wallet] Load Wallet Success',
  props<{ wallet: Wallet }>()
);

export const loadWalletFailure = createAction(
  '[Wallet] Load Wallet Failure',
  props<{ error: string }>()
);

// Create wallet
export const createWallet = createAction(
  '[Wallet] Create Wallet',
  props<{ wallet: CreateWalletRequest }>()
);

export const createWalletSuccess = createAction(
  '[Wallet] Create Wallet Success',
  props<{ wallet: Wallet }>()
);

export const createWalletFailure = createAction(
  '[Wallet] Create Wallet Failure',
  props<{ error: string }>()
);

// Update wallet
export const updateWallet = createAction(
  '[Wallet] Update Wallet',
  props<{ id: string; wallet: UpdateWalletRequest }>()
);

export const updateWalletSuccess = createAction(
  '[Wallet] Update Wallet Success',
  props<{ wallet: Wallet }>()
);

export const updateWalletFailure = createAction(
  '[Wallet] Update Wallet Failure',
  props<{ error: string }>()
);

// Archive wallet
export const archiveWallet = createAction(
  '[Wallet] Archive Wallet',
  props<{ id: string }>()
);

export const archiveWalletSuccess = createAction(
  '[Wallet] Archive Wallet Success',
  props<{ walletId: string }>()
);

export const archiveWalletFailure = createAction(
  '[Wallet] Archive Wallet Failure',
  props<{ error: string }>()
);

// Set default wallet
export const setDefaultWallet = createAction(
  '[Wallet] Set Default Wallet',
  props<{ id: string }>()
);

export const setDefaultWalletSuccess = createAction(
  '[Wallet] Set Default Wallet Success',
  props<{ walletId: string }>()
);

export const setDefaultWalletFailure = createAction(
  '[Wallet] Set Default Wallet Failure',
  props<{ error: string }>()
);

// Reorder wallet
export const reorderWallet = createAction(
  '[Wallet] Reorder Wallet',
  props<{ id: string; newOrder: number }>()
);

export const reorderWalletSuccess = createAction(
  '[Wallet] Reorder Wallet Success',
  props<{ walletId: string; newOrder: number }>()
);

export const reorderWalletFailure = createAction(
  '[Wallet] Reorder Wallet Failure',
  props<{ error: string }>()
);

// Normalize display orders
export const normalizeDisplayOrders = createAction(
  '[Wallet] Normalize Display Orders'
);

export const normalizeDisplayOrdersSuccess = createAction(
  '[Wallet] Normalize Display Orders Success'
);

export const normalizeDisplayOrdersFailure = createAction(
  '[Wallet] Normalize Display Orders Failure',
  props<{ error: string }>()
);

// Utility actions
export const clearWalletError = createAction('[Wallet] Clear Error');

export const clearSelectedWallet = createAction('[Wallet] Clear Selected Wallet');
