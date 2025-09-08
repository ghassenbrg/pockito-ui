// Transaction types based on backend TransactionType enum
export type TransactionType = 'EXPENSE' | 'INCOME' | 'TRANSFER';

export interface TransactionDto {
  id?: string;
  username?: string;
  transactionType: TransactionType;
  walletFromId?: string;
  walletToId?: string;
  amount: number;
  exchangeRate: number;
  walletToAmount?: number;
  note?: string;
  effectiveDate: string; // ISO date string (YYYY-MM-DD)
  categoryId?: string;
  walletFromName?: string;
  walletToName?: string;
  categoryName?: string;
}

// Request DTOs for specific operations
export interface CreateTransactionRequest {
  transactionType: TransactionType;
  walletFromId?: string;
  walletToId?: string;
  amount: number;
  exchangeRate?: number;
  note?: string;
  effectiveDate: string;
  categoryId?: string;
}

export interface UpdateTransactionRequest {
  transactionType: TransactionType;
  walletFromId?: string;
  walletToId?: string;
  amount: number;
  exchangeRate?: number;
  note?: string;
  effectiveDate: string;
  categoryId?: string;
}

// Query parameters for listing transactions
export interface TransactionListParams {
  walletId?: string;
  startDate?: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD)
  transactionType?: TransactionType;
  page?: number;
  size?: number;
  sort?: string;
}

// Pagination parameters
export interface Pageable {
  page?: number;
  size?: number;
  sort?: string;
}

// Backward compatibility alias
export type Transaction = TransactionDto;
