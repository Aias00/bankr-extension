import React from 'react';
import { Balance } from '../../types';
import { formatUsd } from '../../utils/format';

interface Props {
  balances: Balance[];
}

const Balance: React.FC<Props> = ({ balances }) => {
  const total = balances.reduce((acc, bal) => acc + bal.usdValue, 0);
  return (
    <section className="rounded-2xl bg-ink-800 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-sm font-medium">Balances</p>
        <span className="text-xs text-slate-400">{formatUsd(total)}</span>
      </div>
      <div className="grid grid-cols-2 gap-2">
        {balances.length === 0 && (
          <div className="text-xs text-slate-500 col-span-2">No balances loaded.</div>
        )}
        {balances.map((bal, index) => (
          <div key={`${bal.chain}-${bal.symbol}-${index}`} className="rounded-xl bg-ink-700 p-3">
            <p className="text-xs uppercase tracking-[0.2em] text-slate-400">{bal.chain}</p>
            <p className="text-sm font-semibold">{bal.symbol}</p>
            <p className="text-xs text-slate-400">{bal.amount.toFixed(2)}</p>
            <p className="text-xs text-emerald-400">{formatUsd(bal.usdValue)}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default Balance;
