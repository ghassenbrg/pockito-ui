import { Injectable } from '@angular/core';
import { Wallet } from '@api/model/wallet.model';
import { WalletGoalProgress, FormattedAmount } from '../models/wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletDisplayService {
  formatAmount(amount: number | undefined): FormattedAmount {
    if (!amount || amount === 0) {
      return { text: '0.00', color: '#1a202c' }; // Black
    }
    
    if (amount > 0) {
      return { text: `+${amount.toFixed(2)}`, color: '#10b981' }; // Green
    } else {
      return { text: `${amount.toFixed(2)}`, color: '#dc2626' }; // Red
    }
  }

  getGoalProgress(wallet: Wallet): WalletGoalProgress {
    const goalAmount = wallet.goalAmount ?? 0;
    const hasGoal = goalAmount > 0;
    
    if (!hasGoal) {
      return { hasGoal: false, progress: 0, isComplete: false };
    }
    
    const balance = wallet.balance ?? 0;
    const progress = Math.min((balance / goalAmount) * 100, 100);
    const isComplete = progress >= 100;
    
    return {
      hasGoal: true,
      progress: Math.round(progress),
      isComplete
    };
  }

  getWalletIconUrl(wallet: Wallet): string {
    return wallet.iconUrl || `assets/icons/${wallet.type}.png`;
  }

  getWalletTypeLabel(type: string): string {
    const typeLabels: Record<string, string> = {
      'BANK_ACCOUNT': 'Bank Account',
      'CASH': 'Cash',
      'CREDIT_CARD': 'Credit Card',
      'SAVINGS': 'Savings',
      'CUSTOM': 'Custom'
    };
    
    return typeLabels[type] || type;
  }

  getCurrencyLabel(currency: string): string {
    const currencyLabels: Record<string, string> = {
      'TND': 'TND (Tunisian Dinar)',
      'EUR': 'EUR (Euro)',
      'USD': 'USD (US Dollar)',
      'JPY': 'JPY (Japanese Yen)'
    };
    
    return currencyLabels[currency] || currency;
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
}
