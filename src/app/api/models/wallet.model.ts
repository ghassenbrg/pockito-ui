import { Currency, WalletType } from './enum';

export interface WalletRequest {
  name: string;
  description?: string;
  color?: string;
  initialBalance: number;
  currency: Currency;
  iconUrl?: string;
  goalAmount?: number;
  type: WalletType;
  isDefault: boolean;
}

export interface Wallet {
  id: string;
  username: string;
  name: string;
  description?: string;
  color?: string;
  initialBalance: number;
  balance: number;
  currency: Currency;
  iconUrl?: string;
  goalAmount?: number;
  type: WalletType;
  isDefault: boolean;
  orderPosition: number;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}

export interface WalletList {
  wallets: Wallet[];
  totalCount: number;
}

export interface ReorderWalletsRequest {
  walletIds: string[];
}