import { createReducer, on } from '@ngrx/store';
import * as TransactionActions from './transaction.actions';
import { initialState } from './transaction.state';

export const transactionReducer = createReducer(
  initialState,

  // Load Transactions
  on(TransactionActions.loadTransactions, (state, { params }) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadTransactions: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadTransactions: null },
    // Update pagination from params if provided
    currentPage: params?.page ?? state.currentPage,
    pageSize: params?.size ?? state.pageSize,
  })),

  on(TransactionActions.loadTransactionsSuccess, (state, { 
    transactions, 
    totalElements, 
    totalPages, 
    currentPage, 
    pageSize 
  }) => ({
    ...state,
    transactions,
    totalElements,
    totalPages,
    currentPage,
    pageSize,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadTransactions: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadTransactions: null },
    lastSuccessfulOperation: { type: 'loadTransactions', timestamp: Date.now() },
  })),

  on(TransactionActions.loadTransactionsFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadTransactions: false },
    error,
    operationErrors: { ...state.operationErrors, loadTransactions: error },
  })),

  // Load Single Transaction by ID
  on(TransactionActions.loadTransactionById, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, loadTransactionById: true },
    error: null,
    operationErrors: { ...state.operationErrors, loadTransactionById: null },
  })),

  on(TransactionActions.loadTransactionByIdSuccess, (state, { transaction }) => ({
    ...state,
    transactions: state.transactions.some((t) => t.id === transaction.id)
      ? state.transactions.map((t) => (t.id === transaction.id ? transaction : t))
      : [...state.transactions, transaction],
    selectedTransaction: transaction,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadTransactionById: false },
    error: null,
    operationErrors: { ...state.operationErrors, loadTransactionById: null },
    lastSuccessfulOperation: { type: 'loadTransactionById', timestamp: Date.now() },
  })),

  on(TransactionActions.loadTransactionByIdFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, loadTransactionById: false },
    error,
    operationErrors: { ...state.operationErrors, loadTransactionById: error },
  })),

  // Create Transaction
  on(TransactionActions.createTransaction, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, createTransaction: true },
    error: null,
    operationErrors: { ...state.operationErrors, createTransaction: null },
  })),

  on(TransactionActions.createTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: [transaction, ...state.transactions], // Add to beginning for newest first
    isLoading: false,
    loadingStates: { ...state.loadingStates, createTransaction: false },
    error: null,
    operationErrors: { ...state.operationErrors, createTransaction: null },
    lastSuccessfulOperation: { type: 'createTransaction', timestamp: Date.now() },
  })),

  on(TransactionActions.createTransactionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, createTransaction: false },
    error,
    operationErrors: { ...state.operationErrors, createTransaction: error },
  })),

  // Update Transaction
  on(TransactionActions.updateTransaction, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, updateTransaction: true },
    error: null,
    operationErrors: { ...state.operationErrors, updateTransaction: null },
  })),

  on(TransactionActions.updateTransactionSuccess, (state, { transaction }) => ({
    ...state,
    transactions: state.transactions.map((t) => (t.id === transaction.id ? transaction : t)),
    selectedTransaction:
      state.selectedTransaction?.id === transaction.id ? transaction : state.selectedTransaction,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateTransaction: false },
    error: null,
    operationErrors: { ...state.operationErrors, updateTransaction: null },
    lastSuccessfulOperation: { type: 'updateTransaction', timestamp: Date.now() },
  })),

  on(TransactionActions.updateTransactionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, updateTransaction: false },
    error,
    operationErrors: { ...state.operationErrors, updateTransaction: error },
  })),

  // Delete Transaction
  on(TransactionActions.deleteTransaction, (state) => ({
    ...state,
    isLoading: true,
    loadingStates: { ...state.loadingStates, deleteTransaction: true },
    error: null,
    operationErrors: { ...state.operationErrors, deleteTransaction: null },
  })),

  on(TransactionActions.deleteTransactionSuccess, (state, { transactionId }) => ({
    ...state,
    transactions: state.transactions.filter((t) => t.id !== transactionId),
    selectedTransaction:
      state.selectedTransaction?.id === transactionId ? null : state.selectedTransaction,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteTransaction: false },
    error: null,
    operationErrors: { ...state.operationErrors, deleteTransaction: null },
    lastSuccessfulOperation: { type: 'deleteTransaction', timestamp: Date.now() },
  })),

  on(TransactionActions.deleteTransactionFailure, (state, { error }) => ({
    ...state,
    isLoading: false,
    loadingStates: { ...state.loadingStates, deleteTransaction: false },
    error,
    operationErrors: { ...state.operationErrors, deleteTransaction: error },
  })),

  // UI State
  on(TransactionActions.setSelectedTransaction, (state, { transaction }) => ({
    ...state,
    selectedTransaction: transaction,
  })),

  on(TransactionActions.setViewMode, (state, { viewMode }) => {
    // Save view mode to localStorage
    try {
      if (typeof localStorage !== 'undefined') {
        localStorage.setItem('transaction-view-mode', viewMode);
      }
    } catch (error) {
      console.warn('Failed to save view mode to localStorage:', error);
    }
    
    return {
      ...state,
      viewMode,
    };
  }),

  // Pagination actions
  on(TransactionActions.setCurrentPage, (state, { page }) => ({
    ...state,
    currentPage: page,
  })),

  on(TransactionActions.setPageSize, (state, { size }) => ({
    ...state,
    pageSize: size,
    currentPage: 0, // Reset to first page when changing page size
  })),

  on(TransactionActions.nextPage, (state) => {
    const nextPage = state.currentPage + 1;
    return nextPage < state.totalPages 
      ? { ...state, currentPage: nextPage }
      : state;
  }),

  on(TransactionActions.previousPage, (state) => {
    const prevPage = state.currentPage - 1;
    return prevPage >= 0 
      ? { ...state, currentPage: prevPage }
      : state;
  }),

  on(TransactionActions.firstPage, (state) => ({
    ...state,
    currentPage: 0,
  })),

  on(TransactionActions.lastPage, (state) => ({
    ...state,
    currentPage: Math.max(0, state.totalPages - 1),
  })),

  // Filtering actions
  on(TransactionActions.setFilters, (state, { filters }) => ({
    ...state,
    filters,
    currentPage: 0, // Reset to first page when filters change
  })),

  on(TransactionActions.clearFilters, (state) => ({
    ...state,
    filters: {},
    currentPage: 0, // Reset to first page when clearing filters
  })),

  on(TransactionActions.updateFilter, (state, { key, value }) => ({
    ...state,
    filters: { ...state.filters, [key]: value },
    currentPage: 0, // Reset to first page when updating filters
  })),

  // Enhanced error handling
  on(TransactionActions.clearError, (state) => ({
    ...state,
    error: null,
  })),

  on(TransactionActions.clearOperationError, (state, { operation }) => ({
    ...state,
    operationErrors: { ...state.operationErrors, [operation]: null },
  })),

  on(TransactionActions.clearAllErrors, (state) => ({
    ...state,
    error: null,
    operationErrors: {
      loadTransactions: null,
      loadTransactionById: null,
      createTransaction: null,
      updateTransaction: null,
      deleteTransaction: null,
    },
  })),

  // Success state management
  on(TransactionActions.clearSuccessState, (state) => ({
    ...state,
    lastSuccessfulOperation: { type: null, timestamp: null },
  })),

  // Loading state management
  on(TransactionActions.setGlobalLoading, (state, { isLoading }) => ({
    ...state,
    isLoading,
  })),

  on(TransactionActions.setOperationLoading, (state, { operation, isLoading }) => ({
    ...state,
    loadingStates: { ...state.loadingStates, [operation]: isLoading },
  })),
);
