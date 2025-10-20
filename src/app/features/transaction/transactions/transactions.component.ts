import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { PageTransactionDto, Pageable } from '@api/models';
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
  currentPage = 0;
  pageSize = 10;

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
    this.loading = true;
    this.loadingService.show(this.translateService.instant('transactions.loading'));

    const pageable: Pageable = {
      page: this.currentPage,
      size: this.pageSize,
      sort: ['effectiveDate,desc']
    };

    this.transactionService.listTransactions(pageable).subscribe({
      next: (transactions) => {
        this.pageableTransactions = transactions;
        this.loading = false;
        this.loadingService.hide();
      },
      error: () => {
        this.loading = false;
        this.loadingService.hide();
        this.toastService.showError(
          'transactions.loadingError',
          'transactions.loadingErrorMessage'
        );
      }
    });
  }

  onPageChange(event: any): void {
    this.currentPage = Math.floor(event.first / event.rows);
    this.loadTransactions();
  }

  onPageSizeChange(pageSize: number): void {
    this.pageSize = pageSize;
    this.currentPage = 0; // Reset to first page when changing page size
    this.loadTransactions();
  }
}
