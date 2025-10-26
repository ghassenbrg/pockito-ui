import { TransactionType, Currency } from './enum';

export interface TransactionRequest {
  transactionType: TransactionType;
  walletFromId?: string;
  walletToId?: string;
  amount: number;
  exchangeRate: number;
  categoryId?: string;
  note?: string;
  effectiveDate: string;
}

export interface Transaction {
  id: string;
  username: string;
  transactionType: TransactionType;
  walletFromId?: string;
  walletFromName?: string;
  walletToId?: string;
  walletToName?: string;
  walletFromCurrency?: Currency;
  walletToCurrency?: Currency;
  amount: number;
  exchangeRate: number;
  walletToAmount?: number;
  categoryId?: string;
  categoryName?: string;
  iconUrl?: string;
  note?: string;
  effectiveDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionDto {
  id: string;
  username: string;
  transactionType: TransactionType;
  walletFromId?: string;
  walletFromName?: string;
  walletToId?: string;
  walletToName?: string;
  walletFromCurrency?: Currency;
  walletToCurrency?: Currency;
  amount: number;
  exchangeRate: number;
  walletToAmount?: number;
  categoryId?: string;
  categoryName?: string;
  iconUrl?: string;
  note?: string;
  effectiveDate: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface TransactionList {
  transactions: Transaction[];
  totalCount: number;
}

export interface Pageable {
  page?: number;
  size?: number;
  sort?: string[];
}

export interface PageTransactionDto {
  totalPages: number;
  totalElements: number;
  first: boolean;
  last: boolean;
  size: number;
  content: TransactionDto[];
  number: number;
  sort?: Sort;
  numberOfElements: number;
  pageable?: PageableInfo;
  empty: boolean;
}

export interface Sort {
  empty: boolean;
  unsorted: boolean;
  sorted: boolean;
}

export interface PageableInfo {
  offset: number;
  sort?: Sort;
  unpaged: boolean;
  paged: boolean;
  pageNumber: number;
  pageSize: number;
}
