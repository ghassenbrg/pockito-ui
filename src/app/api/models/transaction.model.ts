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
  effectiveDate: string;
  categoryId?: string;
  walletFromName?: string;
  walletToName?: string;
  categoryName?: string;
}

export type TransactionType = 'TRANSFER' | 'EXPENSE' | 'INCOME';

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageTransactionDto {
  totalPages?: number;
  totalElements?: number;
  size?: number;
  content?: TransactionDto[];
  number?: number;
  sort?: Sort;
  first?: boolean;
  last?: boolean;
  numberOfElements?: number;
  pageable?: PageableInfo;
  empty?: boolean;
}

export interface Sort {
  empty?: boolean;
  sorted?: boolean;
  unsorted?: boolean;
}

export interface PageableInfo {
  offset?: number;
  sort?: Sort;
  pageSize?: number;
  pageNumber?: number;
  paged?: boolean;
  unpaged?: boolean;
}
