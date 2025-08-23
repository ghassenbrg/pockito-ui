export interface Wallet {
  id: string;
  name: string;
  iconType: 'EMOJI' | 'URL';
  iconValue: string;
  currencyCode: string;
  color?: string;
  type: 'SAVINGS' | 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'CUSTOM';
  initialBalance: number;
  isDefault: boolean;
  goalAmount?: number;
  userId: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWalletRequest {
  name: string;
  iconType: 'EMOJI' | 'URL';
  iconValue: string;
  currencyCode: string;
  color?: string;
  type: 'SAVINGS' | 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'CUSTOM';
  initialBalance?: number;
  goalAmount?: number;
  setDefault?: boolean;
}

export interface UpdateWalletRequest {
  name: string;
  iconType: 'EMOJI' | 'URL';
  iconValue: string;
  currencyCode: string;
  color?: string;
  type: 'SAVINGS' | 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'CUSTOM';
  goalAmount?: number;
}

export interface WalletIcon {
  type: 'EMOJI' | 'URL';
  value: string;
}

export interface WalletType {
  value: 'SAVINGS' | 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'CUSTOM';
  label: string;
  description?: string;
}

export const WALLET_TYPES: WalletType[] = [
  { value: 'SAVINGS', label: 'Savings', description: 'Savings account with optional goal' },
  { value: 'BANK_ACCOUNT', label: 'Bank Account', description: 'Traditional bank account' },
  { value: 'CASH', label: 'Cash', description: 'Physical cash holdings' },
  { value: 'CREDIT_CARD', label: 'Credit Card', description: 'Credit card account' },
  { value: 'CUSTOM', label: 'Custom', description: 'Custom wallet type' }
];
