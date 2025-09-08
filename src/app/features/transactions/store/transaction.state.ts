import { TransactionDto } from '@api/model/transaction.model';
import { ViewMode, TransactionFilters } from '../models/transaction.types';

export interface TransactionState {
  transactions: TransactionDto[];
  selectedTransaction: TransactionDto | null;
  viewMode: ViewMode;
  
  // Pagination state
  currentPage: number;
  pageSize: number;
  totalElements: number;
  totalPages: number;
  
  // Filtering state
  filters: TransactionFilters;
  
  // Global loading state
  isLoading: boolean;
  
  // Operation-specific loading states
  loadingStates: {
    loadTransactions: boolean;
    loadTransactionById: boolean;
    createTransaction: boolean;
    updateTransaction: boolean;
    deleteTransaction: boolean;
  };
  
  // Error handling
  error: string | null;
  operationErrors: {
    loadTransactions: string | null;
    loadTransactionById: string | null;
    createTransaction: string | null;
    updateTransaction: string | null;
    deleteTransaction: string | null;
  };
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: string | null;
    timestamp: number | null;
  };
}

// Helper function to get view mode from localStorage
const getInitialViewMode = (): ViewMode => {
  try {
    // Check if localStorage is available (some browsers/contexts might not support it)
    if (typeof localStorage === 'undefined') {
      return 'list';
    }
    
    const savedViewMode = localStorage.getItem('transaction-view-mode');
    if (savedViewMode === 'cards' || savedViewMode === 'list') {
      return savedViewMode;
    }
    
    // If no valid saved preference, default to list
    return 'list';
  } catch (error) {
    console.warn('Failed to load view mode from localStorage:', error);
    return 'list';
  }
};

export const initialState: TransactionState = {
  transactions: [],
  selectedTransaction: null,
  viewMode: getInitialViewMode(),
  
  // Pagination state
  currentPage: 0,
  pageSize: 10,
  totalElements: 0,
  totalPages: 0,
  
  // Filtering state
  filters: {},
  
  // Global loading state
  isLoading: false,
  
  // Operation-specific loading states
  loadingStates: {
    loadTransactions: false,
    loadTransactionById: false,
    createTransaction: false,
    updateTransaction: false,
    deleteTransaction: false,
  },
  
  // Error handling
  error: null,
  operationErrors: {
    loadTransactions: null,
    loadTransactionById: null,
    createTransaction: null,
    updateTransaction: null,
    deleteTransaction: null,
  },
  
  // Success states for navigation
  lastSuccessfulOperation: {
    type: null,
    timestamp: null,
  },
};
