import { createFeatureSelector, createSelector } from '@ngrx/store';
import { TransactionState } from './transaction.state';

export const selectTransactionState = createFeatureSelector<TransactionState>('transaction');

// Basic selectors
export const selectTransactions = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.transactions
);

export const selectSelectedTransaction = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.selectedTransaction
);

export const selectViewMode = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.viewMode
);

// Pagination selectors
export const selectCurrentPage = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.currentPage
);

export const selectPageSize = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.pageSize
);

export const selectTotalElements = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.totalElements
);

export const selectTotalPages = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.totalPages
);

export const selectPaginationInfo = createSelector(
  selectCurrentPage,
  selectPageSize,
  selectTotalElements,
  selectTotalPages,
  (currentPage, pageSize, totalElements, totalPages) => ({
    currentPage,
    pageSize,
    totalElements,
    totalPages,
    hasNextPage: currentPage < totalPages - 1,
    hasPreviousPage: currentPage > 0,
    startIndex: currentPage * pageSize + 1,
    endIndex: Math.min((currentPage + 1) * pageSize, totalElements),
  })
);

// Filtering selectors
export const selectFilters = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.filters
);

export const selectHasActiveFilters = createSelector(
  selectFilters,
  (filters) => Object.keys(filters).length > 0 && Object.values(filters).some(value => 
    value !== null && value !== undefined && value !== ''
  )
);

// Loading state selectors
export const selectIsLoading = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.isLoading
);

export const selectLoadingStates = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.loadingStates
);

export const selectIsLoadingOperation = (operation: string) => createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates[operation as keyof typeof loadingStates] || false
);

export const selectIsLoadingTransactions = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadTransactions
);

export const selectIsLoadingTransactionById = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.loadTransactionById
);

export const selectIsCreatingTransaction = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.createTransaction
);

export const selectIsUpdatingTransaction = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.updateTransaction
);

export const selectIsDeletingTransaction = createSelector(
  selectLoadingStates,
  (loadingStates) => loadingStates.deleteTransaction
);

// Error state selectors
export const selectError = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.error
);

export const selectOperationErrors = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.operationErrors
);

export const selectOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => operationErrors[operation as keyof typeof operationErrors] || null
);

export const selectHasAnyError = createSelector(
  selectTransactionState,
  (state: TransactionState) => !!state.error || Object.values(state.operationErrors).some(error => !!error)
);

export const selectHasOperationError = (operation: string) => createSelector(
  selectOperationErrors,
  (operationErrors) => !!operationErrors[operation as keyof typeof operationErrors]
);

// Success state selectors
export const selectLastSuccessfulOperation = createSelector(
  selectTransactionState,
  (state: TransactionState) => state.lastSuccessfulOperation
);

export const selectHasSuccessfulOperation = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => !!lastSuccessfulOperation.type
);

export const selectSuccessfulOperationType = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.type
);

export const selectSuccessfulOperationTimestamp = createSelector(
  selectLastSuccessfulOperation,
  (lastSuccessfulOperation) => lastSuccessfulOperation.timestamp
);

// Computed selectors
export const selectTransactionsByType = (type: string) => createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => transaction.transactionType === type)
);

export const selectExpenseTransactions = createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => transaction.transactionType === 'EXPENSE')
);

export const selectIncomeTransactions = createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => transaction.transactionType === 'INCOME')
);

export const selectTransferTransactions = createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => transaction.transactionType === 'TRANSFER')
);

export const selectTransactionById = (id: string) => createSelector(
  selectTransactions,
  (transactions) => transactions.find(transaction => transaction.id === id)
);

export const selectTransactionsByWallet = (walletId: string) => createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => 
    transaction.walletFromId === walletId || transaction.walletToId === walletId
  )
);

export const selectTransactionsByCategory = (categoryId: string) => createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => transaction.categoryId === categoryId)
);

export const selectTransactionsByDateRange = (startDate: string, endDate: string) => createSelector(
  selectTransactions,
  (transactions) => transactions.filter(transaction => {
    const transactionDate = new Date(transaction.effectiveDate);
    const start = new Date(startDate);
    const end = new Date(endDate);
    return transactionDate >= start && transactionDate <= end;
  })
);

export const selectFilteredTransactions = createSelector(
  selectTransactions,
  selectFilters,
  (transactions, filters) => {
    let filtered = [...transactions];

    if (filters.walletId) {
      filtered = filtered.filter(transaction => 
        transaction.walletFromId === filters.walletId || 
        transaction.walletToId === filters.walletId
      );
    }

    if (filters.transactionType) {
      filtered = filtered.filter(transaction => 
        transaction.transactionType === filters.transactionType
      );
    }

    if (filters.startDate && filters.endDate) {
      const start = new Date(filters.startDate);
      const end = new Date(filters.endDate);
      filtered = filtered.filter(transaction => {
        const transactionDate = new Date(transaction.effectiveDate);
        return transactionDate >= start && transactionDate <= end;
      });
    }

    return filtered;
  }
);

// Combined loading and error selectors for specific operations
export const selectTransactionOperationState = (operation: string) => createSelector(
  selectIsLoadingOperation(operation),
  selectOperationError(operation),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectCreateTransactionState = createSelector(
  selectIsCreatingTransaction,
  selectOperationError('createTransaction'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectUpdateTransactionState = createSelector(
  selectIsUpdatingTransaction,
  selectOperationError('updateTransaction'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectLoadTransactionByIdState = createSelector(
  selectIsLoadingTransactionById,
  selectOperationError('loadTransactionById'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

export const selectDeleteTransactionState = createSelector(
  selectIsDeletingTransaction,
  selectOperationError('deleteTransaction'),
  (isLoading, error) => ({
    isLoading,
    error,
    hasError: !!error
  })
);

// Combined state selectors for components
export const selectTransactionListState = createSelector(
  selectTransactions,
  selectIsLoadingTransactions,
  selectOperationError('loadTransactions'),
  selectPaginationInfo,
  selectFilters,
  selectHasActiveFilters,
  (transactions, isLoading, error, pagination, filters, hasActiveFilters) => ({
    transactions,
    isLoading,
    error,
    hasError: !!error,
    pagination,
    filters,
    hasActiveFilters,
  })
);

export const selectTransactionModalState = createSelector(
  selectSelectedTransaction,
  selectIsCreatingTransaction,
  selectIsUpdatingTransaction,
  selectOperationError('createTransaction'),
  selectOperationError('updateTransaction'),
  (selectedTransaction, isCreating, isUpdating, createError, updateError) => ({
    selectedTransaction,
    isCreating,
    isUpdating,
    createError,
    updateError,
    hasCreateError: !!createError,
    hasUpdateError: !!updateError,
  })
);
