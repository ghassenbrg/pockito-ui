export interface UserDto {
  username?: string;
  country?: Country;
  defaultCurrency?: Currency;
  createdAt?: string;
  updatedAt?: string;
}

export type Country = 
  | 'US' | 'CA' | 'GB' | 'DE' | 'FR' | 'IT' | 'ES' | 'NL' | 'BE' | 'CH' | 'AT' | 'SE' | 'NO' | 'DK' | 'FI' | 'PL' | 'CZ' | 'HU' | 'RO' | 'BG' | 'HR' | 'SI' | 'SK' | 'LT' | 'LV' | 'EE' | 'IE' | 'PT' | 'GR' | 'CY' | 'MT' | 'LU' | 'JP' | 'CN' | 'KR' | 'IN' | 'AU' | 'NZ' | 'SG' | 'HK' | 'TW' | 'TH' | 'MY' | 'ID' | 'PH' | 'VN' | 'MX' | 'BR' | 'AR' | 'CL' | 'CO' | 'PE' | 'VE' | 'UY' | 'PY' | 'BO' | 'EC' | 'GT' | 'HN' | 'SV' | 'NI' | 'CR' | 'PA' | 'IL' | 'AE' | 'SA' | 'TR' | 'EG' | 'ZA' | 'NG' | 'KE' | 'MA' | 'TN' | 'DZ' | 'LY' | 'SD' | 'ET' | 'GH' | 'CI' | 'SN' | 'RU' | 'UA' | 'BY' | 'MD' | 'RS' | 'ME' | 'BA' | 'MK' | 'AL' | 'XK' | 'IS' | 'GL' | 'FO' | 'AD' | 'MC' | 'LI' | 'SM' | 'VA';

import { Currency } from './wallet.model';
