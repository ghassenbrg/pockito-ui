import { Currency } from './common.model';

export interface WalletDto {
  id?: string;
  username: string;
  name: string;
  initialBalance: number;
  balance?: number;
  currency: Currency;
  iconUrl?: string;
  goalAmount?: number;
  type: WalletType;
  isDefault: boolean;
  orderPosition: number;
  description?: string;
  color?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

// Backward compatibility alias
export type Wallet = WalletDto;

// Updated to match OpenAPI specification exactly
export type WalletType = 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'SAVINGS' | 'CUSTOM';

export interface ReorderWalletsRequest {
  walletIds: string[];
}
