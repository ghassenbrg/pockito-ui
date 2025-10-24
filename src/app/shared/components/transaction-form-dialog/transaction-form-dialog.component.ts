import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TransactionType, TransactionDto } from '@api/models';
import { TranslatePipe } from '@ngx-translate/core';
import { PockitoDialogComponent } from '@shared/components/pockito-dialog/pockito-dialog.component';
import { TransactionFormComponent } from '@shared/components/transaction-form/transaction-form.component';

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

  currentTransactionType: TransactionType | null = null;
  currentWalletFromId: string | null = null;
  currentWalletToId: string | null = null;

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
}