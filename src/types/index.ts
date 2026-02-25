export type JobStatus = 'pending' | 'completed' | 'failed';

export interface BankrJobResponse<T = unknown> {
  success?: boolean;
  jobId?: string;
  status: JobStatus;
  response?: T;
  error?: string;
}

export interface Position {
  id: string;
  market: string;
  side: 'UP' | 'DOWN';
  shares: number;
  entryPrice: number;
  currentPrice: number;
  pnlUsd: number;
  pnlPct: number;
  status: 'active' | 'settled' | 'redeemable';
  expiresAt?: string;
}

export interface Balance {
  chain: 'Polygon' | 'Ethereum' | 'Solana' | 'Other';
  symbol: string;
  amount: number;
  usdValue: number;
}

export interface Market {
  id: string;
  title: string;
  priceUp: number;
  priceDown: number;
  volumeUsd: number;
  category: string;
  trend?: number[];
}

export interface TradeOrder {
  marketId: string;
  side: 'UP' | 'DOWN';
  usdAmount: number;
  stopLossPct?: number;
  takeProfitPct?: number;
}

export interface NotificationEvent {
  type: 'position' | 'price' | 'settlement';
  title: string;
  message: string;
  createdAt: string;
}

export interface BankrSnapshot {
  positions: Position[];
  balances: Balance[];
  markets: Market[];
  lastUpdated: string;
}

export interface Settings {
  apiKeyEncrypted?: string;
  apiKeyIv?: string;
  refreshIntervalMs: number;
  autoRefresh: boolean;
}
