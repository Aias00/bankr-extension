export const formatUsd = (value: number): string =>
  value.toLocaleString('en-US', { style: 'currency', currency: 'USD' });

export const formatPct = (value: number): string => `${value.toFixed(2)}%`;
