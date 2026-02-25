import { decryptText } from '../utils/crypto';
import { loadSettings, loadSnapshot, saveSnapshot, pushNotification } from '../utils/storage';
import { fetchSnapshot, submitTrade } from '../utils/bankr-api';
import { BankrSnapshot } from '../types';

export const getApiKey = async (): Promise<string> => {
  const settings = await loadSettings();
  if (!settings.apiKeyEncrypted || !settings.apiKeyIv) {
    throw new Error('API key is not configured');
  }
  return decryptText(settings.apiKeyEncrypted, settings.apiKeyIv);
};

const notify = async (title: string, message: string, type: 'position' | 'price' | 'settlement') => {
  const event = { type, title, message, createdAt: new Date().toISOString() };
  await pushNotification(event);
  await chrome.notifications.create({
    type: 'basic',
    iconUrl: 'icons/icon-128.png',
    title,
    message
  });
};

const diffAndNotify = async (prev: BankrSnapshot | null, next: BankrSnapshot) => {
  if (!prev) return;

  if (prev.positions.length !== next.positions.length) {
    await notify('Position Update', 'Your Polymarket positions changed.', 'position');
  }

  const settled = next.positions.filter((pos) => pos.status !== 'active');
  const prevSettled = prev.positions.filter((pos) => pos.status !== 'active');
  if (settled.length > prevSettled.length) {
    await notify('Market Settled', 'A market position has settled.', 'settlement');
  }

  const priceSwing = next.positions.find((pos) => Math.abs(pos.pnlPct) > 5);
  if (priceSwing) {
    await notify('Price Alert', `${priceSwing.market} moved ${priceSwing.pnlPct.toFixed(2)}%.`, 'price');
  }
};

export const refreshSnapshot = async (): Promise<BankrSnapshot> => {
  const apiKey = await getApiKey();
  const prev = await loadSnapshot();
  const next = await fetchSnapshot(apiKey);
  await saveSnapshot(next);
  await diffAndNotify(prev, next);
  return next;
};

export const placeTrade = async (prompt: string): Promise<string> => {
  const apiKey = await getApiKey();
  return submitTrade(apiKey, prompt);
};
