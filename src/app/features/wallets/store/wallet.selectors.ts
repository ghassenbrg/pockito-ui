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

export const selectIsLoading = createSelector(
  selectWalletState,
  (state: WalletState) => state.isLoading
);

export const selectError = createSelector(
  selectWalletState,
  (state: WalletState) => state.error
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
