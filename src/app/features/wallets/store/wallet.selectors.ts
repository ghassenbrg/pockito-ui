import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.state';

export const selectWalletState = createFeatureSelector<WalletState>('wallet');

// Basic selectors
export const selectWallets = createSelector(
  selectWalletState,
  (state: WalletState) => state.wallets
);

export const selectSelectedWallet = createSelector(
  selectWalletState,
  (state: WalletState) => state.selectedWallet
);

export const selectViewMode = createSelector(
  selectWalletState,
  (state: WalletState) => state.viewMode
);

// Loading state selectors
export const selectIsLoading = createSelector(
  selectWalletState,
  (state: WalletState) => state.isLoading
);

export const selectLoadingStates = createSelector(
  selectWalletState,
  (state: WalletState) => state.loadingStates
);

export const selectIsLoadingOperation = (operation: string) => createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates[operation as keyof typeof loadingStates] || false
);

export const selectIsLoadingWallets = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadWallets
);

export const selectIsLoadingWalletById = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadWalletById
);

export const selectIsCreatingWallet = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.createWallet
);

export const selectIsUpdatingWallet = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.updateWallet
);

export const selectIsDeletingWallet = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.deleteWallet
);

export const selectIsSettingDefaultWallet = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.setDefaultWallet
);

export const selectIsMovingWalletUp = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.moveWalletUp
);

export const selectIsMovingWalletDown = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.moveWalletDown
);

// Error state selectors
export const selectError = createSelector(
  selectWalletState,
  (state: WalletState) => state.error
);

export const selectOperationErrors = createSelector(
  selectWalletState,
  (state: WalletState) => state.operationErrors
);

export const selectOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => operationErrors[operation as keyof typeof operationErrors] || null
);

export const selectHasAnyError = createSelector(
  selectWalletState,
  (state: WalletState) => !!state.error || Object.values(state.operationErrors).some(error => !!error)
);

export const selectHasOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => !!operationErrors[operation as keyof typeof operationErrors]
);

// Success state selectors
export const selectLastSuccessfulOperation = createSelector(
  selectWalletState,
  (state: WalletState) => state.lastSuccessfulOperation
);

export const selectHasSuccessfulOperation = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => !!lastSuccessfulOperation.type
);

export const selectSuccessfulOperationType = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.type
);

export const selectSuccessfulOperationTimestamp = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.timestamp
);

// Computed selectors
export const selectActiveWallets = createSelector(
  selectWallets,
  (wallets) => wallets.filter(wallet => wallet.active)
);

export const selectDefaultWallet = createSelector(
  selectWallets,
  (wallets) => wallets.find(wallet => wallet.isDefault)
);

export const selectSortedWallets = createSelector(
  selectWallets,
  (wallets) => [...wallets].sort((a, b) => (a.orderPosition || 0) - (b.orderPosition || 0))
);

export const selectTotalBalance = createSelector(
  selectWallets,
  (wallets) => wallets.reduce((total, wallet) => total + (wallet.balance || 0), 0)
);

export const selectWalletsByType = (type: string) => createSelector(
  selectWallets,
  (wallets) => wallets.filter(wallet => wallet.type === type)
);

export const selectWalletById = (id: string) => createSelector(
  selectWallets,
  (wallets) => wallets.find(wallet => wallet.id === id)
);

export const selectCanMoveWalletUp = (walletId: string) => createSelector(
  selectSortedWallets,
  (wallets) => {
    const walletIndex = wallets.findIndex(w => w.id === walletId);
    return walletIndex > 0;
  }
);

export const selectCanMoveWalletDown = (walletId: string) => createSelector(
  selectSortedWallets,
  (wallets) => {
    const walletIndex = wallets.findIndex(w => w.id === walletId);
    return walletIndex < wallets.length - 1;
  }
);

// Combined loading and error selectors for specific operations
export const selectWalletOperationState = (operation: string) => createSelector(
  selectIsLoadingOperation(operation),
  selectOperationError(operation),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectCreateWalletState = createSelector(
  selectIsCreatingWallet,
  selectOperationError('createWallet'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectUpdateWalletState = createSelector(
  selectIsUpdatingWallet,
  selectOperationError('updateWallet'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectLoadWalletByIdState = createSelector(
  selectIsLoadingWalletById,
  selectOperationError('loadWalletById'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);
