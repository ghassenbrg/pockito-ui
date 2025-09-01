import { Injectable } from '@angular/core';
import { BehaviorSubject, map } from 'rxjs';
import { Wallet } from '../../../api/model/wallet.model';
import { WalletService } from '../../../api/services/wallet.service';
import { WalletDisplayService } from './wallet-display.service';

export interface WalletState {
  wallets: Wallet[];
  isLoading: boolean;
  error: string | null;
  selectedWallet: Wallet | null;
  viewMode: 'cards' | 'list';
}

@Injectable({
  providedIn: 'root'
})
export class WalletStateService {
  private stateSubject = new BehaviorSubject<WalletState>({
    wallets: [],
    isLoading: false,
    error: null,
    selectedWallet: null,
    viewMode: 'cards'
  });

  public state$ = this.stateSubject.asObservable();
  public wallets$ = this.state$.pipe(map(state => state.wallets));
  public isLoading$ = this.state$.pipe(map(state => state.isLoading));
  public error$ = this.state$.pipe(map(state => state.error));
  public selectedWallet$ = this.state$.pipe(map(state => state.selectedWallet));
  public viewMode$ = this.state$.pipe(map(state => state.viewMode));

  // Computed observables
  public activeWallets$ = this.wallets$.pipe(
    map(wallets => this.walletDisplayService.getActiveWallets(wallets))
  );

  public defaultWallet$ = this.wallets$.pipe(
    map(wallets => this.walletDisplayService.getDefaultWallet(wallets))
  );

  public sortedWallets$ = this.wallets$.pipe(
    map(wallets => this.walletDisplayService.sortWalletsByOrder(wallets))
  );

  public totalBalance$ = this.wallets$.pipe(
    map(wallets => this.walletDisplayService.getTotalBalance(wallets))
  );

  constructor(
    private walletService: WalletService,
    private walletDisplayService: WalletDisplayService
  ) {
    this.initializeWallets();
  }

  private initializeWallets(): void {
    this.setLoading(true);
    this.walletService.getAllWallets().subscribe({
      next: (wallets) => {
        this.updateState({ wallets, isLoading: false, error: null });
      },
      error: (error) => {
        this.updateState({ 
          wallets: [], 
          isLoading: false, 
          error: error.message || 'Failed to load wallets' 
        });
      }
    });
  }

  // State update methods
  private updateState(updates: Partial<WalletState>): void {
    const currentState = this.stateSubject.value;
    this.stateSubject.next({ ...currentState, ...updates });
  }

  setLoading(isLoading: boolean): void {
    this.updateState({ isLoading });
  }

  setError(error: string | null): void {
    this.updateState({ error });
  }

  setSelectedWallet(wallet: Wallet | null): void {
    this.updateState({ selectedWallet: wallet });
  }

  setViewMode(viewMode: 'cards' | 'list'): void {
    this.updateState({ viewMode });
  }

  // Wallet operations
  addWallet(wallet: Wallet): void {
    const currentWallets = this.stateSubject.value.wallets;
    const updatedWallets = [...currentWallets, wallet];
    this.updateState({ wallets: updatedWallets });
  }

  updateWallet(updatedWallet: Wallet): void {
    const currentWallets = this.stateSubject.value.wallets;
    const updatedWallets = currentWallets.map(wallet => 
      wallet.id === updatedWallet.id ? updatedWallet : wallet
    );
    this.updateState({ wallets: updatedWallets });
  }

  removeWallet(walletId: string): void {
    const currentWallets = this.stateSubject.value.wallets;
    const updatedWallets = currentWallets.filter(wallet => wallet.id !== walletId);
    this.updateState({ wallets: updatedWallets });
  }

  // Reordering operations
  moveWalletUp(wallet: Wallet): void {
    const currentWallets = [...this.stateSubject.value.wallets];
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex > 0) {
      // Swap with the wallet above
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex - 1];
      currentWallets[currentIndex - 1] = temp;
      
      // Update order values
      this.updateWalletOrders(currentWallets);
      this.updateState({ wallets: currentWallets });
    }
  }

  moveWalletDown(wallet: Wallet): void {
    const currentWallets = [...this.stateSubject.value.wallets];
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex < currentWallets.length - 1) {
      // Swap with the wallet below
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex + 1];
      currentWallets[currentIndex + 1] = temp;
      
      // Update order values
      this.updateWalletOrders(currentWallets);
      this.updateState({ wallets: currentWallets });
    }
  }

  private updateWalletOrders(wallets: Wallet[]): void {
    wallets.forEach((wallet, index) => {
      wallet.order = index + 1;
    });
  }

  // Default wallet management
  setDefaultWallet(walletId: string): void {
    const currentWallets = this.stateSubject.value.wallets.map(wallet => ({
      ...wallet,
      isDefault: wallet.id === walletId
    }));
    this.updateState({ wallets: currentWallets });
  }

  // Utility methods
  getWalletById(id: string): Wallet | undefined {
    return this.stateSubject.value.wallets.find(wallet => wallet.id === id);
  }

  getWalletsByType(type: string): Wallet[] {
    return this.walletDisplayService.getWalletsByType(this.stateSubject.value.wallets, type);
  }

  refreshWallets(): void {
    this.initializeWallets();
  }

  clearError(): void {
    this.updateState({ error: null });
  }

  // State selectors
  getCurrentState(): WalletState {
    return this.stateSubject.value;
  }

  getCurrentWallets(): Wallet[] {
    return this.stateSubject.value.wallets;
  }

  getCurrentViewMode(): 'cards' | 'list' {
    return this.stateSubject.value.viewMode;
  }
}
