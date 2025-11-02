import { Country, Currency } from './enum';

export interface User {
  username: string;
  country?: Country;
  defaultCurrency?: Currency;
  createdAt: Date;
  updatedAt: Date;
}