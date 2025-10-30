import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wallet } from '@api/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { WalletFormComponent } from '@features/wallet/wallet-form/wallet-form.component';
import { WalletStateService } from '../../../state/wallet/wallet-state.service';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '@shared/services/loading.service';

@Component({
  selector: 'app-wallet-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoDialogComponent,
    WalletFormComponent,
  ],
  templateUrl: './wallet-form-dialog.component.html',
  styleUrls: ['./wallet-form-dialog.component.scss']
})
export class WalletFormDialogComponent {
  @Input() visible: boolean = false;
  @Input() walletId?: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() walletSaved = new EventEmitter<Wallet>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() walletDeleted = new EventEmitter<string>();

  constructor(
    private walletState: WalletStateService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {
    this.bindLoading();
  }

  onWalletSaved(wallet: Wallet): void {
    this.walletSaved.emit(wallet);
    this.closeDialog();
  }

  onFormCancelled(): void {
    this.formCancelled.emit();
    this.closeDialog();
  }

  onDialogVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
  }

  private closeDialog(): void {
    this.visible = false;
    this.visibleChange.emit(false);
  }

  // Check if we're in edit mode
  isEditMode(): boolean {
    return !!this.walletId;
  }

  // Get dialog header text
  getDialogHeader(): string {
    return this.walletId ? 'wallets.editWallet' : 'wallets.createWallet';
  }

  // Delete wallet
  deleteWallet(): void {
    if (!this.walletId) {
      return;
    }

    if (confirm(this.translate.instant('wallets.delete.confirm'))) {
      const targetId = this.walletId;
      this.walletState.deleteWallet(targetId);
      // Wait for wallets$ to reflect deletion before confirming success
      const sub = this.walletState.wallets$.subscribe((wallets) => {
        if (wallets && !wallets.find((w) => w.id === targetId)) {
          this.toastService.showSuccess(
            'wallets.delete.success',
            'wallets.delete.successMessage'
          );
          this.walletDeleted.emit(targetId);
          this.closeDialog();
          sub.unsubscribe();
        }
      });
    }
  }

  private bindLoading(): void {
    let loadingId: string | null = null;
    this.walletState.isLoading$.subscribe((isLoading) => {
      if (isLoading && !loadingId) {
        loadingId = this.loadingService.show(this.translate.instant('common.loading'));
      } else if (!isLoading && loadingId) {
        this.loadingService.hide(loadingId);
        loadingId = null;
      }
    });
  }
}
