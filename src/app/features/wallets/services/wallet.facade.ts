import { Injectable } from '@angular/core';
import { Store } from '@ngrx/store';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';
import { Wallet, WalletDto } from '@api/model/wallet.model';
import { WalletFormData } from '../models/wallet.types';
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
  isLoading$ = this.store.select(WalletSelectors.selectIsLoading);
  error$ = this.store.select(WalletSelectors.selectError);

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

  createWallet(walletData: WalletFormData): void {
    const walletToCreate: WalletDto = {
      name: walletData.name!,
      initialBalance: 0,
      balance: 0,
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

  setViewMode(viewMode: 'cards' | 'list'): void {
    this.store.dispatch(WalletActions.setViewMode({ viewMode }));
  }

  clearError(): void {
    this.store.dispatch(WalletActions.clearError());
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
}
