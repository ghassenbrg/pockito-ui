import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';

interface Wallet {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  iconUrl?: string;
  goalAmount: number;
  type: string;
  isDefault: boolean;
  active: boolean;
}

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit {
  wallets: Wallet[] = [];
  isMobileView: boolean = false;

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadWallets();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  private checkScreenSize() {
    this.isMobileView = window.innerWidth <= 768;
  }

  setViewMode(isMobile: boolean) {
    this.isMobileView = isMobile;
  }

  createWallet() {
    // TODO: Implement wallet creation logic
    console.log('Create wallet clicked');
  }

  viewWallet(wallet: Wallet) {
    // TODO: Implement wallet view logic
    console.log('View wallet:', wallet.name);
  }

  editWallet(wallet: Wallet) {
    // TODO: Implement wallet edit logic
    console.log('Edit wallet:', wallet.name);
  }

  deleteWallet(wallet: Wallet) {
    // TODO: Implement wallet deletion logic
    if (confirm(`Are you sure you want to delete ${wallet.name}?`)) {
      console.log('Delete wallet:', wallet.name);
    }
  }

  makeDefault(wallet: Wallet) {
    // TODO: Implement make default logic
    console.log('Make default wallet:', wallet.name);
  }

  loadWallets(): void {
    this.wallets = [
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
      },
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
      },
    ];
  }

  getTotalBalance(): number {
    return this.wallets
      .filter((w) => w.active)
      .reduce((total, wallet) => total + wallet.balance, 0);
  }

  getActiveWalletsCount(): number {
    return this.wallets.filter((w) => w.active).length;
  }

  getWalletsByCurrency(): { [currency: string]: number } {
    const currencyTotals: { [currency: string]: number } = {};
    
    this.wallets
      .filter(w => w.active)
      .forEach(wallet => {
        if (currencyTotals[wallet.currency]) {
          currencyTotals[wallet.currency] += wallet.balance;
        } else {
          currencyTotals[wallet.currency] = wallet.balance;
        }
      });
    
    return currencyTotals;
  }

  getTotalGoals(): number {
    return this.wallets
      .filter(w => w.active && w.goalAmount > 0)
      .reduce((total, wallet) => total + wallet.goalAmount, 0);
  }

  getTotalInitialBalance(): number {
    return this.wallets
      .filter(w => w.active)
      .reduce((total, wallet) => total + wallet.initialBalance, 0);
  }

  getWalletsWithGoals(): Wallet[] {
    return this.wallets.filter(w => w.active && w.goalAmount > 0);
  }

  getGoalProgress(wallet: Wallet): number {
    if (wallet.goalAmount <= 0) return 0;
    return Math.min((wallet.balance / wallet.goalAmount) * 100, 100);
  }

  getWalletTypeCount(type: string): number {
    return this.wallets.filter(w => w.active && w.type === type).length;
  }

  getTotalNetWorth(): number {
    return this.wallets
      .filter(w => w.active)
      .reduce((total, wallet) => total + wallet.balance, 0);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/icons/wallet.png';
  }

  formatAmount(amount: number): { text: string; color: string } {
    if (amount > 0) {
      return { text: `+${amount.toFixed(2)}`, color: '#10b981' }; // Green
    } else if (amount < 0) {
      return { text: `${amount.toFixed(2)}`, color: '#dc2626' }; // Red
    } else {
      return { text: '0.00', color: '#1a202c' }; // Black
    }
  }
}
