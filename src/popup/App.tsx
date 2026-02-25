import React, { useEffect, useMemo, useState } from 'react';
import { useBankrStore } from '../store/useBankrStore';
import Positions from './components/Positions';
import Balance from './components/Balance';
import Markets from './components/Markets';
import Trade from './components/Trade';
import { formatUsd } from '../utils/format';

const App: React.FC = () => {
  const {
    settings,
    snapshot,
    isLoading,
    error,
    tradeResult,
    init,
    refresh,
    setApiKey,
    updateSettings
  } = useBankrStore();

  const [apiKeyInput, setApiKeyInput] = useState('');

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (!settings?.autoRefresh) return undefined;
    const interval = window.setInterval(() => {
      refresh().catch(() => undefined);
    }, settings.refreshIntervalMs || 2000);
    return () => window.clearInterval(interval);
  }, [settings?.autoRefresh, settings?.refreshIntervalMs, refresh]);

  const totals = useMemo(() => {
    const positions = snapshot?.positions ?? [];
    const balances = snapshot?.balances ?? [];
    const pnl = positions.reduce((acc, pos) => acc + pos.pnlUsd, 0);
    const holdings = balances.reduce((acc, bal) => acc + bal.usdValue, 0);
    return { pnl, holdings, total: pnl + holdings };
  }, [snapshot]);

  const handleApiKeySave = async () => {
    if (!apiKeyInput.trim()) return;
    await setApiKey(apiKeyInput.trim());
    setApiKeyInput('');
  };

  return (
    <div className="w-[360px] bg-ink-900 text-white p-4 space-y-4">
      <header className="flex items-center justify-between">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-emerald-300">Bankr</p>
          <h1 className="text-lg font-semibold">Polymarket Desk</h1>
        </div>
        <button
          className="rounded-full border border-emerald-400 px-3 py-1 text-xs hover:bg-emerald-500 hover:text-black transition"
          onClick={() => refresh()}
        >
          {isLoading ? 'Refreshing...' : 'Refresh'}
        </button>
      </header>

      <section className="rounded-2xl bg-ink-800 p-4 shadow-glow animate-fade">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Total Value</p>
            <p className="text-2xl font-semibold">{formatUsd(totals.total)}</p>
          </div>
          <div className={`text-right ${totals.pnl >= 0 ? 'text-emerald-400' : 'text-danger-500'}`}>
            <p className="text-xs uppercase tracking-[0.2em]">PnL</p>
            <p className="text-xl font-semibold">{formatUsd(totals.pnl)}</p>
          </div>
        </div>
        <div className="mt-2 text-xs text-slate-400">
          Updated: {snapshot?.lastUpdated ? new Date(snapshot.lastUpdated).toLocaleTimeString() : '—'}
        </div>
      </section>

      {error && (
        <div className="rounded-xl bg-danger-500/20 border border-danger-500 px-3 py-2 text-xs">
          {error}
        </div>
      )}

      <Balance balances={snapshot?.balances ?? []} />
      <Positions positions={snapshot?.positions ?? []} />
      <Markets markets={snapshot?.markets ?? []} />
      <Trade tradeResult={tradeResult} />

      <section className="rounded-2xl bg-ink-800 p-4 space-y-2">
        <div className="flex items-center justify-between">
          <p className="text-sm font-medium">Settings</p>
          <label className="flex items-center gap-2 text-xs">
            <input
              type="checkbox"
              className="accent-emerald-500"
              checked={settings?.autoRefresh ?? true}
              onChange={(event) => updateSettings({ autoRefresh: event.target.checked })}
            />
            Auto refresh
          </label>
        </div>
        <div className="space-y-2">
          <input
            type="password"
            placeholder={settings?.apiKeyEncrypted ? 'API Key saved' : 'Enter API Key'}
            value={apiKeyInput}
            onChange={(event) => setApiKeyInput(event.target.value)}
            className="w-full rounded-lg bg-ink-700 px-3 py-2 text-xs text-white placeholder:text-slate-500"
          />
          <button
            className="w-full rounded-lg bg-emerald-500 text-black text-xs font-semibold py-2 hover:bg-emerald-400"
            onClick={handleApiKeySave}
          >
            Save API Key
          </button>
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Refresh (ms)</span>
            <input
              type="number"
              min={2000}
              step={500}
              value={settings?.refreshIntervalMs ?? 2000}
              onChange={(event) =>
                updateSettings({ refreshIntervalMs: Number(event.target.value) || 2000 })
              }
              className="w-24 rounded-lg bg-ink-700 px-2 py-1 text-right"
            />
          </div>
        </div>
      </section>
    </div>
  );
};

export default App;
