import { CommonModule } from '@angular/common';
import { Component, Input, Output, EventEmitter, OnInit, OnChanges, SimpleChanges } from '@angular/core';
import { PageTransactionDto, TransactionType, WalletDto } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { PockitoCurrencyPipe } from '../../pipes/pockito-currency.pipe';
import { EmptyStateComponent } from '../empty-state/empty-state.component';

@Component({
  selector: 'app-transaction-list',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PockitoCurrencyPipe,
    ButtonModule,
    TooltipModule,
    EmptyStateComponent
  ],
  templateUrl: './transaction-list.component.html',
  styleUrl: './transaction-list.component.scss'
})
export class TransactionListComponent implements OnInit, OnChanges {
  @Input() pageableTransactions?: PageTransactionDto;
  @Input() wallet?: WalletDto | null;
  @Input() walletId: string = '';

  @Output() loadMore = new EventEmitter<void>();

  // Internal properties
  groupedTransactions: { [date: string]: any[] } = {};
  isLoadingMore: boolean = false;

  TransactionType = TransactionType;

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.processTransactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageableTransactions'] && this.pageableTransactions) {
      this.processTransactions();
      this.isLoadingMore = false;
    }
  }

  private processTransactions(): void {
    if (!this.pageableTransactions) {
      return;
    }
    
    this.groupTransactionsByDate(this.pageableTransactions.content || []);
  }

  get currentPage(): number {
    return this.pageableTransactions?.number || 0;
  }

  get pageSize(): number {
    return this.pageableTransactions?.size || 10;
  }

  get totalRecords(): number {
    return this.pageableTransactions?.totalElements || 0;
  }

  get hasMorePages(): boolean {
    if (!this.pageableTransactions) return false;
    const currentPage = this.pageableTransactions.number || 0;
    const totalPages = this.pageableTransactions.totalPages || 1;
    return currentPage < totalPages - 1;
  }


  onLoadMore() {
    if (!this.isLoadingMore && this.hasMorePages) {
      this.isLoadingMore = true;
      this.loadMore.emit();
    }
  }


  formatDisplayDate(dateString: string): string {
    const date = new Date(dateString);
    const today = new Date();
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);

    // Check if it's today
    if (this.isSameDay(date, today)) {
      return this.translateService.instant('common.today');
    }
    
    // Check if it's yesterday
    if (this.isSameDay(date, yesterday)) {
      return this.translateService.instant('common.yesterday');
    }

    // Check if it's this year
    if (date.getFullYear() === today.getFullYear()) {
      return date.toLocaleDateString(this.translateService.currentLang || 'en', {
        month: 'long',
        day: 'numeric'
      });
    }

    // Default format with year
    return date.toLocaleDateString(this.translateService.currentLang || 'en', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  }

  private isSameDay(date1: Date, date2: Date): boolean {
    return date1.getFullYear() === date2.getFullYear() &&
           date1.getMonth() === date2.getMonth() &&
           date1.getDate() === date2.getDate();
  }

  getSortedDateKeys(): string[] {
    return Object.keys(this.groupedTransactions).sort((a, b) => {
      return new Date(b).getTime() - new Date(a).getTime(); // Most recent first
    });
  }

  getTransactionDisplayName(transaction: any): string {
    if (transaction.transactionType === TransactionType.TRANSFER) {
      return this.translateService.instant('enums.transactionType.TRANSFER');
    }
    
    // For income and expense, show the category name
    return transaction.categoryName || this.translateService.instant('common.unknownCategory');
  }

  private groupTransactionsByDate(transactions: any[]): void {
    // Clear previous grouping
    this.groupedTransactions = {};

    // Sort transactions by update date (most recent first)
    const sortedTransactions = transactions.sort((a, b) => {
      const dateA = new Date(a.updateDate || a.effectiveDate);
      const dateB = new Date(b.updateDate || b.effectiveDate);
      return dateB.getTime() - dateA.getTime();
    });

    // Group by effective date
    sortedTransactions.forEach(transaction => {
      const effectiveDate = transaction.effectiveDate;
      const dateKey = this.formatDateKey(effectiveDate);
      
      if (!this.groupedTransactions[dateKey]) {
        this.groupedTransactions[dateKey] = [];
      }
      this.groupedTransactions[dateKey].push(transaction);
    });
  }

  private formatDateKey(dateString: string): string {
    const date = new Date(dateString);
    return date.toISOString().split('T')[0]; // YYYY-MM-DD format
  }
}
