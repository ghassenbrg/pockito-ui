import { CommonModule } from '@angular/common';
import { Component, OnDestroy, OnInit } from '@angular/core';
import { PageTransactionDto, Pageable, TransactionDto } from '@api/models';
import { TranslatePipe, TranslateService } from '@ngx-translate/core';
import { PageHeaderComponent } from '@shared/components/page-header/page-header.component';
import { TransactionListComponent } from '@app/components/transaction-list/transaction-list.component';
import { LoadingService, ToastService } from '@shared/services';
import { TransactionsStateService } from '../../../state/transaction/transactions-state.service';
import { Observable, Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
export class TransactionsComponent implements OnInit, OnDestroy {
  pageableTransactions$!: Observable<PageTransactionDto | null>;
  
  private destroy$ = new Subject<void>();

  constructor(
    private transactionsState: TransactionsStateService,
    private loadingService: LoadingService,
    private toastService: ToastService,
    private translateService: TranslateService
  ) {}

  ngOnInit(): void {
    this.bindLoading();
    this.pageableTransactions$ = this.transactionsState.pageable$;
    this.loadFirstPage();
  }

  private loadFirstPage(): void {
    const pageable: Pageable = { page: 0, size: 10, sort: ['effectiveDate,desc'] };
    this.transactionsState.loadFirstPage(pageable);
  }

  onLoadMore(): void {
    this.transactionsState.loadNextPage();
  }

  onTransactionSaved(_transaction: TransactionDto): void {
    // The state will merge the created transaction when it matches current filters
  }

  private bindLoading() {
    // Use fixed ID for transactions loading state
    const TRANSACTION_LOADING_ID = 'transactions-page';
    
    this.transactionsState.isLoading$
      .pipe(takeUntil(this.destroy$))
      .subscribe((isLoading) => {
        if (isLoading) {
          this.loadingService.showWithId(TRANSACTION_LOADING_ID, this.translateService.instant('transactions.loading'));
        } else {
          this.loadingService.hide(TRANSACTION_LOADING_ID);
        }
      });
  }

  ngOnDestroy(): void {
    // Clean up all subscriptions to prevent memory leaks
    this.destroy$.next();
    this.destroy$.complete();
    
    // Clean up any lingering loading indicators
    this.loadingService.hideAll();
  }
}
