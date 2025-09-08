import { CommonModule } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  OnDestroy,
  OnInit,
} from '@angular/core';
import { Router } from '@angular/router';
import { TransactionDto } from '@api/model/transaction.model';
import { ResponsiveService } from '@core/services/responsive.service';
import { TranslateModule } from '@ngx-translate/core';
import { ButtonModule } from 'primeng/button';
import { TooltipModule } from 'primeng/tooltip';
import { Subscription } from 'rxjs';
import { map } from 'rxjs/operators';
import { TransactionCardComponent } from './components/transaction-card/transaction-card.component';
import { TransactionFiltersComponent } from './components/transaction-filters/transaction-filters.component';
import { TransactionListItemComponent } from './components/transaction-list-item/transaction-list-item.component';
import { TransactionModalComponent } from './components/transaction-modal/transaction-modal.component';
import { TransactionPaginationComponent } from './components/transaction-pagination/transaction-pagination.component';
import { TransactionFilters, ViewMode } from './models/transaction.types';
import { TransactionFacade } from './services/transaction.facade';

@Component({
  selector: 'app-transactions',
  standalone: true,
  imports: [
    CommonModule,
    ButtonModule,
    TooltipModule,
    TranslateModule,
    TransactionCardComponent,
    TransactionListItemComponent,
    TransactionFiltersComponent,
    TransactionModalComponent,
    TransactionPaginationComponent,
  ],
  templateUrl: './transactions.component.html',
  styleUrl: './transactions.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TransactionsComponent implements OnInit, OnDestroy {
  // Use observables directly instead of component properties
  transactions$ = this.transactionFacade.transactions$;
  wallets$ = this.transactionFacade.wallets$;
  categories$ = this.transactionFacade.categories$;
  isMobileView$ = this.responsiveService.screenSize$.pipe(
    map((screenSize) => screenSize.isMobile)
  );
  currentViewMode$ = this.transactionFacade.viewMode$;
  filters$ = this.transactionFacade.filters$;
  formData$ = this.transactionFacade.getFormData$();
  
  // Modal state
  showModal = false;
  modalMode: 'create' | 'edit' | 'view' = 'create';
  selectedTransaction: TransactionDto | null = null;
  
  // Pagination state
  currentPage$ = this.transactionFacade.currentPage$;
  pageSize$ = this.transactionFacade.pageSize$;
  totalElements$ = this.transactionFacade.totalElements$;
  paginationInfo$ = this.transactionFacade.paginationInfo$;
 
  private subscriptions = new Subscription();

  constructor(
    public transactionFacade: TransactionFacade,
    private responsiveService: ResponsiveService,
    private router: Router
  ) {}

  ngOnInit(): void {
    this.initializeComponent();
    this.setupSubscriptions();
  }

  ngOnDestroy(): void {
    this.subscriptions.unsubscribe();
  }

  private initializeComponent(): void {
    this.transactionFacade.initializeData();
  }

  private setupSubscriptions(): void {
    // Load form data for filters
    this.subscriptions.add(this.formData$.subscribe());
  }

  private loadTransactions(): void {
    // Transactions are automatically loaded by the facade
    this.transactionFacade.loadTransactions();
  }

  setViewMode(viewMode: ViewMode): void {
    this.transactionFacade.setViewMode(viewMode);
  }

  createTransaction(): void {
    this.modalMode = 'create';
    this.selectedTransaction = null;
    this.showModal = true;
  }

  viewTransaction(transaction: TransactionDto): void {
    this.modalMode = 'view';
    this.selectedTransaction = transaction;
    this.showModal = true;
  }

  editTransaction(transaction: TransactionDto): void {
    this.modalMode = 'edit';
    this.selectedTransaction = transaction;
    this.showModal = true;
  }

  deleteTransaction(transaction: TransactionDto): void {
    this.transactionFacade.deleteTransaction(transaction);
  }

  onFiltersChange(filters: TransactionFilters): void {
    this.transactionFacade.setFilters(filters);
  }

  onClearFilters(): void {
    this.transactionFacade.clearFilters();
  }

  // Modal handlers
  onModalClose(): void {
    this.showModal = false;
    this.selectedTransaction = null;
  }

  onTransactionSaved(): void {
    this.showModal = false;
    this.selectedTransaction = null;
    // Transactions will be reloaded automatically by the facade
  }

  // Pagination handlers
  onPageChange(page: number): void {
    this.transactionFacade.setPage(page);
  }

  onPageSizeChange(size: number): void {
    this.transactionFacade.setPageSize(size);
  }

  // Event handlers for child components
  onViewTransaction(transaction: TransactionDto): void {
    this.viewTransaction(transaction);
  }

  onEditTransaction(transaction: TransactionDto): void {
    this.editTransaction(transaction);
  }

  onDeleteTransaction(transaction: TransactionDto): void {
    this.deleteTransaction(transaction);
  }

  onViewModeChange(viewMode: ViewMode): void {
    // This will automatically save the view mode to localStorage via the facade
    this.setViewMode(viewMode);
  }

  // TrackBy function for performance optimization
  trackByTransactionId(index: number, transaction: TransactionDto): string {
    return transaction.id ?? '';
  }
}
