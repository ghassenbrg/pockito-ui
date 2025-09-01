import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Wallet } from '../../../api/model/wallet.model';
import { WalletService } from '../../../api/services/wallet.service';
import { WalletFormData } from '../models/wallet.types';

@Injectable({
  providedIn: 'root'
})
export class WalletActionsService {
  constructor(
    private walletService: WalletService,
    private router: Router
  ) {}

  createWallet(walletData: WalletFormData): boolean {
    const walletToCreate = {
      name: walletData.name!,
      initialBalance: 0, // Default value, will be calculated from transactions
      balance: 0, // Default value, will be calculated from transactions
      currency: walletData.currency!,
      type: walletData.type!,
      goalAmount: walletData.goalAmount,
      isDefault: walletData.isDefault!,
      active: walletData.active!,
      iconUrl: walletData.iconUrl,
      description: walletData.description,
      color: walletData.color,
      order: 0
    };

    const success = this.walletService.createWallet(walletToCreate);
    if (success) {
      this.navigateToWallets();
      return true;
    }
    return false;
  }

  updateWallet(existingWallet: Wallet, walletData: WalletFormData): boolean {
    const updatedWallet: Wallet = {
      ...existingWallet,
      ...walletData
    };
    
    const success = this.walletService.updateWallet(updatedWallet);
    if (success) {
      this.navigateToWallets();
      return true;
    }
    return false;
  }

  deleteWallet(wallet: Wallet): boolean {
    if (this.confirmDeletion(wallet.name)) {
      const success = this.walletService.deleteWallet(wallet.id);
      return success;
    }
    return false;
  }

  setDefaultWallet(wallet: Wallet): boolean {
    return this.walletService.setDefaultWallet(wallet.id);
  }

  moveWalletUp(wallet: Wallet): void {
    this.walletService.moveWalletUp(wallet);
  }

  moveWalletDown(wallet: Wallet): void {
    this.walletService.moveWalletDown(wallet);
  }

  navigateToCreateWallet(): void {
    this.router.navigate(['/app/wallets/new']);
  }

  navigateToEditWallet(walletId: string): void {
    this.router.navigate(['/app/wallets/edit', walletId]);
  }

  navigateToWallets(): void {
    this.router.navigate(['/app/wallets']);
  }

  navigateToWalletView(_walletId: string): void {
    // TODO: Implement wallet view navigation when feature is ready
    // this.router.navigate(['/app/wallets/view', _walletId]);
  }

  private confirmDeletion(walletName: string): boolean {
    return confirm(`Are you sure you want to delete ${walletName}?`);
  }

  canDeleteWallet(wallet: Wallet): boolean {
    // Add business logic for when a wallet can be deleted
    // For example, wallets with transactions might not be deletable
    return wallet.active; // Simple example - can be enhanced
  }

  canEditWallet(wallet: Wallet): boolean {
    // Add business logic for when a wallet can be edited
    return wallet.active; // Simple example - can be enhanced
  }

  canSetDefaultWallet(wallet: Wallet): boolean {
    // Add business logic for when a wallet can be set as default
    return wallet.active && !wallet.isDefault;
  }

  getWalletActions(wallet: Wallet): {
    canView: boolean;
    canEdit: boolean;
    canDelete: boolean;
    canSetDefault: boolean;
    canMoveUp: boolean;
    canMoveDown: boolean;
  } {
    return {
      canView: true, // Always can view
      canEdit: this.canEditWallet(wallet),
      canDelete: this.canDeleteWallet(wallet),
      canSetDefault: this.canSetDefaultWallet(wallet),
      canMoveUp: true, // Will be checked against wallet list
      canMoveDown: true // Will be checked against wallet list
    };
  }
}
