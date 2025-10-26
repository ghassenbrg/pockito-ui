import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageTransactionDto, Pageable, TransactionDto } from '@api/models';
import { TransactionService } from '@api/services';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TransactionListComponent } from '@shared/components/transaction-list/transaction-list.component';
import { LoadingService, ToastService } from '@shared/services';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    TranslatePipe,
    PageHeaderComponent,
    TransactionListComponent
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss'
})
export class TransactionsComponent implements OnInit {
  pageableTransactions?: PageTransactionDto;
  loading = false;
  allTransactions: any[] = [];

  constructor(
    private transactionService: TransactionService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.loadTransactions();
  }

  loadTransactions(): void {

    let nextPage: number;
    let loadingId: string = '';

    if (this.pageableTransactions) {
      nextPage = (this.pageableTransactions.number || 0) + 1;
    } else {
      loadingId = this.loadingService.show(this.translateService.instant('transactions.loading'));
      nextPage = 0;
    }

    const pageable: Pageable = {
      page: nextPage,
      size: 10,
      sort: ['effectiveDate,desc']
    };

    this.transactionService.listTransactions(pageable).subscribe({
      next: (transactions) => {
        if (transactions.number === 0) {
          // First load - replace all transactions
          this.allTransactions = transactions.content || [];
        } else {
          // Load more - append to existing transactions
          this.allTransactions = [...this.allTransactions, ...(transactions.content || [])];
        }
        
        // Update pageableTransactions with combined data
        this.pageableTransactions = {
          ...transactions,
          content: this.allTransactions
        };
        
        this.loadingService.hide(loadingId);
      },
      error: () => {
        this.toastService.showError(
          'transactions.loadingError',
          'transactions.loadingErrorMessage'
        );
        this.loadingService.hide(loadingId);
      }
    });
  }

  onLoadMore(): void {
    this.loadTransactions();
  }

  onTransactionSaved(_transaction: TransactionDto): void {
    // Reload transactions to show updated data
    this.loadTransactions();
  }
}
