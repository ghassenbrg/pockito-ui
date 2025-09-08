import { createAction, props } from '@ngrx/store';
import { TransactionDto, CreateTransactionRequest, UpdateTransactionRequest, TransactionListParams } from '@api/model/transaction.model';
import { ViewMode, TransactionFilters } from '../models/transaction.types';

// Load Transactions
export const loadTransactions = createAction(
  '[Transaction] Load Transactions',
  props<{ params?: TransactionListParams }>()
);
export const loadTransactionsSuccess = createAction(
  '[Transaction] Load Transactions Success',
  props<{ 
    transactions: TransactionDto[];
    totalElements: number;
    totalPages: number;
    currentPage: number;
    pageSize: number;
  }>()
);
export const loadTransactionsFailure = createAction(
  '[Transaction] Load Transactions Failure',
  props<{ error: string }>()
);

// Load Single Transaction by ID
export const loadTransactionById = createAction(
  '[Transaction] Load Transaction By ID',
  props<{ transactionId: string }>()
);
export const loadTransactionByIdSuccess = createAction(
  '[Transaction] Load Transaction By ID Success',
  props<{ transaction: TransactionDto }>()
);
export const loadTransactionByIdFailure = createAction(
  '[Transaction] Load Transaction By ID Failure',
  props<{ error: string }>()
);

// Create Transaction
export const createTransaction = createAction(
  '[Transaction] Create Transaction',
  props<{ transactionData: CreateTransactionRequest }>()
);
export const createTransactionSuccess = createAction(
  '[Transaction] Create Transaction Success',
  props<{ transaction: TransactionDto }>()
);
export const createTransactionFailure = createAction(
  '[Transaction] Create Transaction Failure',
  props<{ error: string }>()
);

// Update Transaction
export const updateTransaction = createAction(
  '[Transaction] Update Transaction',
  props<{ transactionId: string; transactionData: UpdateTransactionRequest }>()
);
export const updateTransactionSuccess = createAction(
  '[Transaction] Update Transaction Success',
  props<{ transaction: TransactionDto }>()
);
export const updateTransactionFailure = createAction(
  '[Transaction] Update Transaction Failure',
  props<{ error: string }>()
);

// Delete Transaction
export const deleteTransaction = createAction(
  '[Transaction] Delete Transaction',
  props<{ transaction: TransactionDto }>()
);
export const deleteTransactionSuccess = createAction(
  '[Transaction] Delete Transaction Success',
  props<{ transactionId: string }>()
);
export const deleteTransactionFailure = createAction(
  '[Transaction] Delete Transaction Failure',
  props<{ error: string }>()
);

// UI State
export const setSelectedTransaction = createAction(
  '[Transaction] Set Selected Transaction',
  props<{ transaction: TransactionDto | null }>()
);

export const setViewMode = createAction(
  '[Transaction] Set View Mode',
  props<{ viewMode: ViewMode }>()
);

// Pagination actions
export const setCurrentPage = createAction(
  '[Transaction] Set Current Page',
  props<{ page: number }>()
);

export const setPageSize = createAction(
  '[Transaction] Set Page Size',
  props<{ size: number }>()
);

export const nextPage = createAction('[Transaction] Next Page');
export const previousPage = createAction('[Transaction] Previous Page');
export const firstPage = createAction('[Transaction] First Page');
export const lastPage = createAction('[Transaction] Last Page');

// Filtering actions
export const setFilters = createAction(
  '[Transaction] Set Filters',
  props<{ filters: TransactionFilters }>()
);

export const clearFilters = createAction('[Transaction] Clear Filters');

export const updateFilter = createAction(
  '[Transaction] Update Filter',
  props<{ key: keyof TransactionFilters; value: any }>()
);

// Enhanced error handling actions
export const clearError = createAction('[Transaction] Clear Error');
export const clearOperationError = createAction(
  '[Transaction] Clear Operation Error',
  props<{ operation: string }>()
);
export const clearAllErrors = createAction('[Transaction] Clear All Errors');

// Success tracking actions
export const clearSuccessState = createAction('[Transaction] Clear Success State');

// Loading state management actions
export const setGlobalLoading = createAction(
  '[Transaction] Set Global Loading',
  props<{ isLoading: boolean }>()
);
export const setOperationLoading = createAction(
  '[Transaction] Set Operation Loading',
  props<{ operation: string; isLoading: boolean }>()
);
