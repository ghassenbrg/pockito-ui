import { Currency, Country } from './common.model';

export interface UserDto {
  username: string;
  country?: Country;
  defaultCurrency?: Currency;
  createdAt?: string;
  updatedAt?: string;
}

export interface UpdateUserCurrencyRequest {
  currencyCode: Currency;
}

export interface UpdateUserCountryRequest {
  countryCode: Country;
}
