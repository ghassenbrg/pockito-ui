import { Injectable } from '@angular/core';
import { Wallet } from '@api/model/wallet.model';
import { WalletGoalProgress, FormattedAmount } from '../models/wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletDisplayService {
  // Memoization cache for expensive operations
  private amountFormatCache = new Map<string, FormattedAmount>();
  private goalProgressCache = new Map<string, WalletGoalProgress>();
  private typeLabelCache = new Map<string, string>();
  private currencyLabelCache = new Map<string, string>();
  formatAmount(amount: number | undefined, currency: string = 'USD'): FormattedAmount {
    if (!amount || amount === 0) {
      return { text: '0.00', color: '#1a202c' }; // Black
    }
    
    // Check cache first
    const cacheKey = `${amount}-${currency}`;
    if (this.amountFormatCache.has(cacheKey)) {
      return this.amountFormatCache.get(cacheKey)!;
    }
    
    let result: FormattedAmount;
    const formattedAmount = new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      currencyDisplay: 'code'
    }).format(Math.abs(amount));
    
    if (amount > 0) {
      result = { text: `+${formattedAmount}`, color: '#10b981' }; // Green
    } else {
      result = { text: `-${formattedAmount}`, color: '#dc2626' }; // Red
    }
    
    // Cache the result
    this.amountFormatCache.set(cacheKey, result);
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

  // Color utilities for wallet theming
  getWalletColor(wallet: Wallet): string {
    return wallet.color || this.getDefaultWalletColor(wallet.type);
  }

  getDefaultWalletColor(type: string): string {
    const defaultColors: Record<string, string> = {
      'BANK_ACCOUNT': '#2563eb', // Blue
      'CASH': '#10b981', // Green
      'CREDIT_CARD': '#f59e0b', // Amber
      'SAVINGS': '#8b5cf6', // Purple
      'CUSTOM': '#6b7280' // Gray
    };
    return defaultColors[type] || '#6b7280';
  }

  getWalletColorVariants(color: string): { primary: string; light: string; dark: string; gradient: string } {
    // Convert hex to RGB for manipulation
    const hex = color.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Create lighter variant (20% opacity on white)
    const lightR = Math.round(r + (255 - r) * 0.8);
    const lightG = Math.round(g + (255 - g) * 0.8);
    const lightB = Math.round(b + (255 - b) * 0.8);

    // Create darker variant (20% darker)
    const darkR = Math.round(r * 0.8);
    const darkG = Math.round(g * 0.8);
    const darkB = Math.round(b * 0.8);

    return {
      primary: color,
      light: `rgb(${lightR}, ${lightG}, ${lightB})`,
      dark: `rgb(${darkR}, ${darkG}, ${darkB})`,
      gradient: `linear-gradient(135deg, ${color}, rgb(${darkR}, ${darkG}, ${darkB}))`
    };
  }

  getContrastColor(backgroundColor: string): string {
    // Convert hex to RGB
    const hex = backgroundColor.replace('#', '');
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);

    // Calculate luminance
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    
    // Return white or black based on luminance
    return luminance > 0.5 ? '#000000' : '#ffffff';
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
