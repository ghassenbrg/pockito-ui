export interface WalletDto {
  id?: string;
  username?: string;
  name: string;
  initialBalance: number;
  balance?: number;
  currency: Currency;
  iconUrl?: string;
  goalAmount?: number;
  type: WalletType;
  isDefault: boolean;
  orderPosition?: number;
  description?: string;
  color?: string;
  active?: boolean;
  createdAt?: string;
  updatedAt?: string;
  createdBy?: string;
  updatedBy?: string;
}

export type Currency = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'CNY' | 'HKD' | 'SEK' | 'NOK' | 'DKK' | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'RUB' | 'TRY' | 'BRL' | 'MXN' | 'ARS' | 'CLP' | 'COP' | 'PEN' | 'UYU' | 'VES' | 'KRW' | 'SGD' | 'TWD' | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND' | 'INR' | 'PKR' | 'BDT' | 'LKR' | 'NPR' | 'MMK' | 'KHR' | 'LAK' | 'MNT' | 'KZT' | 'UZS' | 'TJS' | 'TMT' | 'AZN' | 'GEL' | 'AMD' | 'KGS' | 'UAH' | 'BYN' | 'MDL' | 'RSD' | 'BAM' | 'MKD' | 'ALL' | 'XCD' | 'BBD' | 'JMD' | 'TTD' | 'BZD' | 'GYD' | 'SRD' | 'FJD' | 'WST' | 'TOP' | 'VUV' | 'PGK' | 'SBD' | 'KID' | 'TVD' | 'NIO' | 'GTQ' | 'HNL' | 'SVC' | 'PAB' | 'CRC' | 'BOB' | 'EGP' | 'MAD' | 'TND' | 'DZD' | 'LYD' | 'SDG' | 'NGN' | 'KES' | 'GHS' | 'XOF' | 'XAF' | 'XPF' | 'ZAR' | 'BWP' | 'NAM' | 'LSL' | 'SZL' | 'ZMW' | 'ZWL' | 'MWK' | 'TZS' | 'UGX' | 'RWF' | 'BIF' | 'KMF' | 'DJF' | 'SOS' | 'ERN' | 'STN' | 'CVE' | 'GMD' | 'GNF' | 'SLL' | 'LRD' | 'GIP' | 'FKP' | 'SHP' | 'IMP' | 'JEP' | 'GGP' | 'ANG' | 'AWG' | 'BMD' | 'KYD' | 'BND' | 'MOP' | 'BTN' | 'MVR' | 'SCR' | 'MUR' | 'CDF' | 'ETB' | 'XDR' | 'XAU' | 'XAG' | 'XPT' | 'XPD';

export type WalletType = 'BANK_ACCOUNT' | 'CASH' | 'CREDIT_CARD' | 'SAVINGS' | 'CUSTOM';

export interface ReorderWalletsRequest {
  walletIds: string[];
}
