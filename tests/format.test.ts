import { formatUsd, formatPct } from '../src/utils/format';

describe('format utils', () => {
  it('formats usd with currency', () => {
    expect(formatUsd(12.5)).toContain('$');
  });

  it('formats percent with two decimals', () => {
    expect(formatPct(1)).toBe('1.00%');
  });
});
