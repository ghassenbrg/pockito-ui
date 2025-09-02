import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { Wallet } from '@api/model/wallet.model';
import { WalletDisplayService } from '../../services/wallet-display.service';

import { WalletGoalProgress, FormattedAmount } from '../../models/wallet.types';

@Component({
  selector: 'app-wallet-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './wallet-card.component.html',
  styleUrl: './wallet-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class WalletCardComponent {
  @Input() wallet!: Wallet;
  @Input() canMoveUp: boolean = false;
  @Input() canMoveDown: boolean = false;
  
  @Output() viewWallet = new EventEmitter<Wallet>();
  @Output() editWallet = new EventEmitter<Wallet>();
  @Output() deleteWallet = new EventEmitter<Wallet>();
  @Output() makeDefault = new EventEmitter<Wallet>();
  @Output() moveUp = new EventEmitter<Wallet>();
  @Output() moveDown = new EventEmitter<Wallet>();

  constructor(
    private walletDisplayService: WalletDisplayService
  ) {}

  getWalletIconUrl(): string {
    return this.walletDisplayService.getWalletIconUrl(this.wallet);
  }

  getGoalProgress(): WalletGoalProgress {
    return this.walletDisplayService.getGoalProgress(this.wallet);
  }

  formatAmount(amount: number | undefined): FormattedAmount {
    return this.walletDisplayService.formatAmount(amount);
  }

  getWalletTypeLabel(): string {
    return this.walletDisplayService.getWalletTypeLabel(this.wallet.type);
  }

  isWalletActive(): boolean {
    return this.walletDisplayService.isWalletActive(this.wallet);
  }

  isWalletDefault(): boolean {
    return this.walletDisplayService.isWalletDefault(this.wallet);
  }



  onImageError(event: any): void {
    event.target.src = 'assets/icons/wallet.png';
  }

  onViewWallet(): void {
    this.viewWallet.emit(this.wallet);
  }

  onEditWallet(): void {
    this.editWallet.emit(this.wallet);
  }

  onDeleteWallet(): void {
    this.deleteWallet.emit(this.wallet);
  }

  onMakeDefault(): void {
    this.makeDefault.emit(this.wallet);
  }

  onMoveUp(): void {
    this.moveUp.emit(this.wallet);
  }

  onMoveDown(): void {
    this.moveDown.emit(this.wallet);
  }

  // TrackBy function for performance optimization
  trackByWalletId(index: number, wallet: Wallet): string {
    return wallet.id ?? '';
  }
}
