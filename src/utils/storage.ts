import { Settings, BankrSnapshot, NotificationEvent } from '../types';

const SETTINGS_KEY = 'bankr_settings_v1';
const SNAPSHOT_KEY = 'bankr_snapshot_v1';
const NOTIFY_KEY = 'bankr_notifications_v1';

const defaultSettings: Settings = {
  refreshIntervalMs: 2000,
  autoRefresh: true
};

export const loadSettings = async (): Promise<Settings> => {
  const stored = await chrome.storage.local.get(SETTINGS_KEY);
  return { ...defaultSettings, ...(stored[SETTINGS_KEY] as Settings | undefined) };
};

export const saveSettings = async (settings: Settings): Promise<void> => {
  await chrome.storage.local.set({ [SETTINGS_KEY]: settings });
};

export const loadSnapshot = async (): Promise<BankrSnapshot | null> => {
  const stored = await chrome.storage.local.get(SNAPSHOT_KEY);
  return (stored[SNAPSHOT_KEY] as BankrSnapshot | undefined) ?? null;
};

export const saveSnapshot = async (snapshot: BankrSnapshot): Promise<void> => {
  await chrome.storage.local.set({ [SNAPSHOT_KEY]: snapshot });
};

export const loadNotifications = async (): Promise<NotificationEvent[]> => {
  const stored = await chrome.storage.local.get(NOTIFY_KEY);
  return (stored[NOTIFY_KEY] as NotificationEvent[] | undefined) ?? [];
};

export const pushNotification = async (event: NotificationEvent): Promise<void> => {
  const existing = await loadNotifications();
  const updated = [event, ...existing].slice(0, 50);
  await chrome.storage.local.set({ [NOTIFY_KEY]: updated });
};
