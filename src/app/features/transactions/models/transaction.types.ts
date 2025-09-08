export type ViewMode = 'cards' | 'list';

export interface TransactionFilters {
  walletId?: string;
  startDate?: string;
  endDate?: string;
  transactionType?: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  page?: number;
  size?: number;
  sort?: string;
}

export interface TransactionFormData {
  transactionType: 'EXPENSE' | 'INCOME' | 'TRANSFER';
  walletFromId?: string;
  walletToId?: string;
  amount: number;
  exchangeRate?: number;
  note?: string;
  effectiveDate: string;
  categoryId?: string;
}
