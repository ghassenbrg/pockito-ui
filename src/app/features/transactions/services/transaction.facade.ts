import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Store } from '@ngrx/store';
import { Observable, combineLatest, map } from 'rxjs';
import { TransactionDto, TransactionType } from '@api/model/transaction.model';
import { WalletDto } from '@api/model/wallet.model';
import { Category } from '@api/model/category.model';
import { WalletFacade } from '@features/wallets/services/wallet.facade';
import { CategoryFacade } from '@features/categories/services/category.facade';
import { TransactionFilters, ViewMode, TransactionFormData } from '../models/transaction.types';
import * as TransactionActions from '../store/transaction.actions';
import * as TransactionSelectors from '../store/transaction.selectors';

@Injectable({
  providedIn: 'root'
})
export class TransactionFacade {
  // State observables from NgRx store
  transactions$ = this.store.select(TransactionSelectors.selectTransactions);
  wallets$ = this.walletFacade.wallets$;
  categories$ = this.categoryFacade.categories$;
  loading$ = this.store.select(TransactionSelectors.selectIsLoading);
  error$ = this.store.select(TransactionSelectors.selectError);
  viewMode$ = this.store.select(TransactionSelectors.selectViewMode);
  filters$ = this.store.select(TransactionSelectors.selectFilters);
  
  // Pagination observables
  currentPage$ = this.store.select(TransactionSelectors.selectCurrentPage);
  pageSize$ = this.store.select(TransactionSelectors.selectPageSize);
  totalElements$ = this.store.select(TransactionSelectors.selectTotalElements);
  totalPages$ = this.store.select(TransactionSelectors.selectTotalPages);
  paginationInfo$ = this.store.select(TransactionSelectors.selectPaginationInfo);
  
  // Loading states
  isLoadingTransactions$ = this.store.select(TransactionSelectors.selectIsLoadingTransactions);
  isCreatingTransaction$ = this.store.select(TransactionSelectors.selectIsCreatingTransaction);
  isUpdatingTransaction$ = this.store.select(TransactionSelectors.selectIsUpdatingTransaction);
  isDeletingTransaction$ = this.store.select(TransactionSelectors.selectIsDeletingTransaction);
  
  // Error states
  hasAnyError$ = this.store.select(TransactionSelectors.selectHasAnyError);
  operationErrors$ = this.store.select(TransactionSelectors.selectOperationErrors);
  
  // Success states
  lastSuccessfulOperation$ = this.store.select(TransactionSelectors.selectLastSuccessfulOperation);
  
  // Combined states
  transactionListState$ = this.store.select(TransactionSelectors.selectTransactionListState);
  transactionModalState$ = this.store.select(TransactionSelectors.selectTransactionModalState);

  constructor(
    private store: Store,
    private walletFacade: WalletFacade,
    private categoryFacade: CategoryFacade,
    private router: Router
  ) {}

  // Transaction operations
  loadTransactions(params?: any): void {
    this.store.dispatch(TransactionActions.loadTransactions({ params }));
  }

  // Wallet operations
  loadWallets(): void {
    this.walletFacade.loadWallets();
  }

  // Category operations
  loadCategories(): void {
    this.categoryFacade.loadCategories();
  }

  // Initialize all required data
  initializeData(): void {
    this.loadWallets();
    this.loadCategories();
    this.loadTransactions();
  }

  // Ensure data is loaded (safety check)
  ensureDataLoaded(): void {
    // Always load data to ensure it's fresh and available
    this.loadWallets();
    this.loadCategories();
  }

  loadTransactionById(transactionId: string): void {
    this.store.dispatch(TransactionActions.loadTransactionById({ transactionId }));
  }

  createTransaction(transactionData: TransactionFormData): void {
    this.store.dispatch(TransactionActions.createTransaction({ transactionData }));
  }

  updateTransaction(transactionId: string, transactionData: TransactionFormData): void {
    this.store.dispatch(TransactionActions.updateTransaction({ transactionId, transactionData }));
  }

  deleteTransaction(transaction: TransactionDto): void {
    this.store.dispatch(TransactionActions.deleteTransaction({ transaction }));
  }

  // View mode operations
  setViewMode(viewMode: ViewMode): void {
    this.store.dispatch(TransactionActions.setViewMode({ viewMode }));
  }

  // Filter operations
  setFilters(filters: TransactionFilters): void {
    this.store.dispatch(TransactionActions.setFilters({ filters }));
  }

  clearFilters(): void {
    this.store.dispatch(TransactionActions.clearFilters());
  }

  updateFilter(key: keyof TransactionFilters, value: any): void {
    this.store.dispatch(TransactionActions.updateFilter({ key, value }));
  }

  // Pagination operations
  setPage(page: number): void {
    this.store.dispatch(TransactionActions.setCurrentPage({ page }));
  }

  setPageSize(size: number): void {
    this.store.dispatch(TransactionActions.setPageSize({ size }));
  }

  nextPage(): void {
    this.store.dispatch(TransactionActions.nextPage());
  }

  previousPage(): void {
    this.store.dispatch(TransactionActions.previousPage());
  }

  firstPage(): void {
    this.store.dispatch(TransactionActions.firstPage());
  }

  lastPage(): void {
    this.store.dispatch(TransactionActions.lastPage());
  }

  // UI operations
  setSelectedTransaction(transaction: TransactionDto | null): void {
    this.store.dispatch(TransactionActions.setSelectedTransaction({ transaction }));
  }

  // Error handling
  clearError(): void {
    this.store.dispatch(TransactionActions.clearError());
  }

  clearOperationError(operation: string): void {
    this.store.dispatch(TransactionActions.clearOperationError({ operation }));
  }

  clearAllErrors(): void {
    this.store.dispatch(TransactionActions.clearAllErrors());
  }

  clearSuccessState(): void {
    this.store.dispatch(TransactionActions.clearSuccessState());
  }

  // Navigation operations
  navigateToTransactions(): void {
    this.router.navigate(['/app/transactions']);
  }

  navigateToCreateTransaction(): void {
    this.router.navigate(['/app/transactions/create']);
  }

  navigateToEditTransaction(id: string): void {
    this.router.navigate(['/app/transactions/edit', id]);
  }

  navigateToTransactionView(id: string): void {
    this.router.navigate(['/app/transactions/view', id]);
  }

  // Utility methods
  getTransactionTypeColor(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return '#ef4444'; // red
      case 'INCOME':
        return '#10b981'; // green
      case 'TRANSFER':
        return '#3b82f6'; // blue
      default:
        return '#6b7280'; // gray
    }
  }

  formatTransactionType(type: TransactionType): string {
    switch (type) {
      case 'EXPENSE':
        return 'Expense';
      case 'INCOME':
        return 'Income';
      case 'TRANSFER':
        return 'Transfer';
      default:
        return 'Unknown';
    }
  }

  isExpense(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'EXPENSE';
  }

  isIncome(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'INCOME';
  }

  isTransfer(transaction: TransactionDto): boolean {
    return transaction.transactionType === 'TRANSFER';
  }

  // Combined data for forms
  getFormData$(): Observable<{ wallets: WalletDto[], categories: Category[] }> {
    return combineLatest([
      this.wallets$,
      this.categories$
    ]).pipe(
      map(([wallets, categories]) => ({ wallets, categories }))
    );
  }
}