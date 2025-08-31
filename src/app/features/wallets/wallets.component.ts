import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';
import { Wallet } from '../../api/model/wallet.model';
import { WalletService } from '../../api/services/wallet.service';

@Component({
  selector: 'app-wallets',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './wallets.component.html',
  styleUrl: './wallets.component.scss',
})
export class WalletsComponent implements OnInit, OnDestroy {
  wallets: Wallet[] = [];
  isMobileView: boolean = false;
  private walletsSubscription: Subscription = new Subscription();

  constructor(private walletService: WalletService) {}

  ngOnInit(): void {
    this.checkScreenSize();
    this.loadWallets();
    window.addEventListener('resize', () => this.checkScreenSize());
  }

  ngOnDestroy(): void {
    this.walletsSubscription.unsubscribe();
    window.removeEventListener('resize', () => this.checkScreenSize());
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
      const success = this.walletService.deleteWallet(wallet.id);
      if (success) {
        console.log('Wallet deleted successfully');
      } else {
        console.log('Failed to delete wallet');
      }
    }
  }

  makeDefault(wallet: Wallet) {
    const success = this.walletService.setDefaultWallet(wallet.id);
    if (success) {
      console.log('Default wallet updated successfully');
    } else {
      console.log('Failed to update default wallet');
    }
  }

  loadWallets(): void {
    this.walletsSubscription = this.walletService.getAllWallets().subscribe(
      (wallets: Wallet[]) => {
        this.wallets = wallets;
      }
    );
  }

  getGoalProgress(wallet: Wallet): number {
    return this.walletService.getGoalProgress(wallet);
  }

  onImageError(event: any): void {
    event.target.src = 'assets/icons/wallet.png';
  }

  // Reordering methods
  moveWalletUp(wallet: Wallet): void {
    this.walletService.moveWalletUp(wallet);
  }

  moveWalletDown(wallet: Wallet): void {
    this.walletService.moveWalletDown(wallet);
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
