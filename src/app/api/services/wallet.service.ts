import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { Wallet } from '../model/wallet.model';

@Injectable({
  providedIn: 'root'
})
export class WalletService {
  private walletsSubject = new BehaviorSubject<Wallet[]>([]);
  public wallets$ = this.walletsSubject.asObservable();

  private mockWallets: Wallet[] = [
    {
      id: 'b2c3d4e5-f678-9012-abcd-ef2345678901',
      name: 'Checking Account',
      initialBalance: 500,
      balance: 350,
      currency: 'TND',
      goalAmount: 0,
      type: 'BANK_ACCOUNT',
      isDefault: false,
      active: true,
      order: 2,
    },
    {
      id: 'c3d4e5f6-7890-1234-abcd-ef3456789012',
      name: 'Cash Wallet',
      initialBalance: 200,
      balance: 50,
      currency: 'EUR',
      goalAmount: 0,
      type: 'CASH',
      isDefault: false,
      active: true,
      order: 3,
    },
    {
      id: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
      name: 'Personal Savings',
      initialBalance: 1000,
      balance: 1200,
      currency: 'EUR',
      goalAmount: 5000,
      type: 'SAVINGS',
      isDefault: true,
      active: true,
      order: 1,
    },
    {
      id: 'd4e5f678-9012-3456-abcd-ef4567890123',
      name: 'Credit Card',
      initialBalance: 0,
      balance: -300,
      currency: 'JPY',
      goalAmount: 0,
      type: 'CREDIT_CARD',
      isDefault: false,
      active: true,
      order: 4,
    },
    {
      id: 'e5f67890-1234-5678-abcd-ef5678901234',
      name: 'BNP Paribas',
      initialBalance: 0,
      balance: 3000,
      currency: 'EUR',
      iconUrl:
        'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcT42lVhmZycuWMxA0-9Dhx3Vi3-B9YVDPZAjA&s',
      goalAmount: 2000,
      type: 'CUSTOM',
      isDefault: false,
      active: true,
      order: 5,
    },
    {
      id: 'f6f78901-2345-6789-abcd-ef6789012345',
      name: 'Vacation Fund',
      initialBalance: 0,
      balance: 0,
      currency: 'EUR',
      goalAmount: 2000,
      type: 'CUSTOM',
      isDefault: false,
      active: false,
      order: 6,
    },
  ];

  constructor() {
    this.initializeWallets();
  }

  private initializeWallets(): void {
    // Sort wallets by order
    const sortedWallets = [...this.mockWallets].sort((a, b) => a.order - b.order);
    this.walletsSubject.next(sortedWallets);
  }

  // CRUD Operations
  getAllWallets(): Observable<Wallet[]> {
    return this.wallets$;
  }



  deleteWallet(id: string): boolean {
    const currentWallets = this.walletsSubject.value;
    const filteredWallets = currentWallets.filter(wallet => wallet.id !== id);
    
    if (filteredWallets.length === currentWallets.length) {
      return false; // Wallet not found
    }
    
    this.walletsSubject.next(filteredWallets);
    this.updateWalletOrders();
    return true;
  }

  getGoalProgress(wallet: Wallet): number {
    if ((wallet.goalAmount ?? 0) <= 0) return 0;
    return Math.min((wallet.balance / (wallet.goalAmount ?? 1)) * 100, 100);
  }

  // Reordering Methods
  moveWalletUp(wallet: Wallet): void {
    const currentWallets = this.walletsSubject.value;
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex > 0) {
      // Swap with the wallet above
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex - 1];
      currentWallets[currentIndex - 1] = temp;
      
      // Update order values
      this.updateWalletOrders();
      this.walletsSubject.next([...currentWallets]);
    }
  }

  moveWalletDown(wallet: Wallet): void {
    const currentWallets = this.walletsSubject.value;
    const currentIndex = currentWallets.findIndex(w => w.id === wallet.id);
    
    if (currentIndex < currentWallets.length - 1) {
      // Swap with the wallet below
      const temp = currentWallets[currentIndex];
      currentWallets[currentIndex] = currentWallets[currentIndex + 1];
      currentWallets[currentIndex + 1] = temp;
      
      // Update order values
      this.updateWalletOrders();
      this.walletsSubject.next([...currentWallets]);
    }
  }

  private updateWalletOrders(): void {
    const currentWallets = this.walletsSubject.value;
    currentWallets.forEach((wallet, index) => {
      wallet.order = index + 1;
    });
  }

  // Default wallet management
  setDefaultWallet(id: string): boolean {
    const currentWallets = this.walletsSubject.value;
    
    // Remove default from all wallets
    currentWallets.forEach(wallet => {
      wallet.isDefault = false;
    });
    
    // Set the specified wallet as default
    const targetWallet = currentWallets.find(wallet => wallet.id === id);
    if (targetWallet) {
      targetWallet.isDefault = true;
      this.walletsSubject.next([...currentWallets]);
      return true;
    }
    
    return false;
  }


}
