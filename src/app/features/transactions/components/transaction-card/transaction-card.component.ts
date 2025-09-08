import { Component, Input, Output, EventEmitter, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { TranslateModule } from '@ngx-translate/core';
import { TransactionDto, TransactionType } from '@api/model/transaction.model';

@Component({
  selector: 'app-transaction-card',
  standalone: true,
  imports: [CommonModule, ButtonModule, TooltipModule, TranslateModule],
  templateUrl: './transaction-card.component.html',
  styleUrl: './transaction-card.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class TransactionCardComponent {
  @Input() transaction!: TransactionDto;
  @Output() viewTransaction = new EventEmitter<TransactionDto>();
  @Output() editTransaction = new EventEmitter<TransactionDto>();
  @Output() deleteTransaction = new EventEmitter<TransactionDto>();

  onViewTransaction(): void {
    this.viewTransaction.emit(this.transaction);
  }

  onEditTransaction(): void {
    this.editTransaction.emit(this.transaction);
  }

  onDeleteTransaction(): void {
    this.deleteTransaction.emit(this.transaction);
  }

  getTransactionTypeColor(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return '#ef4444'; // red-500
      case 'INCOME':
        return '#10b981'; // emerald-500
      case 'TRANSFER':
        return '#3b82f6'; // blue-500
      default:
        return '#6b7280'; // gray-500
    }
  }

  getTransactionTypeIcon(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return 'pi pi-arrow-down';
      case 'INCOME':
        return 'pi pi-arrow-up';
      case 'TRANSFER':
        return 'pi pi-arrows-h';
      default:
        return 'pi pi-circle';
    }
  }

  formatAmount(amount: number): string {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD' // This should be dynamic based on wallet currency
    }).format(amount);
  }

  formatDate(dateString: string): string {
    return new Date(dateString).toLocaleDateString();
  }
}
