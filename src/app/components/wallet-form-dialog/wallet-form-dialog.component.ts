import { Component, Input, Output, EventEmitter, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Wallet } from '@api/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { WalletFormComponent } from '@features/wallet/wallet-form/wallet-form.component';
import { WalletStateService } from '../../state/wallet/wallet-state.service';
import { ToastService } from '@shared/services/toast.service';
import { TranslateService } from '@ngx-translate/core';
import { LoadingService } from '@shared/services/loading.service';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class WalletFormDialogComponent implements OnDestroy {
  @Input() visible: boolean = false;
  @Input() walletId?: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() walletSaved = new EventEmitter<Wallet>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() walletDeleted = new EventEmitter<string>();

  private destroy$ = new Subject<void>();

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
      
      this.walletState.deleteWallet(targetId).subscribe({
        next: () => {
          this.toastService.showSuccess(
            'wallets.delete.success',
            'wallets.delete.successMessage'
          );
          this.walletDeleted.emit(targetId);
          this.closeDialog();
        },
        error: () => {
          this.toastService.showError('wallets.delete.error', 'wallets.delete.errorMessage');
        }
      });
    }
  }

  private bindLoading(): void {
    const LOADING_ID = 'wallet-form-dialog';
    
    this.walletState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(LOADING_ID, this.translate.instant('common.loading'));
        } else {
          this.loadingService.hide(LOADING_ID);
        }
      });
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.loadingService.hideAll();
  }
}
