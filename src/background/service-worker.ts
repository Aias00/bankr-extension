import { refreshSnapshot, placeTrade } from './api-client';
import { loadSnapshot } from '../utils/storage';

const ALARM_NAME = 'bankr_refresh';

chrome.runtime.onInstalled.addListener(() => {
  chrome.alarms.create(ALARM_NAME, { periodInMinutes: 1 });
});

chrome.alarms.onAlarm.addListener(async (alarm) => {
  if (alarm.name !== ALARM_NAME) return;
  try {
    await refreshSnapshot();
  } catch (error) {
    console.warn('Refresh failed', error);
  }
});

chrome.runtime.onMessage.addListener((message, _sender, sendResponse) => {
  const handle = async () => {
    switch (message?.type) {
      case 'bankr.refresh': {
        const snapshot = await refreshSnapshot();
        return { ok: true, snapshot };
      }
      case 'bankr.snapshot': {
        const snapshot = await loadSnapshot();
        return { ok: true, snapshot };
      }
      case 'bankr.trade': {
        const result = await placeTrade(message.prompt as string);
        return { ok: true, result };
      }
      default:
        return { ok: false, error: 'Unknown message' };
    }
  };

  handle()
    .then((res) => sendResponse(res))
    .catch((err) => sendResponse({ ok: false, error: err?.message || 'Error' }));

  return true;
});
