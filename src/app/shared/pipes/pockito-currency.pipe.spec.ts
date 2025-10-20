import { PockitoCurrencyPipe } from './pockito-currency.pipe';

describe('PockitoCurrencyPipe', () => {
  let pipe: PockitoCurrencyPipe;

  beforeEach(() => {
    pipe = new PockitoCurrencyPipe();
  });

  it('should create', () => {
    expect(pipe).toBeTruthy();
  });

  it('should format currency with code on the right side', () => {
    const result = pipe.transform(100.50, 'USD', 'code');
    expect(result).toBe('100.50 USD');
  });

  it('should format currency with code on the right side for different currencies', () => {
    expect(pipe.transform(100.50, 'EUR', 'code')).toBe('100.50 EUR');
    expect(pipe.transform(100.50, 'JPY', 'code')).toBe('100.50 JPY');
  });

  it('should format currency with positive sign when showPositiveSign is true', () => {
    const result = pipe.transform(100.50, 'USD', 'code', true);
    expect(result).toBe('+100.50 USD');
  });

  it('should handle null and undefined values', () => {
    expect(pipe.transform(null, 'USD', 'code')).toBe('0.00 USD');
    expect(pipe.transform(undefined, 'USD', 'code')).toBe('0.00 USD');
  });

  it('should handle zero values', () => {
    expect(pipe.transform(0, 'USD', 'code')).toBe('0.00 USD');
  });

  it('should handle negative values', () => {
    expect(pipe.transform(-100.50, 'USD', 'code')).toBe('-100.50 USD');
  });
});
