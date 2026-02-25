import React, { useState } from 'react';
import { useBankrStore } from '../../store/useBankrStore';
import { TradeOrder } from '../../types';

interface Props {
  tradeResult?: string;
}

const Trade: React.FC<Props> = ({ tradeResult }) => {
  const { placeTrade, isLoading } = useBankrStore();
  const [order, setOrder] = useState<TradeOrder>({
    marketId: '',
    side: 'UP',
    usdAmount: 10
  });

  const update = (updates: Partial<TradeOrder>) => {
    setOrder((prev) => ({ ...prev, ...updates }));
  };

  const submit = async () => {
    if (!order.marketId.trim()) return;
    await placeTrade(order);
  };

  return (
    <section className="rounded-2xl bg-ink-800 p-4 space-y-3">
      <p className="text-sm font-medium">Quick Trade</p>
      <input
        className="w-full rounded-lg bg-ink-700 px-3 py-2 text-xs text-white placeholder:text-slate-500"
        placeholder="Market ID (e.g. ETH Up/Down 5m)"
        value={order.marketId}
        onChange={(event) => update({ marketId: event.target.value })}
      />
      <div className="grid grid-cols-2 gap-2">
        <select
          className="rounded-lg bg-ink-700 px-3 py-2 text-xs"
          value={order.side}
          onChange={(event) => update({ side: event.target.value as TradeOrder['side'] })}
        >
          <option value="UP">UP</option>
          <option value="DOWN">DOWN</option>
        </select>
        <input
          type="number"
          min={1}
          className="rounded-lg bg-ink-700 px-3 py-2 text-xs"
          value={order.usdAmount}
          onChange={(event) => update({ usdAmount: Number(event.target.value) })}
        />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <input
          type="number"
          placeholder="Stop loss %"
          className="rounded-lg bg-ink-700 px-3 py-2 text-xs"
          value={order.stopLossPct ?? ''}
          onChange={(event) =>
            update({ stopLossPct: event.target.value ? Number(event.target.value) : undefined })
          }
        />
        <input
          type="number"
          placeholder="Take profit %"
          className="rounded-lg bg-ink-700 px-3 py-2 text-xs"
          value={order.takeProfitPct ?? ''}
          onChange={(event) =>
            update({ takeProfitPct: event.target.value ? Number(event.target.value) : undefined })
          }
        />
      </div>
      <button
        className="w-full rounded-lg bg-emerald-500 text-black text-xs font-semibold py-2 hover:bg-emerald-400"
        onClick={submit}
        disabled={isLoading}
      >
        {isLoading ? 'Submitting...' : 'Place Trade'}
      </button>
      {tradeResult && (
        <div className="rounded-lg bg-ink-700 px-3 py-2 text-[11px] text-slate-300">
          {tradeResult}
        </div>
      )}
    </section>
  );
};

export default Trade;
