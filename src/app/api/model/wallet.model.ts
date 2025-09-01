export interface Wallet {
  id: string;
  name: string;
  initialBalance: number;
  balance: number;
  currency: string;
  iconUrl?: string;
  goalAmount?: number;
  type: string;
  isDefault: boolean;
  active: boolean;
  order: number;
  description?: string;
  color?: string;
}
