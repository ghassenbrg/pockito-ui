import { createAction, props } from '@ngrx/store';
import { Wallet, WalletDto } from '@api/model/wallet.model';

// Load Wallets
export const loadWallets = createAction('[Wallet] Load Wallets');
export const loadWalletsSuccess = createAction(
  '[Wallet] Load Wallets Success',
  props<{ wallets: Wallet[] }>()
);
export const loadWalletsFailure = createAction(
  '[Wallet] Load Wallets Failure',
  props<{ error: string }>()
);

// Load Single Wallet by ID
export const loadWalletById = createAction(
  '[Wallet] Load Wallet By ID',
  props<{ walletId: string }>()
);
export const loadWalletByIdSuccess = createAction(
  '[Wallet] Load Wallet By ID Success',
  props<{ wallet: Wallet }>()
);
export const loadWalletByIdFailure = createAction(
  '[Wallet] Load Wallet By ID Failure',
  props<{ error: string }>()
);

// Create Wallet
export const createWallet = createAction(
  '[Wallet] Create Wallet',
  props<{ walletData: WalletDto }>()
);
export const createWalletSuccess = createAction(
  '[Wallet] Create Wallet Success',
  props<{ wallet: Wallet }>()
);
export const createWalletFailure = createAction(
  '[Wallet] Create Wallet Failure',
  props<{ error: string }>()
);

// Update Wallet
export const updateWallet = createAction(
  '[Wallet] Update Wallet',
  props<{ walletId: string; walletData: Partial<WalletDto> }>()
);
export const updateWalletSuccess = createAction(
  '[Wallet] Update Wallet Success',
  props<{ wallet: Wallet }>()
);
export const updateWalletFailure = createAction(
  '[Wallet] Update Wallet Failure',
  props<{ error: string }>()
);

// Delete Wallet
export const deleteWallet = createAction(
  '[Wallet] Delete Wallet',
  props<{ wallet: Wallet }>()
);
export const deleteWalletSuccess = createAction(
  '[Wallet] Delete Wallet Success',
  props<{ walletId: string }>()
);
export const deleteWalletFailure = createAction(
  '[Wallet] Delete Wallet Failure',
  props<{ error: string }>()
);

// Set Default Wallet
export const setDefaultWallet = createAction(
  '[Wallet] Set Default Wallet',
  props<{ wallet: Wallet }>()
);
export const setDefaultWalletSuccess = createAction(
  '[Wallet] Set Default Wallet Success',
  props<{ wallet: Wallet }>()
);
export const setDefaultWalletFailure = createAction(
  '[Wallet] Set Default Wallet Failure',
  props<{ error: string }>()
);

// Move Wallet
export const moveWalletUp = createAction(
  '[Wallet] Move Wallet Up',
  props<{ wallet: Wallet }>()
);
export const moveWalletUpSuccess = createAction(
  '[Wallet] Move Wallet Up Success',
  props<{ wallets: Wallet[] }>()
);
export const moveWalletUpFailure = createAction(
  '[Wallet] Move Wallet Up Failure',
  props<{ error: string }>()
);

export const moveWalletDown = createAction(
  '[Wallet] Move Wallet Down',
  props<{ wallet: Wallet }>()
);
export const moveWalletDownSuccess = createAction(
  '[Wallet] Move Wallet Down Success',
  props<{ wallets: Wallet[] }>()
);
export const moveWalletDownFailure = createAction(
  '[Wallet] Move Wallet Down Failure',
  props<{ error: string }>()
);

// UI State
export const setSelectedWallet = createAction(
  '[Wallet] Set Selected Wallet',
  props<{ wallet: Wallet | null }>()
);

export const setViewMode = createAction(
  '[Wallet] Set View Mode',
  props<{ viewMode: 'cards' | 'list' }>()
);

// Enhanced error handling actions
export const clearError = createAction('[Wallet] Clear Error');
export const clearOperationError = createAction(
  '[Wallet] Clear Operation Error',
  props<{ operation: string }>()
);
export const clearAllErrors = createAction('[Wallet] Clear All Errors');

// Success tracking actions
export const clearSuccessState = createAction('[Wallet] Clear Success State');

// Loading state management actions
export const setGlobalLoading = createAction(
  '[Wallet] Set Global Loading',
  props<{ isLoading: boolean }>()
);
export const setOperationLoading = createAction(
  '[Wallet] Set Operation Loading',
  props<{ operation: string; isLoading: boolean }>()
);
