import { createFeatureSelector, createSelector } from '@ngrx/store';
import { WalletState } from './wallet.state';

export const selectWalletState = createFeatureSelector<WalletState>('wallets');

export const selectAllWallets = createSelector(
  selectWalletState,
  (state: WalletState) => state.wallets
);

export const selectSelectedWallet = createSelector(
  selectWalletState,
  (state: WalletState) => state.selectedWallet
);

export const selectWalletsLoading = createSelector(
  selectWalletState,
  (state: WalletState) => state.loading
);

export const selectWalletsError = createSelector(
  selectWalletState,
  (state: WalletState) => state.error
);

export const selectWalletCreating = createSelector(
  selectWalletState,
  (state: WalletState) => state.creating
);

export const selectWalletUpdating = createSelector(
  selectWalletState,
  (state: WalletState) => state.updating
);

export const selectWalletArchiving = createSelector(
  selectWalletState,
  (state: WalletState) => state.archiving
);

export const selectWalletSettingDefault = createSelector(
  selectWalletState,
  (state: WalletState) => state.settingDefault
);

export const selectDefaultWallet = createSelector(
  selectAllWallets,
  (wallets) => wallets.find(wallet => wallet.isDefault)
);

export const selectWalletsByType = createSelector(
  selectAllWallets,
  (wallets) => (type: string) => wallets.filter(wallet => wallet.type === type)
);

export const selectWalletsCount = createSelector(
  selectAllWallets,
  (wallets) => wallets.length
);
