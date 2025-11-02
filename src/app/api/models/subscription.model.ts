import { SubscriptionFrequency, Currency, DayOfWeek, MonthOfYear } from './enum';

export interface SubscriptionRequest {
  name: string;
  iconUrl?: string;
  frequency: SubscriptionFrequency;
  interval: number;
  amount: number;
  currency: Currency;
  startDate: string;
  endDate?: string;
  isActive: boolean;
  categoryId: string;
  dayOfMonth?: number;
  dayOfWeek?: DayOfWeek;
  monthOfYear?: MonthOfYear;
  defaultWalletId?: string;
  note?: string;
}

export interface Subscription {
  id: string;
  username: string;
  name: string;
  iconUrl?: string;
  frequency: SubscriptionFrequency;
  interval: number;
  amount: number;
  currency: Currency;
  startDate: Date;
  nextDueDate?: Date;
  endDate?: Date;
  isActive: boolean;
  categoryId: string;
  categoryName?: string;
  dayOfMonth?: number;
  dayOfWeek?: DayOfWeek;
  monthOfYear?: MonthOfYear;
  defaultWalletId?: string;
  defaultWalletName?: string;
  note?: string;
  createdAt: Date;
  updatedAt: Date;
  monthlyEquivalentAmount?: number;
}

export interface PaySubscriptionRequest {
  walletId?: string;
  exchangeRate?: number;
}