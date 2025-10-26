import { Country, Currency } from './enum';

export interface UserDto {
  username: string;
  country?: Country;
  defaultCurrency?: Currency;
  createdAt: Date;
  updatedAt: Date;
}

export interface User {
  username: string;
  country?: Country;
  defaultCurrency?: Currency;
  createdAt: Date;
  updatedAt: Date;
}
