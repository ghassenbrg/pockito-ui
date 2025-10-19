import { Pipe, PipeTransform } from '@angular/core';
import { CurrencyPipe } from '@angular/common';

@Pipe({
  name: 'pockitoCurrency',
  standalone: true
})
export class PockitoCurrencyPipe implements PipeTransform {
  private currencyPipe = new CurrencyPipe('en-US');

  transform(
    value: number | null | undefined, 
    currency: string = 'USD', 
    display: 'code' | 'symbol' | 'symbol-narrow' = 'code',
    digitsInfo?: string,
    locale?: string
  ): string {
    if (value === null || value === undefined) {
      return '0.00 ' + currency;
    }

    const sign = value > 0 ? '+' : '';

    // Use Angular's CurrencyPipe to format the number
    const formattedAmount = this.currencyPipe.transform(
      value, 
      currency, 
      display, 
      digitsInfo, 
      locale
    );

    if (!formattedAmount) {
      return '0.00 ' + currency;
    }

    // If display is 'code', we want to move the currency code to the right
    if (display === 'code') {
      // The CurrencyPipe with 'code' display adds currency at the beginning like "USD100.50"
      // We need to remove the currency code and add it to the end with space
      const amountWithoutCurrency = formattedAmount.replace(currency, '');
      return `${sign}${amountWithoutCurrency} ${currency}`;
    }

    // For other display types, return as is
    return `${sign}${formattedAmount}`;
  }
}
