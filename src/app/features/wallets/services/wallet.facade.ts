import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Wallet, WalletDto } from '@api/model/wallet.model';
import { WalletFormData, ViewMode } from '../models/wallet.types';
import * as WalletActions from '../store/wallet.actions';
import * as WalletSelectors from '../store/wallet.selectors';

@Injectable({
  providedIn: 'root'
})
export class WalletFacade {
  // State selectors
  wallets$ = this.store.select(WalletSelectors.selectWallets);
  selectedWallet$ = this.store.select(WalletSelectors.selectSelectedWallet);
  viewMode$ = this.store.select(WalletSelectors.selectViewMode);
  
  // Loading state selectors
  isLoading$ = this.store.select(WalletSelectors.selectIsLoading);
  loadingStates$ = this.store.select(WalletSelectors.selectLoadingStates);
  
  // Operation-specific loading selectors
  isCreatingWallet$ = this.store.select(WalletSelectors.selectIsCreatingWallet);
  isUpdatingWallet$ = this.store.select(WalletSelectors.selectIsUpdatingWallet);
  isDeletingWallet$ = this.store.select(WalletSelectors.selectIsDeletingWallet);
  isSettingDefaultWallet$ = this.store.select(WalletSelectors.selectIsSettingDefaultWallet);
  isMovingWalletUp$ = this.store.select(WalletSelectors.selectIsMovingWalletUp);
  isMovingWalletDown$ = this.store.select(WalletSelectors.selectIsMovingWalletDown);
  isLoadingWalletById$ = this.store.select(WalletSelectors.selectIsLoadingWalletById);
  
  // Error state selectors
  error$ = this.store.select(WalletSelectors.selectError);
  operationErrors$ = this.store.select(WalletSelectors.selectOperationErrors);
  hasAnyError$ = this.store.select(WalletSelectors.selectHasAnyError);
  
  // Success state selectors
  lastSuccessfulOperation$ = this.store.select(WalletSelectors.selectLastSuccessfulOperation);
  hasSuccessfulOperation$ = this.store.select(WalletSelectors.selectHasSuccessfulOperation);
  successfulOperationType$ = this.store.select(WalletSelectors.selectSuccessfulOperationType);
  
  // Combined operation state selectors
  createWalletState$ = this.store.select(WalletSelectors.selectCreateWalletState);
  updateWalletState$ = this.store.select(WalletSelectors.selectUpdateWalletState);
  loadWalletByIdState$ = this.store.select(WalletSelectors.selectLoadWalletByIdState);
  
  // Computed selectors
  activeWallets$ = this.store.select(WalletSelectors.selectActiveWallets);
  defaultWallet$ = this.store.select(WalletSelectors.selectDefaultWallet);
  sortedWallets$ = this.store.select(WalletSelectors.selectSortedWallets);
  totalBalance$ = this.store.select(WalletSelectors.selectTotalBalance);

  constructor(
    private store: Store,
    private router: Router
  ) {}

  // Actions
  loadWallets(): void {
    this.store.dispatch(WalletActions.loadWallets());
  }

  loadWalletById(walletId: string): void {
    this.store.dispatch(WalletActions.loadWalletById({ walletId }));
  }

  createWallet(walletData: WalletFormData): void {
    const walletToCreate: WalletDto = {
      name: walletData.name!,
      initialBalance: walletData.initialBalance,
      currency: walletData.currency!,
      type: walletData.type!,
      goalAmount: walletData.goalAmount,
      isDefault: walletData.isDefault!,
      active: walletData.active!,
      iconUrl: walletData.iconUrl,
      description: walletData.description,
      color: walletData.color,
      orderPosition: 0
    };
    this.store.dispatch(WalletActions.createWallet({ walletData: walletToCreate }));
  }

  updateWallet(walletId: string, walletData: WalletFormData): void {
    this.store.dispatch(WalletActions.updateWallet({ walletId, walletData }));
  }

  deleteWallet(wallet: Wallet): void {
    this.store.dispatch(WalletActions.deleteWallet({ wallet }));
  }

  setDefaultWallet(wallet: Wallet): void {
    this.store.dispatch(WalletActions.setDefaultWallet({ wallet }));
  }

  moveWalletUp(wallet: Wallet): void {
    this.store.dispatch(WalletActions.moveWalletUp({ wallet }));
  }

  moveWalletDown(wallet: Wallet): void {
    this.store.dispatch(WalletActions.moveWalletDown({ wallet }));
  }

  setSelectedWallet(wallet: Wallet | null): void {
    this.store.dispatch(WalletActions.setSelectedWallet({ wallet }));
  }

  setViewMode(viewMode: ViewMode): void {
    this.store.dispatch(WalletActions.setViewMode({ viewMode }));
  }

  // Enhanced error handling methods
  clearError(): void {
    this.store.dispatch(WalletActions.clearError());
  }

  clearOperationError(operation: string): void {
    this.store.dispatch(WalletActions.clearOperationError({ operation }));
  }

  clearAllErrors(): void {
    this.store.dispatch(WalletActions.clearAllErrors());
  }

  // Success state management
  clearSuccessState(): void {
    this.store.dispatch(WalletActions.clearSuccessState());
  }

  // Loading state management
  setGlobalLoading(isLoading: boolean): void {
    this.store.dispatch(WalletActions.setGlobalLoading({ isLoading }));
  }

  setOperationLoading(operation: string, isLoading: boolean): void {
    this.store.dispatch(WalletActions.setOperationLoading({ operation, isLoading }));
  }

  // Navigation methods
  navigateToCreateWallet(): void {
    this.router.navigate(['/app/wallets/new']);
  }

  navigateToEditWallet(walletId: string): void {
    this.router.navigate(['/app/wallets/edit', walletId]);
  }

  navigateToWallets(): void {
    this.router.navigate(['/app/wallets']);
  }

  navigateToWalletView(walletId: string): void {
    this.router.navigate(['/app/wallets/view', walletId]);
  }

  // Utility methods
  getWalletsByType(type: string): Observable<Wallet[]> {
    return this.store.select(WalletSelectors.selectWalletsByType(type));
  }

  getWalletById(id: string): Observable<Wallet | undefined> {
    return this.store.select(WalletSelectors.selectWalletById(id));
  }

  canMoveWalletUp(walletId: string): Observable<boolean> {
    return this.store.select(WalletSelectors.selectCanMoveWalletUp(walletId));
  }

  canMoveWalletDown(walletId: string): Observable<boolean> {
    return this.store.select(WalletSelectors.selectCanMoveWalletDown(walletId));
  }

  canDeleteWallet(wallet: Wallet): boolean {
    // Add business logic for when a wallet can be deleted
    // For example, wallets with transactions might not be deletable
    return wallet.active ?? true;
  }

  // Helper methods for checking operation states
  getOperationState(operation: string): Observable<{ isLoading: boolean; error: string | null; hasError: boolean }> {
    return this.store.select(WalletSelectors.selectWalletOperationState(operation));
  }

  hasOperationError(operation: string): Observable<boolean> {
    return this.store.select(WalletSelectors.selectHasOperationError(operation));
  }
}
