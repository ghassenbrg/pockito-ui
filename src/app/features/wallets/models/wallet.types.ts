import { Wallet } from "@api/model";

export enum WalletType {
  BANK_ACCOUNT = 'BANK_ACCOUNT',
  CASH = 'CASH',
  CREDIT_CARD = 'CREDIT_CARD',
  SAVINGS = 'SAVINGS',
  CUSTOM = 'CUSTOM'
}

export enum Currency {
  TND = 'TND',
  EUR = 'EUR',
  USD = 'USD',
  JPY = 'JPY'
}

export interface WalletTypeOption {
  label: string;
  value: WalletType;
}

export interface CurrencyOption {
  label: string;
  value: Currency;
}

export interface WalletFormData {
  name: string;
  initialBalance: number;
  currency: Currency;
  type: WalletType;
  goalAmount?: number;
  isDefault: boolean;
  active: boolean;
  iconUrl?: string;
  description?: string;
  color: string;
}

export interface WalletDisplayData {
  id: string;
  name: string;
  balance: number;
  currency: Currency;
  type: WalletType;
  goalAmount?: number;
  isDefault: boolean;
  active: boolean;
  iconUrl?: string;
  description?: string;
  color?: string;
  order: number;
}

export interface WalletGoalProgress {
  hasGoal: boolean;
  progress: number;
  isComplete: boolean;
}

export interface FormattedAmount {
  text: string;
  color: string;
}

// Enhanced type definitions for better type safety
export type ViewMode = 'cards' | 'list';

export interface WalletOperationState {
  isLoading: boolean;
  error: string | null;
  hasError: boolean;
}

export interface WalletCacheKey {
  walletId: string;
  balance: number;
  goalAmount: number;
}

export interface WalletSortOptions {
  field: keyof Wallet;
  direction: 'asc' | 'desc';
}

export interface WalletFilterOptions {
  type?: WalletType;
  currency?: Currency;
  active?: boolean;
  hasGoal?: boolean;
}