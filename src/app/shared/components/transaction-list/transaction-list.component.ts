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

  @Output() pageChange = new EventEmitter<any>();
  @Output() pageSizeChange = new EventEmitter<number>();

  // Internal properties
  groupedTransactions: { [date: string]: any[] } = {};
  currentPage: number = 0;
  pageSize: number = 10;
  totalRecords: number = 0;

  TransactionType = TransactionType;
  Math = Math;

  constructor(private translateService: TranslateService) {}

  ngOnInit(): void {
    this.processTransactions();
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['pageableTransactions'] && this.pageableTransactions) {
      this.processTransactions();
    }
  }

  private processTransactions(): void {
    if (!this.pageableTransactions) {
      return;
    }

    this.totalRecords = this.pageableTransactions.totalElements || 0;
    this.currentPage = this.pageableTransactions.number || 0;
    this.pageSize = this.pageableTransactions.size || 10;
    
    this.groupTransactionsByDate(this.pageableTransactions.content || []);
  }

  onPageChange(event: any) {
    this.pageChange.emit(event);
  }

  onPageSizeChange(event: any) {
    const newPageSize = parseInt(event.target.value);
    this.pageSizeChange.emit(newPageSize);
  }

  getPaginatorTemplate() {
    return this.translateService.instant('common.paginatorTemplate', {
      first: this.currentPage * this.pageSize + 1,
      last: Math.min((this.currentPage + 1) * this.pageSize, this.totalRecords),
      totalRecords: this.totalRecords,
    });
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
      return 'Transfer';
    }
    
    // For income and expense, show the category name
    return transaction.categoryName || 'Unknown Category';
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
