import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionType, TransactionDto } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { TransactionFormComponent } from '@app/components/transaction-form/transaction-form.component';
import { TransactionsStateService } from '../../state/transaction/transactions-state.service';
import { LoadingService } from '@shared/services/loading.service';
import { ToastService } from '@shared/services/toast.service';

@Component({
  selector: 'app-transaction-form-dialog',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoDialogComponent,
    TransactionFormComponent,
  ],
  templateUrl: './transaction-form-dialog.component.html',
  styleUrls: ['./transaction-form-dialog.component.scss']
})
export class TransactionFormDialogComponent {
  @Input() visible: boolean = false;
  @Input() transactionId?: string;
  @Input() initialWalletFromId?: string;
  @Input() initialWalletToId?: string;
  
  @Output() visibleChange = new EventEmitter<boolean>();
  @Output() transactionSaved = new EventEmitter<TransactionDto>();
  @Output() formCancelled = new EventEmitter<void>();
  @Output() transactionDeleted = new EventEmitter<string>();

  currentTransactionType: TransactionType | null = null;
  currentWalletFromId: string | null = null;
  currentWalletToId: string | null = null;

  constructor(
    private transactionsState: TransactionsStateService,
    private toastService: ToastService,
    private translate: TranslateService,
    private loadingService: LoadingService
  ) {}

  onTransactionSaved(transaction: TransactionDto): void {
    this.transactionSaved.emit(transaction);
    this.closeDialog();
  }

  onFormCancelled(): void {
    this.formCancelled.emit();
    this.closeDialog();
  }

  onTransactionTypeChanged(transactionType: TransactionType): void {
    this.currentTransactionType = transactionType;
  }

  onWalletChanged(walletFromId: string | null, walletToId: string | null): void {
    this.currentWalletFromId = walletFromId;
    this.currentWalletToId = walletToId;
  }

  onDialogVisibleChange(visible: boolean): void {
    this.visibleChange.emit(visible);
    if (!visible) {
      this.currentTransactionType = null;
      this.currentWalletFromId = null;
      this.currentWalletToId = null;
    }
  }

  private closeDialog(): void {
    this.visibleChange.emit(false);
    this.currentTransactionType = null;
    this.currentWalletFromId = null;
    this.currentWalletToId = null;
  }

  // Determine dialog header color based on transaction type
  getDialogHeaderColor(): string {
    if (!this.currentTransactionType) {
      return 'default';
    }

    switch (this.currentTransactionType) {
      case TransactionType.EXPENSE:
        return 'red';
      case TransactionType.INCOME:
        return 'green';
      case TransactionType.TRANSFER:
        return this.getTransferColor();
      default:
        return 'default';
    }
  }

  // Determine transfer color based on wallet selection
  private getTransferColor(): string {
    // If both wallets are selected and both are actual wallets (not null)
    if (this.currentWalletFromId && this.currentWalletToId) {
      return 'grey'; // Transfer between two wallets
    }
    
    // If from wallet is null (out of Pockito) and to wallet is selected
    if (this.currentWalletFromId === null && this.currentWalletToId) {
      return 'green'; // Money coming into Pockito
    }
    
    // If to wallet is null (out of Pockito) and from wallet is selected
    if (this.currentWalletFromId && this.currentWalletToId === null) {
      return 'red'; // Money going out of Pockito
    }
    
    // Default case - return grey for transfers
    return 'grey';
  }

  // Determine dialog header text based on edit mode
  getDialogHeader(): string {
    return this.transactionId ? 'appLayout.dialogs.editTransaction' : 'appLayout.dialogs.addTransaction';
  }

  // Check if we're in edit mode
  isEditMode(): boolean {
    return !!this.transactionId;
  }

  // Delete transaction
  deleteTransaction(): void {
    if (!this.transactionId) {
      return;
    }

    if (confirm(this.translate.instant('transactions.delete.confirm'))) {
      const id = this.transactionId;
      const loadingId = this.loadingService.show(this.translate.instant('common.loading'));
      
      this.transactionsState.deleteTransaction(id).subscribe({
        next: () => {
          this.loadingService.hide(loadingId);
          this.toastService.showSuccess('transactions.delete.success','transactions.delete.successMessage');
          this.transactionDeleted.emit(id);
          this.closeDialog();
        },
        error: () => {
          this.loadingService.hide(loadingId);
          this.toastService.showError('transactions.delete.error', 'transactions.delete.errorMessage');
        }
      });
    }
  }
}