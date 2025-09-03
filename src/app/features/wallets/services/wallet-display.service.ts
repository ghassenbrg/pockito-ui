import { Injectable } from '@angular/core';
import { Wallet } from '@api/model/wallet.model';
import { WalletGoalProgress, FormattedAmount } from '../models/wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletDisplayService {
  // Memoization cache for expensive operations
  private amountFormatCache = new Map<number, FormattedAmount>();
  private goalProgressCache = new Map<string, WalletGoalProgress>();
  private typeLabelCache = new Map<string, string>();
  private currencyLabelCache = new Map<string, string>();
  formatAmount(amount: number | undefined): FormattedAmount {
    if (!amount || amount === 0) {
      return { text: '0.00', color: '#1a202c' }; // Black
    }
    
    // Check cache first
    if (this.amountFormatCache.has(amount)) {
      return this.amountFormatCache.get(amount)!;
    }
    
    let result: FormattedAmount;
    if (amount > 0) {
      result = { text: `+${amount.toFixed(2)}`, color: '#10b981' }; // Green
    } else {
      result = { text: `${amount.toFixed(2)}`, color: '#dc2626' }; // Red
    }
    
    // Cache the result
    this.amountFormatCache.set(amount, result);
    return result;
  }

  getGoalProgress(wallet: Wallet): WalletGoalProgress {
    const goalAmount = wallet.goalAmount ?? 0;
    const hasGoal = goalAmount > 0;
    
    if (!hasGoal) {
      return { hasGoal: false, progress: 0, isComplete: false };
    }
    
    // Create cache key from wallet properties
    const cacheKey = `${wallet.id}-${wallet.balance}-${goalAmount}`;
    
    // Check cache first
    if (this.goalProgressCache.has(cacheKey)) {
      return this.goalProgressCache.get(cacheKey)!;
    }
    
    const balance = wallet.balance ?? 0;
    const progress = Math.min((balance / goalAmount) * 100, 100);
    const isComplete = progress >= 100;
    
    const result = {
      hasGoal: true,
      progress: Math.round(progress),
      isComplete
    };
    
    // Cache the result
    this.goalProgressCache.set(cacheKey, result);
    return result;
  }

  getWalletIconUrl(wallet: Wallet): string {
    return wallet.iconUrl || `assets/icons/${wallet.type}.png`;
  }

  getWalletTypeLabel(type: string): string {
    // Check cache first
    if (this.typeLabelCache.has(type)) {
      return this.typeLabelCache.get(type)!;
    }
    
    const typeLabels: Record<string, string> = {
      'BANK_ACCOUNT': 'Bank Account',
      'CASH': 'Cash',
      'CREDIT_CARD': 'Credit Card',
      'SAVINGS': 'Savings',
      'CUSTOM': 'Custom'
    };
    
    const result = typeLabels[type] || type;
    
    // Cache the result
    this.typeLabelCache.set(type, result);
    return result;
  }

  getCurrencyLabel(currency: string): string {
    // Check cache first
    if (this.currencyLabelCache.has(currency)) {
      return this.currencyLabelCache.get(currency)!;
    }
    
    const currencyLabels: Record<string, string> = {
      'TND': 'TND (Tunisian Dinar)',
      'EUR': 'EUR (Euro)',
      'USD': 'USD (US Dollar)',
      'JPY': 'JPY (Japanese Yen)'
    };
    
    const result = currencyLabels[currency] || currency;
    
    // Cache the result
    this.currencyLabelCache.set(currency, result);
    return result;
  }

  isWalletActive(wallet: Wallet): boolean {
    return wallet.active ?? true;
  }

  isWalletDefault(wallet: Wallet): boolean {
    return wallet.isDefault;
  }

  canMoveWalletUp(wallets: Wallet[], wallet: Wallet): boolean {
    const currentIndex = wallets.findIndex(w => w.id === wallet.id);
    return currentIndex > 0;
  }

  canMoveWalletDown(wallets: Wallet[], wallet: Wallet): boolean {
    const currentIndex = wallets.findIndex(w => w.id === wallet.id);
    return currentIndex < wallets.length - 1;
  }

  getWalletOrder(wallets: Wallet[], wallet: Wallet): number {
    return wallets.findIndex(w => w.id === wallet.id) + 1;
  }

  sortWalletsByOrder(wallets: Wallet[]): Wallet[] {
    return [...wallets].sort((a, b) => (a.orderPosition ?? 0) - (b.orderPosition ?? 0));
  }

  getActiveWallets(wallets: Wallet[]): Wallet[] {
    return wallets.filter(wallet => wallet.active ?? true);
  }

  getDefaultWallet(wallets: Wallet[]): Wallet | undefined {
    return wallets.find(wallet => wallet.isDefault);
  }

  getWalletsByType(wallets: Wallet[], type: string): Wallet[] {
    return wallets.filter(wallet => wallet.type === type);
  }

  getTotalBalance(wallets: Wallet[], currency?: string): number {
    let total = 0;
    
    wallets.forEach(wallet => {
      if (!currency || wallet.currency === currency) {
        total += wallet.balance ?? 0;
      }
    });
    
    return total;
  }

  // Cache management methods
  clearCache(): void {
    this.amountFormatCache.clear();
    this.goalProgressCache.clear();
    this.typeLabelCache.clear();
    this.currencyLabelCache.clear();
  }

  clearWalletCache(walletId: string): void {
    // Clear goal progress cache for specific wallet
    for (const key of this.goalProgressCache.keys()) {
      if (key.startsWith(walletId)) {
        this.goalProgressCache.delete(key);
      }
    }
  }
}
