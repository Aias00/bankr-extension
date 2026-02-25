import { create } from 'zustand';
import { BankrSnapshot, Settings, TradeOrder } from '../types';
import { loadSettings, saveSettings, loadSnapshot, saveSnapshot } from '../utils/storage';
import { encryptText } from '../utils/crypto';

interface BankrState {
  settings: Settings | null;
  snapshot: BankrSnapshot | null;
  isLoading: boolean;
  error?: string;
  tradeResult?: string;
  init: () => Promise<void>;
  refresh: () => Promise<void>;
  setApiKey: (apiKey: string) => Promise<void>;
  updateSettings: (updates: Partial<Settings>) => Promise<void>;
  placeTrade: (order: TradeOrder) => Promise<void>;
}

const callBackground = (type: string, payload?: Record<string, unknown>) =>
  new Promise<any>((resolve, reject) => {
    chrome.runtime.sendMessage({ type, ...payload }, (response) => {
      const err = chrome.runtime.lastError;
      if (err) reject(err);
      else resolve(response);
    });
  });

const buildPrompt = (order: TradeOrder): string => {
  const parts = [`Bet $${order.usdAmount} on ${order.marketId} ${order.side}`];
  if (order.stopLossPct !== undefined) {
    parts.push(`Stop loss ${order.stopLossPct}%`);
  }
  if (order.takeProfitPct !== undefined) {
    parts.push(`Take profit ${order.takeProfitPct}%`);
  }
  return parts.join('. ');
};

export const useBankrStore = create<BankrState>((set, get) => ({
  settings: null,
  snapshot: null,
  isLoading: false,
  error: undefined,
  tradeResult: undefined,
  init: async () => {
    const [settings, snapshot] = await Promise.all([loadSettings(), loadSnapshot()]);
    set({ settings, snapshot });
  },
  refresh: async () => {
    set({ isLoading: true, error: undefined });
    try {
      const result = await callBackground('bankr.refresh');
      if (!result.ok) {
        set({ isLoading: false, error: result.error || 'Refresh failed' });
        return;
      }
      await saveSnapshot(result.snapshot as BankrSnapshot);
      set({ isLoading: false, snapshot: result.snapshot as BankrSnapshot });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message || 'Refresh failed' });
    }
  },
  setApiKey: async (apiKey: string) => {
    const { ciphertext, iv } = await encryptText(apiKey);
    const settings = get().settings ?? (await loadSettings());
    const updated: Settings = { ...settings, apiKeyEncrypted: ciphertext, apiKeyIv: iv };
    await saveSettings(updated);
    set({ settings: updated });
  },
  updateSettings: async (updates: Partial<Settings>) => {
    const settings = get().settings ?? (await loadSettings());
    const updated: Settings = { ...settings, ...updates };
    await saveSettings(updated);
    set({ settings: updated });
  },
  placeTrade: async (order: TradeOrder) => {
    set({ isLoading: true, error: undefined, tradeResult: undefined });
    const prompt = buildPrompt(order);
    try {
      const result = await callBackground('bankr.trade', { prompt });
      if (!result.ok) {
        set({ isLoading: false, error: result.error || 'Trade failed' });
        return;
      }
      set({ isLoading: false, tradeResult: result.result as string });
    } catch (error) {
      set({ isLoading: false, error: (error as Error).message || 'Trade failed' });
    }
  }
}));
