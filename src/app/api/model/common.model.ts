// Common currency types based on OpenAPI specification
export type Currency = 
  | 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'CAD' | 'AUD' | 'CNY' | 'HKD' | 'SEK' | 'NOK' | 'DKK' 
  | 'PLN' | 'CZK' | 'HUF' | 'RON' | 'BGN' | 'HRK' | 'RUB' | 'TRY' | 'BRL' | 'MXN' | 'ARS' | 'CLP' 
  | 'COP' | 'PEN' | 'UYU' | 'VES' | 'KRW' | 'SGD' | 'TWD' | 'THB' | 'MYR' | 'IDR' | 'PHP' | 'VND' 
  | 'INR' | 'PKR' | 'BDT' | 'LKR' | 'NPR' | 'MMK' | 'KHR' | 'LAK' | 'MNT' | 'KZT' | 'UZS' | 'TJS' 
  | 'TMT' | 'AZN' | 'GEL' | 'AMD' | 'KGS' | 'UAH' | 'BYN' | 'MDL' | 'RSD' | 'BAM' | 'MKD' | 'ALL' 
  | 'XCD' | 'BBD' | 'JMD' | 'TTD' | 'BZD' | 'GYD' | 'SRD' | 'FJD' | 'WST' | 'TOP' | 'VUV' | 'PGK' 
  | 'SBD' | 'KID' | 'TVD' | 'NIO' | 'GTQ' | 'HNL' | 'SVC' | 'PAB' | 'CRC' | 'BOB' | 'EGP' | 'MAD' 
  | 'TND' | 'DZD' | 'LYD' | 'SDG' | 'NGN' | 'KES' | 'GHS' | 'XOF' | 'XAF' | 'XPF' | 'ZAR' | 'BWP' 
  | 'NAM' | 'LSL' | 'SZL' | 'ZMW' | 'ZWL' | 'MWK' | 'TZS' | 'UGX' | 'RWF' | 'BIF' | 'KMF' | 'DJF' 
  | 'SOS' | 'ERN' | 'STN' | 'CVE' | 'GMD' | 'GNF' | 'SLL' | 'LRD' | 'GIP' | 'FKP' | 'SHP' | 'IMP' 
  | 'JEP' | 'GGP' | 'ANG' | 'AWG' | 'BMD' | 'KYD' | 'BND' | 'MOP' | 'BTN' | 'MVR' | 'SCR' | 'MUR' 
  | 'CDF' | 'ETB' | 'XDR' | 'XAU' | 'XAG' | 'XPT' | 'XPD';

// Common country types based on OpenAPI specification
export type Country = 
  | 'US' | 'CA' | 'GB' | 'DE' | 'FR' | 'IT' | 'ES' | 'NL' | 'BE' | 'CH' | 'AT' | 'SE' | 'NO' | 'DK' 
  | 'FI' | 'PL' | 'CZ' | 'HU' | 'RO' | 'BG' | 'HR' | 'SI' | 'SK' | 'LT' | 'LV' | 'EE' | 'IE' | 'PT' 
  | 'GR' | 'CY' | 'MT' | 'LU' | 'JP' | 'CN' | 'KR' | 'IN' | 'AU' | 'NZ' | 'SG' | 'HK' | 'TW' | 'TH' 
  | 'MY' | 'ID' | 'PH' | 'VN' | 'MX' | 'BR' | 'AR' | 'CL' | 'CO' | 'PE' | 'VE' | 'UY' | 'PY' | 'BO' 
  | 'EC' | 'GT' | 'HN' | 'SV' | 'NI' | 'CR' | 'PA' | 'IL' | 'AE' | 'SA' | 'TR' | 'EG' | 'ZA' | 'NG' 
  | 'KE' | 'MA' | 'TN' | 'DZ' | 'LY' | 'SD' | 'ET' | 'GH' | 'CI' | 'SN' | 'RU' | 'UA' | 'BY' | 'MD' 
  | 'RS' | 'ME' | 'BA' | 'MK' | 'AL' | 'XK' | 'IS' | 'GL' | 'FO' | 'AD' | 'MC' | 'LI' | 'SM' | 'VA';

// Common response types
export interface ApiResponse<T> {
  data?: T;
  message?: string;
  success: boolean;
  error?: string;
}

export interface PaginatedResponse<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  first: boolean;
  last: boolean;
}
