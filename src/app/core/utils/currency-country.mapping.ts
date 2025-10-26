/**
 * Mapping between currency codes and country codes for flag icons
 */
export const CurrencyToCountryMap: { [key: string]: string } = {
  USD: 'us',
  EUR: 'eu',
  GBP: 'gb',
  JPY: 'jp',
  CAD: 'ca',
  AUD: 'au',
  CHF: 'ch',
  CNY: 'cn',
  SEK: 'se',
  NOK: 'no',
  DKK: 'dk',
  PLN: 'pl',
  CZK: 'cz',
  HUF: 'hu',
  RUB: 'ru',
  BRL: 'br',
  MXN: 'mx',
  INR: 'in',
  KRW: 'kr',
  SGD: 'sg',
  HKD: 'hk',
  NZD: 'nz',
  ZAR: 'za',
  TRY: 'tr',
  ILS: 'il',
  AED: 'ae',
  SAR: 'sa',
  QAR: 'qa',
  KWD: 'kw',
  BHD: 'bh',
  OMR: 'om',
  JOD: 'jo',
  LBP: 'lb',
  EGP: 'eg',
  MAD: 'ma',
  TND: 'tn',
  DZD: 'dz',
  LYD: 'ly',
  SDG: 'sd',
  ETB: 'et',
  KES: 'ke',
  UGX: 'ug',
  TZS: 'tz',
  ZMW: 'zm',
  BWP: 'bw',
  SZL: 'sz',
  LSL: 'ls',
  NAD: 'na',
  MUR: 'mu',
  SCR: 'sc',
  MVR: 'mv',
  LKR: 'lk',
  NPR: 'np',
  BDT: 'bd',
  PKR: 'pk',
  AFN: 'af',
  UZS: 'uz',
  KZT: 'kz',
  KGS: 'kg',
  TJS: 'tj',
  TMT: 'tm',
  UAH: 'ua',
  BYN: 'by',
  MDL: 'md',
  RON: 'ro',
  BGN: 'bg',
  HRK: 'hr',
  RSD: 'rs',
  MKD: 'mk',
  ALL: 'al',
  BAM: 'ba',
  MNT: 'mn',
  KHR: 'kh',
  LAK: 'la',
  VND: 'vn',
  THB: 'th',
  MYR: 'my',
  IDR: 'id',
  PHP: 'ph',
  MMK: 'mm',
  BND: 'bn',
  FJD: 'fj',
  PGK: 'pg',
  SBD: 'sb',
  VUV: 'vu',
  WST: 'ws',
  TOP: 'to',
  XPF: 'pf',
};

/**
 * Reverse mapping from country codes to currency codes
 */
export const CountryToCurrencyMap: { [key: string]: string } = {
  us: 'USD',
  eu: 'EUR',
  gb: 'GBP',
  jp: 'JPY',
  ca: 'CAD',
  au: 'AUD',
  ch: 'CHF',
  cn: 'CNY',
  se: 'SEK',
  no: 'NOK',
  dk: 'DKK',
  pl: 'PLN',
  cz: 'CZK',
  hu: 'HUF',
  ru: 'RUB',
  br: 'BRL',
  mx: 'MXN',
  in: 'INR',
  kr: 'KRW',
  sg: 'SGD',
  hk: 'HKD',
  nz: 'NZD',
  za: 'ZAR',
  tr: 'TRY',
  il: 'ILS',
  ae: 'AED',
  sa: 'SAR',
  qa: 'QAR',
  kw: 'KWD',
  bh: 'BHD',
  om: 'OMR',
  jo: 'JOD',
  lb: 'LBP',
  eg: 'EGP',
  ma: 'MAD',
  tn: 'TND',
  dz: 'DZD',
  ly: 'LYD',
  sd: 'SDG',
  et: 'ETB',
  ke: 'KES',
  ug: 'UGX',
  tz: 'TZS',
  zm: 'ZMW',
  bw: 'BWP',
  sz: 'SZL',
  ls: 'LSL',
  na: 'NAD',
  mu: 'MUR',
  sc: 'SCR',
  mv: 'MVR',
  lk: 'LKR',
  np: 'NPR',
  bd: 'BDT',
  pk: 'PKR',
  af: 'AFN',
  uz: 'UZS',
  kz: 'KZT',
  kg: 'KGS',
  tj: 'TJS',
  tm: 'TMT',
  ua: 'UAH',
  by: 'BYN',
  md: 'MDL',
  ro: 'RON',
  bg: 'BGN',
  hr: 'HRK',
  rs: 'RSD',
  mk: 'MKD',
  al: 'ALL',
  ba: 'BAM',
  mn: 'MNT',
  kh: 'KHR',
  la: 'LAK',
  vn: 'VND',
  th: 'THB',
  my: 'MYR',
  id: 'IDR',
  ph: 'PHP',
  mm: 'MMK',
  bn: 'BND',
  fj: 'FJD',
  pg: 'PGK',
  sb: 'SBD',
  vu: 'VUV',
  ws: 'WST',
  to: 'TOP',
  pf: 'XPF',
};

/**
 * Get the country code for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Country code (e.g., 'us', 'eu') or undefined if not found
 */
export function getCountryCodeFromCurrency(
  currency: string
): string | undefined {
  return CurrencyToCountryMap[currency];
}

/**
 * Get the currency code for a given country code
 * @param country - Country code (e.g., 'us', 'eu')
 * @returns Currency code (e.g., 'USD', 'EUR') or undefined if not found
 */
export function getCurrencyFromCountryCode(
  country: string
): string | undefined {
  return CountryToCurrencyMap[country];
}

/**
 * Get the flag icon class for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Flag icon class (e.g., 'fi fi-us', 'fi fi-eu') or empty string if not found
 */
export function getCurrencyFlagIcon(currency: string, size: '1x1' | '4x3' = '1x1'): string {
  const countryCode = getCountryCodeFromCurrency(currency);
  return countryCode ? `/assets/flags/${size}/${countryCode}.svg` : '';
}

/**
 * @param country - Country code (e.g., 'us', 'eu')
 * @returns Flag icon class (e.g., 'fi fi-us', 'fi fi-eu') or empty string if not found
 */
export function getCountryFlagIcon(country: string): string {
  return country ? `/assets/flags/${country}.svg` : '';
}

/**
 * Mapping between currency codes and their symbols
 */
export const CurrencySymbolMap: { [key: string]: string } = {
  'USD': '$',
  'EUR': '€',
  'GBP': '£',
  'JPY': '¥',
  'CAD': 'C$',
  'AUD': 'A$',
  'CHF': 'CHF',
  'CNY': '¥',
  'SEK': 'kr',
  'NOK': 'kr',
  'DKK': 'kr',
  'PLN': 'zł',
  'CZK': 'Kč',
  'HUF': 'Ft',
  'RUB': '₽',
  'BRL': 'R$',
  'MXN': '$',
  'INR': '₹',
  'KRW': '₩',
  'SGD': 'S$',
  'HKD': 'HK$',
  'NZD': 'NZ$',
  'ZAR': 'R',
  'TRY': '₺',
  'ILS': '₪',
  'AED': 'د.إ',
  'SAR': '﷼',
  'QAR': '﷼',
  'KWD': 'د.ك',
  'BHD': 'د.ب',
  'OMR': '﷼',
  'JOD': 'د.ا',
  'LBP': 'ل.ل',
  'EGP': '£',
  'MAD': 'د.م.',
  'TND': 'د.ت',
  'DZD': 'د.ج',
  'LYD': 'ل.د',
  'SDG': 'ج.س.',
  'ETB': 'Br',
  'KES': 'KSh',
  'UGX': 'USh',
  'TZS': 'TSh',
  'ZMW': 'ZK',
  'BWP': 'P',
  'SZL': 'L',
  'LSL': 'L',
  'NAD': 'N$',
  'MUR': '₨',
  'SCR': '₨',
  'MVR': 'ރ',
  'LKR': '₨',
  'NPR': '₨',
  'BDT': '৳',
  'PKR': '₨',
  'AFN': '؋',
  'UZS': 'лв',
  'KZT': '₸',
  'KGS': 'лв',
  'TJS': 'SM',
  'TMT': 'T',
  'UAH': '₴',
  'BYN': 'Br',
  'MDL': 'L',
  'RON': 'lei',
  'BGN': 'лв',
  'HRK': 'kn',
  'RSD': 'дин',
  'MKD': 'ден',
  'ALL': 'L',
  'BAM': 'КМ',
  'MNT': '₮',
  'KHR': '៛',
  'LAK': '₭',
  'VND': '₫',
  'THB': '฿',
  'MYR': 'RM',
  'IDR': 'Rp',
  'PHP': '₱',
  'MMK': 'K',
  'BND': 'B$',
  'FJD': 'FJ$',
  'PGK': 'K',
  'SBD': 'SI$',
  'VUV': 'Vt',
  'WST': 'WS$',
  'TOP': 'T$',
  'XPF': '₣',
};

/**
 * Get the currency symbol for a given currency code
 * @param currency - Currency code (e.g., 'USD', 'EUR')
 * @returns Currency symbol (e.g., '$', '€') or the currency code if not found
 */
export function getCurrencySymbol(currency: string): string {
  return CurrencySymbolMap[currency] || currency;
}
